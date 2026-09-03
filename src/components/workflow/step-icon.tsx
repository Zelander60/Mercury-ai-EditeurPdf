'use client';

import React from 'react';
import {
  Sparkles,
  LayoutTemplate,
  Palette,
  Wand2,
  Droplets,
  Archive,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepType } from '@/lib/workflow/engine';

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  layout: LayoutTemplate,
  palette: Palette,
  wand: Wand2,
  droplet: Droplets,
  archive: Archive,
  file: FileText,
};

interface StepIconProps {
  icon: string;
  className?: string;
  badgeClassName?: string;
}

export const StepIcon: React.FC<StepIconProps> = ({
  icon,
  className,
  badgeClassName,
}) => {
  const Icon = ICONS[icon] || Sparkles;
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary',
        badgeClassName
      )}
      aria-hidden
    >
      <Icon className={cn('h-3.5 w-3.5', className)} strokeWidth={2} />
    </span>
  );
};

export function stepIconKey(type: StepType): string {
  switch (type) {
    case 'generate_content':
      return 'sparkles';
    case 'apply_template':
      return 'layout';
    case 'add_cover':
      return 'palette';
    case 'ai_polish':
      return 'wand';
    case 'add_watermark':
      return 'droplet';
    case 'compress':
      return 'archive';
    case 'export_pdf':
      return 'file';
    default:
      return 'sparkles';
  }
}

export default StepIcon;
