import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/stripe/adminTasks';
import { getURL } from '@/lib/utils';
import { getServerUser } from '@/lib/auth';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const { price, quantity = 1, metadata = {} } = await request.json();
  try {
    const user = await getServerUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const customer = await createOrRetrieveCustomer({
      email: user.email || '',
      uuid: user.id,
    });
    const params: Stripe.Checkout.SessionCreateParams = {
      billing_address_collection: 'required',
      customer: customer || undefined,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: { trial_period_days: 14, metadata },
      success_url: `${getURL()}/dashboard`,
      cancel_url: `${getURL()}/dashboard`,
    };
    const session = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}