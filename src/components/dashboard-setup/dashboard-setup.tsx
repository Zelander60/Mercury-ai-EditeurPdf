'use client';
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { v4 } from 'uuid';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { AppUser } from '@/lib/providers/supabase-user-provider';
import { Button } from '../ui/button';
import Loader from '../global/Loader';
import { createWorkspace } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { createClient } from '@/lib/supabase/client';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';
import { Sparkles, ArrowRight, Users } from 'lucide-react';

interface DashboardSetupProps {
  user: AppUser;
  subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  subscription,
  user,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const [selectedEmoji, setSelectedEmoji] = useState('📚');
  const [showLogo, setShowLogo] = useState(false);
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      logo: '',
      workspaceName: '',
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4();

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from('workspace-logos')
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
        if (error) throw new Error('');
        filePath = data.path;
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Logo upload failed — continuing without it',
        });
      }
    }
    try {
      const newWorkspace: workspace = {
        data: null,
        createdAt: new Date().toISOString(),
        iconId: selectedEmoji,
        id: workspaceUUID,
        inTrash: '',
        title: value.workspaceName,
        workspaceOwner: user.id,
        logo: filePath || null,
        bannerUrl: '',
      };
      const { data, error: createError } = await createWorkspace(newWorkspace);
      if (createError) {
        throw new Error();
      }
      dispatch({
        type: 'ADD_WORKSPACE',
        payload: { ...newWorkspace, folders: [] },
      });

      toast({
        title: 'Workspace ready — now create your first book',
        description: `${newWorkspace.title} is live. You’re 30 seconds from your aha moment.`,
      });

      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not create your workspace',
        description:
          "Something went wrong. Try again — your data is safe.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-soft">
      <CardHeader className="space-y-3 pb-4">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-2.5 py-1 text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          Step 1 of 3 — 30 seconds to first book
        </div>
        <CardTitle className="text-2xl tracking-tight">Create your workspace</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          One workspace holds all your books. Name it, pick an icon, and you’re in — teammates and covers later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-end gap-3">
            <div className="shrink-0">
              <Label className="text-xs text-muted-foreground">Icon</Label>
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-lg border bg-card text-2xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="workspaceName" className="text-sm">
                Workspace name
              </Label>
              <Input
                id="workspaceName"
                type="text"
                placeholder="e.g., Atlas Books"
                disabled={isLoading}
                autoFocus
                className="mt-1 h-11 text-base"
                {...register('workspaceName', {
                  required: 'Workspace name is required',
                })}
              />
              {errors?.workspaceName?.message && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.workspaceName.message.toString()}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowLogo((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {showLogo ? '− Hide logo' : '+ Add logo (optional)'}
            </button>
            {showLogo && (
              <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                <Label htmlFor="logo" className="text-xs text-muted-foreground">
                  Workspace logo — Pro can customize, Free gets default
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  {...register('logo', { required: false })}
                />
                {subscription?.status !== 'active' && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Logo customization is Pro — Free workspaces use the icon above.
                  </p>
                )}
              </div>
            )}
          </div>

          <Button disabled={isLoading} type="submit" className="h-11 w-full text-base" size="lg">
            {!isLoading ? (
              <>
                Create workspace
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <Loader />
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            You can invite teammates right after — no need now
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;