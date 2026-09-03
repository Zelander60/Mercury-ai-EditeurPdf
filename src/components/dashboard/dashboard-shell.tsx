'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div
        className={cn(
          'shrink-0 overflow-hidden border-r bg-card transition-all duration-300 ease-premium',
          collapsed ? 'w-[64px]' : 'w-[280px]'
        )}
      >
        <div className={cn(collapsed ? 'hidden' : 'block')}>{sidebar}</div>
        {collapsed && (
          <div className="flex h-full flex-col items-center gap-4 py-4">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Expand sidebar">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopBar onToggle={toggle} collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto bg-background">{children}</div>
      </div>
    </div>
  );
}

function DashboardTopBar({
  onToggle,
  collapsed,
}: {
  onToggle: () => void;
  collapsed: boolean;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle sidebar" className="h-8 w-8">
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-semibold tracking-tight">BookGenerator</span>
          <span className="text-xs text-muted-foreground">/ Workspace</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex">
          <kbd className="rounded border bg-muted px-1.5 py-1 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
        </div>
      </div>
    </header>
  );
}