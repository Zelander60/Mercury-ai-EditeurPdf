import { auth } from '@clerk/nextjs/server';
import React from 'react';

import {
  getCollaboratingWorkspaces,
  getFolders,
  getPrivateWorkspaces,
  getSharedWorkspaces,
  getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';
import PlanUsage from './plan-usage';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '../ui/scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import UserCard from './user-card';

interface SidebarProps {
  params: Promise<{ workspaceId: string }>;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/login');

  //subscr
  const { data: subscriptionData, error: subscriptionError } =
    await getUserSubscriptionStatus(userId);

  //folders
  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    workspaceId
  );
  //error
  if (subscriptionError || foldersError) redirect('/dashboard');

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
    await Promise.all([
      getPrivateWorkspaces(userId),
      getCollaboratingWorkspaces(userId),
      getSharedWorkspaces(userId),
    ]);

  //get all the different workspaces private collaborating shared
  return (
    <aside
      className={twMerge(
        'hidden sm:flex sm:flex-col w-[280px] shrink-0 border-r bg-card p-4 md:gap-4 !justify-between',
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <WorkspaceDropdown
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace.id === workspaceId)}
        />
        <PlanUsage
          foldersLength={workspaceFolderData?.length || 0}
          subscription={subscriptionData}
        />
        <NativeNavigation myWorkspaceId={workspaceId} />
        <ScrollArea className="relative h-[calc(100vh-320px)]">
          <div className="pointer-events-none absolute bottom-0 z-40 h-20 w-full bg-gradient-to-t from-card to-transparent" />
          <FoldersDropdownList
            workspaceFolders={workspaceFolderData || []}
            workspaceId={workspaceId}
          />
        </ScrollArea>
      </div>
      <UserCard subscription={subscriptionData} />
    </aside>
  );
};

export default Sidebar;
