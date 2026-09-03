export const dynamic = 'force-dynamic';

import { ExportButton } from '@/components/documents/export-button';
import { DocumentsHeader } from '@/components/documents/documents-header';
import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { PageShell } from '@/components/site/page-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { BookOpen, FileText, ArrowRight, MoreHorizontal } from 'lucide-react';

function statusBadge(status: string) {
  switch (status) {
    case 'published':
      return <Badge variant="subtle" className="text-[10px]">Published</Badge>;
    case 'review':
      return <Badge variant="outline" className="text-[10px] text-muted-foreground">In review</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] font-medium text-muted-foreground">Draft</Badge>;
  }
}

const DocumentsPage = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await params;
  const docs = await db.query.documents.findMany({
    where: eq(documents.workspaceId, workspaceId),
    orderBy: (documents, { desc }) => [desc(documents.createdAt)],
  });

  return (
    <PageShell>
      <DocumentsHeader workspaceId={workspaceId} />

      {docs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books yet"
          description="Click New Book above for a blank canvas, or Generate with AI to auto-write your first book — no JSON needed."
        />
      ) : (
        <ul className="mt-6 space-y-2">
          {docs.map((doc) => {
            const chapters =
              (doc.contentJson as any)?.chapters?.length ?? 0;
            const sections = (doc.contentJson as any)?.chapters?.reduce(
              (acc: number, ch: any) => acc + (ch.sections?.length || 0),
              0
            );
            const words = JSON.stringify(doc.contentJson)
              .split(/\s+/)
              .filter(Boolean).length;
            const updated = new Date(doc.updatedAt || doc.createdAt);
            return (
              <li
                key={doc.id}
                className="group flex items-center gap-4 rounded-[12px] border border-border/50 bg-card p-4 shadow-soft transition-all duration-premium ease-premium hover:border-border hover:shadow-premium motion-reduce:transition-none"
              >
                <div className="flex h-11 w-9 shrink-0 items-center justify-center rounded-[6px] border border-primary/15 bg-primary/5">
                  <FileText className="h-4 w-4 text-primary/70" aria-hidden />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/${workspaceId}/documents/${doc.id}/editor`}
                      className="truncate text-sm font-semibold tracking-tight hover:underline"
                    >
                      {doc.title || 'Untitled Book'}
                    </Link>
                    {statusBadge(doc.status)}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {chapters > 0
                      ? `${chapters} chapter${chapters > 1 ? 's' : ''} · ${sections} section${sections !== 1 ? 's' : ''} · ~${words.toLocaleString()} words`
                      : 'Empty — open canvas to start writing'}
                    {' · '}
                    <time dateTime={updated.toISOString()}>
                      {updated.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 md:opacity-60">
                  <Link
                    href={`/dashboard/${workspaceId}/documents/${doc.id}`}
                    aria-label={`Advanced JSON view for ${doc.title}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
                  <ExportButton documentId={doc.id} title={doc.title} />
                  <Link href={`/dashboard/${workspaceId}/documents/${doc.id}/editor`}>
                    <Button size="sm" className="group/btn gap-1.5">
                      Open Canvas
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
};

export default DocumentsPage;
