export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import {
  BookOpen,
  BookMarked,
  ChevronRight,
  Clock,
  FileText,
  Sparkles,
  Workflow,
  PenTool,
} from 'lucide-react';

import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import {
  getWorkspaceDetails,
  getUserSubscriptionStatus,
} from '@/lib/supabase/queries';
import { auth } from '@clerk/nextjs/server';

import OverviewHeader from '@/components/dashboard/overview-header';
import { ActivationChecklist } from '@/components/dashboard/activation-checklist';
import { ExportButton } from '@/components/documents/export-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-primary/10 text-primary',
  completed: 'bg-emerald-500/10 text-emerald-600',
  archived: 'bg-destructive/10 text-destructive',
};

const WorkspaceOverview = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) redirect('/login');

  const { data: workspaceData, error: workspaceError } =
    await getWorkspaceDetails(workspaceId);

  if (workspaceError || !workspaceData.length) redirect('/dashboard');

  const [totalResult, draftResult, monthResult, recent, subResult] =
    await Promise.all([
      db
        .select({ value: sql<number>`count(*)` })
        .from(documents)
        .where(eq(documents.workspaceId, workspaceId)),
      db
        .select({ value: sql<number>`count(*)` })
        .from(documents)
        .where(
          and(
            eq(documents.workspaceId, workspaceId),
            eq(documents.status, 'draft')
          )
        ),
      (async () => {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        return db
          .select({ value: sql<number>`count(*)` })
          .from(documents)
          .where(
            and(
              eq(documents.workspaceId, workspaceId),
              gte(documents.createdAt, start.toISOString())
            )
          );
      })(),
      db.query.documents.findMany({
        where: eq(documents.workspaceId, workspaceId),
        orderBy: [desc(documents.createdAt)],
        limit: 8,
      }),
      getUserSubscriptionStatus(userId),
    ]);

  const total = totalResult[0]?.value ?? 0;
  const drafts = draftResult[0]?.value ?? 0;
  const thisMonth = monthResult[0]?.value ?? 0;
  const subscription = subResult?.data;
  const plan = subscription?.status === 'active' ? 'Pro' : 'Free';

  const stats = [
    { label: 'Books', value: total, icon: BookOpen },
    { label: 'Drafts', value: drafts, icon: FileText },
    { label: 'This month', value: thisMonth, icon: Clock },
    { label: 'Plan', value: plan, icon: Sparkles },
  ];

  const quickLinks = [
    {
      href: `/dashboard/${workspaceId}/documents`,
      label: 'All books',
      description: 'Browse and manage your library',
      icon: BookMarked,
    },
    {
      href: `/dashboard/${workspaceId}/workflows`,
      label: 'Automations',
      description: 'Build and run workflows',
      icon: Workflow,
    },
    {
      href: `/dashboard/${workspaceId}/tools`,
      label: 'PDF tools',
      description: 'Merge, split, and compress',
      icon: PenTool,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <OverviewHeader workspaceId={workspaceId} title={workspaceData[0].title} />

      <div className="mt-6">
        <ActivationChecklist workspaceId={workspaceId} totalBooks={total} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" aria-hidden />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent books</CardTitle>
              <CardDescription>Your latest work in this workspace</CardDescription>
            </div>
            <Link
              href={`/dashboard/${workspaceId}/documents`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-14 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium">No books yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a blank book or generate one with AI.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y">
                {recent.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/dashboard/${workspaceId}/documents/${doc.id}/editor`}
                      className="group flex items-center justify-between gap-4 py-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium group-hover:text-primary">
                            {doc.title || 'Untitled Book'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {doc.subtitle
                              ? doc.subtitle
                              : new Date(doc.updatedAt ?? doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            statusStyles[doc.status ?? 'draft'] ??
                            statusStyles.draft
                          }`}
                        >
                          {doc.status ?? 'draft'}
                        </span>
                        <ExportButton documentId={doc.id} title={doc.title} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump to a part of your workspace</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition hover:bg-muted/50"
                >
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-premium ease-premium group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You&apos;re on the{' '}
              <span className="font-medium text-foreground">{plan}</span> plan
              {plan === 'Free' && (
                <>
                  {' '}
                  · up to 5 books per month. Upgrade for unlimited books.
                </>
              )}
              .
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceOverview;