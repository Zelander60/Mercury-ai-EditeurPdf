'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { workspace } from '@/lib/supabase/supabase.types';
import {
  Briefcase,
  User,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkspaceSettings from './tabs/workspace-settings';
import ProfileSettings from './tabs/profile-settings';
import BillingSettings from './tabs/billing-settings';

const tabs = [
  { id: 'workspace', label: 'Workspace', icon: Briefcase },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: CreditCard },
] as const;

interface SettingsPageClientProps {
  workspaceId: string;
  workspace: workspace;
  activeTab: string;
}

export default function SettingsPageClient({
  workspaceId,
  workspace,
  activeTab,
}: SettingsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const switchTab = (tabId: string) => {
    router.push(`${pathname}?tab=${tabId}`, { scroll: false });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'workspace':
        return <WorkspaceSettings workspaceId={workspaceId} workspace={workspace} />;
      case 'profile':
        return <ProfileSettings />;
      case 'billing':
        return <BillingSettings workspaceId={workspaceId} />;
      default:
        return <WorkspaceSettings workspaceId={workspaceId} workspace={workspace} />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/dashboard/${workspaceId}`}>
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your workspace, profile, and billing.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <nav className="w-48 shrink-0">
          <ul className="flex flex-col gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => switchTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-accent text-accent-foreground shadow-soft'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          <div className="rounded-[12px] border border-border/50 bg-card p-6 shadow-soft">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
