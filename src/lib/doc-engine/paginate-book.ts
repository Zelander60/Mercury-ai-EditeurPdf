export interface BookPageTextBlock {
  type: 'title' | 'subtitle' | 'author' | 'chapter' | 'heading' | 'paragraph' | 'bullet';
  text: string;
  fontSize: number;
  bold?: boolean;
}

export interface BookPage {
  pageNumber: number;
  blocks: BookPageTextBlock[];
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72; // 1 inch
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 468
const MAX_HEIGHT = PAGE_HEIGHT - MARGIN * 2; // 648

function heightForBlock(block: BookPageTextBlock): number {
  switch (block.type) {
    case 'title':
      return 40;
    case 'subtitle':
      return 28;
    case 'author':
      return 24;
    case 'chapter':
      return 34;
    case 'heading':
      return 28;
    case 'bullet':
      return 20;
    default:
      // paragraph: approximate wrap height
      const charsPerLine = Math.floor(CONTENT_WIDTH / (block.fontSize * 0.5));
      const lines = Math.max(1, Math.ceil(block.text.length / charsPerLine));
      return lines * (block.fontSize * 1.4) + 6;
  }
}

export function paginateBook(book: any): BookPage[] {
  const pages: BookPage[] = [];
  let cur: BookPage | null = null;
  let used = 0;

  const push = (block: BookPageTextBlock) => {
    const h = heightForBlock(block);
    if (!cur || used + h > MAX_HEIGHT) {
      cur = { pageNumber: pages.length + 1, blocks: [] };
      pages.push(cur);
      used = 0;
    }
    cur.blocks.push(block);
    used += h;
  };

  // Title page
  if (book?.title) push({ type: 'title', text: book.title, fontSize: 34, bold: true });
  if (book?.subtitle) push({ type: 'subtitle', text: book.subtitle, fontSize: 18 });
  if (book?.author)
    push({ type: 'author', text: book.author, fontSize: 14 });

  const chapters = Array.isArray(book?.chapters) ? book.chapters : [];
  if (chapters.length === 0) {
    if (!book?.title) {
      push({
        type: 'paragraph',
        text: 'This book is empty. Open the Raw JSON view to add chapters, or generate content with the Writing Agent.',
        fontSize: 12,
      });
    }
  }

  for (const ch of chapters) {
    if (ch.title) push({ type: 'chapter', text: ch.title, fontSize: 22, bold: true });
    const sections = Array.isArray(ch.sections) ? ch.sections : [];
    for (const sec of sections) {
      if (sec.heading)
        push({ type: 'heading', text: sec.heading, fontSize: 16, bold: true });
      const paras = Array.isArray(sec.paragraphs) ? sec.paragraphs : [];
      for (const p of paras) {
        if (p) push({ type: 'paragraph', text: p, fontSize: 12 });
      }
      const bullets = Array.isArray(sec.bullets) ? sec.bullets : [];
      for (const b of bullets) {
        if (b) push({ type: 'bullet', text: `• ${b}`, fontSize: 12 });
      }
    }
  }

  return pages;
}
