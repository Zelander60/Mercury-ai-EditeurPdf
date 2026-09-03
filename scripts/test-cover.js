const { CoverGenerator } = require('../src/lib/doc-engine/cover');

const config = {
  title: 'Test Book',
  subtitle: 'A Test',
  author: 'Test Author',
  publisher: 'Pierre Studio',
  style: 'elegant',
  background: '#1a1a2e',
  accent: '#e94560',
  textColor: '#ffffff',
  subtitleColor: '#cccccc',
  authorColor: '#ffffff',
  border: true
};

async function test() {
  console.log('Creating cover...');
  const cover = new CoverGenerator(config);
  console.log('Initializing...');
  await cover.init();
  console.log('Building...');
  const result = await cover.build('C:\\Users\\HP\\AppData\\Local\\Temp\\opencode\\test-cover.pdf');
  console.log('Done:', result);
}

test().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
