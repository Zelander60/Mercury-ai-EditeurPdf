/**
 * Seed Stripe products + prices into Supabase.
 *
 * STEP 1: Create the products & recurring prices in Stripe TEST mode:
 *   - Pro  : 29.00 USD / month
 *   - Team : 99.00 USD / month
 * STEP 2: Copy the product IDs (prod_...) and price IDs (price_...)
 *   from the Stripe dashboard into the PLACEHOLDERS below.
 * STEP 3: Run:  node scripts/seed-stripe-products.js
 */
const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// ── PASTE YOUR STRIPE IDs HERE ─────────────────────────────────
const PRO_PRODUCT_ID = 'prod_VB0xtNNp2jMZ5a';
const PRO_PRICE_MONTHLY_ID = 'price_1UAew3B40NNZ3H2hdTMCyKir';
const TEAM_PRODUCT_ID = 'prod_VB0yemXEat5UFQ';
const TEAM_PRICE_MONTHLY_ID = 'price_1UAew4B40NNZ3H2hkwNOfYkg';
// ───────────────────────────────────────────────────────────────

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    // Products
    await sql`
      INSERT INTO products (id, active, name, description)
      VALUES (${PRO_PRODUCT_ID}, true, 'Pro', 'Up to 25 AI-generated books/month + watermark removal')
      ON CONFLICT (id) DO UPDATE SET active = true, name = EXCLUDED.name, description = EXCLUDED.description
    `;
    await sql`
      INSERT INTO products (id, active, name, description)
      VALUES (${TEAM_PRODUCT_ID}, true, 'Team', 'Unlimited AI books + collaboration + priority AI queue')
      ON CONFLICT (id) DO UPDATE SET active = true, name = EXCLUDED.name, description = EXCLUDED.description
    `;

    // Prices (monthly recurring)
    await sql`
      INSERT INTO prices (id, product_id, active, unit_amount, currency, type, interval, interval_count)
      VALUES (${PRO_PRICE_MONTHLY_ID}, ${PRO_PRODUCT_ID}, true, 2900, 'usd', 'recurring', 'month', 1)
      ON CONFLICT (id) DO UPDATE SET active = true
    `;
    await sql`
      INSERT INTO prices (id, product_id, active, unit_amount, currency, type, interval, interval_count)
      VALUES (${TEAM_PRICE_MONTHLY_ID}, ${TEAM_PRODUCT_ID}, true, 9900, 'usd', 'recurring', 'month', 1)
      ON CONFLICT (id) DO UPDATE SET active = true
    `;

    const res = await sql`
      SELECT p.name, p.active, pr.id AS price_id, pr.unit_amount, pr.interval
      FROM products p
      LEFT JOIN prices pr ON pr.product_id = p.id
      ORDER BY p.name
    `;
    console.log('Seeded products/prices:');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
