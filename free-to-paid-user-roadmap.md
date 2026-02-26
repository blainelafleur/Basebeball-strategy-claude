# Free-to-Paid User Roadmap: Baseball Strategy Master

## Why This Roadmap Exists

The app currently gives away 15 free plays/day, has a placeholder "Go Pro" button that unlocks everything with no payment, and broken AI scenario generation. Kids exhaust their position's scenarios in one session, hit a dead-end limit screen, and the "Next Challenge" button stops working. There's no real path from free to paid, no parent involvement, and no reason to come back tomorrow.

This roadmap fixes the foundation and builds a proper freemium system that's genuinely valuable for free users while making the premium tier irresistible.

---

## Competitive Context

| App | Model | Free Tier | Paid Tier | Conversion Rate |
|-----|-------|-----------|-----------|-----------------|
| **Duolingo** | Energy/hearts | Full content, limited mistakes | Unlimited hearts, no ads | ~9% |
| **Prodigy Math** | Cosmetic gating | All math content free | Pets, gear, areas | ~5% |
| **ABCmouse** | Trial | 30-day trial | $9.99-$14.99/mo | N/A (trial) |
| **Homer** | Trial | Limited content | Full library, $9.99/mo | N/A (trial) |
| **Us (target)** | Play limits | All content, 8 plays/day | Unlimited + AI + cosmetics | Target: 5% |

**Key insight from Duolingo**: The free product must be genuinely excellent. The paid tier removes friction (hearts/energy) rather than adding features. Users pay to remove limits on something they already love.

**Key insight from Prodigy**: Teachers are the distribution channel. Free for teachers, monetize parents through cosmetic/progression upgrades. Kids nag parents — "pester power."

---

## The Two Tiers

### Free Tier: "The Product" (not a demo)

| Feature | Included | Rationale |
|---------|----------|-----------|
| All 394 handcrafted scenarios | Yes | Never gate educational content |
| All 15 positions | Yes | Full exploration |
| **8 plays per day** | Yes | ~15-20 min session. Enough to learn, short enough to want more |
| Daily Diamond Play | Yes, free always | Does NOT count against 8. The #1 retention hook |
| Speed Round / Survival / Season | Yes | Each scenario counts as 1 play |
| Streaks & achievements | Yes | Free retention engine |
| Field themes | 3 (Classic, Sunny, Retro) | Others visible but locked |
| Avatar | 2 jerseys, 2 caps, 1 bat | Others visible but locked |
| Coach mascot | Basic encouraging lines | No position-specific tips or baseball facts |
| AI scenarios | No | Pro exclusive |
| Streak Freeze | No | Pro exclusive |

**Why 8 plays?** Duolingo's energy system yields ~15-20 minutes of active learning before depletion. Our 8-play limit achieves similar session length. Homer positions "15 minutes a day" as the sweet spot parents trust. Too generous (15) means kids don't come back; too stingy (5) frustrates before they're hooked.

**Why Daily Diamond is always free?** Even if a kid burns through their 8 plays, they can always come back tomorrow for the Daily Diamond. This creates the daily habit without costing money. It's the single most important retention decision in the free tier.

### Premium: "All-Star Pass" — $4.99/mo or $29.99/year

| Feature | Value |
|---------|-------|
| **Unlimited daily plays** | No cap — practice as much as they want |
| **AI Coach's Challenge** | Claude generates personalized scenarios targeting weak areas |
| **Full coach mascot** | Position-specific tips, streak reactions, baseball facts |
| **All 10 field themes** | Night Game, Dome, Spring Training, World Series, Sandlot, Winter Classic, All-Star Game |
| **Full avatar customization** | All 6 jersey colors, 6 cap colors, 3 bat styles |
| **Streak Freeze** | 1/week automatic — protects your streak if you miss a day |
| **2x XP on all plays** | Faster level progression |
| **Enhanced Parent Report** | Learning velocity, concept mastery timeline, per-position recommendations |
| **Pro badge** | Golden star next to name |

**Pricing rationale**: $4.99/mo is competitive with Prodigy ($4.99-$8.99/mo) and well below ABCmouse ($14.99/mo). The annual $29.99 ($2.50/mo effective) aligns with the "baseball season" mental model — parents buy it in March, keep it through October.

---

## Conversion Touchpoints (5 moments, least to most assertive)

### 1. Plays Remaining Counter (header, always visible)
- Green when >3 remaining
- Amber when 3 or fewer remaining
- Red at 1 remaining
- "Back tomorrow" when 0
- Gentle, informational — no purchase language

### 2. Position Exhaustion Message
When a free user has played all diff:1 scenarios for a position:
> "You've mastered all Rookie scenarios for Shortstop! Try Catcher — it teaches you the other side of pitch selection. Or Go Pro for AI-generated challenges."

This creates natural aspiration without blocking access (they can still replay).

### 3. Post-Game Soft Prompt (every 5th game)
Parent-focused messaging on the outcome screen:
> "[Name] has learned 12 concepts! The All-Star Pass gives unlimited practice and AI coaching — $4.99/mo"

Non-blocking, appears below the main outcome content.

### 4. Limit Screen (when daily limit hit)
Celebration-first, not punishment:
- Lead with progress stats (accuracy, streak, level)
- Comeback hook: "See you tomorrow for your Daily Diamond!"
- Parent-gated upgrade: "Ask a Parent About All-Star Pass" → math gate → pricing

### 5. Parent Report Upgrade Section
The highest-intent touchpoint. A parent who goes through the gate to view the report is already engaged:
> "Want to accelerate [name]'s learning? The All-Star Pass gives unlimited scenarios, AI coaching, and detailed learning analytics. $4.99/mo or $29.99/year."

---

## COPPA Compliance

- **Parent gate** required for any purchase interaction (math problem serves as gate)
- Credit card transaction at Stripe serves as **Verifiable Parental Consent** (VPC)
- No personal data collected from children in free tier (localStorage only)
- Parent email collected only at point of purchase through Stripe
- No targeted advertising
- April 2026 deadline for compliance with amended COPPA rule

---

## Implementation Phases

### Phase 0: Bug Fixes (DONE in this session)
- [x] Fix "Next Challenge" button doing nothing at limit
- [x] Exempt Daily Diamond from daily play count
- [x] Change DAILY_FREE from 15 to 8
- [x] Redesign limit screen: celebration-first with progress stats
- [x] Color-coded plays-remaining counter (amber at 3, red at 1)

### Phase 1: Pro Feature Gating (~6 hours)

**Goal:** Make premium features visible but locked for free users.

1. **Add `proGate()` utility function**
   - Checks `stats.isPro`, shows upgrade panel if false
   - Reusable across all gated features

2. **Gate AI scenarios**
   - AI Coach's Challenge button → `proGate('ai')` check
   - When AI would trigger (all scenarios exhausted), show "Go Pro for AI coaching" instead of silent fallback

3. **Gate premium themes**
   - Free: Classic, Sunny, Retro
   - Locked: Night, Dome, Spring Training, World Series, Sandlot, Winter Classic, All-Star Game
   - Show locked themes with a small lock icon and "All-Star Pass" label

4. **Gate extended avatar customization**
   - Free: 2 jersey colors (blue, red), 2 cap colors (blue, red), 1 bat style
   - Locked: remaining 4 jerseys, 4 caps, 2 bat styles
   - Show locked options with subtle lock overlay

5. **Gate full coach mascot**
   - Free: basic encouraging lines ("Great job!", "Keep learning!")
   - Pro: position-specific tips, streak reactions, baseball facts (the existing 65+ lines)

6. **Add streak freeze for Pro users**
   - Automatic 1/week: if Pro user misses a day, streak is preserved
   - Track `lastStreakFreezeDate` in stats

7. **Add 2x XP for Pro users**
   - In `handleChoice` points calculation, multiply by 2 if `stats.isPro`

8. **Add Pro badge**
   - Golden star next to level badge in header for Pro users

### Phase 2: Payment Integration (~4 hours)

**Goal:** Real money flows. Parents pay, kids play.

1. **Set up Stripe**
   - Create "All-Star Pass" product in Stripe Dashboard
   - Create two Prices: $4.99/mo recurring, $29.99/year recurring
   - Generate Payment Links for each Price
   - Configure success redirect URL: `app_url?pro=success&plan={monthly|yearly}`

2. **Add Payment Link constants**
   ```
   const STRIPE_MONTHLY = "https://buy.stripe.com/[monthly_id]";
   const STRIPE_YEARLY = "https://buy.stripe.com/[yearly_id]";
   ```

3. **Build parent-gated upgrade panel**
   - Math problem gate (existing pattern)
   - Two pricing cards: monthly ($4.99) and yearly ($29.99 — "Save 50%")
   - Buttons link to Stripe Payment Links
   - "What's included" feature comparison

4. **Handle Stripe return**
   - On app load, check `window.location.search` for `?pro=success`
   - Set `stats.isPro = true`, `stats.proExpiry` = 30 or 365 days from now
   - Clear URL params
   - Show celebration screen

5. **Subscription status check**
   - On app load, check `stats.proExpiry` against current date
   - If expired, reset `isPro = false`
   - Show "Your All-Star Pass expired" with renewal link

**Known limitation:** Without a backend, `isPro` lives in localStorage and could be spoofed by a savvy user. This is acceptable at current scale. Phase 4 adds server-side verification.

### Phase 3: Content Sustainability (~4 hours)

**Goal:** Free users never feel "stuck," Pro users get infinite fresh content.

1. **Persist scenario history (`hist`) to localStorage**
   - Move `hist` from `useState({})` into `stats` object (which is already persisted)
   - Replace all `setHist()` calls with `setStats()` updates
   - History survives page refresh and daily resets

2. **Fix AI scenario generation**
   - Add `x-api-key` header to fetch call
   - Add `anthropic-dangerous-direct-browser-access: true` header
   - Add `apiKey` field to stats (parent-gated settings input)
   - If no API key, skip AI attempt entirely (don't make a doomed 401 request)
   - Show "Set up AI Coach in Settings" instead of silent fallback

3. **Smart rotation (spaced repetition)**
   - When all scenarios in a position pool have been seen, don't just pick randomly
   - Prioritize scenarios the player got wrong previously
   - Track `wrongCount` per scenario ID in stats
   - This turns repetition into actual learning reinforcement

4. **Difficulty graduation for young players**
   - Ages 6-8 start with `maxDiff=1` only
   - When a player achieves >70% accuracy on all diff:1 scenarios for a position, unlock diff:2 for that position specifically
   - Show celebratory "Level Up! Harder scenarios unlocked for [Position]!" moment
   - The age group setting remains the global default, but per-position mastery can override it

5. **Cross-position encouragement**
   - When all scenarios for a position are exhausted, show on the outcome screen:
   - "You've mastered all [Position] scenarios at your level! Try [related position] next."
   - Suggested positions based on related concepts (pitcher→catcher, SS→2B, LF→CF, etc.)

### Phase 4: Conversion Optimization (~3 hours)

**Goal:** Maximize the free→paid conversion funnel.

1. **"Tell a Parent" feature**
   - On the limit screen, add "Share with a parent" button
   - Copies a text to clipboard: "Hey! I've been learning baseball strategy on Baseball Strategy Master. I've learned [N] concepts so far! Can we get the All-Star Pass? $4.99/mo at [link]"
   - Uses the "pester power" approach (like Prodigy) but done transparently

2. **Upgrade prompt in Parent Report**
   - At bottom of parent report (highest-intent touchpoint): data-driven pitch about the child's learning velocity and areas for improvement
   - "Your player is in the top 20% for accuracy!" with upgrade CTA

3. **Locked-content previews**
   - Show all 10 themes in the theme selector, locked ones with blurred preview + lock icon
   - Show all avatar options, locked ones grayed out
   - Creates visual aspiration — kids see what they're missing

4. **Position card exhaustion badges**
   - When a position's available scenarios are exhausted, show a badge on the position card
   - "All Rookie scenarios complete!" with suggestion to try another position or upgrade for AI

5. **Funnel event tracking**
   - Track in localStorage: `funnelEvents` array
   - Events: `limit_hit`, `limit_panel_viewed`, `parent_gate_attempted`, `parent_gate_passed`, `stripe_link_clicked`, `pro_activated`
   - When analytics backend exists, these can be sent server-side

### Phase 5: Backend + Team Tier (future, major scope)

**Goal:** Server-side verification, team features, coach dashboard.

This is a separate product and requires:
- Next.js or similar server framework
- Database (Prisma + PostgreSQL already in repo)
- Stripe webhooks for subscription verification
- User accounts and authentication
- Coach dashboard for team management
- Team analytics and reporting
- COPPA-compliant data handling

**Pricing**: $14.99/mo per team (up to 25 players)

**This phase is NOT part of the single-file architecture.** It builds on the Next.js infrastructure already scaffolded in the repo's `/src` directory. Defer until individual subscription revenue validates the market.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users hitting limit | >80% within week 1 | `todayPlayed >= DAILY_FREE` in localStorage |
| "Ask a Parent" click rate | >10% of limit-hit users | Funnel events |
| Free-to-paid conversion | 5% of monthly active users | Stripe dashboard |
| Monthly churn | <10% | Stripe dashboard |
| Day-2 retention (return rate) | >40% | `ds` (daily streak) field |
| Average session length | 15-20 min | `todayPlayed * ~2 min` |
| Concepts learned per week | >5 per active user | `stats.cl` array length growth |

---

## What NOT to Do

1. **Do NOT gate educational content.** All 394 scenarios stay free. Always.
2. **Do NOT show purchase prompts during active gameplay.** Upgrade prompts belong in natural pauses: limit screen, outcome screen (subtle), parent report.
3. **Do NOT use punishing language.** "DAILY LIMIT REACHED" → "Great session today!" Celebrate progress, don't emphasize restrictions.
4. **Do NOT require accounts for free play.** localStorage-only is perfect for free users. No signup friction, no COPPA consent needed.
5. **Do NOT build the team/coach tier yet.** It requires a backend. Validate individual subscriptions first.
6. **Do NOT make kids feel pressured.** The upgrade decision should feel like it comes from the parent. "Ask a Parent" is the primary CTA, never "Buy Now."

---

## Cost Considerations

| Item | Cost | Notes |
|------|------|-------|
| Claude API (AI scenarios) | ~$0.003-0.005/generation | Only for Pro users |
| Stripe fees | 2.9% + $0.30/transaction | Standard |
| Hosting (Replit) | Free tier or $7/mo | Current setup |
| At 100 Pro users | ~$490/mo revenue, ~$15/mo Stripe fees | Positive from day 1 |
| At 1000 Pro users | ~$4,900/mo revenue | Sustainable |

The single-file architecture means near-zero infrastructure cost. Revenue is almost entirely margin until the backend/team tier is built.
