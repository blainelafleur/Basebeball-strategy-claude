# BSM Strategic Plan — Revised

## The North Star

Build the app that Blaine LaFleur — 20-year coach, high-level player, father of three boys in the target age range — would be proud to hand to his team. Not "good enough to get feedback on." Not "MVP." The real thing. When Blaine says "this is ready," it's ready.

The previous plan was wrong about one thing: it assumed BSM needed external validation. It doesn't. Blaine is the target audience, the domain expert, the coach, AND the player. Shipping a half-baked version to coaches risks burning the one shot at a first impression. The right move is to make it undeniably good, THEN ship.

Everything else from the audit stands: the Babel wall, the repo clutter, the technical debt. Those aren't about shipping — they're about building a foundation worthy of what this app should become.

---

## PHASE 0: STOP THE BLEEDING (This Weekend, 4-6 hours)

### Kill Babel → Vite Migration

Every page load transpiles 2.6 MB of JSX through `@babel/standalone` in the browser. **10-20 seconds on mobile.** This isn't a user problem — it's a BUILDER problem. Blaine can't properly test the app when every reload takes 15 seconds. Fast iteration requires fast load times.

**Fix:** Add Vite. The `assemble.sh` already splits into 9 src files — each becomes an ES module import. Output: pre-compiled bundle, loads in <2s.

### Add PWA Manifest

`manifest.json` + service worker. Makes the app installable on Blaine's phone for testing. Eventually makes it installable for everyone.

### Clean the Repo

Archive 70+ obsolete markdown files to `_archive/`. Keep only 7 living docs. Delete the abandoned Next.js scaffold artifacts that don't match the current app. Clean context = better Claude sessions = faster building.

---

## THE NEXT.JS QUESTION: Should BSM Become a Next.js App?

**Short answer: Yes, but not yet. Vite first, Next.js when the app needs pages.**

Here's the honest breakdown:

### What Next.js Would Give BSM

| Capability | Why It Matters for BSM |
|-----------|----------------------|
| **File-based routing** | Coach dashboard, parent portal, landing page, admin panel — each gets its own page/route instead of being crammed into one component |
| **Server-side rendering** | Landing page and SEO pages render on server = Google indexes them = organic discovery |
| **API routes** | Could replace or supplement the Cloudflare Worker for simpler endpoints |
| **Image optimization** | Field themes, player sprites, marketing screenshots — auto-optimized |
| **React Server Components** | Scenario data (644 scenarios) could load server-side, not shipped to every client |
| **Better DX** | Hot module replacement, TypeScript support, built-in linting |

### What Next.js Would NOT Help With

- **The core game loop** — read scenario, pick answer, see feedback. This is pure client-side React. Next.js doesn't make this better.
- **The AI pipeline** — runs on Cloudflare Worker regardless.
- **Graphics/animations** — SVG-based, runs in browser. Framework doesn't matter.
- **Kids liking it more** — kids don't care about the framework. They care about speed, fun, and rewards.

### The Right Sequence

1. **Now: Vite** — Gets rid of Babel, gives a real build step, loads in <2s. Zero architecture change to game code. The 9 src files become ES module imports instead of cat-concatenated. This is a 4-6 hour migration.

2. **Phase 3 (when we need pages): Next.js** — When coach dashboard, parent portal, and landing page are being built, THAT is when Next.js pays off. Those are separate pages with separate concerns. Cramming them into index.jsx is wrong. Next.js file-based routing makes each a clean, independent page.

3. **The migration path is smooth:** Vite → Next.js is straightforward. The React components don't change. The game logic doesn't change. You add `app/` directory, move screens into route files, and the game component becomes `app/play/page.tsx`.

**Bottom line:** Vite gives 90% of the benefit RIGHT NOW with 10% of the effort. Next.js is the right long-term architecture but shouldn't block the immediate work of making the game excellent.

---

## PHASE 1: MAKE THE GAME UNDENIABLE (3-4 weeks)

Blaine is the tester, the validator, and the standard. This phase is about playing the app obsessively and fixing everything that doesn't meet the bar.

### The Testing Protocol

Blaine plays every position. Every difficulty. Every game mode. With the mindset of three people:

1. **Leo (age 8, diff:1)** — Is the language simple enough? Are the explanations clear? Does the coaching voice feel like a real coach talking to a kid? Does the app feel FUN or like homework?

2. **Brooks (age 15, diff:3)** — Are the All-Star scenarios genuinely challenging? Do the explanations teach something a competitive player doesn't already know? Is the BRAIN data being leveraged? Does it feel like it respects his intelligence?

3. **A coach assigning this to a team** — Would Blaine assign this to his own team? What's missing that would make him say "do your 5 BSM plays before practice"? Is the pre-game value obvious?

### What to Fix Based on Blaine's Testing

**Game Feel**
- Is scenario selection smart? (Does spaced repetition work? Does it avoid serving the same concept 3x in a row?)
- Is the coaching voice consistent? (Some explanations are rich with "why," others are generic. These should all feel like Blaine coaching.)
- Does the difficulty progression feel earned? (Rookie → Pro → All-Star should feel like leveling up, not just harder words.)
- Are the animations adding value or just slowing things down?

**AI Quality**
- Play 20+ AI scenarios across 5 positions. Note every scenario that feels wrong, off-topic, or below the handcrafted standard.
- Verify the position-mismatch fix is working (no more batter scenarios for catcher).
- Check: do AI explanations feel as good as handcrafted ones?

**Educational Depth**
- Is the app actually teaching? After 20 plays on a concept, does Blaine feel like a kid would understand it?
- Are the BRAIN concepts being surfaced at the right time?
- Does the Baseball Brain feel useful or like a data dump?

**Polish**
- Every screen, every button, every transition. Anything that feels rough gets noted.
- Mobile experience specifically — this is where kids will use it.

### What to Build Based on Gaps Found

This list will grow from Blaine's testing. But predicted items based on the audit:

1. **Explanation quality pass** — Go through the weakest positions (batter 66%, pitcher 66%, manager 70%) and rewrite explanations that are generic or lack "why" reasoning. This is manual content work, not code.

2. **Coaching voice consistency** — Define 3-5 coaching voice templates (encouragement for right, teaching for wrong, challenge for close). Apply them across all scenarios.

3. **BRAIN integration** — When a scenario touches a concept that has BRAIN data (RE24, count leverage, steal breakeven), surface that data contextually. "This is related to run expectancy — explore in Baseball Brain."

4. **Scenario gaps** — Write scenarios for the 3 zero-coverage concepts (of-wall-play, mound-composure, defensive-substitution). Add 10-15 shortstop/secondBase/thirdBase scenarios to balance the distribution.

5. **Speed and polish** — With Vite in place, ensure every interaction is instant. No jank on mobile. Animations smooth at 60fps.

---

## PHASE 2: MAKE THE SYSTEMS BULLETPROOF (2-3 weeks)

Before anyone else touches this app, the systems need to be solid.

### Testing Foundation

50 Vitest tests covering:
- Scenario structural validation (every scenario has valid structure)
- State machine transitions (HOME → PLAYING → OUTCOME → HOME)
- AI firewall checks (known-good and known-bad scenarios)
- XP/scoring calculations
- Mastery state machine (unseen → introduced → learning → mastered → degraded)

### App Architecture Cleanup

- Extract `useReducer` state machine from the 120 `useState` calls
- Custom hooks: `useSpeedRound()`, `useSurvival()`, `useSeason()`, `useReplay()`
- Screen components: `HomeScreen`, `PlayScreen`, `OutcomeScreen`
- This makes the code maintainable for the features coming in Phase 3-4

### Worker Hardening

- Deploy D1 schema (Pro gating BLOCKER)
- Stripe webhook HMAC verification
- Split into route modules: `ai.js`, `auth.js`, `subscriptions.js`, `middleware.js`
- Basic error monitoring (Sentry)
- Server-side Pro verification (replace client-side spoofable flag)

---

## PHASE 3: THE FEATURES THAT MAKE IT SPECIAL (4-6 weeks)

These are the features that make BSM undeniably better than anything else. The moat.

### Multi-Decision Sequences ("Play Breakdown")

Break one play into 3 steps: "Who cuts?" → "Where does SS throw?" → "Who backs up?" No competitor does this. Tests the CHAIN of decisions, not isolated choices. This is how real baseball works.

### Concept Skill Tree

The prerequisite graph exists in `BRAIN.concepts` (48 concepts). Make it visible — RPG-style skill tree. Lit nodes for mastered, grayed for locked. Kids see progress. Parents see learning. Coaches see gaps.

### Pre-Game Mode

"Playing shortstop today? Here are 5 situations you might see." This is the killer feature for coaches. Position-specific, difficulty-appropriate, served fresh before every game.

### Enforce Prerequisites

Don't show relay scenarios to a player who hasn't mastered cutoff roles. The graph exists — USE it. This transforms BSM from a quiz app into a curriculum.

### Transfer-to-Field Features

- Post-game reflection journal ("What happened today?")
- Physical drill links (30-second videos — Blaine can record these himself)
- "Next time you see this in a game, notice..." prompts after mastering a concept

---

## PHASE 4: SHIP IT (2-3 weeks)

NOW it's ready. The app meets Blaine's standard. Every position, every difficulty, every game mode has been tested by someone who knows baseball at a high level. The systems are solid. The features are unique.

### Coach Distribution

- Blaine gives it to his own teams first (Brooks's team, Leo's team, SGS, Oilers)
- One coach who loves it tells 5 more coaches
- LAUNCH_KIT.md outreach messages go out to the league

### Coach Dashboard (Simplified)

Team codes (KV, no accounts needed). Aggregate stats. "Concepts to practice this week." This is what makes a coach ASSIGN BSM as pre-game homework.

### Weekly Parent Email

Concept trends, session time, position strengths. The distribution loop: coach assigns → kid plays → parent sees progress → parent pays for Pro.

### Landing Page

Real page with screenshots, social proof from Blaine's teams, CTA. SEO for "baseball strategy app for kids."

---

## WHAT SHOULD BE DELETED

| Category | Files | Why |
|----------|-------|-----|
| Abandoned Next.js scaffold | `src/app/`, `src/lib/`, `prisma/`, unused npm deps | Not the current app. Will rebuild properly in Phase 3 if needed |
| Session prompts | 17 `CLAUDE_CODE_PROMPT_*.md` files | Instructions, not docs. Live in Obsidian vault |
| AI evolution docs | 9 `AI_*.md` files | Superseded by current pipeline + CLAUDE.md |
| One-time audit/fix plans | 20+ planning/QA docs | Historical. Captured in ROADMAP.md |
| 70B artifacts | `phase1-finetune/`, test scripts | Deferred per architecture strategy |
| Binary docs | `.docx` files | Don't belong in git |

**Keep only:** CLAUDE.md, ROADMAP.md, SCENARIO_BIBLE.md, BRAIN_KNOWLEDGE_SYSTEM.md, IDEAS_AND_INSIGHTS.md, BSM_PROJECT_CONTEXT.md, ARCHITECTURE_STRATEGY.md

## WHAT SHOULD BE REDONE

| Item | Current | Should Be | Why |
|------|---------|-----------|-----|
| Build system | CDN Babel in browser (10-20s) | Vite now, Next.js when pages needed | Load time kills testing AND first impressions |
| App state | 120 useState calls | useReducer + custom hooks | Can't add features safely to current structure |
| Worker | 4,392-line monolith | 4 route modules | Can't test, can't maintain |
| Repo docs | 85 markdown files | 7 living docs + Obsidian vault | Noise overwhelms signal |
| Pro gating | Client-side spoofable | Server-verified | Must work before charging money |
| Explanation quality | Uneven (batter 66%, pitcher 66%) | Consistent coaching voice across all positions | Content quality IS the product |

---

## THE REVISED SEQUENCE

```
Phase 0 (this weekend)     → Fast app, clean repo, proper build
Phase 1 (3-4 weeks)        → Blaine plays obsessively, fixes everything
Phase 2 (2-3 weeks)        → Systems hardened, code cleaned, tests added
Phase 3 (4-6 weeks)        → Features that make BSM undeniable (multi-decision, skill tree, pre-game)
Phase 4 (2-3 weeks)        → Ship to teams, coaches, parents
```

Total: ~12-16 weeks to a product Blaine is proud to hand to every coach in Louisiana.

---

## VERIFICATION

- **Phase 0:** App loads in <2s on Blaine's phone. Repo has 7 docs, not 85.
- **Phase 1:** Blaine has played 100+ scenarios across all positions and difficulties. Every issue noted is fixed. AI scenarios feel as good as handcrafted.
- **Phase 2:** Test suite passes. State machine has named transitions. Worker endpoints tested. D1 schema deployed.
- **Phase 3:** Multi-decision sequences playable. Skill tree visible. Pre-game mode works for "playing shortstop today."
- **Phase 4:** 50 users from Blaine's teams. Day-2 retention measured. First coach says "my team loves this."
