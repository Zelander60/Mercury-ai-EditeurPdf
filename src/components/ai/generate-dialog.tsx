'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FontPicker } from '@/components/documents/font-picker';

interface GenerateDialogProps {
  onGenerate: (book: any) => void;
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GenerateDialog: React.FC<GenerateDialogProps> = ({
  onGenerate,
  workspaceId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    controlledOnOpenChange?.(v);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'generating' | 'done'>('form');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('non-fiction');
  const [chapters, setChapters] = useState(8);
  const [style, setStyle] = useState<'academic' | 'casual' | 'professional' | 'creative'>('professional');
  const [model, setModel] = useState('openrouter/free');
  const [bodyFont, setBodyFont] = useState('Lora');
  const [headingFont, setHeadingFont] = useState('PlayfairDisplay');

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');
    setStep('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          genre,
          chapters,
          style,
          model,
          fontBody: bodyFont,
          fontHeading: headingFont,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setStep('done');
      setTimeout(() => {
        onGenerate(data.data);
        setOpen(false);
        setStep('form');
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Generation failed');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    'non-fiction', 'self-help', 'business', 'technology', 'science',
    'health', 'finance', 'education', 'psychology', 'history',
    'biography', 'cooking', 'travel', 'fiction', 'romance',
    'thriller', 'fantasy', 'sci-fi', 'horror', 'poetry',
  ];

  const models = [
    { value: 'openrouter/free', label: 'OpenRouter Free (auto)' },
    { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 (Best)' },
    { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (Fast)' },
    { value: 'openai/gpt-4o', label: 'GPT-4o' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Cheap)' },
    { value: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Book with AI</DialogTitle>
          <DialogDescription>
            Describe your book idea and AI will generate the complete content.
          </DialogDescription>
        </DialogHeader>

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">
              Generating your book content... This may take 30-60 seconds.
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="text-4xl">✅</div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Book generated successfully!</p>
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ai-title">Book Title *</Label>
              <Input
                id="ai-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI for Small Business"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-subtitle">Subtitle</Label>
              <Input
                id="ai-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., A Practical Guide"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-desc">Description *</Label>
              <Textarea
                id="ai-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the book should cover, its target audience, and key topics..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chapters</Label>
                <Input
                  type="number"
                  value={chapters}
                  onChange={(e) => setChapters(Number(e.target.value))}
                  min={3}
                  max={20}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Writing Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as any)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <FontPicker bodyFont={bodyFont} headingFont={headingFont} onBodyChange={setBodyFont} onHeadingChange={setHeadingFont} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
