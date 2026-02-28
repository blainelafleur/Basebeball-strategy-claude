# Baseball Strategy Master — Master Roadmap

## Context

**Where We Are:** A polished educational baseball game — 539 handcrafted scenarios across 15 categories, SVG field with 10 themes, avatar customization, season mode, coach mascot, survival/speed/daily modes, AI scenarios via xAI Grok + Cloudflare Worker proxy — running as a single-file React app (`index.jsx`, ~8,270 lines) on Cloudflare Pages. Free tier gives 8 plays/day with a well-designed limit screen and Daily Diamond always free. Pro gating, upgrade panel, and Stripe Payment Links are implemented. BRAIN knowledge system (v2.4.0) includes QUALITY_FIREWALL, CONSISTENCY_RULES, 7 knowledge maps, POS_PRINCIPLES, and Living Document System.

**The Strategy:** Complete the Quality & Intelligence sprints (Phase 2.95) to fix the data model and make the AI actually smart. Then build production infrastructure. Then grow with social features and coach tools.

**Key Decisions:**
- **Pricing:** $4.99/mo or $29.99/year (competitive with Prodigy, validated by market research)
- **Payment:** Stripe Payment Links first (no backend), webhooks later (after backend)
- **AI:** Fix client-side generation first, migrate server-side later
- **COPPA:** Parent gate + Stripe VPC now, full audit later
- **Scenario quality:** Governed by `SCENARIO_BIBLE.md` (separate reference document)

---

## Phase 1: "Make It Irresistible" (Game Polish) — COMPLETE

All work in `index.jsx`. No backend changes. Shipped to Cloudflare Pages.

### 1.1 AI-Powered Coach Mascot — DONE
- Expanded from 18 static lines to 65+ across success/warning/danger
- Position-specific lines, streak reactions (3-10+), baseball facts (12 facts, 20% chance)
- `getCoachLine()` accepts `pos` and `streak` for context-aware messages

### 1.2 Richer Cosmetics & Progression — DONE
- 10 field themes (Classic, Night, Sunny, Dome, Retro, Spring Training, World Series, Sandlot, Winter Classic, All-Star Game)
- Avatar customization: 6 jersey colors, 6 cap colors, 3 bat styles — visible on field sprite
- Stadium builder: 4 milestones at 50/100/200/330 games
- Prestige system: After Hall of Fame, restart season with +10% XP bonus per season

### 1.3 Enhanced Season Mode — DONE
- Story text for all 7 stages with stage intro screen (emoji, difficulty badge, story quote, season stats)

### 1.4 Mobile-First Polish — DONE
- CSS media queries for phone (<480px), tablet (480-768px), desktop (>768px)
- 44px minimum touch targets, safe area padding for notch devices

### 1.5 Sound & Animation Polish — DONE
- 3 new sounds: whoosh (transitions), cheer (perfect answers), jackpot (every 5th streak)
- Slower animations, confetti burst on level-ups, idle ball toss on mound

### 1.6 Survival + Speed Round Improvements — DONE
- Full post-game review, timeout reveals correct answer, difficulty preview on survival button

### 1.7 Age-Appropriate Explanations — DONE
- 50 scenarios with `explSimple` arrays for ages 6-10

### 1.8 Free Tier Overhaul — DONE
- 8 plays/day limit (was 15), Daily Diamond exempt from count
- Celebration-first limit screen with progress stats
- Color-coded plays-remaining counter (green > amber > red)

---

## Phase 2: "Monetize It" (Client-Side Freemium) — COMPLETE

All work in `index.jsx`. No backend needed. Stripe Payment Links handle payment.

### 2.1 Pro Feature Gating

Gate premium features for free users. Make them visible but locked.

- **`proGate()` utility** — checks `stats.isPro`, shows upgrade panel if false
- **AI scenarios** — Pro exclusive. Show "Go Pro for AI coaching" instead of silent fallback
- **Themes** — Free: Classic, Sunny, Retro. Locked: remaining 7 with lock icon
- **Avatar** — Free: 2 jerseys, 2 caps, 1 bat. Locked: remaining options grayed out
- **Coach mascot** — Free: basic encouragement. Pro: position tips, streak reactions, facts
- **Streak Freeze** — Pro exclusive. 1/week automatic, track `lastStreakFreezeDate`
- **2x XP** — Multiply points by 2 if `stats.isPro`
- **Pro badge** — Golden star next to level badge in header

### 2.2 Payment Integration (Stripe Payment Links)

Real money flows. No backend required.

- Create "All-Star Pass" product in Stripe Dashboard
- Two Prices: **$4.99/mo** recurring, **$29.99/year** recurring ("Save 50%")
- Generate Payment Links, configure success redirect: `app_url?pro=success&plan={monthly|yearly}`
- Parent-gated upgrade panel (math problem gate → pricing cards → Stripe links)
- Handle return: check URL params, set `stats.isPro = true` + `stats.proExpiry`
- Expiry check on app load: if expired, reset `isPro`, show renewal link

**Known limitation:** `isPro` in localStorage can be spoofed. Acceptable at current scale. Phase 3 adds server-side verification.

### 2.3 Content Sustainability

Free users never feel stuck. Pro users get infinite fresh content.

- **Persist scenario history** — move `hist` from useState into persisted `stats` object
- **Fix AI generation (client-side)** — add `x-api-key` header, `anthropic-dangerous-direct-browser-access: true` header, parent-gated API key input in settings
- **Spaced repetition** — prioritize previously-wrong scenarios when pool is exhausted, track `wrongCount` per scenario ID
- **Difficulty graduation** — ages 6-8 start diff:1 only, unlock diff:2 per-position at >70% accuracy
- **Cross-position encouragement** — suggest related positions when scenarios exhausted (pitcher→catcher, SS→2B, LF→CF)

### 2.4 Conversion Optimization

Maximize the free→paid funnel at 5 natural touchpoints.

1. **Plays Remaining Counter** — header, always visible, color-coded (green → amber → red)
2. **Position Exhaustion Message** — suggest other positions + "Go Pro for AI challenges"
3. **Post-Game Soft Prompt** — every 5th game, parent-focused, non-blocking
4. **Limit Screen** — celebration-first with "Ask a Parent About All-Star Pass" → math gate → pricing
5. **Parent Report** — highest-intent touchpoint, data-driven upgrade pitch

Additional:
- "Tell a Parent" clipboard share feature on limit screen
- Locked-content previews (blurred themes, grayed avatars)
- Position card exhaustion badges
- Funnel event tracking in localStorage (`limit_hit`, `stripe_link_clicked`, `pro_activated`, etc.)

---

## Phase 2.5: "Make It Real" (Audit & Refinement) — COMPLETE

Hardened Phase 2 implementation after audit revealed critical gaps.

### 2.5.1 Harden Parent Gate — DONE
- Replaced hardcoded `13 x 7` with randomized math problems
- Gate pass stored in sessionStorage (clears on tab close)

### 2.5.2 Make AI Work — xAI Grok + Cloudflare Worker — DONE
- Created `worker/index.js` — Cloudflare Worker proxy that hides xAI API key
- Rewrote `generateAIScenario()` for xAI `grok-4-1-fast` (OpenAI-compatible format)
- ~~Enabled `x_search` tool~~ (deprecated by xAI, removed)
- Removed client-side API key requirement (proxy handles auth)
- 15-second timeout with fallback to handcrafted scenarios

### 2.5.3 Lightweight Analytics — DONE
- Added `firstPlayDate`, `lastPlayDate`, `sessionCount` tracking
- "Export Analytics (JSON)" button in parent report panel

### 2.5.4 UX Quick Wins — DONE
- 3-step first-play tutorial overlay for new users
- Position mastery celebration screen when all scenarios exhausted
- ARIA labels and keyboard navigation on key interactive elements

### 2.5.5 Scenario Expansion — DONE
- Expanded from 394 to 460 handcrafted scenarios (+66)
- Filled weak positions: 1B, 2B, SS, 3B, LF, CF, RF (+6 each), famous (+10), rules (+10), counts (+10)

### 2.5.6 Documentation Refresh — DONE
- Updated CLAUDE.md, ROADMAP.md, MEMORY.md to match current codebase

### 2.5.7 AI Response Time Optimization — TODO
- Current AI scenario generation takes noticeably long (~5-10s)
- Investigate: reduce prompt size, try smaller/faster model, pre-generate during idle, cache common positions
- Consider streaming response to show partial progress

### Accepted Risks (Until Phase 3)
- `isPro` in localStorage can be spoofed — fix with server-side auth
- Stripe Payment Link URLs need real Stripe products configured
- Cloudflare Worker AI proxy is free tier (100K req/day) — sufficient at current scale

---

## Phase 2.9: "Polish & Fix" (Playtest Audit Response) — COMPLETE

Addressed 16 items from a full playtesting audit of the live app.

### 2.9.1 P0 Quick Fixes — DONE
- Fixed p39 scenario title mismatch ("They Just Took You Deep")
- Fixed hardcoded "6 positions" → dynamic `{Object.keys(SCENARIOS).length}`
- Renamed "Best Run" → "Best Streak" in stats header
- Scoreboard COUNT column always visible (shows "--" for fielding)
- Renamed "Change Position" → "← Pick Position"
- Renamed "Game X of 36" → "Challenge X of 36" in season mode

### 2.9.2 P1 UX Improvements — DONE
- Speed Round timer waits for options to reveal before starting, "GO!" flash
- Challenge a Friend: mobile `navigator.share()` + clipboard `.catch()` fallback
- AI fallback shows "📚 Practice" badge instead of silent mode switch
- Parent Report: replaced `prompt()` with inline math gate card
- PRO badge clickable → shows benefits panel (plan, expiry, feature list)
- Famous/Rules/Counts cards show accuracy% and play count
- Streak break toast when losing 3+ streak

### 2.9.3 P2 New Features — DONE
- Session recap overlay after 3+ normal plays (stats, accuracy, concepts)
- Level badge clickable → progression panel (all 5 levels, progress bar, prestige)
- "Explain More" AI-powered deep dive on outcome screen (Pro only, locked for free)

---

## Phase 2.92: "Make It Smart" (BRAIN Knowledge System) — COMPLETE

Built the knowledge engine that powers scenario quality, AI validation, and adaptive learning infrastructure.

### 2.92.1 BRAIN Constant + Knowledge Maps — DONE
- RE24 run expectancy matrix (24 base-out states), count leverage data, steal break-even thresholds
- 7 knowledge maps: cutoff/relay, bunt defense, first-third, backup coverage, rundown, DP positioning, hit-and-run
- POS_PRINCIPLES for all 15 positions (authoritative coaching reference)
- Brain API functions: getRelevantMaps(), formatBrainStats(), getTeachingContext()

### 2.92.2 Scenario Expansion (460 → 539) — DONE
- Situational mastery clusters: 16 scenarios across pitcher/batter/baserunner/manager
- Outfield expansion: LF/CF/RF each expanded to 25+ scenarios (was ~21 each)
- Rules edge cases: 6 new scenarios (batting out of order, interference, time play, pitch clock, fan interference)
- Total: 539 handcrafted scenarios across 15 categories

### 2.92.3 AI Quality Systems — DONE
- QUALITY_FIREWALL: 10 automated checks (Tier 1 reject, Tier 2 warn, Tier 3 suggest) integrated into generateAIScenario()
- CONSISTENCY_RULES: 10 cross-position contradiction rules (CR1-CR10), integrated into AI pipeline
- ROLE_VIOLATIONS: Position-specific regex validation for AI-generated scenarios
- Error classification: timeout, parse, structure, rate, role-violation, consistency-violation

### 2.92.4 Living Document System — DONE
- BRAIN_VERSION (2.4.0) + BRAIN_VERSION_DATE tracking
- KNOWLEDGE_CHANGELOG with structured version history
- ANNUAL_UPDATE_CHECKLIST: 12 checks with source references for annual data refresh
- Deprecation process, community feedback pipeline documented in SCENARIO_BIBLE.md Section 11

### Known Issues (fixed in Phase 2.95 Sprints 1-2)
- ~~78% of scenarios (422/539) lack conceptTags~~ — FIXED: 539/539 tagged (Sprint 1.1)
- ~~Only 50/539 scenarios have explSimple~~ — FIXED: 164/164 Diff 1 covered (Sprint 1.2)
- ~~CONSISTENCY_RULES produce false positives (23/23 in audit)~~ — FIXED: 0 false positives (Sprint 1.4)
- ~~AI scenarios not persisted~~ — FIXED: aiHistory in localStorage (Sprint 1.5/2.1)
- ~~AI has zero memory between generations~~ — FIXED: history, scoring, caching, dedup (Sprint 2)

---

## Phase 2.95: "Quality & Intelligence" (Audit Sprints) — IN PROGRESS

Comprehensive improvement plan based on full audit (see `AUDIT_REPORT.md`). Four sprints to fix the data model, make the AI intelligent, build adaptive learning, and prepare for scale.

### Sprint 1: Stop the Bleeding (Weeks 1-2) — COMPLETE
**Goal:** Fix the data model so the learning engine actually works.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Add conceptTags to all 539 scenarios | DONE | 539/539 tagged, 43 unique conceptTags |
| 2 | Add explSimple to all Diff 1 scenarios (164) | DONE | 164/164 Diff 1 scenarios have explSimple |
| 3 | Standardize explanation lengths (fix 127 imbalanced) | DONE | All explanations balanced |
| 4 | Fix CONSISTENCY_RULES false positives (refine regex) | DONE | CR1/CR2/CR10 refined, 0 false positives |
| 5 | Persist AI scenarios to localStorage | DONE | aiHistory in DEFAULT state, saved on generation + answer |

### Sprint 2: Make the AI Smart (Weeks 3-4) — COMPLETE
**Goal:** Transform AI from content generator to learning coach.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | AI scenario persistence + history tracking | DONE | Done in Sprint 1.5, aiHistory capped at 100 |
| 2 | AI quality scoring (player response, time, re-engagement) | DONE | scoreAIScenario() 0-100 composite, getAIQualityStats() |
| 3 | Pre-generate + cache AI scenarios per session | DONE | aiCacheRef, background gen for top 3 positions on home screen |
| 4 | Reduce AI prompt size (move validation client-side) | DONE | 36% reduction (~597 tokens saved), SELF-AUDIT condensed to 6 items |
| 5 | AI generation deduplication (compare to history) | DONE | Title-matching vs handcrafted + recent AI history |

### Sprint 3: Adaptive Learning Engine (Weeks 5-7) — COMPLETE
**Goal:** Connect existing systems into a real learning path.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Concept-based scenario selection (not random within category) | DONE | scoreScenarioForLearning() + weightedPick() — 6 scoring factors |
| 2 | Mastery heatmap visualization for players | DONE | Domain-grouped heatmap with 5 mastery states, accuracy, streaks |
| 3 | Difficulty auto-calibration from aggregate data | DONE | scenarioCalibration tracking, zone-of-proximal-development scoring, upgrade nudge |
| 4 | Session coherence system (scenarios build on each other) | DONE | Prereq chain progression, wrong-answer reinforcement, domain coherence |
| 5 | "What should I practice?" recommendation engine | DONE | getPracticeRecommendations() — 6 rec types, priority-sorted, home screen UI |

### Sprint 4: Scale Preparation (Weeks 8-10) — COMPLETE
**Goal:** Make the app production-ready for real users and revenue.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Server-side Pro verification via Cloudflare Worker | DONE | /verify-pro, /activate-pro, /stripe-webhook endpoints; D1 subscriptions table; graceful degradation with client fallback; reconciliation for existing Pro users |
| 2 | Real-time analytics pipeline (anonymized) | DONE | Batched event ingestion (30s flush), per-session random hash (no PII), 5 event types, /analytics + /analytics/summary endpoints, D1 analytics_events table |
| 3 | A/B testing framework for AI prompts | DONE | Deterministic hash-based bucket assignment, 2 active tests (ai_temperature, ai_system_prompt), weighted variant selection, tracked in analytics |
| 4 | Error monitoring + alerting for AI failures | DONE | Batched error reporting, auto-alert webhook (10 AI errors in 5 min), global JS/promise handlers, /error-report + /errors/summary endpoints, D1 error_logs table. **TODO:** Set up Slack Incoming Webhook and run `npx wrangler secret put ALERT_WEBHOOK_URL` to enable live error alerts. |
| 5 | Performance audit (bundle optimization) | DONE | 1.3MB raw / 352KB gzipped, shared style constants (S object), React.memo on Field + Board components, load time tracking in analytics |

---

## Phase 2.7: "Know Your Players" (User Accounts) — NOT STARTED

Add user accounts and server-side progress sync using Cloudflare D1 (free serverless SQLite). Stays within current single-file architecture — no Next.js port needed.

### Phase A: MVP — Accounts & Sync
- **Cloudflare D1 database**: `users`, `profiles`, `sessions` tables
- **Worker auth endpoints**: signup, login, logout, verify-email, me, sync
- **Password hashing**: PBKDF2-SHA256 via Web Crypto API
- **Email verification**: Resend API (free tier: 3K emails/month)
- **Frontend**: Login/signup screens, account panel, sync indicator
- **Dual-write**: localStorage (offline fallback) + server sync (debounced 3s)
- **Claim progress**: Existing anonymous users can create account and migrate localStorage stats
- **13+ only**: Under-13 continue as anonymous (COPPA consent deferred to Phase B)

### Phase B: COPPA + Server-Side Pro
- **Parent consent flow**: Under-13 signup collects parent email, sends consent link (email-plus method)
- **Consent audit log**: `consent_log` table for COPPA compliance proof
- **Server-side Pro**: `subscriptions` table replaces spoofable localStorage `isPro`
- **Promo codes tied to accounts**: Redemptions recorded against user ID

### Phase C: Multi-Profile + Polish
- **Parent accounts**: Add/switch between multiple child profiles
- **Forgot password**: Password reset via email
- **Soft engagement prompts**: "Save your progress" after 3rd game, after first achievement
- **Data export/deletion**: Per-profile export and COPPA-compliant deletion

### Key Architecture Decisions
- **D1 over PostgreSQL**: Free, already in Cloudflare ecosystem, sufficient at current scale
- **Stats as JSON blob**: Store full `stats` object in `profiles.stats_json` — avoids restructuring 40+ fields
- **Session tokens over JWTs**: Simple random tokens in D1, allows server-side revocation
- **Accounts are optional**: Anonymous localStorage play works exactly as today

---

## Phase 3: "Build the Engine" (Production Infrastructure) — NOT STARTED

Major scope change: port to Next.js for SSR, move to PostgreSQL for scale, add advanced features.

### 3.1 Port Game into Next.js
- Extract `index.jsx` into modular components under `src/components/game/`
- Keep all 460 scenarios as `src/data/scenarios.ts`
- Game must look and play identically to the Phase 1/2 client-side version
- Migrate D1 accounts data to PostgreSQL

### 3.2 Enhanced Auth
- Add Google OAuth via NextAuth (alongside existing email/password from Phase 2.7)
- Server-side session management
- Account linking (merge anonymous + OAuth + email accounts)

### 3.3 Hybrid Persistence
- Game works offline with localStorage (preserve current behavior)
- When logged in, sync to PostgreSQL on each scenario completion
- Leaderboard entries written server-side

### 3.4 Server-Side AI
- Replace Cloudflare Worker xAI proxy with Next.js API routes
- Reuse the proven prompt from `generateAIScenario()`
- Rate limiting: 5 AI scenarios/day free, unlimited for paid
- API key never exposed to client

### 3.5 Stripe Webhooks
- Replace Payment Links (2.2) with server-side webhook verification
- Subscription status in database, not localStorage
- Proper renewal/cancellation handling

### 3.6 Deploy to Railway
- PostgreSQL + Redis
- Stripe webhooks
- Sentry + PostHog
- Custom domain + health checks

---

## Phase 4: "Grow It" (Distribution & Social) — NOT STARTED

### 4.1 League Leaderboards
- 10 baseball-themed tiers with weekly promotion/demotion
- Pseudonymous (COPPA compliant)
- Fresh competition every Monday

### 4.2 Coach Dashboard + Team Tier ($14.99/mo)
- Create team, invite up to 25 players, assign scenarios, view progress
- One coach = 15-20 families = subscriber pipeline
- Target travel ball coaches first
- Requires backend from Phase 3

### 4.3 Shareable Baseball Cards + Referral
- Auto-generated player stat cards with QR code/referral link
- Referral rewards: XP, streak freezes, cosmetics, free month

### 4.4 COPPA Audit
- Neutral age gate, parent-only data collection, deletion endpoint
- Privacy policy, no child analytics, no targeted ads
- **Deadline: April 22, 2026**

---

## The Two Tiers

### Free Tier: "The Product" (not a demo)

| Feature | Included |
|---------|----------|
| All 539 handcrafted scenarios | Yes |
| All 15 positions | Yes |
| 8 plays per day | Yes |
| Daily Diamond Play (exempt from limit) | Yes |
| Speed Round / Survival / Season | Yes |
| Streaks & achievements | Yes |
| Field themes | 3 (Classic, Sunny, Retro) |
| Avatar | 2 jerseys, 2 caps, 1 bat |
| Coach mascot | Basic encouraging lines |
| AI scenarios | No |
| Streak Freeze | No |

### Premium: "All-Star Pass" — $4.99/mo or $29.99/year

| Feature | Value |
|---------|-------|
| Unlimited daily plays | No cap |
| AI Coach's Challenge | Personalized scenarios targeting weak areas |
| Full coach mascot | Position tips, streak reactions, baseball facts |
| All 10 field themes | Unlocked |
| Full avatar customization | All colors and bat styles |
| Streak Freeze | 1/week automatic |
| 2x XP | Faster progression |
| Pro badge | Golden star next to name |

**Pricing rationale:** $4.99/mo is competitive with Prodigy ($4.99-$8.99/mo) and well below ABCmouse ($14.99/mo). The annual $29.99 ($2.50/mo effective) aligns with the baseball season — parents buy it in March, keep it through October.

---

## Competitive Context

| App | Model | Free Tier | Paid Tier | Conversion Rate |
|-----|-------|-----------|-----------|-----------------|
| Duolingo | Energy/hearts | Full content, limited mistakes | Unlimited hearts, no ads | ~9% |
| Prodigy Math | Cosmetic gating | All math content free | Pets, gear, areas | ~5% |
| ABCmouse | Trial | 30-day trial | $9.99-$14.99/mo | N/A |
| Homer | Trial | Limited content | Full library, $9.99/mo | N/A |
| **Us (target)** | Play limits | All content, 8 plays/day | Unlimited + AI + cosmetics | Target: 5% |

---

## COPPA Compliance Strategy

**Phase 2 (client-side):**
- Parent gate (math problem) required for any purchase interaction
- Credit card transaction at Stripe = Verifiable Parental Consent
- No personal data from children in free tier (localStorage only)
- Parent email collected only at point of purchase through Stripe

**Phase 3 (backend):**
- Server-side data handling with proper consent flows

**Phase 4:**
- Full COPPA audit — neutral age gate, deletion endpoint, privacy policy, no child analytics
- Deadline: April 22, 2026

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Daily active users hitting limit | >80% within week 1 | `todayPlayed >= 8` in localStorage |
| "Ask a Parent" click rate | >10% of limit-hit users | Funnel events |
| Free-to-paid conversion | 5% of MAU | Stripe dashboard |
| Monthly churn | <10% | Stripe dashboard |
| Day-2 retention | >40% | Daily streak field |
| Average session length | 15-20 min | ~8 plays × ~2 min |

---

## What NOT to Do

1. **Don't gate educational content.** All 539 scenarios stay free. Always.
2. **Don't show purchase prompts during active gameplay.** Only in natural pauses.
3. **Don't use punishing language.** Celebrate progress, don't emphasize restrictions.
4. **Don't require accounts for free play.** localStorage-only is fine.
5. **Don't build the team/coach tier before the backend.** Validate individual subs first.
6. **Don't make kids feel pressured.** "Ask a Parent" is the primary CTA, never "Buy Now."

---

## Cost Considerations

| Item | Cost | Notes |
|------|------|-------|
| Claude API (AI scenarios) | ~$0.003-0.005/generation | Only for Pro users |
| Stripe fees | 2.9% + $0.30/transaction | Standard |
| Hosting (Cloudflare Pages) | Free tier | Current setup |
| At 100 Pro users | ~$490/mo revenue | Positive from day 1 |
| At 1,000 Pro users | ~$4,900/mo revenue | Sustainable |

---

## Reference Documents

- **`SCENARIO_BIBLE.md`** — Scenario quality framework, knowledge hierarchy, position principles, quality checklist, Living Document Protocol (Section 11), audit log. The authoritative reference for all scenario content.
- **`CLAUDE.md`** — Codebase architecture, file structure, editing instructions.
- **`AUDIT_REPORT.md`** — Full critical audit with grades, 7 critical issues, AI deep dive, and sprint plan details.
- **`BASEBALL_BRAIN_PHASE2_PLAN.md`** — Original 20-prompt plan for building the BRAIN knowledge system (Phase 2.92). All prompts executed.
