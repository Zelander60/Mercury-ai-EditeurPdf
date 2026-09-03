import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/stripe/adminTasks';
import { getURL } from '@/lib/utils';
import { getServerUser } from '@/lib/auth';
import { NextResponse } from 'next/server';
export async function POST() {
  try {
    const user = await getServerUser();

    if (!user) throw new Error('could not find the user');

    const customer = await createOrRetrieveCustomer({
      email: user.email || '',
      uuid: user.id,
    });

    if (!customer) throw new Error('No Customer');
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/dashboard`,
    });
    return NextResponse.json({ url });
  } catch (error) {
    console.log('ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}