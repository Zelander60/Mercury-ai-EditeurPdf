'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { getStripe } from '@/lib/stripe/stripeClient';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { Check, Sparkles, Loader2 } from 'lucide-react';

interface PriceType {
  id: string;
  unitAmount: number | null;
  currency: string;
  interval: string | null;
  intervalCount: number | null;
  trialPeriodDays: number | null;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  prices?: PriceType[];
}

type DisplayPlan = {
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  annualTotal: number;
  priceId: string | null;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
};

const FALLBACK_PLANS: DisplayPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for trying — habit + invite loop',
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    annualTotal: 0,
    priceId: null,
    features: ['5 books / month', '1 workspace', 'AI outline → chapters', 'Basic covers', 'Watermarked PDF'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For serious authors who ship',
    priceMonthly: 29,
    priceAnnualMonthly: 24,
    annualTotal: 290,
    priceId: '__pro__',
    features: [
      'Unlimited books',
      'All models (Claude, GPT-4, Gemini)',
      'All cover styles + custom branding',
      'PDF canvas editor',
      'Priority queue',
      'Reverse trial: 14 days free',
    ],
    cta: 'Start Pro — 2 mo free',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    description: 'For agencies & publishing teams',
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    annualTotal: 990,
    priceId: '__team__',
    features: [
      'Everything in Pro',
      'Unlimited workspaces & seats',
      'Team libraries & comments',
      'API access',
      'White-label exports',
      'Dedicated support',
    ],
    cta: 'Start Team',
    highlighted: false,
  },
];

function formatAmount(price: PriceType): string {
  if (price.unitAmount == null) return '—';
  const amount = price.unitAmount / 100;
  if (amount === Math.floor(amount)) return `${amount}`;
  return amount.toFixed(2);
}

export const PricingSection: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const [plans, setPlans] = useState<DisplayPlan[]>(FALLBACK_PLANS);
  const [hasStripePlans, setHasStripePlans] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, subscription } = useSupabaseUser();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const { data } = await res.json();
        if (data && data.length) {
          const stripePlans: DisplayPlan[] = data.map((p: Product) => {
            const price = p.prices?.[0];
            const monthly = price?.unitAmount ? price.unitAmount / 100 : 0;
            const annualMonthly = Math.round(monthly * 0.83);
            const annualTotal = annualMonthly * 12;
            const isPro = p.name.toLowerCase().includes('pro');
            return {
              name: p.name,
              description: p.description || '',
              priceMonthly: monthly,
              priceAnnualMonthly: annualMonthly,
              annualTotal,
              priceId: price?.id || null,
              features: isPro
                ? FALLBACK_PLANS[1].features
                : p.name.toLowerCase().includes('team')
                  ? FALLBACK_PLANS[2].features
                  : FALLBACK_PLANS[0].features,
              cta: isPro ? 'Start Pro — 2 mo free' : p.name === 'Starter' ? 'Start free' : 'Start Team',
              highlighted: isPro,
              badge: isPro ? 'Most Popular' : undefined,
            };
          });
          // Ensure Starter exists
          if (!stripePlans.some((p) => p.priceMonthly === 0)) {
            stripePlans.unshift(FALLBACK_PLANS[0]);
          }
          setPlans(stripePlans);
          setHasStripePlans(true);
        }
      } catch (e) {
        // fallback
      }
    };
    loadProducts();
  }, []);

  const handleCheckout = useCallback(
    async (plan: DisplayPlan) => {
      if (loading) return;

      if (!plan.priceId || !hasStripePlans) {
        router.push('/signup');
        return;
      }

      if (!user) {
        toast({
          title: 'Create your free workspace first',
          description: 'Start free — upgrade when you hit momentum.',
        });
        router.push('/signup');
        return;
      }

      if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        toast({ title: 'You already have a paid plan' });
        return;
      }

      setLoading(plan.priceId);
      try {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: { id: plan.priceId } }),
        });
        const { sessionId } = await res.json();
        if (!sessionId) throw new Error('No session');
        const stripe = await getStripe();
        const err = await stripe?.redirectToCheckout({ sessionId });
        if (err) throw new Error(err.error?.message || 'Checkout failed');
      } catch (e: any) {
        toast({ title: 'Something went wrong', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(null);
      }
    },
    [loading, user, subscription, router, toast, hasStripePlans]
  );

  return (
    <div className="space-y-8">
      {/* Annual/monthly toggle — default annual (20–30% more annual attach) */}
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex rounded-full border bg-muted p-1">
          <button
            onClick={() => setAnnual(true)}
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${annual ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-pressed={annual}
          >
            Annually
            <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
              2 months free
            </span>
          </button>
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!annual ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-pressed={!annual}
          >
            Monthly
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {annual ? 'Billed annually · Cancel anytime · Save ~17% vs monthly' : 'Billed monthly · Switch to annual anytime and save'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const displayPrice = annual ? plan.priceAnnualMonthly : plan.priceMonthly;
          const isFree = plan.priceMonthly === 0;
          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.highlighted ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {plan.badge}
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {plan.name}
                  {plan.highlighted && <Sparkles className="h-4 w-4 text-primary" />}
                </CardTitle>
                <CardDescription className="min-h-[40px] text-sm leading-relaxed">
                  {plan.description}
                </CardDescription>
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tighter">${displayPrice}</span>
                    {!isFree && <span className="text-sm text-muted-foreground">/mo</span>}
                  </div>
                  {!isFree && annual && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ${plan.annualTotal}/year · You save ${plan.priceMonthly * 12 - plan.annualTotal}/yr vs monthly
                    </p>
                  )}
                  {!isFree && !annual && (
                    <p className="mt-1 text-xs text-muted-foreground">Billed monthly · Annual saves 2 months</p>
                  )}
                  {isFree && <p className="mt-1 text-xs text-muted-foreground">No credit card · 5 books/mo</p>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan)}
                  disabled={loading !== null}
                  aria-busy={loading === plan.priceId}
                >
                  {loading === plan.priceId ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {loading === plan.priceId ? 'Redirecting…' : plan.cta}
                </Button>
                {plan.highlighted && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">14-day Pro reverse trial included</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Cancel anytime · 14-day Pro reverse trial, then Free · Annual 2 months free vs monthly · Prices in USD
      </p>
    </div>
  );
};