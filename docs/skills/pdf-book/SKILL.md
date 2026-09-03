---
name: pdf-book
description: Create professional, best-seller quality PDF books. Use when the user asks to create a book, ebook, novel, memoir, textbook, guide, or any long-form PDF document with chapters, table of contents, headers/footers, and professional typography. Also use for PDF reports, whitepapers, or any multi-page document that needs book-quality formatting.
---

# pdf-book

## When to use

Use this skill when the user asks to create:
- A book, ebook, novel, memoir, textbook, guide, or manual
- A long-form PDF with chapters, table of contents, and professional formatting
- A report, whitepaper, proposal, or any multi-page document requiring book-quality typography
- Any PDF that needs custom fonts, proper margins, headers/footers, and page numbers

Do NOT use for: simple one-page PDFs, invoices, receipts, or quick documents.

## Engine

The rendering engine is at the same level as this `SKILL.md`:

```
node "<skill-dir>/engine.js" <book.json> [output.pdf]
```

Where `<skill-dir>` is the absolute path to the directory containing this `SKILL.md`.

The engine uses **pdf-lib** (no Chromium, no browser, no Python) with embedded Google Fonts:
- **Lora** (Regular, Bold, Italic, BoldItalic) — body text serif
- **Playfair Display** (Regular, Bold, Italic) — headings serif

## Book Structure (JSON)

Create a JSON file with this structure:

```json
{
  "title": "Book Title",
  "subtitle": "Optional subtitle",
  "author": "Author Name",
  "publisher": "Publisher Name",
  "edition": "First Edition",
  "isbn": "978-X-XXXX-XXXX-X",
  "trim": [432, 648],
  "margins": { "top": 72, "bottom": 72, "inside": 84, "outside": 72 },
  "dedication": "For someone special...",
  "epigraph": {
    "text": "A relevant quotation",
    "source": "— Author Name"
  },
  "chapters": [
    {
      "number": 1,
      "title": "Chapter Title",
      "epigraph": {
        "text": "Chapter-opening quotation",
        "source": "— Source"
      },
      "sections": [
        {
          "heading": "Section Name",
          "paragraphs": [
            "First paragraph text.",
            "Second paragraph text."
          ]
        }
      ]
    }
  ]
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Book title (displayed on cover) |
| `subtitle` | No | Subtitle (displayed below title) |
| `author` | No | Author name. If omitted, auto-resolved by language: `fr` → "Pierre Lompo", all others → "Peter Lompo" |
| `lang` | No | Language code (`fr`, `en`, `de`, `es`, etc.). Default: `en`. Used to resolve default author name |
| `publisher` | No | Publisher name (copyright page). Default: "Pierre Studio" |
| `edition` | No | Edition info (copyright page) |
| `isbn` | No | ISBN (copyright page) |
| `trim` | No | Page size in points. Default: `[432, 648]` (6×9 inches) |
| `margins` | No | Margins in points. Default: 72pt (1 inch) all sides, 84pt inside |
| `dedication` | No | Dedication text (dedication page) |
| `epigraph` | No | Book-opening quotation with source |
| `chapters` | Yes | Array of chapter objects |
| `chapters[].number` | No | Chapter number (auto-incremented if omitted) |
| `chapters[].title` | Yes | Chapter title |
| `chapters[].epigraph` | No | Chapter-opening quotation |
| `chapters[].sections` | No | Array of sections within the chapter |
| `chapters[].sections[].heading` | No | Section heading |
| `chapters[].sections[].paragraphs` | Yes | Array of paragraph strings |

### Cover Configuration

Add a `cover` field to generate a professional cover and merge it automatically:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "cover": {
    "preset": "thriller",
    "style": "elegant",
    "background": "#1a1a2e",
    "accent": "#e94560",
    "textColor": "#ffffff",
    "subtitleColor": "#cccccc",
    "authorColor": "#ffffff",
    "border": true,
    "gradient": "dark_bottom"
  },
  "chapters": [...]
}
```

| Cover Field | Required | Description |
|-------------|----------|-------------|
| `preset` | No | Genre preset — auto-fills colors/style (see table below) |
| `style` | No | Cover style: `elegant` (default), `minimal`, `bold`, `classic` |
| `background` | No | Background hex color (e.g., `"#1a1a2e"`) or `null` for white |
| `accent` | No | Accent hex color for decorative elements |
| `textColor` | No | Title text hex color |
| `subtitleColor` | No | Subtitle hex color |
| `authorColor` | No | Author name hex color |
| `border` | No | Show decorative border (`true`/`false`) |
| `gradient` | No | Gradient effect: `dark_bottom`, `dark_top`, `vignette`, or `null` |
| `titleSize` | No | Override title font size (default varies by style) |
| `titleY` | No | Title vertical position (0.0-1.0, default varies) |
| `authorY` | No | Author vertical position (0.0-1.0) |
| `decorLine` | No | Show decorative line under title (`true`/`false`) |
| `decorLineWidth` | No | Width of decorative line in points |
| `topStripe` | No | Show accent stripe at top (`true`/`false`) |
| `bottomStripe` | No | Show accent stripe at bottom (`true`/`false`) |
| `stripeHeight` | No | Height of accent stripes in points |
| `stripeColor` | No | Custom color for stripes (hex) |

### Genre Presets

Use `preset` to auto-apply bestseller-optimized color schemes and layouts:

| Preset | Genre | Colors | Style |
|--------|-------|--------|-------|
| `thriller` | Thriller / Suspense | Near-monochrome dark, cold red accent | bold |
| `psych_thriller` | Psychological Thriller | Muted desaturated, cold blue accent | minimal |
| `romance` | Contemporary Romance | Warm pink/coral on light | elegant |
| `dark_romance` | Dark Romance | Deep burgundy/black, gold metallics | elegant |
| `fantasy` | Epic Fantasy | Jewel tones, dark ground, gold accent | elegant |
| `cozy_fantasy` | Cozy Fantasy | Warm amber/sage/dusty rose | classic |
| `literary` | Literary Fiction | Restrained muted, negative space | minimal |
| `historical` | Historical Fiction | Aged cream/parchment, warm sepia | classic |
| `self_help` | Self-Help / Business | Clean high-contrast, blue for trust | bold |
| `scifi` | Science Fiction | Cool blues/cyan, neon on dark | bold |
| `horror` | Horror | Black, blood red, stark white | bold |
| `memoir` | Memoir / Biography | Soft neutrals, warm tones | elegant |
| `poetry` | Poetry | Muted monochrome, negative space | minimal |
| `children` | Children's / Middle Grade | Bright primaries, warm saturated | bold |
| `romantasy` | Romantasy | Jewel tones, warm bloom, gold | elegant |

**Using presets:**
```json
{
  "title": "The Silent Observer",
  "author": "Alexandra Reed",
  "preset": "thriller"
}
```

Presets can be overridden with explicit color/style fields:
```json
{
  "title": "The Silent Observer",
  "author": "Alexandra Reed",
  "preset": "thriller",
  "accent": "#00ff00"
}
```

### Cover Styles

| Style | Description | Best For |
|-------|-------------|----------|
| `elegant` | Dark background, ornate border, diamond ornaments | Fiction, memoir, literary nonfiction |
| `minimal` | Clean white, thin accent lines, modern typography | Business, self-help, design |
| `bold` | Full dark background, thick accent stripes, large title | Thriller, sci-fi, motivational |
| `classic` | Cream background, double border, classic flourishes | History, philosophy, academic |

## Generated PDF Structure

The engine produces a professionally formatted book with:

1. **Cover page** — centered title, subtitle, author, decorative separator
2. **Copyright page** — standard copyright notice, publisher, edition, ISBN
3. **Dedication page** — if provided
4. **Epigraph page** — if provided
5. **Table of Contents** — all chapters and sections listed
6. **Chapter title pages** — chapter number, title, optional epigraph
7. **Body text** — properly typeset paragraphs with paragraph indentation
8. **Running headers** — chapter title on each page
9. **Page numbers** — outer margin, bottom
10. **Section ornaments** — decorative separators between sections

## Typography Rules

These rules produce best-seller quality output. Follow them when generating content.

### Fonts

| Use | Font | Weight |
|-----|------|--------|
| Body text | Lora | Regular (400) |
| Bold body | Lora | Bold (700) |
| Italic body | Lora | Italic (400i) |
| Chapter headings | Playfair Display | Bold (700) |
| Section headings | Playfair Display | Bold (700) |
| Chapter numbers | Lora | Regular (400) |

### Sizes

| Element | Size | Leading |
|---------|------|---------|
| Body text | 11pt | 18pt |
| Chapter title | 28pt | 36pt |
| Section heading | 14pt | 20pt |
| Chapter number | 10pt | 14pt |
| Running header | 7pt | 10pt |
| Page number | 9pt | 12pt |
| Dedication | 14pt | 22pt |
| Epigraph | 11pt | 17pt |

### Spacing

| Element | Space |
|---------|-------|
| After paragraph | 8pt |
| After section heading | 16pt |
| Before chapter title | 50pt from chapter number |
| After epigraph | 30pt before body |
| Between TOC entries | 22pt |
| Between TOC subsections | 18pt |

### Colors

| Element | RGB |
|---------|-----|
| Body text | (0.12, 0.12, 0.12) |
| Chapter title | (0.1, 0.1, 0.1) |
| Chapter number | (0.5, 0.3, 0.18) |
| Section heading | (0.15, 0.15, 0.15) |
| Running header | (0.6, 0.6, 0.6) |
| Page number | (0.5, 0.5, 0.5) |
| Separator line | (0.75, 0.6, 0.4) |
| Epigraph text | (0.4, 0.4, 0.4) |
| Epigraph source | (0.5, 0.5, 0.5) |
| Copyright text | (0.4, 0.4, 0.4) |

### Layout

| Parameter | Value | Notes |
|-----------|-------|-------|
| Trim size | 6×9 inches | Standard book format |
| Inside margin | 60pt (0.83in) | For binding margin |
| Outside margin | 48pt (0.67in) | |
| Top margin | 60pt (0.83in) | |
| Bottom margin | 60pt (0.83in) | |
| Header height | 36pt | Space for running header |
| Footer height | 36pt | Space for page number |
| Body width | 324pt (4.5in) | Text column width |

## Workflow

### 1. Plan the Book

Before generating content, plan:
- **Structure**: How many chapters? What sections in each?
- **Content depth**: How many paragraphs per section? (3-5 is ideal)
- **Epigraphs**: Find relevant quotations for each chapter
- **Flow**: Does the book have a narrative arc?

### 2. Generate Content

Write compelling, well-structured content. Follow these principles:

**Paragraph construction:**
- Start each section with a strong opening sentence
- Use the "inverted pyramid" — most important information first
- Vary paragraph length (2-6 sentences)
- End sections with a transition to the next topic

**Chapter openings:**
- Begin with the epigraph quotation
- Use a strong first sentence that hooks the reader
- Establish the chapter's theme immediately

**Section headings:**
- Use descriptive, active headings (not generic)
- Keep headings under 6 words
- Make headings parallel in structure

### 3. Create the JSON

Structure the book content as JSON following the schema above. Ensure:
- All paragraphs are strings (no HTML, no markdown)
- Chapter numbers are sequential
- Each chapter has at least one section with paragraphs
- Add a `cover` object for professional cover generation

### 4. Generate the PDF

**Full build (cover + content, recommended):**
```bash
node "<skill-dir>/build.js" "<path-to-book.json>" "<output-path>.pdf"
```

**Content only (no cover):**
```bash
node "<skill-dir>/engine.js" "<path-to-book.json>" "<output-path>.pdf"
```

**Cover only:**
```bash
node "<skill-dir>/cover.js" "<path-to-cover.json>" "<output-path>.pdf"
```

**Merge existing cover + content:**
```bash
node "<skill-dir>/merge.js" "<cover.pdf>" "<content.pdf>" "<output-path>.pdf"
```

### 5. Verify

Check the output PDF:
- Cover page displays correctly
- Table of contents lists all chapters
- Chapter title pages have proper formatting
- Body text is readable with proper leading
- Page numbers appear on all pages (except front matter)
- Running headers show chapter titles

## Content Guidelines

For best-seller quality, the content itself matters as much as the typography:

### Writing Style
- **Active voice** over passive voice
- **Short sentences** for emphasis, long sentences for flow
- **Concrete details** over abstract generalizations
- **Transitions** between paragraphs and sections
- **Varied sentence structure** to maintain rhythm

### Chapter Structure
- **Opening**: Epigraph + strong first paragraph
- **Development**: 2-4 sections with clear headings
- **Depth**: 3-5 paragraphs per section (300-600 words per section)
- **Closing**: Natural conclusion, not abrupt

### Avoid
- Walls of text without section breaks
- Generic headings ("Introduction", "Conclusion" without context)
- Repetitive sentence structures
- Overly long paragraphs (>8 sentences)
- Passive constructions

## Customization

### Change Trim Size
Modify the `trim` field in the JSON:
- `[432, 648]` — 6×9 inches (standard trade paperback)
- `[468, 684]` — 6.5×9.5 inches (larger format)
- `[414, 612]` — 5.75×8.5 inches (mass market)

### Change Margins
Modify the `margins` field:
```json
"margins": { "top": 72, "bottom": 72, "inside": 90, "outside": 72 }
```

### Add More Fonts
To add custom fonts, place `.ttf` files in the `fonts/` directory and modify `engine.js` to load them.

## Quick Reference

| Task | Command |
|------|---------|
| Full build (cover + content) | `node build.js book.json output.pdf` |
| Content only | `node engine.js book.json output.pdf` |
| Cover only | `node cover.js cover.json cover.pdf` |
| Merge cover + content | `node merge.js cover.pdf book.pdf output.pdf` |
| List genre presets | `node cover.js --list-presets` |
| Engine location | `<skill-dir>/engine.js` |
| Cover generator | `<skill-dir>/cover.js` |
| Genre presets | `<skill-dir>/presets.js` |
| Build script | `<skill-dir>/build.js` |
| Merge script | `<skill-dir>/merge.js` |
| Fonts location | `<skill-dir>/fonts/` |
| Dependencies | `pdf-lib`, `@pdf-lib/fontkit` (installed in skill dir) |
