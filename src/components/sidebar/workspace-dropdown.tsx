'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react';
import SelectedWorkspace from './selected-workspace';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import WorkspaceCreator from '../global/workspace-creator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceDropdownProps {
  privateWorkspaces: workspace[] | [];
  sharedWorkspaces: workspace[] | [];
  collaboratingWorkspaces: workspace[] | [];
  defaultValue: workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!state.workspaces.length) {
      dispatch({
        type: 'SET_WORKSPACES',
        payload: {
          workspaces: [
            ...privateWorkspaces,
            ...sharedWorkspaces,
            ...collaboratingWorkspaces,
          ].map((workspace) => ({ ...workspace, folders: [] })),
        },
      });
    }
  }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, state.workspaces.length, dispatch]);

  const handleSelect = (option: workspace) => {
    setSelectedOption(option);
    setOpen(false);
  };

  useEffect(() => {
    const findSelectedWorkspace = state.workspaces.find(
      (workspace) => workspace.id === defaultValue?.id
    );
    if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
  }, [state, defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card px-3 py-6"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.title : 'Select a workspace'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search workspaces…" />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            {!!privateWorkspaces.length && (
              <CommandGroup heading="Private">
                {privateWorkspaces.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.title}
                    onSelect={() => handleSelect(option)}
                  >
                    <SelectedWorkspace workspace={option} onClick={handleSelect} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!!sharedWorkspaces.length && (
              <CommandGroup heading="Shared">
                {sharedWorkspaces.map((option) => (
                  <CommandItem key={option.id} value={option.title} onSelect={() => handleSelect(option)}>
                    <SelectedWorkspace workspace={option} onClick={handleSelect} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!!collaboratingWorkspaces.length && (
              <CommandGroup heading="Collaborating">
                {collaboratingWorkspaces.map((option) => (
                  <CommandItem key={option.id} value={option.title} onSelect={() => handleSelect(option)}>
                    <SelectedWorkspace workspace={option} onClick={handleSelect} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="border-t p-2">
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator />}
              description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
            >
              <div className="flex w-full items-center justify-center gap-2 rounded-md p-2 transition-colors hover:bg-accent">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">+</span>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default WorkspaceDropdown;