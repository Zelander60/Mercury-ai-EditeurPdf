#!/usr/bin/env node
/**
 * pdf-book-merge — Merge a cover PDF with a book PDF
 * Usage: node merge.js <cover.pdf> <book.pdf> <output.pdf>
 */

const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error("Usage: node merge.js <cover.pdf> <book.pdf> <output.pdf>");
    process.exit(1);
  }

  const [coverPath, bookPath, outputPath] = args;

  const coverBytes = fs.readFileSync(coverPath);
  const bookBytes = fs.readFileSync(bookPath);

  const coverDoc = await PDFDocument.load(coverBytes);
  const bookDoc = await PDFDocument.load(bookBytes);

  const mergedDoc = await PDFDocument.create();

  // Copy cover (first page only)
  const [coverPage] = await mergedDoc.copyPages(coverDoc, [0]);
  mergedDoc.addPage(coverPage);

  // Copy all book pages
  const bookPages = await mergedDoc.copyPages(bookDoc, bookDoc.getPageIndices());
  for (const page of bookPages) {
    mergedDoc.addPage(page);
  }

  const pdfBytes = await mergedDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);

  const totalPages = 1 + bookDoc.getPageCount();
  console.log(`Merged: ${outputPath} (${totalPages} pages, ${pdfBytes.length} bytes)`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
