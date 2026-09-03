const { buildBook } = require('../src/lib/doc-engine/book-builder');

const book = {
  title: 'AI for Small Business',
  subtitle: 'A Practical Guide',
  author: 'Peter Lompo',
  publisher: 'Pierre Studio',
  cover: {
    style: 'elegant',
    background: '#1a1a2e',
    accent: '#e94560',
    textColor: '#ffffff',
    subtitleColor: '#cccccc',
    authorColor: '#ffffff',
    border: true
  },
  chapters: [
    {
      title: 'Introduction',
      sections: [
        {
          heading: 'Overview',
          paragraphs: [
            'Artificial Intelligence is no longer just for tech giants.',
            'This book provides a practical guide to implementing AI in your small business.'
          ]
        }
      ]
    }
  ]
};

async function test() {
  console.log('Building book...');
  const { pdfBytes, pages } = await buildBook(book);
  const fs = require('fs');
  const outputPath = 'C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\test-buildbook.pdf';
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Done: ${outputPath} (${pages} pages, ${pdfBytes.length} bytes)`);
}

test().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
