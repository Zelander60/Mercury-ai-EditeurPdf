import React from 'react';
import { cn } from '@/lib/utils';

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-6 py-8', className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn('mt-16 md:mt-24', className)}>{children}</section>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-[32px] font-semibold leading-[1.1] tracking-[-0.015em] text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}