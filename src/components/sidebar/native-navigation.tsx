'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { Home, Files, Wrench, Workflow, Settings, Trash2 } from 'lucide-react';
import TrashDialog from '../trash/trash';

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === `/dashboard/${myWorkspaceId}`) return pathname === href;
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    twMerge(
      'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors',
      isActive(href)
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    );

  return (
    <nav className={twMerge('my-2', className)}>
      <ul className="flex flex-col gap-1">
        <li>
          <Link className={linkClass(`/dashboard/${myWorkspaceId}`)} href={`/dashboard/${myWorkspaceId}`}>
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </li>

        <li>
          <Link
            className={linkClass(`/dashboard/${myWorkspaceId}/documents`)}
            href={`/dashboard/${myWorkspaceId}/documents`}
          >
            <Files className="h-4 w-4" />
            <span>Books</span>
          </Link>
        </li>

        <li>
          <Link
            className={linkClass(`/dashboard/${myWorkspaceId}/tools`)}
            href={`/dashboard/${myWorkspaceId}/tools`}
          >
            <Wrench className="h-4 w-4" />
            <span>PDF Tools</span>
          </Link>
        </li>

        <li>
          <Link
            className={linkClass(`/dashboard/${myWorkspaceId}/workflows`)}
            href={`/dashboard/${myWorkspaceId}/workflows`}
          >
            <Workflow className="h-4 w-4" />
            <span>Workflows</span>
          </Link>
        </li>

        <li>
          <Link
            className={linkClass(`/dashboard/${myWorkspaceId}/settings`)}
            href={`/dashboard/${myWorkspaceId}/settings`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </li>

        <TrashDialog>
          <li className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
            <Trash2 className="h-4 w-4" />
            <span>Trash</span>
          </li>
        </TrashDialog>
      </ul>
    </nav>
  );
};

export default NativeNavigation;