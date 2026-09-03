'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatDockProps {
  workspaceId: string;
  documentTitle?: string;
  context?: string;
  onApply?: (text: string) => void;
  className?: string;
}

type Msg = { id: string; role: 'user' | 'assistant'; content: string };

export function ChatDock({ workspaceId, documentTitle, context, onApply, className }: ChatDockProps) {
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          workspaceId,
          documentTitle,
          context,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const assistantMsg: Msg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'No response',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      toast.error(err.message || 'Chat failed');
    } finally {
      setLoading(false);
    }
  };

  if (minimized) {
    return (
      <Button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-premium"
        size="icon"
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className={cn('flex h-full w-[340px] shrink-0 flex-col overflow-hidden border-l bg-card shadow-soft', className)}>
      <div className="flex items-center justify-between border-b bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Writing Agent</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">360°</span>
        </div>
        <Button variant="ghost" size="xs" onClick={() => setMinimized(true)}>
          Hide
        </Button>
      </div>

      <div className="px-3 py-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="xs" onClick={() => setInput('Outline chapter 3 about AI agents')}>
            Outline
          </Button>
          <Button variant="outline" size="xs" onClick={() => setInput('Polish this draft to be more punchy')}>
            Polish
          </Button>
          <Button variant="outline" size="xs" onClick={() => setInput('Research the market for this topic')}>
            Research
          </Button>
          <Button variant="outline" size="xs" onClick={() => setInput('Draft a cover brief for this book')}>
            Cover brief
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-3 py-2">
          {messages.length === 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
              Ask me to outline, expand a chapter, polish a selection, research a topic, or draft a cover brief. I see your book context automatically.
              <br />
              <br />
              Try: <em>“Outline chapter 3 about AI agents”</em> or <em>“Polish this intro to be more punchy”</em>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('rounded-lg p-3 text-sm leading-relaxed', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              {m.role === 'assistant' && onApply && (
                <Button size="xs" variant="secondary" className="mt-2" onClick={() => onApply(m.content)}>
                  Apply
                </Button>
              )}
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the agent…"
            className="h-9 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as any);
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground">Free via OpenRouter · Premium fallback when rate-limited</p>
      </form>
    </Card>
  );
}