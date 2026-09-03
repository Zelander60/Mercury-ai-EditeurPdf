require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testExport() {
  const { data: doc, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', '490b836b-663e-46c5-b268-588d6205740f')
    .single();

  if (error || !doc) {
    console.error('Document not found:', error);
    process.exit(1);
  }

  console.log('Found document:', doc.title);

  const book = doc.content_json || {
    title: doc.title,
    subtitle: doc.subtitle || '',
    chapters: [],
  };

  book.title = book.title || doc.title;
  book.subtitle = book.subtitle || doc.subtitle || '';
  if (doc.cover_config) {
    book.cover = { ...(book.cover || {}), ...doc.cover_config };
  }

  const { buildBook } = require('../src/lib/doc-engine/book-builder');
  const fs = require('fs');

  console.log('Building PDF...');
  const { pdfBytes, pages } = await buildBook(book);

  const outputPath = 'C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\test-export.pdf';
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF exported: ${outputPath} (${pages} pages, ${pdfBytes.length} bytes)`);
  process.exit(0);
}

testExport().catch(e => {
  console.error(e);
  process.exit(1);
});
