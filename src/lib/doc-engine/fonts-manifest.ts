/**
 * Font manifest — selectable fonts for export
 * Each entry maps a logical family to its TTF files.
 * Files must exist in src/lib/doc-engine/fonts/
 */

export type FontFamily = 'Lora' | 'Merriweather' | 'Roboto' | 'Inter' | 'SourceSerif4' | 'EBGaramond' | 'CrimsonText' | 'Cormorant' | 'PlayfairDisplay';

export interface FontOption {
  value: FontFamily;
  label: string;
  category: 'Serif' | 'Sans' | 'Display';
  preview: string;
  files: {
    regular: string;
    bold: string;
    italic: string;
    boldItalic?: string;
  };
  fallback: 'TimesRoman' | 'Helvetica' | 'Courier';
}

export const BODY_FONTS: FontOption[] = [
  {
    value: 'Lora',
    label: 'Lora',
    category: 'Serif',
    preview: 'The quick brown fox',
    files: { regular: 'Lora-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf', boldItalic: 'Lora-BoldItalic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'Merriweather',
    label: 'Merriweather',
    category: 'Serif',
    preview: 'Classic book serif',
    files: { regular: 'Merriweather-Regular.ttf', bold: 'Merriweather-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'SourceSerif4',
    label: 'Source Serif 4',
    category: 'Serif',
    preview: 'Elegant reading',
    files: { regular: 'SourceSerif4-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'EBGaramond',
    label: 'EB Garamond',
    category: 'Serif',
    preview: 'Timeless literary',
    files: { regular: 'EBGaramond-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'CrimsonText',
    label: 'Crimson Text',
    category: 'Serif',
    preview: 'Old style serif',
    files: { regular: 'CrimsonText-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'Inter',
    label: 'Inter',
    category: 'Sans',
    preview: 'Clean modern sans',
    files: { regular: 'Inter-Regular.ttf', bold: 'Inter-Regular.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'Helvetica',
  },
  {
    value: 'Roboto',
    label: 'Roboto',
    category: 'Sans',
    preview: 'Geometric sans',
    files: { regular: 'Roboto-Regular.ttf', bold: 'Roboto-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'Helvetica',
  },
];

export const HEADING_FONTS: FontOption[] = [
  {
    value: 'PlayfairDisplay',
    label: 'Playfair Display',
    category: 'Display',
    preview: 'High contrast display',
    files: { regular: 'PlayfairDisplay-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf', italic: 'PlayfairDisplay-Italic.ttf' },
    fallback: 'Helvetica',
  },
  {
    value: 'Cormorant',
    label: 'Cormorant',
    category: 'Display',
    preview: 'Refined sharp serif',
    files: { regular: 'Cormorant-Regular.ttf', bold: 'PlayfairDisplay-Bold.ttf', italic: 'PlayfairDisplay-Italic.ttf' },
    fallback: 'Helvetica',
  },
  {
    value: 'Lora',
    label: 'Lora',
    category: 'Serif',
    preview: 'Soft elegant',
    files: { regular: 'Lora-Regular.ttf', bold: 'Lora-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
  {
    value: 'Inter',
    label: 'Inter',
    category: 'Sans',
    preview: 'Modern minimal',
    files: { regular: 'Inter-Regular.ttf', bold: 'Inter-Regular.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'Helvetica',
  },
  {
    value: 'Merriweather',
    label: 'Merriweather',
    category: 'Serif',
    preview: 'Sturdy serif heading',
    files: { regular: 'Merriweather-Regular.ttf', bold: 'Merriweather-Bold.ttf', italic: 'Lora-Italic.ttf' },
    fallback: 'TimesRoman',
  },
];

export const ALL_FONTS: Record<string, FontOption> = Object.fromEntries(
  [...BODY_FONTS, ...HEADING_FONTS].map((f) => [f.value, f])
);

export const FONT_PAIRINGS: { body: FontFamily; heading: FontFamily; label: string }[] = [
  { body: 'Lora', heading: 'PlayfairDisplay', label: 'Classic — Lora + Playfair' },
  { body: 'Merriweather', heading: 'Cormorant', label: 'Literary — Merriweather + Cormorant' },
  { body: 'SourceSerif4', heading: 'PlayfairDisplay', label: 'Elegant — Source Serif + Playfair' },
  { body: 'Inter', heading: 'Inter', label: 'Modern — Inter + Inter' },
  { body: 'Roboto', heading: 'Cormorant', label: 'Contrast — Roboto + Cormorant' },
  { body: 'EBGaramond', heading: 'Cormorant', label: 'Timeless — EB Garamond + Cormorant' },
];
