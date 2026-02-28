# Baseball Strategy Master — Full Audit & Action Plan
**Date: February 27, 2026** | **Auditor: Claude** | **App version: Phase 2.95 complete**

---

## CURRENT STATE SNAPSHOT

- **index.jsx**: ~8,881 lines, ~1.3MB raw (352KB gzipped)
- **worker/index.js**: ~1,071 lines with D1, KV, auth stubs, AI proxy, analytics, error monitoring
- **Scenarios**: 539 handcrafted across 15 positions + AI generation for Pro users
- **BRAIN**: v2.4.0 with RE24, 43 concepts, 21 knowledge maps, position principles
- **Monetization**: Stripe Payment Links ($4.99/mo, $29.99/yr), 8 free plays/day
- **Deployment**: Cloudflare Pages (live), Cloudflare Worker (live), D1 database (live)
- **No user accounts yet** — localStorage only
- **No paying customers yet** — app is pre-launch

---

## WHAT'S ACTUALLY DONE (verified)

✅ 539 scenarios, all with conceptTags, explanations, ageMin/ageMax, explSimple for diff:1
✅ BRAIN knowledge system with 21 maps, quality firewall, consistency rules
✅ AI generation via xAI Grok with quality scoring, caching, deduplication
✅ Adaptive learning: concept-weighted selection, mastery heatmap, auto-calibration, session coherence
✅ Server-side Pro verification (verify-pro, activate-pro, stripe-webhook endpoints)
✅ Analytics pipeline (batched, anonymized, 5 event types)
✅ A/B testing framework (ai_temperature, ai_system_prompt)
✅ Error monitoring with auto-alert webhook
✅ React.memo on Field + Board components
✅ Mobile viewport, touch targets (44px min), safe-area support in preview.html
✅ SVG uses proper viewBox (0 0 400 310), scales responsively
✅ No dangerouslySetInnerHTML anywhere — no XSS vector
✅ STORAGE_KEY constant exists (single source of truth)
✅ Sound system via Web Audio API (no audio files)
✅ 5 game modes: Position Play, Season, Speed Round, Survival, Daily Diamond

---

## WHAT'S REAL vs WHAT THE ROADMAP SAYS

### Phase 2.7 "Know Your Players" — ROADMAP says NOT STARTED, but...
The **worker already has auth endpoint stubs** (signup, login, logout, verify-email, me, sync) from earlier work. The D1 database binding exists. However, the **frontend has zero auth UI** — no login screen, no signup, no account panel. The worker auth code is untested infrastructure.

### Phase 3 "Build the Engine" — Premature
The ROADMAP plans a Next.js port, PostgreSQL migration, Railway deployment. **This is overkill right now.** The app has zero paying users. The single-file architecture on Cloudflare Pages + Workers is fine for the first 1,000 users. This phase should be deferred until product-market fit is proven.

### COPPA Deadline — April 22, 2026
The ROADMAP lists this as Phase 4. That's **less than 2 months away.** Current state: parent gate exists (math problem), credit card = parental consent for Pro. But there's no privacy policy, no data deletion endpoint, no neutral age gate on first launch. If the app goes live with real users before then, COPPA compliance needs to move up.

---

## TOP ISSUES FOUND (verified against actual code)

### Critical — Blocks launch

1. **No privacy policy or terms of service.** Required for any app targeting kids. Stripe also requires it.

2. **No way to actually GET users.** The app exists at a Cloudflare Pages URL. There's no landing page, no App Store listing, no SEO, no way for a parent or coach to discover this app. The tech is solid but the distribution is zero.

3. **Stripe Payment Links point to test/placeholder URLs.** The links in the code (`4gM00ifyYbLI67way56kg00` and `4gM7sKgD2g1YbrQ9u16kg01`) — are these live Stripe links or test mode? If test, Pro activation doesn't work in production.

4. **Worker secrets need verification.** STRIPE_WEBHOOK_SECRET, ADMIN_KEY, and ALERT_WEBHOOK_URL may not be configured. Without STRIPE_WEBHOOK_SECRET, the webhook endpoint silently fails on every Stripe event.

### High Priority — Should fix before real users

5. **localStorage quota risk.** The entire stats object (including masteryData, aiHistory capped at 100, sessionHistory, explanationLog) gets serialized on every save. No quota checking. On mobile Safari (which has ~5MB limit), a power user could hit the wall. Need a debounced save + quota guard.

6. **Global setInterval for analytics/errors never cleaned up.** Lines 3494-3499 and 3525-3536 create setInterval and addEventListener at module scope. These can't be cleaned up. Not a bug per se (the app is the entire page), but could cause issues if ever embedded or if React strict mode double-mounts.

7. **Promo code endpoint has no rate limiting.** The `/validate-code` worker endpoint allows unlimited guesses. A script could brute-force short promo codes. Need per-IP rate limiting on this endpoint.

8. **CORS whitelist includes localhost.** worker/index.js ALLOWED_ORIGINS includes localhost:3000 and localhost:5000. Fine for dev, but in production any local dev server can hit your API. Should be environment-gated or removed.

### Medium Priority — Polish

9. **Pitch-clock-strategy concept has only 1 scenario (rl24).** This is a major 2023 MLB rule change. Kids playing today see it every game. Needs 3-4 more scenarios.

10. **Infield-fly rule has only 2 scenarios.** One of the most commonly misunderstood rules. Needs 2-3 more edge cases.

11. **The `S` shared style constants are barely used.** Sprint 4.5 created them but only a few places in the existing 8,000+ lines reference them. The original inline styles are still everywhere. The optimization is incomplete.

12. **AB_TESTS framework is wired in but has no data feedback loop.** Tests run, variants are tracked in analytics, but there's no admin UI or analysis pipeline to determine a winner. It's fire-and-forget.

13. **Auth endpoint stubs in worker are dead code.** signup, login, logout, verify-email, me, sync — all exist in the worker but aren't called from the frontend. Either build the frontend or remove the dead code.

---

## THE REAL QUESTION: What makes this app "kick ass"?

The **baseball knowledge and scenario quality is genuinely excellent.** 539 scenarios with real MLB data, age-appropriate explanations, and a sophisticated BRAIN system is a strong foundation. The adaptive learning engine (concept weighting, mastery tracking, spaced repetition) is better than most edu-tech apps.

What's missing isn't more engineering. What's missing is:

1. **Real users playing it and giving feedback.** All the A/B testing and analytics infrastructure is meaningless without traffic.
2. **A distribution strategy.** Travel ball coaches are the gateway — one coach = 15-20 families.
3. **A polished first impression.** The first 30 seconds matter more than features 47 through 52.

---

## PRIORITIZED ACTION PLAN

### Sprint A: "Launch Ready" (do this now)
**Goal:** Get the app to a state where you could confidently hand the URL to a travel ball coach and say "try this with your team."

| # | Task | What it does | Effort |
|---|------|-------------|--------|
| A1 | Landing page | Create a simple, beautiful landing page at bsm-app.pages.dev that explains what the app is, shows screenshots, has a "Play Now" button | 2-3 hrs |
| A2 | First-run polish | Audit the onboarding flow — is it clear, fast, and delightful for a 10-year-old opening this for the first time? Fix any rough edges | 2-3 hrs |
| A3 | Privacy policy + ToS | Create basic privacy policy and terms of service. Add link in app footer. Required for Stripe and COPPA | 1-2 hrs |
| A4 | Verify Stripe links are live mode | Confirm payment links work in production, test the full purchase → pro activation flow end-to-end | 1 hr |
| A5 | Remove localhost from CORS | Gate localhost origins behind an environment check in the worker | 30 min |
| A6 | Rate-limit promo code endpoint | Add per-IP rate limiting to /validate-code (same pattern as other endpoints) | 30 min |
| A7 | localStorage safety | Add debounced save (2s) + quota guard with graceful degradation | 1 hr |

### Sprint B: "Content Gaps" (scenario expansion)
**Goal:** Fill the identified content gaps so no major baseball concept feels thin.

| # | Task | What it does | Effort |
|---|------|-------------|--------|
| B1 | Pitch clock scenarios (4 new) | 2 diff:1, 1 diff:2, 1 diff:3 covering pitcher violations, batter violations, strategic use | 1-2 hrs |
| B2 | Infield fly scenarios (3 new) | Edge cases: with 2 outs (rule doesn't apply), foul territory, appeal process | 1 hr |
| B3 | Win probability scenarios (3 new) | Late-game decision making tied to win probability math | 1 hr |
| B4 | Hit-and-run scenarios (3 new) | Runner reads, coverage responsibilities, when to call it off | 1 hr |

### Sprint C: "Coach's Gateway" (distribution strategy)
**Goal:** Build the feature that turns one coach into 15-20 family subscribers.

| # | Task | What it does | Effort |
|---|------|-------------|--------|
| C1 | Team code system | Coach creates a team code. Players enter it. Coach sees aggregate progress (anonymized). No accounts needed — code links to localStorage identities | 3-4 hrs |
| C2 | Weekly team report | Auto-generated summary: "Your team played 47 scenarios this week. Weakest area: cutoff roles. Strongest: baserunning." Delivered via the app (coach views with team code) | 2-3 hrs |
| C3 | Shareable player card | After a great game, auto-generate a baseball-card-style image with stats. Player can share via link. Card has QR code back to app | 2-3 hrs |
| C4 | Coach outreach kit | Create a one-pager PDF: "Why Baseball Strategy Master for Your Team" — benefits, how to set up, what players learn. Something a coach can read in 60 seconds | 1 hr |

### Sprint D: "Retention & Polish" (make players stick)
**Goal:** Increase day-7 retention from whatever it is to 40%+.

| # | Task | What it does | Effort |
|---|------|-------------|--------|
| D1 | Push notification / reminder system | "Your daily diamond is waiting!" — via service worker (no app install needed) | 2-3 hrs |
| D2 | Achievement celebrations | When a player unlocks an achievement, make it feel special. Full-screen animation, shareable moment | 2 hrs |
| D3 | "Challenge a Friend" mode | Generate a shareable link with 5 scenarios. Friend plays the same 5. Compare scores. No accounts needed | 3-4 hrs |
| D4 | Scenario of the Week | Curated "hardest scenario" with leaderboard. Free for everyone. Social proof + engagement | 2 hrs |

### Sprint E: "Data-Driven Iteration" (after real users exist)
**Goal:** Use the analytics infrastructure (already built!) to learn and improve.

| # | Task | What it does | Effort |
|---|------|-------------|--------|
| E1 | Admin dashboard | Simple HTML page that calls /analytics/summary and /errors/summary. Shows DAU, popular positions, error rates, conversion funnel | 2-3 hrs |
| E2 | A/B test analysis | Build a simple script to pull A/B test results and determine winners | 1-2 hrs |
| E3 | Scenario difficulty recalibration | Use real player data to adjust difficulty ratings. Some "diff:1" scenarios might actually be hard for kids | 2 hrs |
| E4 | Funnel optimization | Identify where free users drop off. Adjust limit screen copy, upgrade prompt timing | Ongoing |

---

## WHAT TO SKIP (for now)

- **User accounts (Phase 2.7)** — Don't build login/signup until you have 100+ active users who are asking for it. localStorage works fine for now. The team code system (Sprint C) gives coaches what they need without accounts.

- **Next.js port (Phase 3)** — The single-file architecture handles the current scale. Don't rewrite until you've proven product-market fit.

- **PostgreSQL migration** — D1 is free and handles the current load. Migrate when D1 becomes the bottleneck (it won't be for a long time).

- **Full COPPA audit (Phase 4)** — Keep the current parent gate + credit card consent model. Do the full audit when you're approaching the April 22 deadline and have real user data to audit.

- **More engineering infrastructure** — You have analytics, A/B testing, error monitoring, server-side Pro verification. The infrastructure is ahead of the user base. Focus on getting users, not building more tools.

---

## RECOMMENDED ORDER OF EXECUTION

**Week 1:** Sprint A (Launch Ready) — get to a shareable state
**Week 2:** Sprint B (Content Gaps) + Sprint C1-C2 (Team Code + Report)
**Week 3:** Sprint C3-C4 (Shareable Card + Coach Kit) + Sprint D1-D2 (Notifications + Achievements)
**Week 4:** Hand the app to 3-5 travel ball coaches. Watch what happens. Sprint E (Data).
**Week 5+:** Sprint D3-D4 + iterate based on real user feedback

The app's knowledge system is world-class. The tech is solid. What it needs now is **users, feedback, and distribution** — not more features.
