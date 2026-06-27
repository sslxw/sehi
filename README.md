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

Copy `.env.example` to `.env` for local development.

### WHOOP setup

1. Create an app at [developer-dashboard.whoop.com](https://developer-dashboard.whoop.com)
2. Register redirect URI **exactly** (path matters):
   - Local: `http://localhost:3000/callback`
   - ngrok: `https://YOUR-SUBDOMAIN.ngrok-free.dev/callback`
3. Request scopes: `read:recovery`, `read:cycles`, `read:sleep`, `read:profile`, `offline`
4. Set `WHOOP_REDIRECT_URI` and `NEXT_PUBLIC_APP_URL` in `.env` to the same base URL + `/callback`
5. Click **Connect WHOOP** in the sidebar and sign in

Live metrics replace demo data across Today, Trends, and Coach. Tokens are stored in `.data/whoop-tokens.json` (local dev).

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
