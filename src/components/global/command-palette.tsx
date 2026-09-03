'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FileText, Home, Wrench, Workflow, Plus, Search, Sparkles } from 'lucide-react';

interface CommandPaletteProps {
  workspaceId?: string;
  recentDocs?: { id: string; title: string }[];
}

export function CommandPalette({ workspaceId, recentDocs = [] }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex hover:bg-accent"
      >
        <Search className="h-3 w-3" />
        Search
        <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => run(() => router.push('/dashboard'))}>
              <Home className="mr-2 h-4 w-4" /> Go to Dashboard
            </CommandItem>
            {workspaceId && (
              <>
                <CommandItem onSelect={() => run(() => router.push(`/dashboard/${workspaceId}`))}>
                  <Home className="mr-2 h-4 w-4" /> Workspace Home
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push(`/dashboard/${workspaceId}/documents`))}>
                  <FileText className="mr-2 h-4 w-4" /> Go to Books
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push(`/dashboard/${workspaceId}/tools`))}>
                  <Wrench className="mr-2 h-4 w-4" /> PDF Tools
                </CommandItem>
                <CommandItem onSelect={() => run(() => router.push(`/dashboard/${workspaceId}/workflows`))}>
                  <Workflow className="mr-2 h-4 w-4" /> Workflows
                </CommandItem>
              </>
            )}
          </CommandGroup>
          <CommandGroup heading="Create">
            {workspaceId && (
              <>
                <CommandItem
                  onSelect={() =>
                    run(async () => {
                      const { createDocument } = await import(
                        '@/lib/server-actions/document-actions'
                      );
                      const result = await createDocument({
                        workspaceId,
                        title: 'Untitled Book',
                        type: 'ebook',
                        contentJson: {
                          title: 'Untitled Book',
                          subtitle: '',
                          chapters: [
                            {
                              title: 'Chapter 1',
                              sections: [
                                {
                                  heading: 'Introduction',
                                  paragraphs: [
                                    'Start writing your story here, or use the Writing Agent to generate.',
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      } as any);
                      if (result?.data?.id) {
                        router.push(
                          `/dashboard/${workspaceId}/documents/${result.data.id}/editor`
                        );
                      }
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> New Book
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    run(() =>
                      router.push(
                        `/dashboard/${workspaceId}/documents?generate=1`
                      )
                    )
                  }
                >
                  <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                </CommandItem>
              </>
            )}
          </CommandGroup>
          {recentDocs.length > 0 && (
            <CommandGroup heading="Recent Books">
              {recentDocs.slice(0, 5).map((doc) => (
                <CommandItem
                  key={doc.id}
                  onSelect={() => run(() => workspaceId && router.push(`/dashboard/${workspaceId}/documents/${doc.id}/editor`))}
                >
                  <FileText className="mr-2 h-4 w-4" /> {doc.title || 'Untitled Book'}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}