#!/usr/bin/env node
/**
 * pdf-book-cover — Professional book cover generator with genre presets
 * Uses pdf-lib + custom Google Fonts. No Chromium, no browser.
 *
 * Usage: node cover.js <cover.json> [output.pdf]
 *
 * cover.json structure:
 * {
 *   "title": "Book Title",
 *   "subtitle": "Optional subtitle",
 *   "author": "Author Name",
 *   "publisher": "Publisher Name",
 *   "preset": "thriller",           // genre preset (overrides colors/style)
 *   "style": "elegant",             // elegant | minimal | bold | classic
 *   "trim": [432, 648],             // 6x9 inches (standard cover)
 *   "background": "#1a1a2e",        // hex color or null for white
 *   "accent": "#e94560",            // accent color for decorative elements
 *   "textColor": "#ffffff",         // main text color
 *   "subtitleColor": "#cccccc",     // subtitle color
 *   "authorColor": "#ffffff",       // author color
 *   "border": true,                 // decorative border
 *   "gradient": "dark_bottom",      // gradient effect
 *   "isbn": "978-X-XXXX-XXXX-X"    // optional, placed at bottom
 * }
 *
 * Available presets: thriller, psych_thriller, romance, dark_romance,
 * fantasy, cozy_fantasy, literary, historical, self_help, scifi,
 * horror, memoir, poetry, children, romantasy
 */

const { PDFDocument, rgb, StandardFonts, degrees } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const fs = require("fs");
const path = require("path");
const { mergeWithPreset, listPresets, getPreset } = require("./presets");

function resolveFontsDir() {
  const candidates = [
    path.join(__dirname, "fonts"),
    path.join(process.cwd(), "src/lib/doc-engine/fonts"),
    path.join(process.cwd(), ".next/server/src/lib/doc-engine/fonts"),
    path.join(__dirname, "../../src/lib/doc-engine/fonts"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(path.join(p, "Lora-Regular.ttf"))) return p;
    } catch (e) {}
  }
  return path.join(__dirname, "fonts");
}
const FONTS_DIR = resolveFontsDir();

// ── Genre Font Mapping ──
// Maps genre presets to preferred font families
const GENRE_FONTS = {
  thriller: { family: "bold", size: 48 },
  psych_thriller: { family: "minimal", size: 44 },
  romance: { family: "elegant", size: 38 },
  dark_romance: { family: "elegant", size: 38 },
  fantasy: { family: "elegant", size: 40 },
  cozy_fantasy: { family: "classic", size: 34 },
  literary: { family: "minimal", size: 42 },
  historical: { family: "classic", size: 34 },
  self_help: { family: "bold", size: 48 },
  scifi: { family: "bold", size: 46 },
  horror: { family: "bold", size: 48 },
  memoir: { family: "elegant", size: 38 },
  poetry: { family: "minimal", size: 42 },
  children: { family: "bold", size: 50 },
  romantasy: { family: "elegant", size: 40 },
};

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

function resolveAuthor(config) {
  if (config.author) return config.author;
  const lang = (config.lang || "en").toLowerCase().substring(0, 2);
  return AUTHOR_NAMES[lang] || "Peter Lompo";
}

function resolvePublisher(config) {
  return config.publisher || "Pierre Studio";
}

// ── Color Parsing ──
function hexToRgb(hex) {
  if (!hex) return null;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function parseColor(c, fallback) {
  return hexToRgb(c) || fallback;
}

// ── Text Wrapping ──
function wrapText(text, font, fontSize, maxWidth) {
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

// ── Gradient Drawing ──
function drawGradient(page, w, h, colorTop, colorBottom, steps = 20) {
  const stepH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = colorTop.red + (colorBottom.red - colorTop.red) * t;
    const g = colorTop.green + (colorBottom.green - colorTop.green) * t;
    const b = colorTop.blue + (colorBottom.blue - colorTop.blue) * t;
    page.drawRectangle({
      x: 0,
      y: h - (i + 1) * stepH,
      width: w,
      height: stepH + 1, // slight overlap to avoid gaps
      color: rgb(r, g, b),
    });
  }
}

// ── Cover Generator ──

class CoverGenerator {
  constructor(config) {
    // Merge with preset if specified
    if (config.preset) {
      this.config = mergeWithPreset(config.preset, config);
    } else {
      this.config = { ...config };
    }
    // Resolve author and publisher based on language/defaults
    this.config.author = resolveAuthor(this.config);
    this.config.publisher = resolvePublisher(this.config);
    this.trimW = (this.config.trim && this.config.trim[0]) || 432;
    this.trimH = (this.config.trim && this.config.trim[1]) || 648;
    this.doc = null;
    this.fonts = {};
  }

  async init() {
    this.doc = await PDFDocument.create();
    this.doc.registerFontkit(fontkit);

    const load = async (name, fallbackStd) => {
      const candidates = [
        path.join(FONTS_DIR, name),
        path.join(process.cwd(), "src/lib/doc-engine/fonts", name),
        path.join(__dirname, "fonts", name),
      ];
      for (const p of candidates) {
        try {
          if (fs.existsSync(p)) {
            const buf = fs.readFileSync(p);
            return await this.doc.embedFont(buf);
          }
        } catch (e) {}
      }
      if (fallbackStd) {
        console.warn(`[CoverGenerator] Font ${name} not found, falling back to ${fallbackStd}`);
        return await this.doc.embedFont(StandardFonts[fallbackStd]);
      }
      throw new Error(`Font ${name} not found: ${candidates.join(', ')}`);
    };

    const bodyFamily = this.config.fontBody || this.config.fonts?.body || 'Lora';
    const headingFamily = this.config.fontHeading || this.config.fonts?.heading || 'PlayfairDisplay';
    const fontMap = {
      Lora: { regular: 'Lora-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'TimesRoman' },
      Merriweather: { regular: 'Merriweather-Regular.ttf', bold: 'Merriweather-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'TimesRoman' },
      Roboto: { regular: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'Helvetica' },
      Inter: { regular: 'Inter-Regular.ttf', bold: 'Inter-Regular.ttf', italic: 'Lora-Italic.ttf', fallback: 'Helvetica' },
      SourceSerif4: { regular: 'SourceSerif4-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'TimesRoman' },
      EBGaramond: { regular: 'EBGaramond-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'TimesRoman' },
      CrimsonText: { regular: 'CrimsonText-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', fallback: 'TimesRoman' },
      PlayfairDisplay: { regular: 'PlayfairDisplay-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf', italic: 'PlayfairDisplay-Italic.ttf', fallback: 'Helvetica' },
      Cormorant: { regular: 'Cormorant-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf', italic: 'PlayfairDisplay-Italic.ttf', fallback: 'Helvetica' },
    };
    const bodyFiles = fontMap[bodyFamily] || fontMap['Lora'];
    const headingFiles = fontMap[headingFamily] || fontMap['PlayfairDisplay'];

    this.fonts = {
      body: await load(bodyFiles.regular, bodyFiles.fallback),
      bodyBold: await load(bodyFiles.bold, bodyFiles.fallback === 'TimesRoman' ? 'TimesRomanBold' : 'HelveticaBold'),
      bodyItalic: await load(bodyFiles.italic, bodyFiles.fallback === 'TimesRoman' ? 'TimesRomanItalic' : 'HelveticaOblique'),
      heading: await load(headingFiles.regular, headingFiles.fallback),
      headingBold: await load(headingFiles.bold, headingFiles.fallback === 'TimesRoman' ? 'TimesRomanBold' : 'HelveticaBold'),
      headingItalic: await load(headingFiles.italic, headingFiles.fallback === 'TimesRoman' ? 'TimesRomanItalic' : 'HelveticaOblique'),
    };
  }

  // ── Decorative Elements ──

  drawBorder(page, color, inset = 20) {
    const w = this.trimW;
    const h = this.trimH;
    const thickness = 1.5;

    page.drawRectangle({
      x: inset, y: inset,
      width: w - inset * 2, height: h - inset * 2,
      borderColor: color, borderWidth: thickness,
    });

    const inner = inset + 6;
    page.drawRectangle({
      x: inner, y: inner,
      width: w - inner * 2, height: h - inner * 2,
      borderColor: color, borderWidth: 0.5,
    });
  }

  drawDecorativeLine(page, y, width, color, centerX) {
    const cx = centerX || this.trimW / 2;
    const halfW = width / 2;

    page.drawLine({
      start: { x: cx - halfW, y },
      end: { x: cx + halfW, y },
      thickness: 1.5, color,
    });

    // Diamond ornament
    const d = 5;
    page.drawLine({ start: { x: cx, y: y + d }, end: { x: cx + d, y }, thickness: 1.5, color });
    page.drawLine({ start: { x: cx + d, y }, end: { x: cx, y: y - d }, thickness: 1.5, color });
    page.drawLine({ start: { x: cx, y: y - d }, end: { x: cx - d, y }, thickness: 1.5, color });
    page.drawLine({ start: { x: cx - d, y }, end: { x: cx, y: y + d }, thickness: 1.5, color });
  }

  drawCornerOrnaments(page, color, inset = 30) {
    const w = this.trimW;
    const h = this.trimH;
    const size = 15;
    const thickness = 1.5;

    // Top-left
    page.drawLine({ start: { x: inset, y: h - inset }, end: { x: inset + size, y: h - inset }, thickness, color });
    page.drawLine({ start: { x: inset, y: h - inset }, end: { x: inset, y: h - inset - size }, thickness, color });
    // Top-right
    page.drawLine({ start: { x: w - inset, y: h - inset }, end: { x: w - inset - size, y: h - inset }, thickness, color });
    page.drawLine({ start: { x: w - inset, y: h - inset }, end: { x: w - inset, y: h - inset - size }, thickness, color });
    // Bottom-left
    page.drawLine({ start: { x: inset, y: inset }, end: { x: inset + size, y: inset }, thickness, color });
    page.drawLine({ start: { x: inset, y: inset }, end: { x: inset, y: inset + size }, thickness, color });
    // Bottom-right
    page.drawLine({ start: { x: w - inset, y: inset }, end: { x: w - inset - size, y: inset }, thickness, color });
    page.drawLine({ start: { x: w - inset, y: inset }, end: { x: w - inset, y: inset + size }, thickness, color });
  }

  drawStripe(page, y, height, color) {
    page.drawRectangle({
      x: 0, y,
      width: this.trimW, height,
      color,
    });
  }

  // ── Background Effects ──

  drawBackground(page) {
    const cfg = this.config;
    const bg = parseColor(cfg.background, null);

    if (cfg.gradient === "dark_bottom" && bg) {
      // Gradient from lighter top to dark bottom
      const lighter = rgb(
        Math.min(1, bg.red + 0.15),
        Math.min(1, bg.green + 0.15),
        Math.min(1, bg.blue + 0.15)
      );
      drawGradient(page, this.trimW, this.trimH, lighter, bg, 30);
    } else if (cfg.gradient === "dark_top" && bg) {
      // Gradient from dark top to lighter bottom
      const lighter = rgb(
        Math.min(1, bg.red + 0.15),
        Math.min(1, bg.green + 0.15),
        Math.min(1, bg.blue + 0.15)
      );
      drawGradient(page, this.trimW, this.trimH, bg, lighter, 30);
    } else if (cfg.gradient === "vignette" && bg) {
      // Vignette effect (dark edges, lighter center)
      drawGradient(page, this.trimW, this.trimH, bg, rgb(
        Math.min(1, bg.red + 0.1),
        Math.min(1, bg.green + 0.1),
        Math.min(1, bg.blue + 0.1)
      ), 20);
    } else if (bg) {
      page.drawRectangle({ x: 0, y: 0, width: this.trimW, height: this.trimH, color: bg });
    }
  }

  // ── Draw Text Block ──

  drawTitle(page, cfg) {
    const cx = this.trimW / 2;
    const textColor = parseColor(cfg.textColor, rgb(0.1, 0.1, 0.1));
    
    // Get genre-specific font if preset is set
    let titleFont = this.fonts.headingBold;
    let titleSize = cfg.titleSize || 38;
    if (cfg._preset && GENRE_FONTS[cfg._preset]) {
      const genreConfig = GENRE_FONTS[cfg._preset];
      titleSize = cfg.titleSize || genreConfig.size;
      // Use appropriate font based on genre style
      if (genreConfig.family === "bold") titleFont = this.fonts.headingBold;
      else if (genreConfig.family === "minimal") titleFont = this.fonts.heading;
      else if (genreConfig.family === "elegant") titleFont = this.fonts.headingBold;
      else if (genreConfig.family === "classic") titleFont = this.fonts.headingBold;
      else titleFont = this.fonts.headingBold;
    }

    const titleMaxW = this.trimW - 100;
    const titleLines = wrapText(cfg.title, titleFont, titleSize, titleMaxW);
    const titleY = cfg.titleY || 0.55;
    let ty = this.trimH * titleY;

    for (const line of titleLines) {
      const tw = titleFont.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2,
        y: ty,
        size: titleSize,
        font: titleFont,
        color: textColor,
      });
      ty -= titleSize + 10;
    }

    return ty;
  }

  drawSubtitle(page, cfg, startY) {
    if (!cfg.subtitle) return startY;
    const cx = this.trimW / 2;
    const subtitleColor = parseColor(cfg.subtitleColor, rgb(0.6, 0.6, 0.6));
    const subSize = 16;
    const titleMaxW = this.trimW - 100;
    const subLines = wrapText(cfg.subtitle, this.fonts.headingItalic, subSize, titleMaxW - 40);
    let ty = startY - 20;

    for (const line of subLines) {
      const sw = this.fonts.headingItalic.widthOfTextAtSize(line, subSize);
      page.drawText(line, {
        x: cx - sw / 2,
        y: ty,
        size: subSize,
        font: this.fonts.headingItalic,
        color: subtitleColor,
      });
      ty -= subSize + 6;
    }

    return ty;
  }

  drawAuthor(page, cfg) {
    if (!cfg.author) return;
    const cx = this.trimW / 2;
    const authorColor = parseColor(cfg.authorColor, rgb(0.3, 0.3, 0.3));
    const authorSize = 15;
    const authorY = cfg.authorY || 0.2;

    const aw = this.fonts.body.widthOfTextAtSize(cfg.author, authorSize);
    page.drawText(cfg.author, {
      x: cx - aw / 2,
      y: this.trimH * authorY,
      size: authorSize,
      font: this.fonts.body,
      color: authorColor,
    });
  }

  drawPublisher(page, cfg) {
    if (!cfg.publisher) return;
    const cx = this.trimW / 2;
    const subtitleColor = parseColor(cfg.subtitleColor, rgb(0.6, 0.6, 0.6));
    const pubSize = 9;
    const pw = this.fonts.body.widthOfTextAtSize(cfg.publisher, pubSize);
    page.drawText(cfg.publisher, {
      x: cx - pw / 2,
      y: 45,
      size: pubSize,
      font: this.fonts.body,
      color: subtitleColor,
    });
  }

  // ── Style: Elegant ──

  drawElegant(page) {
    const cfg = this.config;
    const cx = this.trimW / 2;
    const accent = parseColor(cfg.accent, rgb(0.91, 0.27, 0.38));

    this.drawBackground(page);

    // Border
    if (cfg.border !== false) {
      this.drawBorder(page, accent, 24);
      if (cfg.cornerOrnaments !== false) {
        this.drawCornerOrnaments(page, accent, 34);
      }
    }

    // Title
    const ty = this.drawTitle(page, cfg);

    // Decorative line under title
    const lineW = cfg.decorLineWidth || 120;
    if (cfg.decorLine !== false) {
      this.drawDecorativeLine(page, ty - 10, lineW, accent, cx);
    }

    // Subtitle
    this.drawSubtitle(page, cfg, ty - 50);

    // Author
    this.drawAuthor(page, cfg);

    // Publisher
    this.drawPublisher(page, cfg);
  }

  // ── Style: Minimal ──

  drawMinimal(page) {
    const cfg = this.config;
    const cx = this.trimW / 2;
    const accent = parseColor(cfg.accent, rgb(0.75, 0.6, 0.4));

    this.drawBackground(page);

    // Thin accent line at top
    const lineW = cfg.decorLineWidth || 50;
    page.drawRectangle({
      x: cx - lineW, y: this.trimH - 80,
      width: lineW * 2, height: 1.5,
      color: accent,
    });

    // Title
    const titleSize = cfg.titleSize || 42;
    const titleMaxW = this.trimW - 80;
    const titleLines = wrapText(cfg.title, this.fonts.heading, titleSize, titleMaxW);
    const titleY = cfg.titleY || 0.52;
    let ty = this.trimH * titleY;
    const textColor = parseColor(cfg.textColor, rgb(0.1, 0.1, 0.1));

    for (const line of titleLines) {
      const tw = this.fonts.heading.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2, y: ty,
        size: titleSize, font: this.fonts.heading,
        color: textColor,
      });
      ty -= titleSize + 12;
    }

    // Subtitle
    this.drawSubtitle(page, cfg, ty);

    // Author — bottom left
    if (cfg.author) {
      const authorColor = parseColor(cfg.authorColor, rgb(0.2, 0.2, 0.2));
      const authorSize = 13;
      page.drawText(cfg.author, {
        x: 60, y: 70,
        size: authorSize, font: this.fonts.body,
        color: authorColor,
      });
    }

    // Thin accent line at bottom
    page.drawRectangle({
      x: cx - lineW, y: 55,
      width: lineW * 2, height: 0.75,
      color: accent,
    });

    // Publisher
    if (cfg.publisher) {
      const subtitleColor = parseColor(cfg.subtitleColor, rgb(0.6, 0.6, 0.6));
      const pubSize = 8;
      const pw = this.fonts.body.widthOfTextAtSize(cfg.publisher, pubSize);
      page.drawText(cfg.publisher, {
        x: this.trimW - 60 - pw, y: 70,
        size: pubSize, font: this.fonts.body,
        color: subtitleColor,
      });
    }
  }

  // ── Style: Bold ──

  drawBold(page) {
    const cfg = this.config;
    const cx = this.trimW / 2;
    const accent = parseColor(cfg.accent, rgb(0.91, 0.27, 0.38));
    const stripeColor = cfg.stripeColor ? parseColor(cfg.stripeColor, accent) : accent;

    this.drawBackground(page);

    // Accent stripes
    if (cfg.topStripe !== false) {
      const stripeH = cfg.stripeHeight || 12;
      this.drawStripe(page, this.trimH - stripeH, stripeH, stripeColor);
    }
    if (cfg.bottomStripe) {
      const stripeH = cfg.stripeHeight || 8;
      this.drawStripe(page, 0, stripeH, stripeColor);
    }

    // Title — very large, bold
    const titleSize = cfg.titleSize || 48;
    const titleMaxW = this.trimW - 60;
    const titleLines = wrapText(cfg.title, this.fonts.headingBold, titleSize, titleMaxW);
    const titleY = cfg.titleY || 0.55;
    let ty = this.trimH * titleY;
    const textColor = parseColor(cfg.textColor, rgb(1, 1, 1));

    for (const line of titleLines) {
      const tw = this.fonts.headingBold.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2, y: ty,
        size: titleSize, font: this.fonts.headingBold,
        color: textColor,
      });
      ty -= titleSize + 12;
    }

    // Thick accent line
    if (cfg.decorLine !== false) {
      ty -= 15;
      const lineW = cfg.decorLineWidth || 60;
      page.drawRectangle({
        x: cx - lineW, y: ty,
        width: lineW * 2, height: 4,
        color: accent,
      });
      ty -= 35;
    }

    // Subtitle
    this.drawSubtitle(page, cfg, ty);

    // Author — large, at bottom
    if (cfg.author) {
      const authorColor = parseColor(cfg.authorColor, rgb(1, 1, 1));
      const authorSize = 18;
      const authorY = cfg.authorY || 0.15;
      const aw = this.fonts.headingBold.widthOfTextAtSize(cfg.author, authorSize);
      page.drawText(cfg.author, {
        x: cx - aw / 2,
        y: this.trimH * authorY,
        size: authorSize, font: this.fonts.headingBold,
        color: authorColor,
      });
    }
  }

  // ── Style: Classic ──

  drawClassic(page) {
    const cfg = this.config;
    const cx = this.trimW / 2;
    const accent = parseColor(cfg.accent, rgb(0.6, 0.45, 0.25));

    this.drawBackground(page);

    // Ornate border
    if (cfg.border !== false) {
      this.drawBorder(page, accent, 22);
      if (cfg.cornerOrnaments !== false) {
        this.drawCornerOrnaments(page, accent, 32);
      }
    }

    // Horizontal rule above title
    page.drawRectangle({
      x: 80, y: this.trimH * 0.72,
      width: this.trimW - 160, height: 1,
      color: accent,
    });

    // Title
    const titleSize = cfg.titleSize || 34;
    const titleMaxW = this.trimW - 100;
    const titleLines = wrapText(cfg.title, this.fonts.headingBold, titleSize, titleMaxW);
    const titleY = cfg.titleY || 0.62;
    let ty = this.trimH * titleY;
    const textColor = parseColor(cfg.textColor, rgb(0.15, 0.1, 0.05));

    for (const line of titleLines) {
      const tw = this.fonts.headingBold.widthOfTextAtSize(line, titleSize);
      page.drawText(line, {
        x: cx - tw / 2, y: ty,
        size: titleSize, font: this.fonts.headingBold,
        color: textColor,
      });
      ty -= titleSize + 8;
    }

    // Decorative flourish
    if (cfg.decorLine !== false) {
      ty -= 8;
      const lineW = cfg.decorLineWidth || 100;
      this.drawDecorativeLine(page, ty, lineW, accent, cx);
      ty -= 28;
    }

    // Subtitle
    this.drawSubtitle(page, cfg, ty);

    // Horizontal rule below subtitle area
    page.drawRectangle({
      x: 80, y: this.trimH * 0.32,
      width: this.trimW - 160, height: 0.75,
      color: accent,
    });

    // Author
    this.drawAuthor(page, cfg);

    // Publisher
    this.drawPublisher(page, cfg);
  }

  // ── Main Build ──

  async build(outputPath) {
    const page = this.doc.addPage([this.trimW, this.trimH]);
    const style = (this.config.style || "elegant").toLowerCase();

    switch (style) {
      case "minimal":
        this.drawMinimal(page);
        break;
      case "bold":
        this.drawBold(page);
        break;
      case "classic":
        this.drawClassic(page);
        break;
      case "elegant":
      default:
        this.drawElegant(page);
        break;
    }

    const pdfBytes = await this.doc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    return { bytes: pdfBytes.length };
  }
}

// ── CLI Entry Point ──

async function main() {
  const args = process.argv.slice(2);

  // List presets mode
  if (args[0] === "--list-presets") {
    const presets = listPresets();
    console.log("\nAvailable genre presets:\n");
    for (const p of presets) {
      console.log(`  ${p.key.padEnd(18)} ${p.name}`);
      console.log(`  ${"".padEnd(18)} ${p.description}\n`);
    }
    return;
  }

  if (args.length < 1) {
    console.error("Usage: node cover.js <cover.json> [output.pdf]");
    console.error("\nOptions:");
    console.error("  --list-presets    Show all available genre presets");
    console.error("\ncover.json fields:");
    console.error('  "title"      — Book title (required)');
    console.error('  "subtitle"   — Subtitle (optional)');
    console.error('  "author"     — Author name (required)');
    console.error('  "publisher"  — Publisher name (optional)');
    console.error('  "preset"     — Genre preset (overrides colors/style)');
    console.error('  "style"      — elegant | minimal | bold | classic');
    console.error('  "background" — Hex color or null');
    console.error('  "accent"     — Hex color for decorative elements');
    console.error('  "textColor"  — Hex color for title');
    console.error('  "subtitleColor" — Hex color for subtitle');
    console.error('  "authorColor"   — Hex color for author');
    console.error('  "border"     — true/false');
    console.error('  "gradient"   — dark_bottom | dark_top | vignette | null');
    process.exit(1);
  }

  const configPath = args[0];
  const outputPath = args[1] || configPath.replace(/\.json$/, "-cover.pdf");

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const gen = new CoverGenerator(config);
  await gen.init();
  const result = await gen.build(outputPath);
  console.log(`Cover generated: ${outputPath} (${result.bytes} bytes)`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error("Error:", e.message);
    process.exit(1);
  });
}

module.exports = { CoverGenerator };
