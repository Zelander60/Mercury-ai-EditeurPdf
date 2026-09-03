'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace, User } from '@/lib/supabase/supabase.types';
import { createClient } from '@/lib/supabase/client';
import {
  updateWorkspace,
  deleteWorkspace,
  getCollaborators,
  addCollaborators,
  removeCollaborators,
} from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import CollaboratorSearch from '@/components/global/collaborator-search';
import { Lock, Share, Plus, Trash2 } from 'lucide-react';

interface Props {
  workspaceId: string;
  workspace: workspace;
}

export default function WorkspaceSettings({ workspaceId, workspace }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const { dispatch } = useAppState();
  const [permissions, setPermissions] = useState('private');
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [wsName, setWsName] = useState(workspace.title || '');
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions('shared');
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWsName(val);
    if (!val) return;
    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: { workspace: { title: val }, workspaceId },
    });
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: val }, workspaceId);
    }, 500);
  };

  const onChangeWorkspaceLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from('workspace-logos')
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: '3600',
        upsert: true,
      });
    if (!error) {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { logo: data.path }, workspaceId },
      });
      await updateWorkspace({ logo: data.path }, workspaceId);
      setUploadingLogo(false);
      toast({ title: 'Logo updated' });
    }
    setUploadingLogo(false);
  };

  const addCollaborator = async (profile: User) => {
    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };

  const removeCollaborator = async (user: User) => {
    if (collaborators.length === 1) setPermissions('private');
    await removeCollaborators([user], workspaceId);
    setCollaborators(collaborators.filter((c) => c.id !== user.id));
    router.refresh();
  };

  const onPermissionsChange = (val: string) => {
    if (val === 'private') setOpenAlertMessage(true);
    else setPermissions(val);
  };

  const onClickAlertConfirm = async () => {
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions('private');
    setOpenAlertMessage(false);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold tracking-tight">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic workspace information and branding.
        </p>
        <Separator className="my-4" />
        <div className="grid max-w-lg gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-sm text-muted-foreground">
              Workspace name
            </Label>
            <Input
              id="ws-name"
              value={wsName}
              onChange={workspaceNameChange}
              placeholder="My Workspace"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-logo" className="text-sm text-muted-foreground">
              Workspace logo
            </Label>
            <Input
              id="ws-logo"
              type="file"
              accept="image/*"
              onChange={onChangeWorkspaceLogo}
              disabled={uploadingLogo}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">
              Recommended 256×256px. PNG or JPG.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight">Collaboration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control who can access this workspace.
        </p>
        <Separator className="my-4" />
        <div className="max-w-lg space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Permissions</Label>
            <Select onValueChange={onPermissionsChange} value={permissions}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      <div className="text-left">
                        <span className="text-sm">Private</span>
                        <p className="text-xs text-muted-foreground">Only you can access</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="shared">
                    <div className="flex items-center gap-2">
                      <Share className="h-3.5 w-3.5" />
                      <div className="text-left">
                        <span className="text-sm">Shared</span>
                        <p className="text-xs text-muted-foreground">Invite collaborators</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {permissions === 'shared' && (
            <div className="space-y-3">
              <CollaboratorSearch
                existingCollaborators={collaborators}
                getCollaborator={addCollaborator}
              >
                <Button type="button" size="sm" className="h-8 text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Add Collaborator
                </Button>
              </CollaboratorSearch>

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  Collaborators ({collaborators.length})
                </Label>
                <ScrollArea className="h-[140px] w-full rounded-[10px] border border-border/50">
                  {collaborators.length ? (
                    collaborators.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between border-b border-border/50 px-3 py-2.5 last:border-b-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-[10px]">
                              {c.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-[200px] truncate text-[13px] text-muted-foreground">
                            {c.email}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeCollaborator(c)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        No collaborators yet
                      </span>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold tracking-tight text-destructive">
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Irreversible actions. Proceed with caution.
        </p>
        <Separator className="my-4" />
        <div className="flex items-center justify-between rounded-[10px] border border-destructive/20 bg-destructive/5 p-4">
          <div>
            <p className="text-sm font-medium">Delete this workspace</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete all books, files, and settings.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 shrink-0"
            onClick={async () => {
              await deleteWorkspace(workspaceId);
              toast({ title: 'Workspace deleted' });
              dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
              router.replace('/dashboard');
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </section>

      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to private?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing to a Private workspace will remove all collaborators permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
