import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PricingSection } from '@/components/landing-page/pricing-section';
import { HeroDemo } from '@/components/landing-page/hero-demo';
import { SiteFooter } from '@/components/site/footer';
import { BookOpen, Palette, Layers, Sparkles, Zap, Users, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI as infrastructure',
    description: 'Not a chatbot. Outline → chapters → polish, inline. Claude, GPT-4, Gemini behind the curtain — you feel speed, not latency.',
  },
  {
    icon: Palette,
    title: 'Covers that convert',
    description: 'Genre-tuned gradients, typography, and layout. No design skills — every cover looks like it cost $500.',
  },
  {
    icon: Layers,
    title: 'PDF canvas, not a preview',
    description: 'Coordinate-based editor: drag text, shapes, highlights. What you move is what prints.',
  },
  {
    icon: BookOpen,
    title: '15 genre presets',
    description: 'Thriller to self-help, romance to sci-fi — templates with smart formatting and chapter frameworks.',
  },
  {
    icon: Zap,
    title: '90-second export',
    description: 'Bookmarks, TOC, print-ready PDF. One click, no formatting hell.',
  },
  {
    icon: Users,
    title: 'Team workspace',
    description: 'Workspaces, roles, comments, and shared libraries. Invite, collaborate, ship — like Linear for books.',
  },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', role: 'Self-Published Author · 12k copies', quote: 'Generated a 200-page self-help book in 10 minutes. Outline → PDF without touching InDesign.' },
  { name: 'James K.', role: 'Business Coach · 3 lead magnets', quote: 'Saves 40+ hours per book. My free tier hit 80% — Pro paid for itself in one client.' },
  { name: 'Lisa P.', role: 'Content Creator · 28k subscribers', quote: 'The canvas is the moat. I move a highlight and the PDF moves — trust is instant.' },
];

const LOGOS = ['Acme Co.', 'Northbeam', 'Flowrite', 'Craftbase', 'Brightside', 'Atlas'];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero — carries entire pitch */}
      <section className="relative overflow-hidden">
        {/* premium mesh aura */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_500px_at_50%_-100px,hsl(var(--primary)/0.12),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              New — Outline to print-ready PDF in 90 seconds
              <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground">
                <span aria-hidden>·</span> Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘K</kbd> anywhere
              </span>
            </div>

            <h1 className="mt-6 text-balance text-5xl font-semibold tracking-[-0.022em] sm:text-6xl md:text-[64px] md:leading-[0.95]">
              The publishing workspace
              <span className="block text-primary">for teams and AI agents</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Turn any idea into a print-ready book — from outline to PDF in 90 seconds. No design skills. No formatting hell. Built for the AI era.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Start writing free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  See live demo
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required · 5 free books · Reverse trial: 14 days of Pro, then Free
            </p>

            {/* Social proof — immediately at friction point */}
            <div className="mt-10 border-t pt-8">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Trusted by authors and teams shipping weekly
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 opacity-60">
                {LOGOS.map((logo) => (
                  <span key={logo} className="text-sm font-semibold tracking-tight">
                    {logo}
                  </span>
                ))}
              </div>
              <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
                “ChatGPT traffic converts at 24% — 6× Google. Our demo is indexed for LLMs, not just SEO.”
              </p>
            </div>
          </div>

          {/* Product is demo — working surface, not screenshot */}
          <div id="demo" className="mx-auto mt-12 max-w-5xl scroll-mt-24">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* How It Works — progressive disclosure, 3 steps */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">From idea to finished book in 90 seconds</h2>
          <p className="mt-3 text-muted-foreground">Three steps. No tours. The checklist pulls you to the aha moment.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { step: '01', title: 'Describe your book', desc: 'One field. Title + topic. Genre auto-tuned — you pick the outcome, we handle the structure.' },
            { step: '02', title: 'AI generates — you direct', desc: 'Chapters stream in. Polish inline, not in a chat. Every edit is instant, not a round-trip.' },
            { step: '03', title: 'Export print-ready PDF', desc: 'Cover, TOC, bookmarks — one click. Private, not public; signed URLs, no leaks.' },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border bg-card p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — calm, one family, generous whitespace */}
      <section id="features" className="mx-auto mt-16 max-w-6xl px-6 md:mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything you need. Nothing you don’t — until you do.</h2>
          <p className="mt-3 text-muted-foreground">Progressive disclosure: power is there, but calm is default.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex flex-col transition-all duration-premium ease-premium hover:shadow-premium motion-reduce:transition-none">
              <CardHeader className="pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-4 w-4" />
                </div>
                <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials — metric outcomes, not generic praise */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Loved by authors who ship</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="bg-card">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">“{t.quote}”</p>
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing — annual-first, will be enhanced with toggle */}
      <section id="pricing" className="mx-auto mt-24 max-w-5xl px-6 scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Simple pricing. 2 months free on annual.</h2>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you hit momentum — not before.</p>
        </div>
        <div className="mt-12">
          <PricingSection />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          Annual saves ~17% vs monthly. Monthly stays for flexibility — upgrade at 80% usage or on pricing-page visit (intent, not calendar). 14-day Pro reverse trial included.
        </p>
      </section>

      {/* Final CTA — one primary action */}
      <section className="mx-auto mb-16 mt-16 max-w-3xl px-6 text-center md:mt-24">
        <Card className="border bg-card shadow-premium ring-1 ring-primary/10">
          <CardContent className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to ship your next book?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join authors who went from idea to print-ready PDF in one session. Your first book is 90 seconds away.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base">
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground">No credit card · Cancel anytime</span>
            </div>
          </CardContent>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
};

export default HomePage;