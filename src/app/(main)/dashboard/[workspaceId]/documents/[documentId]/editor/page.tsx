export const dynamic = 'force-dynamic';

import db from '@/lib/supabase/db';
import { documents } from '@/lib/supabase/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react';
import { EditorShell } from '@/components/pdf-editor/editor-shell';

const EditorPage = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; documentId: string }>;
}) => {
  const { workspaceId, documentId } = await params;
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, documentId),
  });

  if (!doc) {
    redirect(`/dashboard/${workspaceId}/documents`);
  }

  const contentJson = (doc.contentJson as any) || {
    title: doc.title,
    subtitle: doc.subtitle || '',
    chapters: [],
  };

  let pageCount = 1;

  try {
    const { buildBook } = await import('@/lib/doc-engine/book-builder');
    const result = await buildBook(contentJson);
    pageCount = result.pages;
  } catch (e) {
    console.error('Failed to build preview:', e);
  }

  const operations = (doc as any).operations || [];

  const { paginateBook } = await import('@/lib/doc-engine/paginate-book');
  const bookPages = paginateBook(contentJson);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <EditorShell
        documentId={documentId}
        documentTitle={doc.title || 'Untitled Book'}
        pageCount={Math.max(pageCount, bookPages.length)}
        pageSize={{ width: 612, height: 792 }}
        initialOperations={operations}
        bookContext={JSON.stringify(contentJson)}
        bookPages={bookPages}
      />
    </div>
  );
};

export default EditorPage;
