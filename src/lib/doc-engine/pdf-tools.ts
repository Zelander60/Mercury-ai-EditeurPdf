/**
 * PDF Tools - Client-side PDF manipulation
 * Uses pdf-lib for all operations (no browser needed)
 */
import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Compress a PDF by removing metadata and optimizing streams
 */
export async function compressPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  // Remove metadata to reduce size
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  // Save with compression options
  return pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePdfs(pdfArray: Uint8Array[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const pdfBytes of pdfArray) {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const copiedPages = await mergedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  return mergedDoc.save();
}

/**
 * Split a PDF into individual pages
 */
export async function splitPdf(
  pdfBytes: Uint8Array,
  ranges?: Array<{ start: number; end: number }>
): Promise<Uint8Array[]> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const results: Uint8Array[] = [];

  if (ranges) {
    for (const range of ranges) {
      const start = Math.max(0, range.start - 1); // 1-indexed to 0-indexed
      const end = Math.min(pageCount - 1, range.end - 1);
      const newDoc = await PDFDocument.create();
      const pages = await newDoc.copyPages(pdfDoc, Array.from({ length: end - start + 1 }, (_, i) => start + i));
      pages.forEach((page) => newDoc.addPage(page));
      results.push(await newDoc.save());
    }
  } else {
    // Split into individual pages
    for (let i = 0; i < pageCount; i++) {
      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(pdfDoc, [i]);
      newDoc.addPage(page);
      results.push(await newDoc.save());
    }
  }

  return results;
}

/**
 * Extract specific pages from a PDF
 */
export async function extractPages(
  pdfBytes: Uint8Array,
  pageNumbers: number[] // 1-indexed
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const indices = pageNumbers
    .filter((n) => n >= 1 && n <= pdfDoc.getPageCount())
    .map((n) => n - 1);

  const pages = await newDoc.copyPages(pdfDoc, indices);
  pages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}

/**
 * Add a text watermark to all pages
 */
export async function addWatermark(
  pdfBytes: Uint8Array,
  text: string,
  options?: {
    fontSize?: number;
    color?: string;
    opacity?: number;
    rotation?: number;
  }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  const {
    fontSize = 50,
    color = 'CCCCCC',
    opacity = 0.3,
    rotation = 45,
  } = options || {};

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - (text.length * fontSize * 0.3),
      y: height / 2,
      size: fontSize,
      color: undefined,
      opacity,
      rotate: degrees(rotation),
    });
  }

  return pdfDoc.save();
}

/**
 * Get PDF page count and metadata
 */
export async function getPdfInfo(pdfBytes: Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
    pages: pdfDoc.getPages().map((page, i) => ({
      index: i + 1,
      width: page.getSize().width,
      height: page.getSize().height,
    })),
    sizeBytes: pdfBytes.byteLength,
    sizeMB: (pdfBytes.byteLength / (1024 * 1024)).toFixed(2),
  };
}
