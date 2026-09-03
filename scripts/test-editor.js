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

async function testEditor() {
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
  const { PDFDocument, rgb } = require('pdf-lib');

  console.log('Building base PDF...');
  const { pdfBytes } = await buildBook(book);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  console.log('Page count:', pdfDoc.getPageCount());
  const firstPage = pdfDoc.getPage(0);
  const size = firstPage.getSize();
  console.log('Page size:', size.width, 'x', size.height);

  // Test applying operations inline
  const testOps = [
    {
      type: 'text',
      id: 'test-text-1',
      page: 1,
      x: 100,
      y: 100,
      text: 'Hello from PDF Editor!',
      fontSize: 24,
      color: '#e94560',
    },
    {
      type: 'shape',
      id: 'test-shape-1',
      page: 1,
      x: 100,
      y: 200,
      width: 150,
      height: 80,
      shape: 'rect',
      color: '#1a1a2e',
      thickness: 3,
    },
  ];

  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return rgb(r, g, b);
  }

  console.log('Applying operations...');
  for (const op of testOps) {
    const pageIndex = op.page - 1;
    if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) continue;
    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();
    const pdfY = height - op.y;

    if (op.type === 'text') {
      page.drawText(op.text, {
        x: op.x,
        y: pdfY,
        size: op.fontSize,
        color: hexToRgb(op.color),
      });
    } else if (op.type === 'shape') {
      page.drawRectangle({
        x: op.x,
        y: pdfY - op.height,
        width: op.width,
        height: op.height,
        borderColor: hexToRgb(op.color),
        borderWidth: op.thickness || 1,
      });
    }
  }

  const finalBytes = await pdfDoc.save();
  const fs = require('fs');
  const outputPath = 'C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\test-editor-output.pdf';
  fs.writeFileSync(outputPath, finalBytes);
  console.log(`PDF with operations: ${outputPath} (${finalBytes.length} bytes)`);

  // Save operations to document
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      content_json: {
        ...doc.content_json,
        operations: testOps,
      }
    })
    .eq('id', doc.id);

  if (updateError) {
    console.error('Update error:', updateError);
  } else {
    console.log('Operations saved to document');
  }

  process.exit(0);
}

testEditor().catch(e => {
  console.error(e);
  process.exit(1);
});
