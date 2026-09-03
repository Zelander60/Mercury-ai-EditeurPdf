#!/usr/bin/env node
/**
 * Genre presets for pdf-book covers
 * Based on 2025-2026 bestseller design research
 *
 * Each preset includes:
 * - Colors: background, accent, text, subtitle, author
 * - Typography: titleFont, titleSize, subtitleFont, authorFont
 * - Layout: border style, ornaments, composition
 * - Description of when to use
 */

const PRESETS = {
  // ══════════════════════════════════════════════════════════════
  // THRILLER / SUSPENSE
  // Near-monochrome dark field, heavy condensed type, one cold accent
  // Bestsellers: Gillian Flynn, Lee Child, Alex Michaelides
  // ══════════════════════════════════════════════════════════════
  thriller: {
    name: "Thriller / Suspense",
    description: "Dark, tense, high-contrast. Near-monochrome with one cold accent. Heavy type dominates.",
    background: "#0a0a0f",
    accent: "#c41e3a",
    textColor: "#f0f0f0",
    subtitleColor: "#888888",
    authorColor: "#ffffff",
    border: false,
    style: "bold",
    // Layout overrides
    titleY: 0.55,
    authorY: 0.15,
    decorLine: false,
    cornerOrnaments: false,
    // Special: thick accent stripe at top
    topStripe: true,
    bottomStripe: true,
    stripeHeight: 8,
  },

  // ══════════════════════════════════════════════════════════════
  // PSYCHOLOGICAL THRILLER
  // Muted, unsettling, off-balance. Desaturated with one jarring accent.
  // Bestsellers: The Silent Patient, Gone Girl, The Woman in the Window
  // ══════════════════════════════════════════════════════════════
  psych_thriller: {
    name: "Psychological Thriller",
    description: "Muted, unsettling, off-balance. Desaturated tones with one jarring accent.",
    background: "#1a1a1f",
    accent: "#4a6670",
    textColor: "#d4d4d4",
    subtitleColor: "#6a6a6a",
    authorColor: "#b0b0b0",
    border: false,
    style: "minimal",
    titleY: 0.52,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 40,
    cornerOrnaments: false,
  },

  // ══════════════════════════════════════════════════════════════
  // CONTEMPORARY ROMANCE
  // Bright, warm, illustrated feel. Pink/coral/teal pastels.
  // Bestsellers: Colleen Hoover, Emily Henry, Ali Hazelwood
  // ══════════════════════════════════════════════════════════════
  romance: {
    name: "Contemporary Romance",
    description: "Bright, warm, inviting. Pink/coral tones with elegant typography.",
    background: "#fdf2f0",
    accent: "#e8637a",
    textColor: "#2d1b2e",
    subtitleColor: "#8a5a6a",
    authorColor: "#4a2a3a",
    border: false,
    style: "elegant",
    titleY: 0.58,
    authorY: 0.2,
    decorLine: true,
    decorLineWidth: 80,
    cornerOrnaments: false,
    // Warm accent line under title
    warmLine: true,
  },

  // ══════════════════════════════════════════════════════════════
  // DARK ROMANCE
  // Deep burgundy/black, high contrast, gold metallics
  // Bestsellers: Haunting Adeline, Credence, neon gods
  // ══════════════════════════════════════════════════════════════
  dark_romance: {
    name: "Dark Romance",
    description: "Deep burgundy/black, high contrast, gold metallics. Sensual and intense.",
    background: "#1a0a0f",
    accent: "#8b1a2b",
    textColor: "#f5e6d3",
    subtitleColor: "#a08070",
    authorColor: "#d4b896",
    border: true,
    style: "elegant",
    titleY: 0.55,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 100,
    cornerOrnaments: true,
    goldAccent: true,
  },

  // ══════════════════════════════════════════════════════════════
  // EPIC FANTASY
  // Jewel tones, dark ground, gold/warm metallic accent
  // Bestsellers: Sarah J. Maas, Brandon Sanderson, Rebecca Yarros
  // ══════════════════════════════════════════════════════════════
  fantasy: {
    name: "Epic Fantasy",
    description: "Rich jewel tones, dark ground, gold metallic accent. Ornate and atmospheric.",
    background: "#0d0a1a",
    accent: "#c9a84c",
    textColor: "#f0e6d2",
    subtitleColor: "#8a7a5a",
    authorColor: "#d4c4a0",
    border: true,
    style: "elegant",
    titleY: 0.55,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 120,
    cornerOrnaments: true,
    goldAccent: true,
    // Dark gradient overlay feel
    gradientDark: true,
  },

  // ══════════════════════════════════════════════════════════════
  // COZY FANTASY
  // Warm earth tones, amber/sage/dusty rose, friendly
  // Bestsellers: Legends & Lattes, House in the Cerulean Sea
  // ══════════════════════════════════════════════════════════════
  cozy_fantasy: {
    name: "Cozy Fantasy",
    description: "Warm earth tones, amber/sage/dusty rose. Friendly and inviting.",
    background: "#f5ede0",
    accent: "#8b6b4a",
    textColor: "#3a2a1a",
    subtitleColor: "#7a6a5a",
    authorColor: "#5a4a3a",
    border: true,
    style: "classic",
    titleY: 0.56,
    authorY: 0.2,
    decorLine: true,
    decorLineWidth: 80,
    cornerOrnaments: true,
  },

  // ══════════════════════════════════════════════════════════════
  // LITERARY FICTION
  // Restrained, sophisticated, muted. Negative space dominant.
  // Bestsellers: Klara and the Sun, A Little Life, Normal People
  // ══════════════════════════════════════════════════════════════
  literary: {
    name: "Literary Fiction",
    description: "Restrained, sophisticated, muted. Clean typography with negative space.",
    background: "#f8f6f2",
    accent: "#6a5a4a",
    textColor: "#1a1a1a",
    subtitleColor: "#7a7a7a",
    authorColor: "#3a3a3a",
    border: false,
    style: "minimal",
    titleY: 0.52,
    authorY: 0.22,
    decorLine: true,
    decorLineWidth: 50,
    cornerOrnaments: false,
    // Thin, elegant lines
    thinAccents: true,
  },

  // ══════════════════════════════════════════════════════════════
  // HISTORICAL FICTION
  // Aged cream/parchment, warm sepia, muted gold
  // Bestsellers: All the Light We Cannot See, The Nightingale
  // ══════════════════════════════════════════════════════════════
  historical: {
    name: "Historical Fiction",
    description: "Aged cream/parchment, warm sepia, muted gold. Classic and timeless.",
    background: "#f0e8d4",
    accent: "#8b7355",
    textColor: "#2a1a0a",
    subtitleColor: "#6a5a4a",
    authorColor: "#4a3a2a",
    border: true,
    style: "classic",
    titleY: 0.56,
    authorY: 0.2,
    decorLine: true,
    decorLineWidth: 100,
    cornerOrnaments: true,
    warmGold: true,
  },

  // ══════════════════════════════════════════════════════════════
  // SELF-HELP / BUSINESS
  // Clean, high contrast, authoritative. Blue/green for trust.
  // Bestsellers: Atomic Habits, Think Like a Monk, The Mountain Is You
  // ══════════════════════════════════════════════════════════════
  self_help: {
    name: "Self-Help / Business",
    description: "Clean, high contrast, authoritative. Blues/greens for trust and growth.",
    background: "#ffffff",
    accent: "#2563eb",
    textColor: "#111827",
    subtitleColor: "#6b7280",
    authorColor: "#374151",
    border: false,
    style: "bold",
    titleY: 0.55,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 60,
    cornerOrnaments: false,
    // Bold accent stripe
    topStripe: true,
    stripeHeight: 6,
    stripeColor: "#2563eb",
  },

  // ══════════════════════════════════════════════════════════════
  // SCIENCE FICTION
  // Cool blues/cyan, neon accents, dark background
  // Bestsellers: Dune, Project Hail Mary, The Three-Body Problem
  // ══════════════════════════════════════════════════════════════
  scifi: {
    name: "Science Fiction",
    description: "Cool blues/cyan, neon accents, dark background. Futuristic and clean.",
    background: "#0a0f1a",
    accent: "#00bcd4",
    textColor: "#e0f0ff",
    subtitleColor: "#6090b0",
    authorColor: "#b0d0e0",
    border: false,
    style: "bold",
    titleY: 0.55,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 80,
    cornerOrnaments: false,
    // Neon glow effect (simulated with accent)
    neonAccent: true,
  },

  // ══════════════════════════════════════════════════════════════
  // HORROR
  // Black, blood red, stark white. Unsettling minimalism.
  // Bestsellers: Stephen King, Mexican Gothic, The Haunting of Hill House
  // ══════════════════════════════════════════════════════════════
  horror: {
    name: "Horror",
    description: "Black, blood red, stark white. Unsettling minimalism and dread.",
    background: "#050505",
    accent: "#8b0000",
    textColor: "#e8e8e8",
    subtitleColor: "#5a5a5a",
    authorColor: "#c0c0c0",
    border: false,
    style: "bold",
    titleY: 0.55,
    authorY: 0.15,
    decorLine: false,
    cornerOrnaments: false,
    topStripe: true,
    bottomStripe: true,
    stripeHeight: 4,
    stripeColor: "#8b0000",
  },

  // ══════════════════════════════════════════════════════════════
  // MEMOIR / BIOGRAPHY
  // Soft neutrals, warm tones, personal feel
  // Bestsellers: Becoming, Greenlights, The Glass Castle
  // ══════════════════════════════════════════════════════════════
  memoir: {
    name: "Memoir / Biography",
    description: "Soft neutrals, warm tones, personal and intimate feel.",
    background: "#f5f0eb",
    accent: "#a08060",
    textColor: "#2a2018",
    subtitleColor: "#7a6a5a",
    authorColor: "#4a3a2a",
    border: false,
    style: "elegant",
    titleY: 0.55,
    authorY: 0.2,
    decorLine: true,
    decorLineWidth: 60,
    cornerOrnaments: false,
  },

  // ══════════════════════════════════════════════════════════════
  // POETRY
  // Muted, monochrome, negative space. Type-led.
  // Bestsellers: Milk and Honey, The Sun and Her Flowers
  // ══════════════════════════════════════════════════════════════
  poetry: {
    name: "Poetry",
    description: "Muted, monochrome, negative space. Type-led with small motif.",
    background: "#fafafa",
    accent: "#999999",
    textColor: "#1a1a1a",
    subtitleColor: "#888888",
    authorColor: "#444444",
    border: false,
    style: "minimal",
    titleY: 0.48,
    authorY: 0.25,
    decorLine: true,
    decorLineWidth: 30,
    cornerOrnaments: false,
    thinAccents: true,
  },

  // ══════════════════════════════════════════════════════════════
  // CHILDREN'S
  // Bright primaries, warm saturated, playful
  // Bestsellers: Dog Man, The Bad Guys, Wings of Fire
  // ══════════════════════════════════════════════════════════════
  children: {
    name: "Children's / Middle Grade",
    description: "Bright primaries, warm saturated, playful and energetic.",
    background: "#fff8e1",
    accent: "#ff6b35",
    textColor: "#1a1a1a",
    subtitleColor: "#5a5a5a",
    authorColor: "#3a3a3a",
    border: true,
    style: "bold",
    titleY: 0.56,
    authorY: 0.18,
    decorLine: false,
    cornerOrnaments: false,
    // Fun, rounded accents
    playfulAccents: true,
  },

  // ══════════════════════════════════════════════════════════════
  // ROMANTASY
  // Jewel tones, warm luminous bloom, elegant flourishes
  // Bestsellers: Fourth Wing, A Court of Thorns and Roses
  // ══════════════════════════════════════════════════════════════
  romantasy: {
    name: "Romantasy",
    description: "Jewel tones, warm luminous bloom, elegant flourishes. Magic meets passion.",
    background: "#1a0a20",
    accent: "#c084fc",
    textColor: "#f0e6ff",
    subtitleColor: "#a080c0",
    authorColor: "#d0b8e8",
    border: true,
    style: "elegant",
    titleY: 0.55,
    authorY: 0.18,
    decorLine: true,
    decorLineWidth: 100,
    cornerOrnaments: true,
    goldAccent: true,
    // Iridescent feel
    iridescent: true,
  },
};

// ── Helper: Get preset by name ──
function getPreset(name) {
  const key = name.toLowerCase().replace(/[\s-]/g, "_");
  return PRESETS[key] || null;
}

// ── Helper: List all presets ──
function listPresets() {
  return Object.entries(PRESETS).map(([key, p]) => ({
    key,
    name: p.name,
    description: p.description,
  }));
}

// ── Helper: Merge preset with user config ──
function mergeWithPreset(presetName, userConfig = {}) {
  const preset = getPreset(presetName);
  if (!preset) {
    throw new Error(`Unknown preset: "${presetName}". Available: ${Object.keys(PRESETS).join(", ")}`);
  }
  // User config overrides preset
  return { ...preset, ...userConfig, _preset: presetName };
}

module.exports = { PRESETS, getPreset, listPresets, mergeWithPreset };

// ── CLI: List presets ──
if (require.main === module) {
  const presets = listPresets();
  console.log("\nAvailable genre presets:\n");
  for (const p of presets) {
    console.log(`  ${p.key.padEnd(16)} ${p.name}`);
    console.log(`  ${"".padEnd(16)} ${p.description}\n`);
  }
}
