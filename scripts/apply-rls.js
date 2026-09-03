/**
 * Apply Row Level Security policies from enable-rls.sql.
 *
 * WARNING: Only run AFTER launching and validating the app, and after
 * confirming browser-side queries won't break. Server routes are unaffected
 * (service role bypasses RLS).
 *
 * Run:  node scripts/apply-rls.js
 */
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  const file = path.join(__dirname, 'enable-rls.sql');
  const content = fs.readFileSync(file, 'utf8');
  try {
    await sql.unsafe(content);
    console.log('RLS policies applied successfully.');
  } catch (e) {
    console.error('Error applying RLS:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
