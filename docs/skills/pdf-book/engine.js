#!/usr/bin/env node
/**
 * pdf-book-engine — Professional book PDF generator
 * Uses pdf-lib + custom Google Fonts. No Chromium, no browser.
 *
 * Usage: node engine.js <book.json> [output.pdf]
 *
 * book.json structure:
 * {
 *   "title": "Book Title",
 *   "subtitle": "Subtitle",
 *   "author": "Author Name",
 *   "trim": [432, 648],        // 6x9 inches in points
 *   "margins": { "top": 72, "bottom": 72, "inside": 84, "outside": 72 },
 *   "chapters": [
 *     {
 *       "number": 1,
 *       "title": "Chapter Title",
 *       "sections": [
 *         { "heading": "Section Name", "paragraphs": ["text...", "text..."] }
 *       ]
 *     }
 *   ],
 *   "dedication": "For...",
 *   "epigraph": { "text": "...", "source": "— Author" }
 * }
 */

const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const path = require("path");

const FONTS_DIR = path.join(__dirname, "fonts");

// ── Language-based Author Names ──
const AUTHOR_NAMES = {
  fr: "Pierre Lompo",
  en: "Peter Lompo",
  de: "Peter Lompo",
  es: "Peter Lompo",
  it: "Peter Lompo",
  pt: "Peter Lompo",
  nl: "Peter Lompo",
  ru: "Peter Lompo",
  ja: "Peter Lompo",
  zh: "Peter Lompo",
  ko: "Peter Lompo",
  ar: "Peter Lompo",
};

function resolveAuthor(book) {
  if (book.author) return book.author;
  const lang = (book.lang || "en").toLowerCase().substring(0, 2);
  return AUTHOR_NAMES[lang] || "Peter Lompo";
}

function resolvePublisher(book) {
  return book.publisher || "Pierre Studio";
}

class BookEngine {
  constructor(book) {
    this.book = book;
    this.author = resolveAuthor(book);
    this.publisher = resolvePublisher(book);
    this.trimW = (book.trim && book.trim[0]) || 432;
    this.trimH = (book.trim && book.trim[1]) || 648;
    this.margin = book.margins || { top: 60, bottom: 60, inside: 60, outside: 48 };
    this.gutter = book.gutter || 0;
    this.doc = null;
    this.fonts = {};
    this.pageNum = 0;
    this.pages = [];
    this.tocEntries = [];
    this.currentY = 0;
    this.currentPage = null;
    this.headerH = 36;
    this.footerH = 36;
    this.bodyTop = 0;
    this.bodyBottom = 0;
    this.bodyLeft = 0;
    this.bodyRight = 0;
    this.bodyW = 0;
  }

  async init() {
    this.doc = await PDFDocument.create();
    this.doc.registerFontkit(fontkit);

    const load = async (name) => {
      const buf = fs.readFileSync(path.join(FONTS_DIR, name));
      return await this.doc.embedFont(buf);
    };

    this.fonts = {
      body: await load("Lora-Regular.ttf"),
      bodyBold: await load("Lora-Bold.ttf"),
      bodyItalic: await load("Lora-Italic.ttf"),
      bodyBoldItalic: await load("Lora-BoldItalic.ttf"),
      heading: await load("PlayfairDisplay-Regular.ttf"),
      headingBold: await load("PlayfairDisplay-Bold.ttf"),
      headingItalic: await load("PlayfairDisplay-Italic.ttf"),
      fallback: null,
    };
    // Verify all fonts have widthOfTextAtSize
    for (const [k, v] of Object.entries(this.fonts)) {
      if (v && typeof v.widthOfTextAtSize !== "function") {
        throw new Error(`Font "${k}" lacks widthOfTextAtSize (type=${typeof v}, constructor=${v.constructor?.name})`);
      }
    }
  }

  layoutMetrics() {
    this.bodyTop = this.trimH - this.margin.top - this.headerH;
    this.bodyBottom = this.margin.bottom + this.footerH;
    this.bodyLeft = this.margin.inside + this.gutter;
    this.bodyRight = this.trimW - this.margin.outside;
    this.bodyW = this.bodyRight - this.bodyLeft;
  }

  newPage() {
    const page = this.doc.addPage([this.trimW, this.trimH]);
    this.pages.push(page);
    this.pageNum++;
    this.currentY = this.bodyTop;
    this.currentPage = page;
    return page;
  }

  drawHeaderFooter() {
    if (this.pageNum <= 4) return; // skip front matter
    const page = this.currentPage;
    const isEven = this.pageNum % 2 === 0;

    // Page number
    const numStr = String(this.pageNum);
    const numW = this.fonts.body.widthOfTextAtSize(numStr, 9);
    const numX = isEven ? this.bodyLeft : this.bodyRight - numW;
    page.drawText(numStr, {
      x: numX,
      y: this.margin.bottom + 12,
      size: 9,
      font: this.fonts.body,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Running header (chapter title)
    const lastChapter = this.book.chapters && this.book.chapters.find((ch, i) => {
      const chPage = this._chapterStartPage[i];
      return chPage && this.pageNum >= chPage;
    });
    if (lastChapter) {
      const headerText = lastChapter.title.toUpperCase();
      const hw = this.fonts.body.widthOfTextAtSize(headerText, 7);
      const hx = isEven ? this.bodyLeft : this.bodyRight - hw;
      page.drawText(headerText, {
        x: hx,
        y: this.trimH - this.margin.top + 8,
        size: 7,
        font: this.fonts.body,
        color: rgb(0.6, 0.6, 0.6),
      });
    }
  }

  drawSeparator(y, width) {
    if (!this.currentPage) return;
    this.currentPage.drawLine({
      start: { x: this.bodyLeft, y },
      end: { x: this.bodyLeft + width, y },
      thickness: 1,
      color: rgb(0.75, 0.6, 0.4),
    });
  }

  wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  drawTextBlock(text, font, fontSize, color, lineHeight) {
    const lines = this.wrapText(text, font, fontSize, this.bodyW);
    for (const line of lines) {
      if (this.currentY < this.bodyBottom + 10) {
        this.drawHeaderFooter();
        this.newPage();
      }
      this.currentPage.drawText(line, {
        x: this.bodyLeft,
        y: this.currentY,
        size: fontSize,
        font,
        color,
      });
      this.currentY -= lineHeight;
    }
    return lines.length;
  }

  ensureSpace(needed) {
    if (this.currentY - needed < this.bodyBottom + 10) {
      this.drawHeaderFooter();
      this.newPage();
    }
  }

  // ── Cover Page ──
  drawCover() {
    this.newPage();
    const page = this.currentPage;
    const cx = this.trimW / 2;

    // Title
    const titleSize = 36;
    const titleLines = this.wrapText(this.book.title, this.fonts.headingBold, titleSize, this.bodyW - 40);
    let ty = this.trimH * 0.55;
    for (const line of titleLines) {
      const tw = this.fonts.headingBold.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2,
        y: ty,
        size: titleSize,
        font: this.fonts.headingBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      ty -= titleSize + 8;
    }

    // Subtitle
    if (this.book.subtitle) {
      const subSize = 16;
      const subLines = this.wrapText(this.book.subtitle, this.fonts.headingItalic, subSize, this.bodyW - 80);
      ty -= 20;
      for (const line of subLines) {
        const sw = this.fonts.headingItalic.widthOfTextAtSize(line, subSize);
        page.drawText(line, {
          x: cx - sw / 2,
          y: ty,
          size: subSize,
          font: this.fonts.headingItalic,
          color: rgb(0.4, 0.35, 0.3),
        });
        ty -= subSize + 6;
      }
    }

    // Separator
    this.drawSeparator(this.trimH * 0.42, 100);
    // Center the separator
    const lastLine = page._drawLine || null; // manual centering via coordinates above

    // Author
    if (this.author) {
      const authorSize = 14;
      const aw = this.fonts.body.widthOfTextAtSize(this.author, authorSize);
      page.drawText(this.author, {
        x: cx - aw / 2,
        y: this.trimH * 0.35,
        size: authorSize,
        font: this.fonts.body,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  // ── Dedication ──
  drawDedication() {
    if (!this.book.dedication) return;
    this.newPage();
    const page = this.currentPage;
    const text = this.book.dedication;
    const size = 14;
    const lines = this.wrapText(text, this.fonts.bodyItalic, size, this.bodyW * 0.6);
    let y = this.trimH * 0.55;
    const indent = this.trimW * 0.25;
    for (const line of lines) {
      page.drawText(line, { x: indent, y, size, font: this.fonts.bodyItalic, color: rgb(0.3, 0.3, 0.3) });
      y -= size + 8;
    }
  }

  // ── Epigraph ──
  drawEpigraph() {
    if (!this.book.epigraph) return;
    this.newPage();
    const page = this.currentPage;
    const { text, source } = this.book.epigraph;
    const size = 12;
    const lines = this.wrapText(text, this.fonts.bodyItalic, size, this.bodyW * 0.7);
    let y = this.trimH * 0.5;
    const indent = this.trimW * 0.2;
    for (const line of lines) {
      page.drawText(line, { x: indent, y, size, font: this.fonts.bodyItalic, color: rgb(0.35, 0.35, 0.35) });
      y -= size + 6;
    }
    if (source) {
      y -= 12;
      const srcSize = 10;
      const srcW = this.fonts.body.widthOfTextAtSize(source, srcSize);
      page.drawText(source, {
        x: indent + (this.bodyW * 0.7) - srcW,
        y, size: srcSize, font: this.fonts.body, color: rgb(0.5, 0.5, 0.5),
      });
    }
  }

  // ── Table of Contents ──
  drawTOC() {
    this.newPage();
    const page = this.currentPage;

    // Add bookmark for Contents
    try {
      this.doc.addOutline("Contents");
    } catch (e) {}

    // Title
    page.drawText("Contents", {
      x: this.bodyLeft,
      y: this.bodyTop,
      size: 24,
      font: this.fonts.headingBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Decorative line under title
    page.drawLine({
      start: { x: this.bodyLeft, y: this.bodyTop - 12 },
      end: { x: this.bodyLeft + 80, y: this.bodyTop - 12 },
      thickness: 1.5,
      color: rgb(0.75, 0.6, 0.4),
    });

    this.currentY = this.bodyTop - 40;

    let chapterNum = 0;
    for (const ch of this.book.chapters) {
      chapterNum++;
      this.ensureSpace(30);

      const numStr = ch.number ? String(ch.number) : String(chapterNum);
      const entryText = ch.title;

      // Chapter number
      const numText = numStr + ".  ";
      const numW = this.fonts.bodyBold.widthOfTextAtSize(numText, 11);
      this.currentPage.drawText(numText, {
        x: this.bodyLeft,
        y: this.currentY,
        size: 11,
        font: this.fonts.bodyBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Chapter title with dot leaders
      const titleStartX = this.bodyLeft + numW;
      const titleW = this.fonts.body.widthOfTextAtSize(entryText, 11);
      this.currentPage.drawText(entryText, {
        x: titleStartX,
        y: this.currentY,
        size: 11,
        font: this.fonts.body,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Dot leaders (fill remaining space with dots)
      const dotsStartX = titleStartX + titleW + 4;
      const dotsEndX = this.bodyRight - 10;
      if (dotsEndX > dotsStartX + 20) {
        const dotChar = ".";
        const dotW = this.fonts.body.widthOfTextAtSize(dotChar, 9);
        const dotsWidth = dotsEndX - dotsStartX;
        const numDots = Math.floor(dotsWidth / dotW);
        const dots = dotChar.repeat(Math.min(numDots, 60));
        this.currentPage.drawText(dots, {
          x: dotsStartX,
          y: this.currentY,
          size: 9,
          font: this.fonts.body,
          color: rgb(0.7, 0.7, 0.7),
        });
      }

      this.currentY -= 22;

      // Subsections
      if (ch.sections) {
        for (const sec of ch.sections) {
          if (!sec.heading) continue;
          this.ensureSpace(18);
          this.currentPage.drawText("    " + sec.heading, {
            x: this.bodyLeft + 20,
            y: this.currentY,
            size: 10,
            font: this.fonts.body,
            color: rgb(0.4, 0.4, 0.4),
          });
          this.currentY -= 18;
        }
      }

      this.currentY -= 6;
    }
    this.drawHeaderFooter();
  }

  // ── Chapter Title Page ──
  drawChapterStart(chapter, chapterNum) {
    // Always start chapters on a new page (right-hand page)
    this.drawHeaderFooter();
    this.newPage();
    this._chapterStartPage = this._chapterStartPage || {};
    this._chapterStartPage[chapterNum - 1] = this.pageNum;

    const page = this.currentPage;
    const cx = this.trimW / 2;

    // Add PDF bookmark/outline for this chapter
    const bookmarkTitle = chapter.number
      ? `${chapter.number}. ${chapter.title}`
      : `${chapterNum}. ${chapter.title}`;
    try {
      const outline = this.doc.addOutline(bookmarkTitle);
      this._outlines = this._outlines || [];
      this._outlines.push({ outline, pageNum: this.pageNum });
    } catch (e) {
      // Outline support may not be available in all pdf-lib versions
    }

    // Chapter number
    const numText = chapter.number ? `CHAPTER ${chapter.number}` : `CHAPTER ${chapterNum}`;
    const numSize = 10;
    const nw = this.fonts.body.widthOfTextAtSize(numText, numSize);
    page.drawText(numText, {
      x: cx - nw / 2,
      y: this.trimH * 0.65,
      size: numSize,
      font: this.fonts.body,
      color: rgb(0.5, 0.3, 0.18),
    });

    // Chapter title
    const titleSize = 28;
    const titleLines = this.wrapText(chapter.title, this.fonts.headingBold, titleSize, this.bodyW - 40);
    let ty = this.trimH * 0.65 - 50;
    for (const line of titleLines) {
      const tw = this.fonts.headingBold.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2,
        y: ty,
        size: titleSize,
        font: this.fonts.headingBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      ty -= titleSize + 8;
    }

    // Epigraph for chapter
    if (chapter.epigraph) {
      ty -= 30;
      const epSize = 11;
      const epLines = this.wrapText(chapter.epigraph.text, this.fonts.bodyItalic, epSize, this.bodyW * 0.6);
      const epIndent = this.trimW * 0.22;
      for (const line of epLines) {
        page.drawText(line, {
          x: epIndent, y: ty, size: epSize,
          font: this.fonts.bodyItalic, color: rgb(0.4, 0.4, 0.4),
        });
        ty -= epSize + 5;
      }
      if (chapter.epigraph.source) {
        ty -= 8;
        const srcW = this.fonts.body.widthOfTextAtSize(chapter.epigraph.source, 9);
        page.drawText(chapter.epigraph.source, {
          x: epIndent + (this.bodyW * 0.6) - srcW, y: ty,
          size: 9, font: this.fonts.body, color: rgb(0.5, 0.5, 0.5),
        });
        ty -= 14;
      }
    }

    // Start body below whatever was drawn (title or epigraph)
    this.currentY = ty - 30;
    this.drawHeaderFooter();
  }

  // ── Draw a bullet list ──
  drawBulletList(items, bodySize, bodyLeading) {
    const bulletChar = "\u2022";
    const indent = 16;
    const bulletGap = 6;
    for (const item of items) {
      this.ensureSpace(bodyLeading * 2);
      const lines = this.wrapText(item, this.fonts.body, bodySize, this.bodyW - indent - bulletGap);
      this.currentPage.drawText(bulletChar, {
        x: this.bodyLeft + 8,
        y: this.currentY,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.12, 0.12, 0.12),
      });
      for (const line of lines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft + indent,
          y: this.currentY,
          size: bodySize,
          font: this.fonts.body,
          color: rgb(0.12, 0.12, 0.12),
        });
        this.currentY -= bodyLeading;
      }
      this.currentY -= 4;
    }
  }

  // ── Draw a numbered list ──
  drawNumberedList(items, bodySize, bodyLeading) {
    const indent = 20;
    const numGap = 6;
    for (let i = 0; i < items.length; i++) {
      this.ensureSpace(bodyLeading * 2);
      const numText = `${i + 1}.`;
      const numW = this.fonts.bodyBold.widthOfTextAtSize(numText, bodySize);
      const lines = this.wrapText(items[i], this.fonts.body, bodySize, this.bodyW - indent - numGap);
      this.currentPage.drawText(numText, {
        x: this.bodyLeft + 8,
        y: this.currentY,
        size: bodySize,
        font: this.fonts.bodyBold,
        color: rgb(0.12, 0.12, 0.12),
      });
      for (const line of lines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft + indent,
          y: this.currentY,
          size: bodySize,
          font: this.fonts.body,
          color: rgb(0.12, 0.12, 0.12),
        });
        this.currentY -= bodyLeading;
      }
      this.currentY -= 4;
    }
  }

  // ── Draw a callout/key takeaway box ──
  drawCallout(title, text, accentColor) {
    const bodySize = 10;
    const bodyLeading = 16;
    const padding = 12;
    const titleSize = 11;
    const accent = accentColor || rgb(0.25, 0.45, 0.8);
    const bgAccent = rgb(
      accent.red * 0.15 + 0.85 * (1 - accent.red * 0.15),
      accent.green * 0.15 + 0.85 * (1 - accent.green * 0.15),
      accent.blue * 0.15 + 0.85 * (1 - accent.blue * 0.15)
    );

    // Calculate height needed - handle newlines by splitting into paragraphs
    const titleLines = title ? this.wrapText(title, this.fonts.bodyBold, titleSize, this.bodyW - padding * 2) : [];
    const paragraphs = text.split("\n");
    const textLines = [];
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed.length === 0) {
        textLines.push(""); // empty line for spacing
      } else {
        textLines.push(...this.wrapText(trimmed, this.fonts.body, bodySize, this.bodyW - padding * 2));
      }
    }
    const totalH = (titleLines.length * (titleSize + 4)) + (textLines.length * bodyLeading) + padding * 2 + 10;

    this.ensureSpace(totalH + 10);

    const boxY = this.currentY - 5;
    const boxH = totalH;

    // Draw box background
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: this.bodyW,
      height: boxH,
      color: bgAccent,
    });

    // Left accent bar
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: 4,
      height: boxH,
      color: accent,
    });

    // Title
    let ty = boxY - padding;
    if (title) {
      for (const line of titleLines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft + padding + 4,
          y: ty,
          size: titleSize,
          font: this.fonts.bodyBold,
          color: accent,
        });
        ty -= titleSize + 4;
      }
      ty -= 4;
    }

    // Text
    for (const line of textLines) {
      if (line === "") {
        ty -= bodyLeading * 0.5; // empty line spacing
        continue;
      }
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding + 4,
        y: ty,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.12, 0.12, 0.12),
      });
      ty -= bodyLeading;
    }

    this.currentY = boxY - boxH - 10;
  }

  // ── Draw a framework/methodology box ──
  drawFramework(name, steps) {
    const bodySize = 10;
    const bodyLeading = 16;
    const titleSize = 12;
    const padding = 28;

    const nameLines = this.wrapText(name, this.fonts.headingBold, titleSize, this.bodyW - padding * 2);
    const stepLines = [];
    for (let i = 0; i < steps.length; i++) {
      const sLines = this.wrapText(`${i + 1}. ${steps[i]}`, this.fonts.body, bodySize, this.bodyW - padding * 2 - 16);
      stepLines.push(...sLines);
    }

    const totalH = (nameLines.length * (titleSize + 6)) + (stepLines.length * bodyLeading) + padding * 2 + steps.length * 4 + 10 + 50;
    this.ensureSpace(totalH + 10);

    const boxY = this.currentY - 5;
    const boxH = totalH;

    // Dark background
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: this.bodyW,
      height: boxH,
      color: rgb(0.12, 0.12, 0.15),
    });

    // Top accent line
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY,
      width: this.bodyW,
      height: 3,
      color: rgb(0.75, 0.6, 0.4),
    });

    // Title
    let ty = boxY - padding;
    for (const line of nameLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding,
        y: ty,
        size: titleSize,
        font: this.fonts.headingBold,
        color: rgb(0.95, 0.9, 0.8),
      });
      ty -= titleSize + 6;
    }
    ty -= 4;

    // Steps
    for (const line of stepLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding + 16,
        y: ty,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.85, 0.82, 0.75),
      });
      ty -= bodyLeading;
    }

    this.currentY = boxY - boxH - 10;
  }

  // ── Draw a case study box ──
  drawCaseStudy(caseStudy) {
    const bodySize = 10;
    const bodyLeading = 16;
    const titleSize = 11;
    const padding = 12;

    const label = caseStudy.label || "CASE STUDY";
    const company = caseStudy.company || "";
    const challenge = caseStudy.challenge || "";
    const solution = caseStudy.solution || "";
    const outcome = caseStudy.outcome || "";

    const companyLines = this.wrapText(company, this.fonts.bodyBold, titleSize, this.bodyW - padding * 2);
    const challengeLines = this.wrapText(`Challenge: ${challenge}`, this.fonts.body, bodySize, this.bodyW - padding * 2 - 16);
    const solutionLines = this.wrapText(`Solution: ${solution}`, this.fonts.body, bodySize, this.bodyW - padding * 2 - 16);
    const outcomeLines = this.wrapText(`Outcome: ${outcome}`, this.fonts.body, bodySize, this.bodyW - padding * 2 - 16);

    const totalH = (companyLines.length * (titleSize + 4)) + (challengeLines.length * bodyLeading) + (solutionLines.length * bodyLeading) + (outcomeLines.length * bodyLeading) + padding * 2 + bodyLeading * 3 + 10;
    this.ensureSpace(totalH + 10);

    const boxY = this.currentY - 5;
    const boxH = totalH;

    // Light background
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: this.bodyW,
      height: boxH,
      color: rgb(0.96, 0.96, 0.95),
    });

    // Left accent bar
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: 4,
      height: boxH,
      color: rgb(0.45, 0.55, 0.3),
    });

    let ty = boxY - padding;

    // Label
    this.currentPage.drawText(label, {
      x: this.bodyLeft + padding,
      y: ty,
      size: 8,
      font: this.fonts.bodyBold,
      color: rgb(0.45, 0.55, 0.3),
    });
    ty -= 14;

    // Company name
    for (const line of companyLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding,
        y: ty,
        size: titleSize,
        font: this.fonts.bodyBold,
        color: rgb(0.12, 0.12, 0.12),
      });
      ty -= titleSize + 4;
    }
    ty -= 6;

    // Challenge
    for (const line of challengeLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding + 16,
        y: ty,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.12, 0.12, 0.12),
      });
      ty -= bodyLeading;
    }
    ty -= 4;

    // Solution
    for (const line of solutionLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding + 16,
        y: ty,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.12, 0.12, 0.12),
      });
      ty -= bodyLeading;
    }
    ty -= 4;

    // Outcome
    for (const line of outcomeLines) {
      this.currentPage.drawText(line, {
        x: this.bodyLeft + padding + 16,
        y: ty,
        size: bodySize,
        font: this.fonts.body,
        color: rgb(0.12, 0.12, 0.12),
      });
      ty -= bodyLeading;
    }

    this.currentY = boxY - boxH - 10;
  }

  // ── Draw an image placeholder circle with prompt ──
  drawImagePlaceholder(prompt, caption) {
    const circleR = 50;
    const bodySize = 9;
    const bodyLeading = 14;
    const captionSize = 8;
    const needed = circleR * 2 + 60;

    this.ensureSpace(needed);

    const cx = this.trimW / 2;
    const cy = this.currentY - circleR - 10;

    // Circle outline
    this.currentPage.drawCircle({
      x: cx,
      y: cy,
      size: circleR,
      borderColor: rgb(0.6, 0.6, 0.6),
      borderWidth: 1,
      color: rgb(0.93, 0.93, 0.92),
    });

    // Camera icon (simple text)
    const iconSize = 12;
    this.currentPage.drawText("[Image]", {
      x: cx - this.fonts.body.widthOfTextAtSize("[Image]", iconSize) / 2,
      y: cy - iconSize / 2,
      size: iconSize,
      font: this.fonts.body,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Position below circle
    let bottomY = cy - circleR - 12;

    // Prompt text below circle
    if (prompt) {
      const promptLines = this.wrapText(prompt, this.fonts.bodyItalic, bodySize, this.bodyW);
      for (const line of promptLines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft,
          y: bottomY,
          size: bodySize,
          font: this.fonts.bodyItalic,
          color: rgb(0.5, 0.5, 0.5),
        });
        bottomY -= bodyLeading;
      }
    }

    // Caption
    if (caption) {
      bottomY -= 4;
      const capLines = this.wrapText(caption, this.fonts.body, captionSize, this.bodyW);
      for (const line of capLines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft,
          y: bottomY,
          size: captionSize,
          font: this.fonts.body,
          color: rgb(0.4, 0.4, 0.4),
        });
        bottomY -= captionSize + 4;
      }
    }

    this.currentY = bottomY - 10;
  }

  // ── Draw a quote/statistic callout ──
  drawStatistic(value, source) {
    const valSize = 22;
    const srcSize = 8;
    const needed = valSize + srcSize + 20;

    this.ensureSpace(needed);

    const cx = this.trimW / 2;
    const valW = this.fonts.headingBold.widthOfTextAtSize(value, valSize);
    this.currentPage.drawText(value, {
      x: cx - valW / 2,
      y: this.currentY - 5,
      size: valSize,
      font: this.fonts.headingBold,
      color: rgb(0.25, 0.45, 0.8),
    });
    this.currentY -= valSize + 6;

    if (source) {
      const srcW = this.fonts.body.widthOfTextAtSize(source, srcSize);
      this.currentPage.drawText(source, {
        x: cx - srcW / 2,
        y: this.currentY,
        size: srcSize,
        font: this.fonts.bodyItalic,
        color: rgb(0.5, 0.5, 0.5),
      });
      this.currentY -= srcSize + 10;
    }
  }

  // ── Draw action steps section ──
  drawActionSteps(steps) {
    const bodySize = 10;
    const bodyLeading = 16;
    const titleSize = 14;
    const padding = 26;

    // Calculate height
    const titleLines = ["ACTION STEPS"];
    const stepLinesArr = steps.map((step, i) => {
      return this.wrapText(`${i + 1}. ${step}`, this.fonts.body, bodySize, this.bodyW - padding - 20);
    });
    const allLines = stepLinesArr.flat();
    const totalH = titleSize + 16 + (allLines.length * bodyLeading) + steps.length * 4 + padding * 2 + 10;

    this.ensureSpace(totalH + 10);

    const boxY = this.currentY - 5;
    const boxH = totalH;

    // Light background
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: this.bodyW,
      height: boxH,
      color: rgb(0.95, 0.97, 1.0),
    });

    // Top accent line
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY,
      width: this.bodyW,
      height: 3,
      color: rgb(0.25, 0.45, 0.8),
    });

    let ty = boxY - padding;

    // Title
    this.currentPage.drawText("ACTION STEPS", {
      x: this.bodyLeft + padding,
      y: ty,
      size: titleSize,
      font: this.fonts.headingBold,
      color: rgb(0.25, 0.45, 0.8),
    });
    ty -= titleSize + 10;

    // Steps
    for (const step of steps) {
      const stepNum = `${steps.indexOf(step) + 1}.`;
      const numW = this.fonts.bodyBold.widthOfTextAtSize(stepNum, bodySize);
      this.currentPage.drawText(stepNum, {
        x: this.bodyLeft + padding,
        y: ty,
        size: bodySize,
        font: this.fonts.bodyBold,
        color: rgb(0.25, 0.45, 0.8),
      });
      const sLines = this.wrapText(step, this.fonts.body, bodySize, this.bodyW - padding - 20);
      for (const line of sLines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft + padding + 20,
          y: ty,
          size: bodySize,
          font: this.fonts.body,
          color: rgb(0.12, 0.12, 0.12),
        });
        ty -= bodyLeading;
      }
      ty -= 4;
    }

    this.currentY = boxY - boxH - 10;
  }

  // ── Draw diagnostic/assessment section ──
  drawDiagnostic(title, questions) {
    const bodySize = 10;
    const bodyLeading = 16;
    const titleSize = 14;
    const padding = 26;

    const questionLines = questions.map(q => this.wrapText(q, this.fonts.body, bodySize, this.bodyW - padding - 16));
    const totalH = titleSize + 16 + (questionLines.flat().length * bodyLeading) + questions.length * 4 + padding * 2 + 10;

    this.ensureSpace(totalH + 10);

    const boxY = this.currentY - 5;
    const boxH = totalH;

    // Background
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: this.bodyW,
      height: boxH,
      color: rgb(0.96, 0.95, 0.92),
    });

    // Left accent
    this.currentPage.drawRectangle({
      x: this.bodyLeft,
      y: boxY - boxH,
      width: 4,
      height: boxH,
      color: rgb(0.75, 0.6, 0.4),
    });

    let ty = boxY - padding;

    // Title
    this.currentPage.drawText(title.toUpperCase(), {
      x: this.bodyLeft + padding + 4,
      y: ty,
      size: titleSize,
      font: this.fonts.headingBold,
      color: rgb(0.4, 0.3, 0.15),
    });
    ty -= titleSize + 10;

    // Questions
    for (const q of questions) {
      // Draw checkbox (empty square using lines instead of Unicode)
      const cbX = this.bodyLeft + padding + 4;
      const cbY = ty - 1;
      const cbSize = 8;
      this.currentPage.drawRectangle({
        x: cbX,
        y: cbY,
        width: cbSize,
        height: cbSize,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });
      const qLines = this.wrapText(q, this.fonts.body, bodySize, this.bodyW - padding - 20);
      for (const line of qLines) {
        this.currentPage.drawText(line, {
          x: this.bodyLeft + padding + 18,
          y: ty,
          size: bodySize,
          font: this.fonts.body,
          color: rgb(0.12, 0.12, 0.12),
        });
        ty -= bodyLeading;
      }
      ty -= 4;
    }

    this.currentY = boxY - boxH - 10;
  }

  // ── Body Content ──
  drawChapterBody(chapter) {
    const bodySize = 11;
    const bodyLeading = 18;
    const paraIndent = 20;
    const paraSpacing = 8;

    for (const section of chapter.sections || []) {
      // Section heading
      if (section.heading) {
        this.ensureSpace(50);
        this.currentY -= 20;

        // Heading with small caps style
        const hSize = 14;
        this.currentPage.drawText(section.heading.toUpperCase(), {
          x: this.bodyLeft,
          y: this.currentY,
          size: hSize,
          font: this.fonts.headingBold,
          color: rgb(0.15, 0.15, 0.15),
        });
        this.currentY -= hSize + 4;

        // Subtle line under heading
        this.currentPage.drawLine({
          start: { x: this.bodyLeft, y: this.currentY },
          end: { x: this.bodyLeft + 60, y: this.currentY },
          thickness: 0.75,
          color: rgb(0.75, 0.6, 0.4),
        });
        this.currentY -= 16;
      }

      // Paragraphs
      for (let pi = 0; pi < (section.paragraphs || []).length; pi++) {
        const para = section.paragraphs[pi];
        this.ensureSpace(bodyLeading * 2);
        this.drawTextBlock(
          para,
          this.fonts.body,
          bodySize,
          rgb(0.12, 0.12, 0.12),
          bodyLeading
        );
        this.currentY -= paraSpacing;
      }

      // Bullet lists
      if (section.bullets && section.bullets.length > 0) {
        this.drawBulletList(section.bullets, bodySize, bodyLeading);
      }

      // Numbered lists
      if (section.numberedList && section.numberedList.length > 0) {
        this.drawNumberedList(section.numberedList, bodySize, bodyLeading);
      }

      // Callouts
      if (section.callout) {
        this.drawCallout(section.callout.title, section.callout.text, null);
      }

      // Framework boxes
      if (section.framework) {
        this.drawFramework(section.framework.name, section.framework.steps);
      }

      // Statistics
      if (section.statistic) {
        this.drawStatistic(section.statistic.value, section.statistic.source);
      }

      // Image placeholders
      if (section.imagePlaceholder) {
        this.drawImagePlaceholder(section.imagePlaceholder.prompt, section.imagePlaceholder.caption);
      }

      // Case studies
      if (section.caseStudy) {
        this.drawCaseStudy(section.caseStudy);
      }

      // Diagnostics
      if (section.diagnostic) {
        this.drawDiagnostic(section.diagnostic.title, section.diagnostic.questions);
      }

      // Quick wins
      if (section.quickWins) {
        this.drawCallout("Quick Wins (Start This Week)", section.quickWins.join("\n\n"), rgb(0.15, 0.6, 0.35));
      }
    }

    // Action steps at end of chapter
    if (chapter.actionSteps && chapter.actionSteps.length > 0) {
      this.drawActionSteps(chapter.actionSteps);
    }

    // Section break ornament
    this.currentY -= 10;
    if (this.currentY > this.bodyBottom + 40) {
      const ornSize = 14;
      const orn = "\u2022  \u2022  \u2022";
      const ow = this.fonts.body.widthOfTextAtSize(orn, ornSize);
      this.currentPage.drawText(orn, {
        x: (this.trimW - ow) / 2,
        y: this.currentY,
        size: ornSize,
        font: this.fonts.body,
        color: rgb(0.65, 0.55, 0.4),
      });
    }
  }

  // ── Copyright Page ──
  drawCopyright() {
    this.newPage();
    const page = this.currentPage;
    const lines = [
      `Copyright \u00A9 ${new Date().getFullYear()} ${this.author || ""}`,
      "",
      "All rights reserved.",
      "",
      "No part of this publication may be reproduced, distributed,",
      "or transmitted in any form without prior written permission.",
      "",
      "Published by " + this.publisher,
      "",
      "First Edition: " + (this.book.edition || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })),
      "",
      "ISBN: " + (this.book.isbn || ""),
    ];
    let y = this.trimH * 0.65;
    for (const line of lines) {
      page.drawText(line, {
        x: this.bodyLeft,
        y,
        size: 9,
        font: this.fonts.body,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 14;
    }
  }

  // ── Build Full Book ──
  async build(outputPath) {
    this.layoutMetrics();
    this._chapterStartPage = {};

    // Front matter
    this.drawCover();
    this.drawCopyright();
    this.drawDedication();
    this.drawEpigraph();
    this.drawTOC();

    // Chapters
    let chNum = 0;
    for (const chapter of this.book.chapters) {
      chNum++;
      this.drawChapterStart(chapter, chNum);
      this.drawChapterBody(chapter);
    }

    // Final page
    this.drawHeaderFooter();

    const pdfBytes = await this.doc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return { pages: this.pages.length, bytes: pdfBytes.length };
  }
}

// ── CLI Entry Point ──
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node engine.js <book.json> [output.pdf]");
    process.exit(1);
  }

  const bookPath = args[0];
  const outputPath = args[1] || bookPath.replace(/\.json$/, ".pdf");

  const book = JSON.parse(fs.readFileSync(bookPath, "utf-8"));
  const engine = new BookEngine(book);
  await engine.init();
  const result = await engine.build(outputPath);
  console.log(`PDF generated: ${outputPath} (${result.pages} pages, ${result.bytes} bytes)`);
}

if (require.main === module) {
  main().catch(e => { console.error("Error:", e.message); process.exit(1); });
}

module.exports = { BookEngine };
