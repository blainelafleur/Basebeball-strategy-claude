# Baseball Strategy Master — Master Roadmap

## Context

**Where We Are:** A polished educational baseball game — 394 handcrafted scenarios across 15 categories, SVG field with 10 themes, avatar customization, season mode, coach mascot, survival/speed/daily modes — running as a single-file React app (`index.jsx`, ~4,239 lines) on Replit. Free tier gives 8 plays/day with a well-designed limit screen and Daily Diamond always free.

**The Strategy:** Three phases remain. First, monetize the client-side app (no backend needed). Then build production infrastructure. Then grow with social features and coach tools.

**Key Decisions:**
- **Pricing:** $4.99/mo or $29.99/year (competitive with Prodigy, validated by market research)
- **Payment:** Stripe Payment Links first (no backend), webhooks later (after backend)
- **AI:** Fix client-side generation first, migrate server-side later
- **COPPA:** Parent gate + Stripe VPC now, full audit later
- **Scenario quality:** Governed by `SCENARIO_BIBLE.md` (separate reference document)

---

## Phase 1: "Make It Irresistible" (Game Polish) — COMPLETE

All work in `index.jsx`. No backend changes. Shipped to Replit.

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

## Phase 2: "Monetize It" (Client-Side Freemium) — NOT STARTED

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

## Phase 3: "Build the Engine" (Production Infrastructure) — NOT STARTED

Major scope change: port to Next.js, add accounts, move payment server-side.

### 3.1 Port Game into Next.js
- Extract `index.jsx` into modular components under `src/components/game/`
- Keep all 394 scenarios as `src/data/scenarios.ts`
- Game must look and play identically to the Phase 1/2 client-side version

### 3.2 Auth + COPPA-Compliant Accounts
- NextAuth with parent email/password or Google OAuth
- Parent creates child profile(s) — username only, no child email
- Guest mode (localStorage) still works — convert to account later
- Credit card payment = COPPA Verifiable Parental Consent

### 3.3 Hybrid Persistence
- Game works offline with localStorage (preserve current behavior)
- When logged in, sync to PostgreSQL on each scenario completion
- Leaderboard entries written server-side

### 3.4 Server-Side Claude AI
- Replace client-side Claude calls with server-side `/api/ai/` routes
- Reuse the proven prompt from `generateAIScenario()`
- Rate limiting: 5 AI scenarios/day free, unlimited for paid
- API key never exposed to client (replaces client-side fix from 2.3)

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
| All 394 handcrafted scenarios | Yes |
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

1. **Don't gate educational content.** All 394 scenarios stay free. Always.
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
| Hosting (Replit) | Free tier or $7/mo | Current setup |
| At 100 Pro users | ~$490/mo revenue | Positive from day 1 |
| At 1,000 Pro users | ~$4,900/mo revenue | Sustainable |

---

## Reference Documents

- **`SCENARIO_BIBLE.md`** — Scenario quality framework, knowledge hierarchy, position principles, quality checklist, audit log. The authoritative reference for all scenario content.
- **`CLAUDE.md`** — Codebase architecture, file structure, editing instructions.
