const { BookEngine } = require('../src/lib/doc-engine/engine');

const book = {
  title: 'Test Book',
  subtitle: 'A Test',
  author: 'Test Author',
  chapters: [
    {
      title: 'Chapter 1',
      sections: [
        { heading: 'Section 1', paragraphs: ['This is a test paragraph.'] }
      ]
    }
  ]
};

async function test() {
  console.log('Creating engine...');
  const engine = new BookEngine(book);
  console.log('Initializing...');
  await engine.init();
  console.log('Building...');
  const result = await engine.build('C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\test-engine.pdf');
  console.log('Done:', result);
}

test().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
