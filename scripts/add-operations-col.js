const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS operations JSONB DEFAULT '[]'::jsonb`;
    console.log('Added operations column');

    const check = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'operations'
    `;
    console.log('Column:', JSON.stringify(check));

    // Also verify content_json column exists (used by editor)
    const check2 = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'documents'
    `;
    console.log('All columns:', check2.map((r) => r.column_name).join(', '));

  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

main();
