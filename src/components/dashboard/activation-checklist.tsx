'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ChecklistProps {
  workspaceId: string;
  totalBooks: number;
  hasExported?: boolean;
  hasCollaborator?: boolean;
}

export const ActivationChecklist: React.FC<ChecklistProps> = ({
  workspaceId,
  totalBooks,
  hasExported = false,
  hasCollaborator = false,
}) => {
  const steps = [
    {
      id: 'create',
      title: 'Create your first book',
      description: 'Blank or AI-generated — 30 seconds to aha',
      done: totalBooks > 0,
      href: `/dashboard/${workspaceId}/documents`,
      cta: totalBooks > 0 ? 'View library' : 'New book',
    },
    {
      id: 'preview',
      title: 'Preview & export',
      description: 'Open the PDF canvas and export once — feel the print-ready payoff',
      done: hasExported || totalBooks > 1,
      href: `/dashboard/${workspaceId}/documents`,
      cta: 'Open books',
    },
    {
      id: 'invite',
      title: 'Invite a teammate',
      description: 'Workspaces compound — invite one person and ship faster',
      done: hasCollaborator,
      href: `/dashboard/${workspaceId}#collaborators`,
      cta: 'Invite',
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const allDone = doneCount === steps.length;

  if (allDone) return null;

  return (
    <Card className="border-primary/20 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Get to your aha moment — 3 steps</CardTitle>
            <CardDescription>
              {doneCount} of {steps.length} complete · {progress}% — finish in under 2 minutes
            </CardDescription>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {3 - doneCount} left
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-1.5" />
      </CardHeader>
      <CardContent className="grid gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${step.done ? 'bg-muted/30 opacity-70' : 'bg-card'}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${step.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-muted-foreground/30'}`}
            >
              {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${step.done ? 'line-through text-muted-foreground' : ''}`}>
                {step.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.done && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={step.href}>
                  {step.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        ))}
        <p className="pt-1 text-center text-xs text-muted-foreground">
          Tip: Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘K</kbd> anywhere to jump
        </p>
      </CardContent>
    </Card>
  );
};

export default ActivationChecklist;