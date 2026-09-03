const { BookEngine } = require("./engine");
const { CoverGenerator } = require("./cover");
const { PDFDocument } = require("pdf-lib");

/**
 * Build a complete book PDF from a book JSON object.
 * Returns a Buffer of PDF bytes.
 */
async function buildBook(book) {
  const os = require("os");
  const fs = require("fs");
  const path = require("path");

  const tmpDir = os.tmpdir();
  const timestamp = Date.now();

  // Build content
  const contentPath = path.join(tmpDir, `pdf-book-content-${timestamp}.pdf`);
  const engine = new BookEngine(book);
  await engine.init();
  const contentResult = await engine.build(contentPath);

  // Build cover if configured
  if (book.cover) {
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
    await cover.build(coverPath);

    // Merge
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

    // Cleanup
    try { fs.unlinkSync(contentPath); } catch (e) {}
    try { fs.unlinkSync(coverPath); } catch (e) {}

    return { pdfBytes, pages: 1 + contentResult.pages };
  }

  // No cover
  const pdfBytes = fs.readFileSync(contentPath);
  try { fs.unlinkSync(contentPath); } catch (e) {}
  return { pdfBytes, pages: contentResult.pages };
}

module.exports = { buildBook };
