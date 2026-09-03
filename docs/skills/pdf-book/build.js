#!/usr/bin/env node
/**
 * pdf-book-build — Full book builder: cover + content + merge
 * Usage: node build.js <book.json> [output.pdf]
 *
 * If book.json contains a "cover" field, generates cover and merges.
 * If no "cover" field, generates content only (like engine.js).
 *
 * book.json with cover:
 * {
 *   "title": "...",
 *   "author": "...",
 *   "cover": {
 *     "style": "elegant",
 *     "background": "#1a1a2e",
 *     "accent": "#e94560",
 *     "textColor": "#ffffff",
 *     "subtitleColor": "#cccccc",
 *     "authorColor": "#ffffff",
 *     "border": true
 *   },
 *   "chapters": [...]
 * }
 */

const { BookEngine } = require("./engine");
const { CoverGenerator } = require("./cover");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const os = require("os");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node build.js <book.json> [output.pdf]");
    process.exit(1);
  }

  const bookPath = args[0];
  const outputPath = args[1] || bookPath.replace(/\.json$/, ".pdf");
  const book = JSON.parse(fs.readFileSync(bookPath, "utf-8"));

  const tmpDir = os.tmpdir();
  const timestamp = Date.now();

  // Build content
  console.log("Building book content...");
  const contentPath = path.join(tmpDir, `pdf-book-content-${timestamp}.pdf`);
  const engine = new BookEngine(book);
  await engine.init();
  const contentResult = await engine.build(contentPath);
  console.log(`  Content: ${contentResult.pages} pages, ${contentResult.bytes} bytes`);

  // Build cover if configured
  if (book.cover) {
    console.log("Building cover...");
    const coverPath = path.join(tmpDir, `pdf-book-cover-${timestamp}.pdf`);
    const coverConfig = {
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      publisher: book.publisher,
      ...book.cover,
    };
    const cover = new CoverGenerator(coverConfig);
    await cover.init();
    const coverResult = await cover.build(coverPath);
    console.log(`  Cover: ${coverResult.bytes} bytes`);

    // Merge
    console.log("Merging cover + content...");
    const coverBytes = fs.readFileSync(coverPath);
    const contentBytes = fs.readFileSync(contentPath);
    const coverDoc = await PDFDocument.load(coverBytes);
    const contentDoc = await PDFDocument.load(contentBytes);
    const mergedDoc = await PDFDocument.create();

    const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
    mergedDoc.addPage(coverPage);
    const contentPages = await mergedDoc.copyPages(contentDoc, contentDoc.getPageIndices());
    for (const page of contentPages) {
      mergedDoc.addPage(page);
    }

    const pdfBytes = await mergedDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    // Cleanup temp files
    try { fs.unlinkSync(contentPath); } catch (e) {}
    try { fs.unlinkSync(coverPath); } catch (e) {}

    console.log(`\nBook generated: ${outputPath} (${1 + contentResult.pages} pages, ${pdfBytes.length} bytes)`);
  } else {
    // No cover — just rename content to output
    fs.copyFileSync(contentPath, outputPath);
    try { fs.unlinkSync(contentPath); } catch (e) {}
    console.log(`\nBook generated: ${outputPath} (${contentResult.pages} pages, ${contentResult.bytes} bytes)`);
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
