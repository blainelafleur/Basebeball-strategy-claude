# Deployment Checklist — Baseball Strategy Master

**Date:** February 28, 2026
**Summary:** This checklist covers everything needed to deploy all work from the recent sessions.

---

## Step 1: Git — Stage and commit all new/modified files

```bash
# From the repo root:
git add \
  index.jsx \
  index.html \
  preview.html \
  build.sh \
  sw.js \
  privacy.html \
  terms.html \
  coaches.html \
  admin.html \
  scripts/ab-analysis.js \
  scripts/recalibrate.js \
  worker/index.js \
  worker/migrations/001_teams_and_challenges.sql \
  .gitignore \
  CLAUDE.md \
  ROADMAP.md \
  AUDIT_AND_PLAN.md \
  DEPLOY_CHECKLIST.md

git commit -m "Sprints A-E: landing page, 581 scenarios, team codes, challenges, admin dashboard"
git push origin main
```

### What each file does:
| File | Purpose | New or Modified? |
|------|---------|-----------------|
| `index.jsx` | The entire game app (~9,264 lines) | Modified |
| `index.html` | Landing page at root URL | **New** |
| `preview.html` | Game loader (loads index.jsx) | Existing |
| `build.sh` | Build script — copies files to dist/ | **Modified (critical!)** |
| `sw.js` | Service worker for push notifications | **New** |
| `privacy.html` | Privacy policy | **New** |
| `terms.html` | Terms of service | **New** |
| `coaches.html` | Coach outreach one-pager | **New** |
| `admin.html` | Admin dashboard | **New** |
| `scripts/ab-analysis.js` | A/B test analysis script | **New** |
| `scripts/recalibrate.js` | Difficulty recalibration script | **New** |
| `worker/index.js` | Cloudflare Worker (API, teams, challenges) | Modified |
| `worker/migrations/001_teams_and_challenges.sql` | D1 database migration | **New** |
| `.gitignore` | Updated to exclude .wrangler/ and .claude/ | Modified |

---

## Step 2: Run D1 Database Migration

The team code system and challenge system need new tables in your D1 database.

```bash
cd worker
npx wrangler d1 execute bsm-accounts --remote --file=migrations/001_teams_and_challenges.sql
```

Verify the tables were created:
```bash
npx wrangler d1 execute bsm-accounts --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see: `teams`, `team_members`, `challenges` (plus any existing tables like `users`, `analytics`, `errors`).

---

## Step 3: Deploy the Cloudflare Worker

```bash
cd worker
npx wrangler deploy
```

Verify it's live:
```bash
curl https://bsm-ai-proxy.blafleur.workers.dev/health
```

### Worker Secrets to verify:
Make sure these are set (you likely already have them):
```bash
npx wrangler secret list
```

Required secrets:
- `XAI_API_KEY` — xAI API key for AI scenario generation
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `ADMIN_KEY` — Admin dashboard access key
- `ALERT_WEBHOOK_URL` — Error alert webhook (optional)

---

## Step 4: Deploy to Cloudflare Pages

Your Cloudflare Pages project should be configured to:
- **Build command:** `sh build.sh`
- **Build output directory:** `dist`

After pushing to `main`, Cloudflare Pages will:
1. Run `build.sh` → copies all files to `dist/`
2. Deploy `dist/` to `bsm-app.pages.dev`

### Verify the deployment:
After deploy, check these URLs:
- `https://bsm-app.pages.dev/` → Landing page (index.html)
- `https://bsm-app.pages.dev/preview.html` → The game
- `https://bsm-app.pages.dev/privacy.html` → Privacy policy
- `https://bsm-app.pages.dev/terms.html` → Terms of service
- `https://bsm-app.pages.dev/coaches.html` → Coach one-pager
- `https://bsm-app.pages.dev/admin.html` → Admin dashboard
- `https://bsm-app.pages.dev/sw.js` → Service worker

---

## Step 5: Verify Stripe Payment Links

Open these in a browser and confirm they load:
- Monthly: `https://buy.stripe.com/4gM00ifyYbLI67way56kg00`
- Yearly: `https://buy.stripe.com/4gM7sKgD2g1YbrQ9u16kg01`

**Important:** Confirm these are LIVE mode links (not test mode).
Test the full flow: click link → complete payment → redirected to `preview.html?pro=success&plan=monthly`

---

## Step 6: Verify CORS

The worker's CORS whitelist should include your domain. Check that `ALLOWED_ORIGINS` in `worker/index.js` includes `https://bsm-app.pages.dev`.

---

## What was built across all sessions:

### Sprint A (Launch Ready)
- ✅ A1: Landing page (`index.html`)
- ✅ A2: First-run polish (tutorial, onboarding)
- ✅ A3: Privacy policy + Terms of service
- ✅ A4: Stripe links (verify manually — Step 5)
- ✅ A5: localhost removed from CORS (verify in worker)
- ✅ A6: Rate-limited promo code endpoint
- ✅ A7: localStorage safety (debounced save + quota guard)

### Sprint B (Content Gaps — 42 new scenarios)
- ✅ B1: 4 pitch clock scenarios
- ✅ B2: 3 infield fly scenarios
- ✅ B3: 3 win probability scenarios
- ✅ B4: 3 hit-and-run scenarios
- Total: 581 scenarios across 15 positions

### Sprint C (Coach's Gateway)
- ✅ C1: Team code system (worker + frontend)
- ✅ C2: Team report (worker endpoint with PIN auth)
- ✅ C3: Shareable player card (canvas-based)
- ✅ C4: Coach outreach kit (`coaches.html`)

### Sprint D (Retention & Polish)
- ✅ D1: Push notifications (service worker + permission UI)
- ✅ D2: Achievement celebrations (full-screen overlay with confetti)
- ✅ D3: Challenge a Friend (5-scenario packs via worker)
- ✅ D4: Scenario of the Week (deterministic weekly challenge)

### Sprint E (Data-Driven Iteration)
- ✅ E1: Admin dashboard (`admin.html`)
- ✅ E2: A/B test analysis script
- ✅ E3: Difficulty recalibration script
- ✅ E4: Funnel optimization (tracking already built in)
