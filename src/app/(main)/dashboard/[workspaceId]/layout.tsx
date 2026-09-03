import MobileSidebar from '@/components/sidebar/mobile-sidebar';
import Sidebar from '@/components/sidebar/sidebar';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { CommandPalette } from '@/components/global/command-palette';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

const Layout: React.FC<LayoutProps> = ({ children, params }) => {
  const workspaceId = params?.workspaceId;
  return (
    <>
      <div className="hidden sm:block">
        <DashboardShell sidebar={<Sidebar params={params} />}>{children}</DashboardShell>
      </div>
      <div className="sm:hidden">
        <MobileSidebar workspaceId={workspaceId}>
          <Sidebar params={params} className="w-full" />
        </MobileSidebar>
        <div className="flex h-screen flex-col overflow-hidden pt-14">
          <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        </div>
      </div>
      <CommandPalette workspaceId={workspaceId} />
    </>
  );
};

export default Layout;
