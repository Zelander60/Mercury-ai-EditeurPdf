/**
 * Create the BookGenerator Stripe catalog (TEST mode) via the API.
 *
 * Creates:
 *   - Pro  product  -> $29.00 / month recurring price
 *   - Team product  -> $99.00 / month recurring price
 *
 * Uses STRIPE_SECRET_KEY from the local .env (via dotenv).
 * Prints the created ids — the webhooks (product.created / price.created)
 * then auto-sync these into the Supabase products/prices tables. If webhooks
 * are not yet wired, run scripts/seed-stripe-products.js with these ids instead.
 *
 * Run:  node scripts/create-stripe-catalog.js
 */
require('dotenv').config({ path: '.env' });

const Stripe = require('stripe');

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('Missing STRIPE_SECRET_KEY in .env');
    process.exit(1);
  }
  const stripe = new Stripe(key, { apiVersion: '2023-10-16' });

  // Sanity check the key works
  const account = await stripe.balance.retrieve();
  console.log(
    'API key OK — balance available:',
    (account.available?.[0]?.amount ?? 0) / 100,
    account.available?.[0]?.currency
  );

  const plans = [
    {
      name: 'Pro',
      description: 'Up to 25 AI-generated books/month, watermark removal, priority AI queue',
      unitAmount: 2900,
      metadata: { plan: 'pro' },
    },
    {
      name: 'Team',
      description: 'Unlimited AI books + realtime collaboration + dedicated support',
      unitAmount: 9900,
      metadata: { plan: 'team' },
    },
  ];

  for (const plan of plans) {
    // One product per plan (Stripe best practice — never mix tiers on one product)
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: plan.metadata,
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.unitAmount,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { plan: plan.metadata.plan },
    });
    console.log(`\n${plan.name}:`);
    console.log(`  product_id = ${product.id}`);
    console.log(`  price_id   = ${price.id}`);
  }

  console.log('\nDone. Copy the printed ids into scripts/seed-stripe-products.js');
  console.log('if webhooks are not yet configured to sync them.');
}

main().catch((e) => {
  console.error('Error:', e.message || e);
  process.exit(1);
});
