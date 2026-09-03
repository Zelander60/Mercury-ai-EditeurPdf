'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { postData } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, Zap, ArrowUpRight } from 'lucide-react';

interface Props {
  workspaceId: string;
}

export default function BillingSettings({ workspaceId }: Props) {
  const { subscription } = useSupabaseUser();
  const { open, setOpen } = useSubscriptionModal();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const router = useRouter();
  const isPro = subscription?.status === 'active';

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      setLoadingPortal(false);
    }
    setLoadingPortal(false);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold tracking-tight">Current Plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your subscription status and billing management.
        </p>
        <Separator className="my-4" />

        <div className="max-w-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent">
              <Zap className={`h-5 w-5 ${isPro ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {isPro ? 'Pro' : 'Free'} Plan
                </span>
                <Badge
                  variant={isPro ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {isPro ? 'Active' : 'Free'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPro
                  ? 'Full access to all premium features.'
                  : 'Upgrade to unlock unlimited exports, custom fonts, and more.'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {isPro ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={loadingPortal}
                onClick={redirectToCustomerPortal}
              >
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                {loadingPortal ? 'Redirecting...' : 'Manage Subscription'}
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 text-xs"
                onClick={() => setOpen(true)}
              >
                <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                Upgrade to Pro
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => router.push('/#pricing')}
            >
              View all plans
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
