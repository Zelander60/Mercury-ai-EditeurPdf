# HANDOFF — BookGenerator (alias `mercuryai`)

> **Document de passation pour un nouveau modèle / chatbot.**
> Lis ce fichier en premier, puis `README.md`, puis `BILLION_DOLLAR_PLAYBOOK.md`, puis le chapitre 12 (ordre de lecture détaillé).
> **Date** : 2026-09-03  ·  **URL live** : https://mercuryai-drab.vercel.app

---

## 1. TL;DR — 5 minutes

**Quoi** : SaaS « Le workspace d'édition pour équipes et agents IA ». L'idée → livre PDF prêt à imprimer en ~90 s (outline → chapitres → polish → export PDF). Concurrent type : Notion / ChatGPT Canvas orientés livres.

**Stack** : Next.js 16.3.4 (React 19, App Router) + Tailwind 3 + shadcn/ui + Clerk (auth) + Supabase (Postgres + Storage) + Drizzle ORM + Stripe (billing) + OpenRouter (`openrouter/free`) + pdf-lib/fontkit (moteur PDF maison) + @xyflow/react (canvas workflows).

**3 commandes pour démarrer** :
```bash
cd C:\Users\HP\book-platform
bun install        # Vercel utilise bun (vercel.json)
bun run dev        # Next dev -> http://localhost:3000 (port vu 3099 dans dev-log)
npx tsc --noEmit   # type check avant build
```

**Déploiement** : pas de git AVANT ce handoff → maintenant poussé sur `https://github.com/Zelander60/Mercury-ai-EditeurPdf.git` (branche `main`). Déploiement Vercel direct : `vercel --prod --scope zelanders-projects` (obligatoire, l'org est `zelanders-projects`).

**Structure top rapide** :
```
src/app/        routes Next (site, auth, dashboard, api)
src/components/ UI (shadcn + product)
src/lib/        logique (ai, doc-engine, stripe, supabase, workflow, providers)
docs/           CE handoff + skills centralisées
migrations/     Drizzle (schema.ts = source de vérité)
```

---

## 2. Cartographie des fichiers `.md` existants

**60 fichiers `.md`** hors `node_modules`. Les 3 racine sont opérationnels; le reste := skills OpenCode.

### 2.1 Racine (lire en priorité)

| Fichier | Taille | Objectif |
|---|---|---|
| `README.md` | 5 KB | Features + **section Production Deployment Vercel** (env vars, webhook Stripe, Security TODO RLS). |
| `BILLION_DOLLAR_PLAYBOOK.md` | 19.9 KB | **Source de vérité produit** : playbook 0→paid, design system Linear/Stripe, 5 actes 90s-to-Aha, monetization annual-first, 5 piliers, roadmap Phase 0→5, métriques. |
| `clerk.md` | 7.4 KB | Setup Clerk CLI : `app_3IjlKiiLwUy3hzVL7zWO902YBY1`, proxy `/__clerk/:path*`, règle Next15 `await auth()`, `clerk doctor`. |

### 2.2 `.opencode/skills/` — 57 fichiers (7 skills installées projet)

| Skill | Fichiers | Objectif |
|---|---|---|
| `ui-ux-pro-max` | 1 SKILL.md (28 KB) + data/ (google-fonts.csv 747KB, phosphor.json 823KB, styles.csv 149KB) | **Intelligence UI/UX** : 79 styles, 192 palettes, 74 font pairings, 119 UX guidelines, 105 icônes, 22 stacks. Base offline searchable via `scripts/search.py`. |
| `design` | SKILL.md + refs + data/ + scripts/ | Méta-skill 8-en-1 : logo (55 styles), CIP (50 livrables), slides (Chart.js), banner (22 styles), icônes SVG (15 styles), social photos. |
| `brand` | SKILL.md + 11 refs + 4 scripts .cjs + template | Brand voice/visual, sync `brand-guidelines.md` → `design-tokens.json/css` (scripts `inject-brand-context`, `sync-brand-to-tokens`). |
| `ui-styling` | SKILL.md + 7 refs | shadcn/ui (Radix+Tailwind) + Tailwind + canvas design system + accessibilité + dark-mode. |
| `design-system` | SKILL.md + 7 refs + data/ + scripts/ | Tokens 3 couches (primitive→sémantique→component), CSS vars, handoff Tailwind, génération slides. |
| `banner-design` | SKILL.md + refs | Bannières social/ads/web/print, 22 styles, workflow 5 étapes, convention `assets/banners/{campaign}/`. |
| `slides` | SKILL.md + 4 refs | HTML stratégique + Chart.js + design tokens → presentations. |

> Ces 7 skills closes dans `docs/skills/` ainsi que 3 skills PDF (voir chapitre 12).

### 2.3 Autres `.md`
- `docs/skills/*` : 10 skills copiées (voir chapitre 12) — CENTRALISÉES pour handoff.

---

## 3. Stack technique & versions figées

**Fichier** : `package.json` (name legacy `webprodigies-cypress`). Package manager **bun** (bun.lock prioritaire; `vercel.json` force `bun install`).

### Framework / Core
| Package | Version | Rôle |
|---|---|---|
| next | **16.3.4** | App Router + Route Handlers + Turbopack |
| react / react-dom | **19.2.8** | React 19 |
| @clerk/nextjs | ^7.8.4 | Auth (proxy.ts) |
| @clerk/ui | ^1.31.0 | Thème shadcn Clerk |
| drizzle-orm | ^0.28.6 | ORM Postgres |
| postgres | ^3.4.0 | Driver postgres-js |
| @supabase/supabase-js | ^2.38.1 | Supabase client |
| @supabase/ssr | ^0.12.5 | SSR cookies |
| stripe / @stripe/stripe-js | ^14.1.0 / ^2.1.10 | Billing |
| pdf-lib / @pdf-lib/fontkit | ^1.17.1 / ^1.1.1 | Moteur PDF |

### UI / DX
`@radix-ui/*` (16+), `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `lucide-react`, `cmdk` (⌘K), `next-themes`, `sonner`, `vaul` (drawer), `embla-carousel-react`, `react-hook-form` + `zod` + `@hookform/resolvers`, `react-resizable-panel`, `input-otp`, `date-fns`, `recharts` (2.15.4), `@xyflow/react` (12.11.6).

### Éditeur / legacy
`quill` (1.3.7) + `quill-cursors` (4.0.2) + `emoji-picker-react` — **hérité Notion-like** pour `files`/`folders` (peut coexister avec `documents`, objet primaire nouveau).

### Configs clés
- `next.config.js` : `turbopack.root: __dirname`, `outputFileTracingIncludes` pour `/api/documents/[id]/export` + `/api/generate` → `./src/lib/doc-engine/fonts/**/*` (obligatoire sinon ENOENT fonts en prod).
- `tailwind.config.js` : darkMode class, couleurs `hsl(var(--))`, radius, fontSize display 64/h2 32/body 16, boxShadow premium/soft/subtle, fontFamily `notion` = Inter.
- `tsconfig.json` : target es6, strict, paths `@/* -> ./src/*`, exclude `upgrade-backup`.
- `vercel.json` : framework nextjs, build `bun run build`, install `bun install`.
- `drizzle.config.ts` : schema `./src/lib/supabase/schema.ts`, out `./migrations`, driver `pg`, DATABASE_URL.

---

## 4. Architecture & routes

### Entry points
| Fichier | Rôle |
|---|---|
| `src/app/layout.tsx` | RootLayout : Inter, ClerkProvider, ThemeProvider (dark default), AppStateProvider, SupabaseUserProvider, Toaster |
| `src/proxy.ts` | `clerkMiddleware` — matcher `/(api|trpc)(.*)` + `/__clerk/:path*`. `isPublicRoute` = `/`, `/login`, `/signup`, `/api/webhook`, `/api/products` |
| `src/lib/auth.ts` | `getServerUser()` via `auth()` + `currentUser()` |

### Routes UI (App Router)
| Route | Niveau | Description |
|---|---|---|
| `/` | public | Landing (hero, demo, 3 steps, 6 features, 3 testimonials, PricingSection) |
| `/login`, `/signup` | public | Clerk |
| `/dashboard` | auth | Orchestrateur : redirect/`/login`, `DashboardSetup` si pas workspace, sinon `/dashboard/[workspaceId]` |
| `/dashboard/[workspaceId]` | auth | Overview (stats, ActivationChecklist, recents, quick links, Plan) |
| `/dashboard/[workspaceId]/documents` | auth | Bibliothèque de livres (EmptyState, statuts) |
| `/dashboard/[workspaceId]/documents/[documentId]` | auth | Vue brute JSON + erreur `?error=invalid-json` |
| `/dashboard/[workspaceId]/documents/[documentId]/editor` | auth | **Éditeur canvas PDF** (EditorShell, paginateBook, tools-panel) |
| `/dashboard/[workspaceId]/workflows` | auth | Canvas XYFlow workflow builders persistés |
| `/dashboard/[workspaceId]/tools` | auth | Outils PDF (merge/split) |
| `/dashboard/[workspaceId]/settings` | auth | Onglets workspace/profile/billing |
| `/dashboard/[workspaceId]/[folderId]` + `[fileId]` | auth | **Legacy** Notion-like folders/files Quill |

### Routes API
| Route | Auth | Rôle |
|---|---|---|
| `POST /api/generate` | Clerk 401 | `generateBookContent` OpenRouter (16k tokens JSON) |
| `POST /api/chat` | Clerk 401 | Chat dock agent 360° (non-stream) |
| `POST /api/webhook` | Stripe sign | Events product/price/checkout/subscription/invoice |
| `GET /api/products` | public | Produits+prices actifs |
| `POST /api/create-checkout-session` | Clerk | Checkout Stripe 14j trial |
| `POST /api/create-portal-link` | Clerk | Portail billing |
| `POST /api/documents/[id]/export` | authorizeWorkspace | buildBook + exportWithOperations → PDF |
| `POST /api/documents/[id]/save-operations` | authorizeDocument | Sauve ops JSONB |
| `POST /api/workflows/run` | Clerk | Exécute workflow → base64 PDF |

> ⚠️ `src/pages/` contient un vestige `pages/api` (template legacy). App Router prioritaire, mais le nettoyer évite toute confusion (géré au chapitre 11).

### Providers / état
`ThemeProvider` (next-themes) · `AppStateProvider` (reducer workspaces/folders/files, optimistic) · `SupabaseUserProvider` · `SubscriptionModalProvider` (getActiveProductsWithPrice) · `SocketProvider` (presence/cursors, non critique PDF) · `useSupabaseRealtime` hook.

---

## 5. Base de données (Drizzle + Supabase Postgres)

**Source de vérité** : `migrations/schema.ts` (300 lignes) — ré-exporté par `src/lib/supabase/schema.ts`. DB ref : `yivvhfzmwrwckonntcec.supabase.co` (pooler `aws-1-eu-west-1.pooler.supabase.com:6543`).

### 14 tables
| Table | PK | Notes |
|---|---|---|
| `workspaces` | uuid | `workspaceOwner text NOT NULL` (Clerk userId), title/icon/data/inTrash/logo/bannerUrl |
| `folders` | uuid | workspaceId FK cascade |
| `files` | uuid | workspaceId + folderId FK cascade |
| `users` | text | id = Clerk userId, fullName/avatar/billing/payment/email |
| `customers` | text | stripeCustomerId |
| `products` / `prices` | text | Stripe prod_*/price_*, enums pricingType/pricingPlanInterval |
| `subscriptions` | text | userId, status enum, priceId, trial, period |
| `workflows` | uuid | workspaceId, name, description, graph jsonb |
| `collaborators` | uuid | workspaceId + userId |
| `documents` | uuid | **Objet primaire** : workspaceId, title/subtitle/type/status, contentJson, coverConfig, operations jsonb `[]` |
| `documentVersions` | uuid | documentId, contentJson |
| `assets` / `exports` | uuid | documentId, storagePath |

**Enums** : pricingType, pricingPlanInterval, subscriptionStatus + types Supabase (key/factor/aal).

### Requêtes (src/lib/supabase/queries.ts, 348 lignes)
`createWorkspace, deleteWorkspace, getUserSubscriptionStatus, getFolders/getFiles/Details, deleteFile/Folder, get(Private/Collaborating/Shared)Workspaces, add/removeCollaborators, findUser, getActiveProductsWithPrice, create/update Folder/File/Workspace, getCollaborators, getUsersFromSearch (ilike limit5)`.

### Access control (src/lib/supabase/access.ts)
`requireUserId` · `authorizeWorkspace` (owner || collaborator) · `authorizeDocument` (via workspace). Utilisé par `save-operations`, `export`, `document-actions`.

### Free limit (src/lib/server-actions/document-actions.ts)
`FREE_LIMIT = 5` livres/mois (count `gte createdAt monthStart`) si pas `active`/`trialing` → erreur "Free plan allows 5 books per month...".

### ⚠️ Drift migrations
- Les migrations SQL s'arrêtent à `0008` (nov. 2023). Les tables `workflows`, `documents`, `documentVersions`, `assets`, `exports` existent dans `schema.ts` mais **pas** dans les `.sql` → la DB réelle est à jour via autre moyen ? Vérifier avec `bun run push` / `drizzle-kit generate:pg`.
- `package.json migrate` pointe vers `src/lib/supabase/migration.ts` qui **n'existe pas** (fichier introuvable) → script cassé à fixer ou supprimer.

**Commandes drizzle** : `bun run push|generate|pull|check|up|drop`.

---

## 6. Moteur PDF (différenciateur cœur)

**Dossier** : `src/lib/doc-engine/` (JS + TS + fonts).

| Fichier | Rôle |
|---|---|
| `engine.js` (1322 l) | `BookEngine` : trim 432×648 (6×9in), margins, header/footer running, cover/dedication/epigraph/TOC/chapters/sections, bullets/callout/framework/statistic/caseStudy/checklist. CLI `node engine.js book.json out.pdf`. |
| `cover.js` (740 l) | `CoverGenerator` : 15 presets + 4 styles (elegant/minimal/bold/classic) + vignette + bordures. |
| `book-builder.js` | `buildBook(book)` → merge cover+content via `PDFDocument.create` (temp, sans fs persist). |
| `build.js` / `merge.js` | CLIs fichier. |
| `presets.js` | `PRESETS` 15 genres (thriller, romance, fantasy, self_help, scifi, horror...) + get/list/mergeWithPreset. |
| `pdf-operations.ts` | Types Text/Shape/Highlight + `applyOperations` (coord bottom-left) + `exportWithOperations`. |
| `pdf-tools.ts` | compressPdf, mergePdfs, splitPdf, extractPages, addWatermark, getPdfInfo. |
| `paginate-book.ts` | `paginateBook` → BookPage[] blocks (612×792) pou editor preview. |
| `fonts-manifest.ts` | BODY_FONTS 7 + HEADING_FONTS 5 + FONT_PAIRINGS 6. |
| `fonts/` | **17 TTF** : Lora (4), Merriweather (2), Roboto (2), Inter (2), SourceSerif4, EBGaramond, CrimsonText, Cormorant, PlayfairDisplay (3). |

> Fonts embarquées **obligatoire** sur Vercel via `outputFileTracingIncludes` (next.config.js) sinon fallback StandardFonts + warning build.

---

## 7. IA & Workflows

### Router (`src/lib/ai/router.ts`)
- `openrouter/free` (générique auto-route free models) si `OPENROUTER_FREE_ONLY !== false`
- `FREE_FALLBACKS` : gemini/llama/qwen/deepseek
- `PREMIUM_FALLBACK` : `anthropic/claude-sonnet-4` si `OPENROUTER_FREE_ONLY=false`
- `getHeaders()` : HTTP-Referer `NEXT_PUBLIC_SITE_URL`

### Content generator (`src/lib/ai/content-generator.ts`)
- `SYSTEM_PROMPT` JSON strict, `buildPrompt(input)`, fetch `https://openrouter.ai/api/v1/chat/completions`
- `temperature 0.7`, `max_tokens 16000`, `response_format json_object`
- retours `GeneratedBook` avec defaults (auteur Peter Lompo/Pierre Lompo, éditeur Pierre Studio selon langue)

### API generate (`/api/generate`)
- Auth Clerk, valide title+description, retourne `{ data: book }`.

### Workflows (`src/lib/workflow/engine.ts`)
- `StepType` 7 : generate_content, apply_template, add_cover, export_pdf, ai_polish, add_watermark, compress
- `STEP_DEFAULTS`, `PRESET_WORKFLOWS` 3 (ebook, lead_magnet, course_book)
- UI : `components/workflow/` (builder XYFlow + config schema-driven + node)
- Run : `/api/workflows/run` → generate (ou mock fallback 4 chap) → buildBook → steps → base64 PDF

---

## 8. Billing Stripe

### Fichiers : `src/lib/stripe/`
| Fichier | Rôle |
|---|---|
| `index.ts` | `new Stripe(STRIPE_SECRET_KEY, apiVersion 2023-10-16, appInfo "Webprodigies Cypress 0.1.0")` |
| `adminTasks.ts` | upsertProduct/PriceRecord, createOrRetrieveCustomer, copyBillingDetails, manageSubscriptionStatusChange |
| `stripeClient.ts` | `@stripe/stripe-js` |

### Flux
- **Checkout** (`/api/create-checkout-session`) : billing_address required, customer via createOrRetrieveCustomer, `mode subscription`, allow_promotion_codes, `trial_period_days 14`, success/cancel → `/dashboard`.
- **Portal** (`/api/create-portal-link`) : `stripe.billingPortal.sessions.create` → url.
- **Webhook** (`/api/webhook`) : `constructEvent(body, sig, LIVE ?? TEST)`, events product/price upsert + subscription manage (checkout.session.completed si subscription+paid, invoice.paid/failed).
- **UI pricing** : `components/landing-page/pricing-section.tsx` — toggle annual/monthly (défaut annual, 2 mois offerts), decoy, prices serveur-validés depuis `getActiveProductsWithPrice`.

### Seed
`scripts/seed-stripe-products.js` + `create-stripe-catalog.js` (placeholders prod_*/price_* — à remplacer par IDs réels).

---

## 9. Variables d'environnement

### `.env` — 17 variables (valeurs masquées ici, présentes sur disque)
| Var | Secret | Note |
|---|---|---|
| `DATABASE_URL` | ✅ | pooler supabase 6543 /postgres |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | public | ref `yivvhfzmwrwckonntcec` |
| `SERVICE_ROLE_KEY` | ✅ server-only | jamais exposé |
| `PW` | ✅ | password DB (dupliqué dans DATABASE_URL) |
| `NEXT_PUBLIC_SITE_URL` | public | `https://mercuryai-drab.vercel.app` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | public | pk_test_ |
| `STRIPE_SECRET_KEY` | ✅ | sk_test_ |
| `STRIPE_WEBHOOK_SECRET` | ✅ | whsec_ |
| `OPENROUTER_API_KEY` | ✅ | sk-or-v1- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | pk_test_ |
| `CLERK_SECRET_KEY` | ✅ | sk_test_ |
| `NEXT_PUBLIC_CLERK_SIGN_IN/UP_URL` | public | /login /signup |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN/UP_URL` | public | /dashboard |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | public | / |

### `.env.example` — GAP
⚠️ `.env.example` (11 vars) **manque les 6 vars Clerk** (`NEXT_PUBLIC_CLERK_*` + `CLERK_SECRET_KEY`). Corriger avant tout onboarding d'un autre dev. N'inclut pas non plus `OPENROUTER_FREE_ONLY` / `STRIPE_WEBHOOK_SECRET_LIVE`.

### Vercel (Settings → Environment Variables)
Reprendre les 17 + `OPENROUTER_FREE_ONLY` + `STRIPE_WEBHOOK_SECRET_LIVE`. Webhook endpoint : `https://<deployment>.vercel.app/api/webhook`.

---

## 10. Déploiement & infrastructure

- **Hosting** : Vercel. Projet `mercuryai`, org `zelanders-projects` (team_wgTqqP...). URL : `mercuryai-drab.vercel.app`.
- **Déployer** : `vercel --scope zelanders-projects --prod --yes` (le `--scope` est OBLIGATOIRE depuis le changement de scope du token).
- **Git** : désormais `https://github.com/Zelander60/Mercury-ai-EditeurPdf.git` branche `main`.
- **Supabase** : Project ref `yivvhfzmwrwckonntcec`, pooler, Storage buckets `exports, file-banners, avatars, workspace-logos` (policies publiques actuelles — à restreindre avant prod real users).
- **DB** : Drizzle + postgres-js (max 10 connexions).

---

## 11. Dettes, TODOs & alertes

**Technique**
- Git n'était pas installé avant ce handoff → poussé. Sans historique.
- `bun.lock` vs `package-lock.json` drift → choisir bun (recommandé) et supprimer le lock npm.
- Script `migrate` cassé (fichier migration.ts introuvable) → fixer ou retirer.
- Migrations SQL arrêtées à 0008 → régénérer pour tables workflows/documents/assets/exports.
- 0 tests (pas de vitest/jest/playwright) → ajouter minimal.
- Pas de Prettier.

**Sécurité (P0 avant prod real users)**
- **RLS OFF** sur custom tables → `scripts/enable-rls.sql` (512 l) + `apply-rls.js` à exécuter.
- `SERVICE_ROLE_KEY` doit rester server-only.
- Storage buckets → accès signed/owner-controlled.
- **Rate limiting manquant** sur `/api/generate` (coût OpenRouter).
- Scripts legacy ont pu contenir password DB en clair (corrigé Phase 0, vérifier avec grep `Jacccbja123`).

**Conscience handoff**
- `.env*` + `.vercel` + `docs/` sont **volontairement versionnés** (ton override). Si le repo devient public, **rotater les clés** (DATABASE_URL/PW, SERVICE_ROLE, STRIPE, CLERK, OPENROUTER).
- `src/pages/api` vestige legacy → nettoyer.
- 84 `console.log/error` dans src (ex webhook "FROM WEBHOOK??") → remplacer par logger.

---

## 12. Annexe — Skills centralisées dans `docs/skills/`

### Objectif de cette annexe
Copier les skills **PDF** + les skills **installées** (et non les defaults opencode) dans le projet pour qu'un nouveau modèle ait tout sans manque. 52 skills globales opencode (`~/.config/opencode/skills/`) non copiées, listées ci-dessous en référence.

### 10 skills copiées → `docs/skills/` (~4.8 MB)

| Skill | Source | Poids | Quand l'utiliser | Commande type |
|---|---|---|---|---|
| `pdf-book` | `C:\Users\HP\.agents\skills\pdf-book` | 970 KB | Livres/ebooks chapitrés de qualité (Lora/Playfair, TOC, headers/footers) | `node engine.js book.json out.pdf` |
| `pdf-forge` | `C:\Users\HP\pdf-forge\skills\pdf-forge` | 120 KB | HTML/Tailwind→PDF slides 1920×1080 & A4 docs via Playwright | `bin/pdf-forge` |
| `yorus-commercial-proposals` | (dans pdf-forge) | 5 KB | Exemple PDF A4 décisionnel 9 pages | (spécialisation) |
| `ui-ux-pro-max` | `.opencode/skills/` | 3 456 KB | **Intelligence UI/UX** : styles/palettes/fonts/guidelines (base offline 79/192/74/119) | `scripts/search.py --design-system` |
| `design` | `.opencode/skills/` | 236 KB | Logo, CIP 50 livrables, slides, banner, icônes, social photos | scripts Gemini |
| `ui-styling` | `.opencode/skills/` | 167 KB | shadcn/ui + Tailwind + accessibilité + dark-mode | — |
| `design-system` | `.opencode/skills/` | 175 KB | Tokens 3 couches, handoff Tailwind, slides | scripts embed/validate |
| `brand` | `.opencode/skills/` | 87 KB | Brand voice/visual, sync tokens | `inject-brand-context.cjs` |
| `banner-design` | `.opencode/skills/` | 13 KB | Bannières social/ads/web/print | workflow 5 étapes |
| `slides` | `.opencode/skills/` | 19 KB | Presentations HTML Chart.js | — |

> `pdf-book` copié **sans** son `node_modules` (pdf-lib/fontkit déjà deps du projet). Voir `docs/skills/pdf-book/package.json`.

### Skills opencode NON copiées (par défaut, à la racine machine)
Rien à livrer — disponibles sur cette machine seulement via `C:\Users\HP\.config\opencode\skills\` :
- **DEC Canon (20)** : `dec`, `dec-accessibility`, `dec-ai-native-patterns`, `dec-cognitive-load`, `dec-core-principles`, `dec-css-architecture`, `dec-design-system-depth`, `dec-discovery-validation`, `dec-gestalt-principles`, `dec-krug-laws`, `dec-motion-animation`, `dec-nielsen-heuristics`, `dec-norman-principles`, `dec-prioritization-frameworks`, `dec-product-metrics`, `dec-quality-testing`, `dec-rams-principles`, `dec-rendering-architecture`, `dec-software-principles`, `dec-ux-laws`, `dec-web-performance`.
- **Product Design (9)** : `product-design`, `design-get-context`, `design-research`, `design-audit`, `design-ideate`, `design-image-to-code`, `design-url-to-code`, `design-prototype`, `design-qa`, `design-share`.
- **Creative (9)** : `creative-production` (orchestrateur), `creative-ads-explorer`, `creative-explore`, `creative-moodboard`, `creative-offer`, `creative-polish`, `creative-positioning`, `creative-scene`, `creative-shot`.
- **UI Patterns (8)** : `drag-drop-patterns`, `editor-workspace-patterns`, `form-patterns`, `info-card-patterns`, `interaction-patterns`, `mobile-responsive-ux`, `navigation-patterns`, `split-panel-patterns`, `toast-notification-patterns`.
- **Design System & SaaS (3)** : `saas-ui-ux-designer`, `ui-ux-design-system`, `visual-design-system`.
- **Stripe non copiées** : `stripe-best-practices` + `stripe-docs` à `C:\Users\HP\.agents\skills\`.

---

## Ordre de lecture conseillé (checklist handoff)

1. **`docs/HANDOFF.md`** (ce fichier)
2. **`README.md`** (§ Production Deployment + Security TODO)
3. **`BILLION_DOLLAR_PLAYBOOK.md`** (produit & roadmap)
4. `package.json` + `drizzle.config.ts` + `.env.example` vs `.env`
5. `src/app/layout.tsx` + `src/proxy.ts` + `src/lib/auth.ts`
6. `migrations/schema.ts` + `src/lib/supabase/queries.ts` + `access.ts`
7. `src/lib/doc-engine/engine.js` + `cover.js` + `book-builder.js` + `fonts-manifest.ts` + `presets.js`
8. `src/lib/ai/router.ts` + `content-generator.ts` + `/api/generate`
9. `/api/webhook` + `src/lib/stripe/adminTasks.ts` + `src/lib/utils.ts`
10. `src/app/(site)/page.tsx` + landing components + pricing-section
11. `src/lib/workflow/engine.ts` + workflow components + `/api/workflows/run`
12. `src/app/(main)/dashboard/[workspaceId]/documents/*` + `pdf-editor/*`
13. **`docs/skills/`** : `pdf-book`, `pdf-forge`, `ui-ux-pro-max` etc. (quand tu touches PDF/design)
