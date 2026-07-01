# Sehi

Actionable health intelligence for WHOOP data — Sehi Score, energy timeline, journal correlations, AI coach, and enterprise workforce capacity planning.

## Features

- **Today** — Sehi Score, strain budget, energy timeline, sleep debt
- **Journal** — Lifestyle logging with personal metric correlations
- **Calendar** — Recovery-aware training schedule
- **Food** — Scan meals or nutrition labels for macros
- **Coach** — AI guidance powered by DeepSeek with your biometrics
- **Trends** — Weekly brief and 14-day charts
- **Enterprise** — Team readiness and recommended daily work hours per employee

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

This is a standard Next.js 16 app — no extra configuration required.

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `sslxw/sehi` repository
4. Vercel auto-detects Next.js — click **Deploy**

**Build settings (defaults):**

| Setting      | Value        |
|--------------|--------------|
| Framework    | Next.js      |
| Build command| `npm run build`|
| Output       | (automatic)  |
| Install      | `npm install`|

No environment variables are required for the mock-data demo. For AI features, add these in Vercel → Settings → Environment Variables:

| Variable | Purpose |
|----------|---------|
| `DEEPSEEK_API_KEY` | Sehi Coach chat (`/api/chat`) |
| `OPENAI_API_KEY` | Food scan + blood test vision |
| `WHOOP_CLIENT_ID` | WHOOP OAuth ([developer dashboard](https://developer-dashboard.whoop.com)) |
| `WHOOP_CLIENT_SECRET` | WHOOP OAuth client secret (server-only) |
| `WHOOP_REDIRECT_URI` | Must match WHOOP dashboard exactly, e.g. `https://xxx.ngrok-free.dev/callback` |
| `NEXT_PUBLIC_APP_URL` | App base URL for OAuth redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (`sb_publishable_...`) |

Copy `.env.example` to `.env` for local development.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run the schema in [`supabase/schema.sql`](supabase/schema.sql)
3. Add Supabase env vars to `.env` and Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your publishable key (`sb_publishable_...`) from Supabase → Project Settings → API |

Optional server-only: `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`. Never prefix the secret key with `NEXT_PUBLIC_`.
4. In **Authentication → Providers**, enable Email (disable email confirm for dev if you want instant signup)
5. Sign up in the app — data syncs to Postgres with Row Level Security

Without Supabase env vars, the app falls back to localStorage auth (dev only).

### WHOOP setup

1. Create an app at [developer-dashboard.whoop.com](https://developer-dashboard.whoop.com)
2. Register redirect URI **exactly** (path matters):
   - Local: `http://localhost:3000/callback`
   - ngrok: `https://YOUR-SUBDOMAIN.ngrok-free.dev/callback`
3. Request scopes: `read:recovery`, `read:cycles`, `read:sleep`, `read:profile`, `offline`
4. Set `WHOOP_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` in `.env` to the same base URL + `/callback`
5. Click **Connect WHOOP** in the sidebar and sign in

Live metrics replace demo data across Today, Trends, and Coach. OAuth tokens are stored in an **httpOnly cookie** (works on Vercel). After deploying, disconnect and reconnect WHOOP once.

## Tech stack

- Next.js 16 (App Router)
- Supabase (Auth + Postgres)
- TypeScript
- Tailwind CSS v4
- Framer Motion
