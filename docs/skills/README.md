# Skills centralisées — BookGenerator

> 10 skills copiées localement pour qu'un nouveau modèle/chatbot ait tout sans manque (se connecter à OpenCode ou app method).
> Source : skills **installées** projet + skills **PDF** (hors 52 defaults opencode). Voir `../HANDOFF.md` chap. 12.

## Tableau récapitulatif

| Skill | Dossier | Taille | Utilité | Commande d'exemple |
|---|---|---|---|---|
| **pdf-book** | `pdf-book/` | 970 KB | Livres/ebooks chapitrés imprimables (Lora/Playfair, TOC, headers/footers, margins/trim). Moteur pdf-lib. | `node engine.js book.json out.pdf` |
| **pdf-forge** | `pdf-forge/` | 120 KB | HTML/Tailwind → PDF (slides 1920×1080 + docs A4) via Playwright. Thème `yorus-dark.yaml`. | `bin/pdf-forge` |
| **yorus-commercial-proposals** | `yorus-commercial-proposals/` | 5 KB | Exemple concret de PDF A4 commercial décisionnel (9 pages). | (vient de pdf-forge) |
| **ui-ux-pro-max** | `ui-ux-pro-max/` | 3 456 KB | Intelligence UI/UX : 79 styles, 192 palettes, 74 font pairings, 119 guidelines, 105 icônes, 22 stacks. Base offline searchable. | `scripts/search.py --design-system` |
| **design** | `design/` | 236 KB | Méta : logo (55 styles), CIP (50 livrables), slides (Chart.js), banner (22 styles), icônes SVG (15), social photos. | scripts Python Gemini |
| **ui-styling** | `ui-styling/` | 167 KB | shadcn/ui (Radix+Tailwind) + accessibilité + dark-mode + responsive. | — |
| **design-system** | `design-system/` | 175 KB | Tokens 3 couches (primitive→sémantique→component), handoff Tailwind, slides. | `scripts/embed-tokens.cjs` |
| **brand** | `brand/` | 87 KB | Brand voice/visual, messaging, asset mgmt, sync `brand-guidelines.md` → tokens. | `scripts/inject-brand-context.cjs` |
| **banner-design** | `banner-design/` | 13 KB | Bannières social/ads/web/print (22 styles, workflow 5 étapes). | workflow + chrome-devtools |
| **slides** | `slides/` | 19 KB | Presentations HTML stratégiques + Chart.js + tokens. | (wrapper) |

## Lien avec le projet

- `pdf-book` : moteur `src/lib/doc-engine/` (engine.js/cover.js/presets/fonts) est indépendant mais compatible — les 17 TTF du projet sont dans `src/lib/doc-engine/fonts/`.
- `ui-ux-pro-max` + `design-system` + `ui-styling` : correspondent au design system appliqué (tokens `globals.css`, `tailwind.config.js`, `docs/brand-guidelines.md` à créer).
- `pdf-forge` : indépendant du repo principal, utilitaire pour rapports/decks si besoin.

## Notes

- `pdf-book/node_modules` volontairement **exclu** (pdf-lib/fontkit déjà deps de `book-platform`). Si tu veux le skill autonome, `cd docs/skills/pdf-book && npm install`.
- Ces skills sont des **instructions de travail** (SKILL.md) — à lire via l'outil skill d'OpenCode, pas du code exécutable du produit.
