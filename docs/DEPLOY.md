# Deploying Coach OS to Vercel

One-time setup, then deploys are automatic on push to `main`.

## Prerequisites

- Supabase project (free tier) with the Coach OS schema applied
- GitHub repo with the latest code pushed (see "Before you push" below)
- Vercel account linked to GitHub
- Groq API key (free tier) from https://console.groq.com/keys

## Before you push

The repo root for the Vercel project is `coach-os/`, **not the parent folder**. When you import to Vercel, set the **Root Directory** to `coach-os` during project setup.

Confirm these files exist and are clean:

- `.env.example` — committed, has placeholder values, no real secrets
- `.gitignore` — blocks `.env*`, `tmp/`, `cookies.txt`, `.claude/`, client data
- `package.json` — has `"postinstall": "prisma generate"`
- `prisma/schema.prisma` — datasource block has both `url` and `directUrl`
- `src/lib/auth.ts` — has `trustHost: true`

Confirm no secrets are committed:

```bash
git log --all --full-history -- .env
# should output nothing
```

If anything leaked into history, rotate the secret AND scrub history (`git filter-repo` or BFG) before pushing.

## Database setup

In Supabase dashboard → Project Settings → Database → Connection string, you'll see two URLs:

- **Transaction pooler (port 6543)** — this is `DATABASE_URL`. Append `?pgbouncer=true&connection_limit=1` to the end.
- **Direct connection (port 5432)** — this is `DIRECT_URL`. Use as-is.

Apply migrations from your machine (Vercel does not run migrations):

```bash
# In coach-os/, with .env populated locally
npx prisma migrate deploy
```

Seed the production database once:

```bash
node scripts/seed.mjs
```

After seeding, change the seeded passwords or delete the test accounts before going live.

## Vercel project setup

1. Vercel dashboard → Add New → Project → Import `joleneann/coach-os`.
2. **Root Directory**: `coach-os`
3. **Framework Preset**: Next.js (auto-detected)
4. **Build Command**: `next build` (default)
5. **Install Command**: `npm install` (default, runs `postinstall` which runs `prisma generate`)
6. **Output Directory**: `.next` (default)

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables. Apply to **Production**, **Preview**, and **Development** unless noted.

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase pooled URL (port 6543, with `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase direct URL (port 5432) |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32`. Same value across all environments. |
| `NEXTAUTH_URL` | Production: your custom domain or `https://your-app.vercel.app`. Preview: leave unset (NextAuth auto-detects with `trustHost`). |
| `GROQ_API_KEY` | From Groq console |

## First deploy

Push to `main`. Vercel builds and deploys automatically. Watch the build log for:

- `prisma generate` running during install (postinstall hook)
- `next build` completing without TypeScript errors
- No `EAUTH` or `Prisma Client not generated` errors

## Verification checklist

After deploy succeeds, click through the production URL:

1. `/auth/login` loads
2. Coach login works (coach@test.dev / coach123)
3. Coach sees client list
4. Client login works (rohan@test.dev / client123)
5. Client dashboard loads with check-in history
6. Voice recording on `/client/checkin` records and transcribes (needs HTTPS — Vercel provides this automatically)
7. PWA manifest loads at `/manifest.json` and service worker registers

## What does NOT run on Vercel (by design)

These are coach-side workflows that use the local Claude Code subscription. Run them on your machine; their output is written to Supabase and the deployed app reads it.

- `scripts/generate-plan.mjs --client <id>` — drafts plan sections
- `scripts/generate-review.mjs --client <id>` — drafts weekly reviews
- `scripts/seed.mjs` / `scripts/seed-test-clients.mjs` — seeding

## When auth breaks in production

If login redirects loop or returns 500:

1. Confirm `AUTH_SECRET` is set in Vercel and matches across all environments.
2. Confirm `trustHost: true` is in `src/lib/auth.ts` (it should be).
3. For custom domain: set `NEXTAUTH_URL` explicitly to that domain.
4. Check Vercel function logs for `JWT_SESSION_ERROR` or `DATABASE_URL` errors.

## When the database is slow or errors with too many connections

This is the pooler not being configured. Verify `DATABASE_URL` ends with `?pgbouncer=true&connection_limit=1`. Without these flags, Prisma opens too many connections and Supabase throttles.

## Future: custom domain

Vercel → Project → Settings → Domains → add your domain, follow the DNS instructions. Update `NEXTAUTH_URL` to match.
