'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GenerateDialog } from '@/components/ai/generate-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';

interface OverviewHeaderProps {
  workspaceId: string;
  title: string;
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  workspaceId,
  title,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { setOpen } = useSubscriptionModal();
  const [creating, setCreating] = useState(false);

  const handleNewBook = async () => {
    setCreating(true);
    try {
      const { createDocument } = await import(
        '@/lib/server-actions/document-actions'
      );
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
        router.push(`/dashboard/${workspaceId}/documents/${result.data.id}/editor`);
      }
    } catch (e) {
      toast({ title: 'Failed to create book', variant: 'destructive' });
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title || 'Home'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, generate, and publish your books.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handleNewBook}
          disabled={creating}
          aria-busy={creating}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <BookOpen className="h-4 w-4" aria-hidden />
          )}
          {creating ? 'Creating…' : 'New book'}
        </Button>
        <GenerateDialog workspaceId={workspaceId} onGenerate={handleGenerate} />
      </div>
    </div>
  );
};

export default OverviewHeader;