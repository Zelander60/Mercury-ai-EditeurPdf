'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  primary?: { label: string; onClick?: () => void; href?: string };
  secondary?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[12px] border border-dashed bg-card/50 px-8 py-14 text-center',
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {(primary || secondary) && (
        <div className="flex items-center gap-3 pt-1">
          {primary && (
            <Button onClick={primary.onClick} asChild={!!primary.href}>
              {primary.href ? <a href={primary.href}>{primary.label}</a> : primary.label}
            </Button>
          )}
          {secondary && (
            <Button variant="outline" onClick={secondary.onClick} asChild={!!secondary.href}>
              {secondary.href ? <a href={secondary.href}>{secondary.label}</a> : secondary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}