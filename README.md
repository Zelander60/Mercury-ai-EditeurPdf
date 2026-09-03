# Build a SaaS App with Realtime cursors, Nextjs 13, Stripe, Drizzle ORM, Tailwind, Supabase, Sockets

![Application Logo](https://raw.githubusercontent.com/webprodigies/webprodigies-cypress/main/public/cover.png)


| 🟢 Full Video | 🔴 Demo |
|------------|------|
| [Full Video](https://youtu.be/A3l6YYkXzzg) | [Demo](https://insta.openinapp.co/v3tbe) |

## Get all the help you need
Join the Community for FREE if you want to learn how to make money this year with websites! Share all bugs and solutions in the discord. Would love to collaborate and get to know talented developers like yourself. 
[Discord](https://discord.gg/GG4wJkxh)


### Features in this application.

- 🤯 Real-time cursors
- 📝 Real-time text selection
- ⏱️ Real-time database and collaboration
- 🟢 Real-time presence
- 🗑️ Move to trash functionality
- 😜 Custom emoji picker
- 🌙 Light mode dark mode
- 🚨 Next.js 13 app router
- 🗺️ Creating free plan restrictions
- 💰 Take monthly payments
- 📧 Custom email 2FA invitation
- ⚡️ Supabase Row level policy
- 👨‍👨‍👧‍👦 Real-time Collaboration
- 👾 Deployment
- 🤑 Custom Rich text editor
- 📚 Update profile settings
- 📍 Manage payments in a portal
- 🔐 Custom Authentication
- ✳️ Websockets
- 📣 Optimistic UI
- 📱 Responsive design

### Link to the thread with the issue we saw in layout.tsx
[DynamicServerError: Dynamic server usage: cookies](https://github.com/vercel/next.js/issues/49373)

---

## BookGenerator — Production Deployment (Vercel)

This project (rebranded to **BookGenerator**, "AI-powered document creation + professional PDF workspace") is deployed via the **Vercel CLI** (no Git repo is present on this machine — `vercel --prod` uploads the project directly).

### 1. Prepare the environment

Confirm the project builds locally before shipping:

```bash
npx tsc --noEmit
bunx next build
```

### 2. Add all env vars in the Vercel project (Settings → Environment Variables)

These are **mandatory** (copy values from the local `.env`):

| Name | Example | Notes |
|------|---------|-------|
| `DATABASE_URL` | `postgresql://postgres.<ref>:<pw>@aws-1-eu-west-1.pooler.supabase.com:6543/postgres` | Supabase pooler (serverless-safe) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Public |
| `SERVICE_ROLE_KEY` | `eyJ...` | **Secret — never expose** |
| `PW` | Supabase DB password | Secret |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-deployment>.vercel.app` | Set to the live domain |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | AI content generation |

**Stripe – add TEST keys to go live on paid plans:**
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Public |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Secret |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Stripe webhook endpoint |

Create the **Pro** & **Team** products + prices in Stripe, then insert the matching rows into Supabase. Two tables are used (matching this app's code):
- `products`: `id` (the Stripe `price_...`? no — `id` = the **product** id `prod_...`), `name`, `description`, `active`, `image`, `metadata`
- `prices`: `id` (the Stripe **price** id `price_...`), `product_id` → `products.id`, `unit_amount`, `currency`, `type` (`recurring`/`one_time`), `interval` (`month`/`year`), `active`

A ready-to-run SQL seed script lives at `scripts/seed-stripe-products.sql` (fill in your Stripe IDs first).

### 3. Supabase settings (Dashboard)

- **Auth → URL Configuration → Redirect URLs**: add `https://<deployment>.vercel.app/**` (the `/api/auth/callback` handler exchanges the code and redirects to `/dashboard`).
- **Storage buckets** (`exports`, `file-banners`, `avatars`, `workspace-logos`): make them accessible / add public read rules as needed for images.
- **RLS**: currently **OFF** on custom tables. This is acceptable for the rapid launch, but enable Row Level Security + add `auth.uid()`-scoped policies **before** exposing to real users. See the security TODO below.

### 4. Deploy

```bash
vercel login
cd C:\Users\HP\book-platform
vercel --prod
```

- First run creates the project, prompts for env vars (you can also add them in the dashboard after), and produces the deployment URL.
- `bunx next build` runs inside Vercel using the `buildCommand`/`installCommand` in `vercel.json`.

### 5. Webhook (for subscription events)

For production Stripe events, point a webhook endpoint at:
```
https://<deployment>.vercel.app/api/webhook
```
and set `STRIPE_WEBHOOK_SECRET` from the generated signing secret. The local `/api/webhook` verifies the signature and updates the `subscriptions` table.

### Security TODO (post-launch, before real users)
1. Enable RLS on all tables with UID-scoped policies (collaborators, documents, folders, files, workspaces, subscriptions).
2. Restrict `SERVICE_ROLE_KEY` usage — keep server-only, never in browser bundles.
3. Restrict storage buckets to signed/owner-controlled access.
4. Add rate limiting on `/api/generate` (OpenRouter cost control).

