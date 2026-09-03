'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const DEMO_CHAPTERS = [
  'The Freelancer Trap — Why Trading Time Fails',
  'Productize Your Knowledge in 48 Hours',
  'Pricing for Profit — The 3-Tier Ladder',
  'Automate Delivery — From Sale to PDF',
];

export const HeroDemo: React.FC = () => {
  const [title, setTitle] = useState('The Solo Agency Playbook');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    if (!title.trim()) return;
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 900);
  };

  return (
    <Card className="overflow-hidden border shadow-xl">
      <div className="flex flex-col lg:flex-row">
        {/* Left: input */}
        <div className="flex-1 border-b lg:border-b-0 lg:border-r bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Live demo — no signup
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">
            Describe your book. Watch it become real.
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Type any idea. We’ll outline it like a real publishing workspace.
          </p>

          <div className="mt-6 space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI for Small Business"
              className="h-11 text-base"
              aria-label="Book title demo"
            />
            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={generating || !title.trim()} className="flex-1">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    Generate outline
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Open workspace</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Try: “Healthy Meal Prep for Busy Parents” or “B2B Cold Email That Converts”
            </p>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 bg-muted/20 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Preview
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {generated ? '4 chapters · ~42 pages' : 'Waiting for input'}
            </span>
          </div>

          <div className="mt-4 rounded-lg border bg-card p-4">
            <div className="flex gap-4">
              <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground">A practical guide · 2026</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full bg-primary transition-all duration-700 ${generating ? 'w-2/3 animate-pulse' : generated ? 'w-full' : 'w-1/3'}`}
                  />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {generating ? 'Outlining…' : generated ? 'Outline ready' : 'Ready to generate'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {DEMO_CHAPTERS.map((c, i) => (
                <div
                  key={c}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    generated ? 'bg-card' : 'bg-muted/40'
                  } ${generating ? 'animate-pulse' : ''}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate">{c}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Print-ready PDF · TOC + bookmarks</span>
              <span className="hidden sm:inline">Cmd+K to navigate</span>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            This is the actual workspace surface — not a screenshot.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default HeroDemo;