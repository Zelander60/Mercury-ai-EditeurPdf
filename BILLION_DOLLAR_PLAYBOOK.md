# BookGenerator — Billion-Dollar SaaS Transformation Playbook

> **Extraordinary zero → paid logic for 100M+ users. Compete with Google, Notion, Stripe, Linear, Vercel — not by copying their pages, but by out-crafting their *systems*.**
>
> **Objective:** Convert free users to paid at *great* rates (8–12% freemium, 10–15% trial, 25–35% CC-required), maximize LTV and cash flow via annual-first monetization, and build a compound growth engine that Stripe/Linear would respect.

**Status:** Living blueprint · **Owner:** Product + Growth · **Last audited:** 2026-09-02 · **Stack:** Next.js 16 · Clerk · Supabase · Stripe · @xyflow/react · Tailwind 3

---

## 0. Thesis — Why We Win

Google wins on distribution. We win on **craft + time-to-value + compound retention**.

2026 research (ChartMogul × ProductLed, n=200 B2B products):

* 57% lead with free trial, 26% freemium, 7% reverse trial — *the model is not the moat*.
* Median free→paid is **8%**, but top 20% convert **10×** the bottom 20%.
* **Time-to-aha <2 min** is the #1 predictor. 40–60% of trials churn in 24h without it.
* **Intent-based** upgrade prompts convert **40%** better than time-based.
* **Reverse trial** (full → free) beats pure freemium on loss aversion.
* **PQL-routed** products convert at **~25%** vs 9% average — only 24% of companies use PQLs.

Linear/Stripe/Vercel feel premium for one reason: **interaction completeness** — every state (default, hover, focus, active, disabled, loading, empty) is *designed*, not defaulted. One typeface, one accent, generous whitespace, high contrast, motion with purpose. We will out-Linear Linear on *publishing*.

**Our wedge:** The only publishing workspace where the **product is the demo** — a real book surface on the landing page that visitors can *use* before signup.

---

## 1. Current-State Audit — Conversion Leaks (P0 → P2)

### P0 — Trust & Paywall Foundations
| Area | Current | Leak | Cost |
|------|---------|------|------|
| Hero pitch | "Generate Professional Books with AI" | Generic, doesn't carry full pitch, no audience/category/moat | Visitor leaves without understanding |
| Primary CTA | Start Writing Free + View Demo → /dashboard (404 for anon) | Broken demo path, no product surface | Immediate bounce |
| Social proof | 3 fake testimonials 3 sections down | No logo wall at friction point (hero), no metric outcomes | Trust fails before scroll |
| Freemium model | 5 books/mo everywhere, Starter $0 vs Stripe $29/$99 mismatch | No strategic limit, no reverse trial, fallback empty state leaks | No upgrade pressure |
| Pricing page | 3 flat cards, no annual toggle, no 2-mo-free framing | Annual customers churn 5–10% vs 30–50% monthly — we leave 2–3× LTV on table | 30–50% working capital left |
| Secrets | DB password in `scripts/*.js` | Plaintext in git | Security / rotation mandatory |

### P1 — Activation & Craft
* **Time-to-aha >5 min:** Onboarding asks for workspace name/logo before any book exists. No 30-sec interactive book.
* **AI discarded:** `/api/generate` result was pushed to query string and never persisted — user generates, sees nothing.
* **Emoji cards:** 📝🎨📐 — reads cheap, not premium. Border-2 hover breaks system; cards not one family.
* **Type doesn't carry:** 4xl–6xl hero with default tracking/weight, no 5-step scale, mixed emphasis (bold vs color vs size war).
* **No progressive disclosure:** All features at once. Stripe reveals complexity step-by-step; we overwhelm.
* **No command palette:** Linear's Cmd+K is gold standard — we have none, navigation friction stays high.
* **Empty/loading/error stubbed:** Generic spinners, not skeletons matching layout; empty states not designed as onboarding.

### P2 — Scale & Polish
* No annual-first default (20–30% more annual attach lost).
* No intent-based paywalls (usage limit 80% triggers).
* No PQL model (high-intent users not routed to sales-assist).
* `package-lock.json` drift, `DATABASE_URL` max:1, unpaginated `documents` lists.

**Verdict:** Prototype, not product. First job is not more features — it's a **coherent system** that earns trust in 8 seconds and value in 90 seconds.

---

## 2. Design System — Premium SaaS Craft

> Inspired by **Linear Method**, Rauno Freiberg's *Devouring Details* (23 chapters), and Matt Ström-Awn's Stripe Dashboard writeup. Not hex values — *rules*.

### Philosophy
* **Neutral-first, dark-first:** 60% neutral, 30% surface, 10% accent. One accent (brand indigo `hsl(266 100% 50%)`), used sparingly. No second chromatic CTA.
* **Single typeface:** `DM_Sans` (replace with Inter/Geist/Söhne-grade variable at scale) — 5-step scale (14/16/20/32/64), weights 400 + 500 only, tight tracking on display (`-0.022em` at 64px).
* **Interaction density > visual density:** Sparse pixels, dense behavior — every element responds to hover/focus/keyboard/context.
* **Physical metaphor:** Menus grow from trigger, modals have weight, skeletons shimmer with purpose.

### Tokens (already in `globals.css`, now enforced)
* **Space:** 4/8/16/24/32/48/64/96 (8pt grid). Hero: 96 top, 64 between sections, 32 inside cards.
* **Radius:** `0.5rem` cards, `999px` pills. No arbitrary radii.
* **Color:** Light `0 0% 100%` bg / `224 71% 4%` fg; Dark `249 100% 3.9%` / `248 100% 88%`. Semantic only for status (emerald/destructive).
* **Motion:** 150–300ms micro, ease-out entering, ease-in exiting, `prefers-reduced-motion` respected.
* **A11y:** 44×44 touch targets, 4.5:1 text, focus ring 2px `ring`, keyboard Cmd+K, `aria-describedby` on fields.

### Component Rules
* Every button: 6 states (default/hover/focus/active/disabled/loading) — if one missing, not done.
* Cards: one family (same border, shadow, padding). No `border-2` exceptions.
* Empty/loading/error: designed, not stubbed — illustration + headline + one CTA.
* Skeletons match layout, not spinners, for predictable content.

### Checklist (per screen)
- [ ] One primary action, hierarchy obvious
- [ ] Accents restrained, cards one family
- [ ] Empty/loading/error exist
- [ ] Mobile still works (single column, thumb zone, safe areas)
- [ ] All interactive states crafted

---

## 3. Zero → Paid — The Extraordinary Journey (5 Acts, 90 sec to Aha)

```
[Act 1: ATTRACT]  0–8 sec — Hero carries full pitch + social proof
        ↓
[Act 2: ACTIVATE] 8–60 sec — Interactive demo, 1-field signup
        ↓
[Act 3: AHA]      60–90 sec — First book *exists* (not "setup complete")
        ↓
[Act 4: HABIT]    Day 1–7 — Reverse trial, checklist, PQL nudges
        ↓
[Act 5: CONVERT]  Intent moment — annual-first paywall, loss framing, 2-mo-free
```

### Act 1 — Attract (Landing, before signup)
**Goal:** Visitor understands *who, what, why now* in one hero.

* **One-sentence pitch** (Stripe test): *"The publishing workspace for teams and AI agents. Turn any idea into a print-ready book — from outline to PDF in 90 seconds. Built for the AI era."* — audience + category + differentiator + trend frame. No visitor should need to scroll to get it.
* **Type does heavy lifting:** 64px display, `-0.022em` tracking, `font-semibold`, accent only on the differentiator word ("print-ready").
* **Product is demo:** Embed a **live, working mini-book surface** in the hero (Linear's ENG-2703 pattern) — visitor types a title, sees AI outline stream, no signup yet. Replit/Lovable ungated: 38% of freemium let users try before account — we do it for publishing. Demo data is real product, not screenshot.
* **Social proof immediately under hero:** Logo wall (6–8 real or design-partner marks) + metric outcomes ("Sarah → 200-page book in 10 min", "James → 3 lead magnets, 40h saved") — not generic testimonials. CXL: proof near CTA at friction point outperforms footer logos 2–3×.
* **High contrast + whitespace:** Take spacing that feels enough, double it. Black-on-white hero, generous air. Monochrome base + one accent (indigo) — Hermès orange principle.

### Act 2 — Activate (Signup, <30 sec)
* **One-field signup:** Email + Google only. Every extra field beyond email/password costs 10–60% signups. Role/use-case question *after* value, not before.
* **No credit card for freemium** — early stage needs volume + activation data. Card-required (30% conversion) is a later A/B lever, not default.
* **Segment on entry (1 question):** "What are you making?" [Book / Lead magnet / Course workbook / Team docs] → routes to tailored onboarding + pre-configures first view (role-based adaptive interface, HubSpot pattern).

### Act 3 — Aha (First session, <90 sec)
**Aha definition (cohort-derived):** User who **creates OR generates a book and sees it in their library** within first session converts 3–5×.

* **Activation checklist (visible gap):** 3 steps only — (1) Create/generate first book (2) Preview PDF (3) Export or invite teammate. Checklist creates pull; generic "explore analytics" steps removed.
* **Progressive disclosure:** Only the book surface is visible first. Workspaces/folders/workflows hidden until needed. Stripe pattern: never show more than needed at each stage.
* **Gamified credits:** Completing checklist grants +2 AI credits (motivation to overcome friction — 2026 #2 tactic).
* **Fix shipped:** `documents-header.tsx` now persists generated JSON to a real `Document` row — no more discard.

### Act 4 — Habit (Days 1–14, Reverse Trial)
* **Reverse trial:** New users get **14 days of Pro** on the free plan, then downgrade to Free (5 books/mo). Loss aversion > imagination. Notion/Loom pattern, 8–12% great freemium conversion vs 3–5% plain freemium.
* **Intent-based nudges, not calendar:** Upgrade prompt at **80% of limit** (Dropbox 80% storage pattern), on pricing page visit, or on premium feature attempt. 40% better than time-based. In-app > email when user is *in* product experiencing value.
* **Behavioral email > time-based:** "You started a book but haven't exported" (4–6× re-engagement) vs "Day 3 check-in". Customer.io/Braze behavioral triggers, AI-personalized (+6.1pp lift).
* **PQL routing:** Users hitting checklist + 80% limit + 2+ sessions → PQL → sales-assist (human touch for enterprise). Only 24% of companies do this and they 3× conversion — PQL is highest-leverage.

### Act 5 — Convert (Intent moment)
**Pricing psychology (all mechanisms named before drawing boxes):**

* **3 tiers, center-stage:** Starter ($0) / Pro ($29) / Team ($99) — Pro is "Most Popular" badge (default-option + social proof; 20–30% more annual when default annual).
* **Annual-first toggle:** Default annual, 20% off framed as **"2 months free"** (beats "Save 17%" — concrete calculation wins). Breakeven month 10; loss frame ("You'll pay $240 extra on monthly") for enterprise.
* **Charm + anchor:** Prices end in 9 where appropriate ($29 vs $30), but round where premium ($99 → $99). High Team tier anchors Pro as cheap.
* **Display:** Annual $ → monthly equivalent ("$29/mo, billed annually") vs monthly premium ("+$6/mo for flexibility").
* **Paywall copy:** Not "Limit reached" but specific, kind, helpful: *"You've created 5 books this month — you're moving fast. Pro unlocks unlimited books and watermark-free PDFs."* Preserve work, never blame.
* **Post-trial re-engagement:** Expired but activated (checklist done) → 30-day win-back recovers 8–15% — free revenue.

---

## 4. Monetization Architecture — Best Margin

### Packaging
* **Free:** 5 books/mo, 1 workspace, basic covers, watermarked PDF, 1 collaborator — *genuinely useful* (habit + invites) but obvious upgrade path.
* **Pro ($29/mo or $290/yr):** Unlimited books, all models (Claude/GPT/Gemini), all covers, PDF editor, custom branding, priority queue.
* **Team ($99/mo or $990/yr):** Everything in Pro + team workspaces, API, white-label, dedicated support, SSO (future). Team seats expand revenue (expansion is most capital-efficient growth).
* **Limits as signals:** Books/mo, workspaces, seats, storage — not arbitrary feature crippling. Strategic freemium = complete product, not crippled trial.

### Packaging lever (highest impact)
ChartMogul: changing *limits/gates* moves conversion more than price. Tested winners:
* Limited AI credits/mo on Free → +MAU.
* Dual CTA: "Start free" vs "14-day Pro trial" → +26% premium trials.
* Freemium OR free trial choice at signup (user self-selects intent).

### Annual Economics (Fungies/ProfitWell/Paddle)
* **Churn:** Annual 8% vs monthly 32% annually. After 2y: 847 vs 462 customers from 1k — same CAC, different business. 50–70% lower churn on same segment.
* **Cash:** +30–50% working capital — $290 upfront funds next quarter's acquisition without dilution.
* **LTV:** 2–3× higher — commitment → habit → renewal.
* **Switch at:** 20% standard ("2 months free"); <15% fails, >30% signals distress. Below 15% reads stingy as annual anchor drifts toward 28% (2024–25).
* **Default annual** → 20–30% more annual attach (Monolit.sh). Show $24/mo billed annually first, monthly as "+$6 flexibility".

### Billing Operations
* Toggle with annual default on pricing page; both cycles offered (Zuora: +20–30% revenue vs single option).
* In-product "Switch to annual" at month 3 (peak satisfaction) — 2–3× conversion vs discount emails.
* Dunning + card updater before scaling annual (expiry risk in 12-mo gap).
* Student/annual-upfront incentives later; not now.

---

## 5. Product Pillars — What We Build

### Pillar 1 — Publishing Workspace (compete with Notion, not Word)
* Document is primary object, workspace is container (already fixed: overview is Home, not Quill).
* `/books/new` → blank / AI / template / import. Structured book editor (contentJson chapters) is default; raw JSON hidden.
* Real PDF preview behind canvas (not white grid). Page size configurable.
* Autosave + version history + conflict detection + visible save status.

### Pillar 2 — AI as Infrastructure (Notion pattern)
* No "Notion AI" button — AI is *behind the curtain*: outline → chapters → polish, inline, autocomplete-like, not chatbot. Latency hidden, trust via skeletons.
* Model picker is power-user progressive disclosure; default is best model.

### Pillar 3 — Visual Automations (n8n for publishing)
* `@xyflow/react` canvas: palette search, handles, typed connections, pan/zoom/minimap, multi-select, delete, undo/redo, keyboard, touch.
* Node inspector: schema-driven forms (already shipped).
* Persisted `workflows` table (workspace-scoped, auth'd) — live on `workflows` route with Save/Update + Saved list.
* Next: real executors (generate_content → OpenRouter), retries, run history (`workflow_runs`), SSE live status, triggers (manual/schedule/webhook), then Inngest durable runs.

### Pillar 4 — Asset & Import Platform (Supabase Storage + TUS)
* One import surface: drag-drop zone, queue, progress, cancel/retry, duplicate handling, destination picker.
* TUS resumable uploads, signed URLs, tenant-scoped keys (`tenants/{workspaceId}/assets/{id}/source`), private buckets.
* Worker pipeline: scan → MIME verify → thumbnail → text extract → OCR → indexing.

### Pillar 5 — Growth Shell
* App shell: collapsible sidebar, command palette (Cmd+K), breadcrumbs, bottom nav thumb zone.
* Mobile: Sheet drawer (not flex-inserted), no fixed 800px cards, bottom padding for nav, hover-only controls fixed.
* Empty states: Notion-warm (slash command hint + template) or Stripe-step-by-step — illustration + headline + one CTA.

---

## 6. Implementation Roadmap — Phases (No Microservices Until Metrics Demand)

### Phase 0 — Containment (Shipped)
* Clerk middleware (public routes explicit) + `authorizeWorkspace`/`authorizeDocument` on `save-operations`, `export`, `document-actions`.
* Hardcoded DB password removed from `scripts/*.js` → env.
* DB user columns `uuid` → `text` for Clerk.
* Shadcn leftovers (resizable/sonner) fixed.
* Malformed `(main)` route deleted, nested `<main>` fixed.

### Phase 1 — Real Product Foundation (Shipped)
* Overview dashboard (`/dashboard/[workspaceId]`) with stats + recent books + quick actions.
* Home replaces My Workspace, layout landmarks fixed.
* AI generate now persists (no discard).
* Overview aggregates via `sql<number>`count(*)\`\`.

### Phase 2 — Visual Builder + Persistence (Shipped)
* `@xyflow/react` builder: `workflow-node.tsx`, `workflow-config.tsx`, `workflow-builder.tsx` (toolbar + palette + canvas + inspector).
* `workflows` table + drizzle schema + `workflow-actions.ts` (CRUD, auth'd).
* `workflows` page now `use`-unwraps params, owns `initialWorkflows` state.

### Phase 3 — Extraordinary Zero → Paid (Next, this doc's mandate)
* [ ] Landing: rewrite `page.tsx` per §3 Act 1 — high-contrast hero (tight tracking, single accent), product-is-demo surface, logo wall at hero, 3-tier pricing with annual-first toggle.
* [ ] Pricing: `pricing-section.tsx` annual/monthly toggle (default annual, 2-mo-free, loss frame), decoy, active price lookup (server-validated), idempotency.
* [ ] Onboarding: 1-question role route + 3-step checklist + reverse trial banner.
* [ ] Paywall: 80% usage trigger + pricing-page-visit trigger, specific helpful copy, preserve work.
* [ ] Instrumentation: Mixpanel/Amplitude events for activation milestones + PQL definition (checklist done + 2 sessions) + cohort funnel.
* [ ] Polish: command palette, skeletons, designed empties, focus rings, motion curves.

### Phase 4 — Monetization & Scale
* Stripe webhook inbox (idempotent, unique event IDs), server price validation, quantity bounds.
* Pagination + indexes (workspace, doc, collaborator), atomic quota (`books_this_month` table vs scan), N+1 fix.
* Private buckets + signed URLs, lifecycle cleanup.
* AI/PDF to durable jobs (Inngest `step.ai.wrap`, concurrency per `event.data.workspaceId`).

### Phase 5 — Demand-Driven Platform
* Redis rate limits, read replicas, CDN exports, CRDT collaboration — only when p95/lag/queue metrics justify.

---

## 7. Metrics — What We Measure

* **Activation:** % new users who see a book in library in first session (target 30% → 50% lift = same as 50% more signups).
* **Time-to-aha:** median seconds signup → first book (target <90s).
* **Free→paid:** freemium 3–5% good / 8–12% great; trial 4–6% / 10–15%; CC-required 25–35% / 50–60%. Track per acquisition source (SEO vs LLM vs paid — ChatGPT traffic 6× Google at Webflow).
* **PQL→paid:** ~25% (track creation, route to human).
* **Annual attach:** % paid choosing annual (target 35–45% with annual default).
* **Churn:** monthly 5–8% vs annual 0.5–1% — cohort by billing cycle.
* **Expansion:** seat/tier upgrade rate.

Tooling: Mixpanel #1 + Amplitude/Google Analytics/ChartMogul for funnel; PostHog + HubSpot/Clay/Statsig for PQL automation. **Behavioral > time-based** triggers.

---

## 8. Risks & Non-Goals

* Don't build microservices/sharding now — modular monolith scales past $10M ARR.
* Don't require credit card pre-PMF — need volume + feedback.
* Don't copy Stripe/Linear positioning blindly — our positioning is *publishing for teams+AI agents*, not payments or issues.
* Don't treat free as cost center — treat as habit + invite loop; measure PQL, not raw free count.

---

## 9. Immediate CSS / Token Changes Applied

* `@import '@xyflow/react/dist/style.css'` (after Clerk, before Tailwind) — in `globals.css`.
* Single accent discipline, 8pt grid, DM_Sans with tight tracking ready for hero upgrade.

---

## 10. References (2026)

* ChartMogul × ProductLed × Kyle Poyar — *SaaS Conversion Report* (n=200, median 8%, reverse trial, CC effect).
* Fungies/Mono — *Annual vs Monthly* churn 8% vs 32%, cash +30–50%, LTV 2–3×.
* Mantlr — *Stripe/Linear/Vercel Premium UI* synthesis (interaction completeness, type as brand, restraint).
* SaaSUI.Design — *7 Trends 2026* (calm design, AI as infrastructure, command palette, adaptive, progressive disclosure).
* growthunhinged.com — implant: intent-based 40% lift, +6.1pp AI-personalized onboarding.
* Baremetrics/ProfitWell/Paddle — churn & LTV datasets cited via Fungies.

---

*This playbook is the single source of truth. Code follows it. Every screen must pass the §2 checklist before merge.*
