# Sehi

Actionable health intelligence for WHOOP data — Sehi Score, energy timeline, journal correlations, AI coach, and enterprise workforce capacity planning.

## Features

- **Today** — Sehi Score, strain budget, energy timeline, sleep debt
- **Journal** — Lifestyle logging with personal metric correlations
- **Calendar** — Recovery-aware training schedule
- **Coach** — AI guidance from your biometrics
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

No environment variables are required for the current mock-data demo.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
