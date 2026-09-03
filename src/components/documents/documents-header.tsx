'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GenerateDialog } from '@/components/ai/generate-dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { BookOpen, Loader2 } from 'lucide-react';

interface DocumentsHeaderProps {
  workspaceId: string;
}

export const DocumentsHeader: React.FC<DocumentsHeaderProps> = ({ workspaceId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setOpen } = useSubscriptionModal();
  const [creating, setCreating] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(
    searchParams?.get('generate') === '1'
  );

  const handleNewDocument = async () => {
    setCreating(true);
    try {
      const { createDocument } = await import(
        '@/lib/server-actions/document-actions'
      );
      // Create a blank canvas-ready book — not an empty JSON doc
      const blankBook = {
        title: 'Untitled Book',
        subtitle: '',
        author: '',
        chapters: [
          {
            title: 'Chapter 1',
            sections: [
              {
                heading: 'Introduction',
                paragraphs: [
                  'Start writing your story here. Delete this placeholder and add your content, or use the Writing Agent to generate.',
                ],
              },
            ],
          },
        ],
        fontBody: 'Lora',
        fontHeading: 'PlayfairDisplay',
      };
      const result = await createDocument({
        workspaceId,
        title: 'Untitled Book',
        type: 'ebook',
        contentJson: blankBook,
      } as any);

      if (result?.error) {
        toast({
          title: 'Limit reached',
          description: result.error,
          variant: 'destructive',
        });
        setOpen(true);
        return;
      }

      if (result?.data?.id) {
        // Go directly to visual canvas, not raw JSON editor — JSON is for advanced users only
        router.push(`/dashboard/${workspaceId}/documents/${result.data.id}/editor`);
      }
    } catch (e) {
      toast({ title: 'Failed to create document', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleGenerate = async (book: any) => {
    try {
      const { createDocument } = await import(
        '@/lib/server-actions/document-actions'
      );
      const result = await createDocument({
        workspaceId,
        title: book?.title || 'Generated Book',
        subtitle: book?.subtitle,
        type: 'ebook',
        status: 'draft',
        contentJson: book,
      } as any);

      if (result?.error) {
        toast({
          title: 'Limit reached',
          description: result.error,
          variant: 'destructive',
        });
        setOpen(true);
        return;
      }

      if (result?.data?.id) {
        router.push(`/dashboard/${workspaceId}/documents/${result.data.id}/editor`);
      }
    } catch (e) {
      toast({ title: 'Failed to save generated book', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Books</h1>
        <p className="text-sm text-muted-foreground">Manage your library — blank or AI-generated</p>
      </div>
      <div className="flex gap-2">
        <GenerateDialog
          workspaceId={workspaceId}
          onGenerate={handleGenerate}
          open={generateOpen}
          onOpenChange={setGenerateOpen}
        />
        <Button
          variant="outline"
          onClick={handleNewDocument}
          disabled={creating}
          aria-busy={creating}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <BookOpen className="h-4 w-4" aria-hidden />
          )}
          {creating ? 'Creating…' : 'New Book'}
        </Button>
      </div>
    </div>
  );
};
