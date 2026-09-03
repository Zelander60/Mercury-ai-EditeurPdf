'use client';
import { Menu, Home, Files, Workflow, Settings } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { twMerge } from 'tailwind-merge';

interface MobileSidebarProps {
  children: React.ReactNode;
  workspaceId: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  children,
  workspaceId,
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: `/dashboard/${workspaceId}`, label: 'Home', icon: Home },
    { href: `/dashboard/${workspaceId}/documents`, label: 'Books', icon: Files },
    { href: `/dashboard/${workspaceId}/workflows`, label: 'Workflows', icon: Workflow },
    { href: `/dashboard/${workspaceId}/settings`, label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === `/dashboard/${workspaceId}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="fixed left-4 top-4 z-50 h-9 w-9 bg-card shadow-soft sm:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <div className="h-full overflow-y-auto p-4">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t bg-card/95 px-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur sm:hidden"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={twMerge(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default MobileSidebar;