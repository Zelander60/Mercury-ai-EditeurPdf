export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDocument, updateDocument } from '@/lib/server-actions/document-actions';
import { redirect } from 'next/navigation';
import React from 'react';

const DocumentEditorPage = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; documentId: string }>;
}) => {
  const { workspaceId, documentId } = await params;
  const { data: doc, error } = await getDocument(documentId);

  if (error || !doc) {
    redirect(`/dashboard/${workspaceId}/documents`);
  }

  const contentJson = (doc.contentJson as any) || {
    title: doc.title,
    subtitle: doc.subtitle || '',
    chapters: [],
  };

  const jsonString = JSON.stringify(contentJson, null, 2);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Advanced — Raw JSON source</p>
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Most users should use{' '}
          <a href={`/dashboard/${workspaceId}/documents/${documentId}/editor`} className="font-medium underline">
            Open Canvas
          </a>{' '}
          — visual editor with fonts, chat agent, and PDF preview. This JSON view is for power users who want direct access to the book structure.
        </p>
      </div>
      <h1 className="text-3xl font-bold mb-6">Edit Document (JSON)</h1>

      <form
        action={async (formData: FormData) => {
          'use server';
          const title = formData.get('title') as string;
          const subtitle = formData.get('subtitle') as string;
          const jsonText = formData.get('content') as string;

          let contentJson;
          try {
            contentJson = JSON.parse(jsonText);
          } catch (e) {
            redirect(`/dashboard/${workspaceId}/documents/${documentId}?error=invalid-json`);
          }

          const result = await updateDocument(documentId, {
            title,
            subtitle,
            contentJson,
          });

          if (result.error) {
            redirect(`/dashboard/${workspaceId}/documents/${documentId}?error=${encodeURIComponent(result.error)}`);
          }

          redirect(`/dashboard/${workspaceId}/documents`);
        }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={doc.title}
            placeholder="Book title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            name="subtitle"
            defaultValue={doc.subtitle || ''}
            placeholder="Book subtitle"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Book JSON</Label>
          <Textarea
            id="content"
            name="content"
            defaultValue={jsonString}
            rows={30}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Paste your complete book JSON here. Use the same format as the pdf-book engine.
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Document</Button>
          <a
            href={`/dashboard/${workspaceId}/documents`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
};

export default DocumentEditorPage;
