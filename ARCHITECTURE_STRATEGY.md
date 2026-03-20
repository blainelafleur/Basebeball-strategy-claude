# BSM Architecture Strategy
## Deep Dive on N1 (Single-File Ceiling), N2 (Real-Time Infrastructure), N3 (70B Model)

**Date:** 2026-03-20
**Status:** Strategic Plan — Ready for Discussion

---

## Executive Summary

Three architecture notes from the thought partner agent reveal an interconnected opportunity. The single-file ceiling (N1) is solvable with a zero-risk `cat` build step that removes 56% of lines. Real-time infrastructure (N2) via Cloudflare Durable Objects enables a Kahoot-style "Live Coaching" feature that turns every coach into a distribution channel — and you already have 80% of the backend built. The 70B model (N3) is a long-term asset that becomes valuable once scale demands it, but Opus is the right choice now.

These three aren't separate projects. They're one architectural evolution:
- **Extraction** makes the codebase workable for the features ahead
- **Real-time** makes BSM a social product, not just a solo quiz app
- **BRAIN exploration** surfaces data that's already in the code but invisible to players
- **The 70B** becomes the cost optimization layer once user scale justifies dedicated GPU hosting

**The punchline:** BSM is sitting on 30% of BRAIN data that players never see, team infrastructure that's 80% built, and a file structure that a 3-line shell script could dramatically improve. The next phase isn't about building new things — it's about activating what's already there, growing users with Opus AI quality, and deferring the 70B until scale makes it economical.

---

# N1: THE SINGLE-FILE CEILING

## The Problem

`index.jsx` is 17,936 lines (2.44 MB). The actual pain points:

| Problem | Severity | Who It Hurts |
|---------|----------|-------------|
| Babel transpilation in browser: 3-6s on laptop, 10-20s on phone | **Critical** | Every user, every page load |
| Navigation: searching "cutoff" hits scenarios, maps, rules, UI | High | Developer experience |
| Claude Code context: ~600-700K tokens just for the file | High | AI-assisted development |
| Find-and-replace collisions (common baseball terms) | Medium | Developer experience |
| Merge conflicts if anyone else contributes | Blocker (future) | Collaboration |

Things that are NOT problems: Cloudflare Pages (25 MB limit, we're at 2.44), gzip transfer (~300 KB compressed), runtime performance (React handles it fine).

## What's Inside (Measured, Not Guessed)

| Section | Lines | % of File | Pure Data? | Extraction Risk |
|---------|-------|-----------|-----------|-----------------|
| SCENARIOS (644 scenarios) | 4,246 | 23.7% | Yes | Near-zero |
| App component (all UI screens) | 3,992 | 22.2% | No | Cannot extract alone |
| AI Pipeline (generation + quality) | ~3,400 | 19.0% | No | Medium-high |
| Brain API functions | ~1,005 | 5.6% | No | Low-medium |
| Field + animations | ~975 | 5.4% | No | Low |
| AI Situation + Pool Mgmt | ~690 | 3.8% | No | Medium |
| Config/meta constants | ~530 | 3.0% | Mostly | Low |
| SITUATION_SETS | 505 | 2.8% | Yes | Near-zero |
| KNOWLEDGE_MAPS (28 maps) | 476 | 2.7% | Yes | Near-zero |
| OPTION_ARCHETYPES | 525 | 2.9% | Yes | Near-zero |
| BRAIN constant | 458 | 2.6% | Yes | Near-zero |
| Everything else | ~1,134 | 6.3% | Mixed | Varies |

## The Solution: `cat`-Based Build

A 3-line shell script gives us multi-file development with zero tooling:

```bash
#!/bin/bash
# build.sh — concatenate source files into deployable index.jsx
cat src/_header.js src/scenarios.js src/situation-sets.js \
    src/knowledge-maps.js src/brain-data.js src/brain-api.js \
    src/ai-pipeline.js src/field.js src/app.js > index.jsx
```

**What this preserves:**
- Artifact compatibility (output is one file with `export default function App()`)
- preview.html workflow (still loads index.jsx with CDN Babel)
- Zero npm, zero node_modules, zero bundler
- Cloudflare Pages deployment (same file)

**What this fixes:**
- Dev experience: edit `src/scenarios.js` instead of navigating 17K lines
- Search scoping: "cutoff" in `src/knowledge-maps.js` only hits maps
- AI context: Claude reads only the files it needs
- Collaboration: separate files = clean merges

## Extraction Order (Phase by Phase)

### Phase A: Pure Data (5,700 lines removed, near-zero risk)
Extract pure data objects that have zero outward dependencies:

| File | Contents | Lines | Dependencies |
|------|----------|-------|-------------|
| `src/scenarios.js` | SCENARIOS object | 4,246 | None |
| `src/situation-sets.js` | SITUATION_SETS | 505 | None |
| `src/knowledge-maps.js` | 28 maps + MAP_RELEVANCE + MAP_AUDIT | 536 | None |
| `src/brain-data.js` | BRAIN constant | 458 | None |
| **Total** | | **5,745** | |

**Result:** index.jsx drops from 17,936 to ~12,200 lines. Dev file is 32% smaller. Zero functional changes.

### Phase B: Logic Modules (4,400 more lines, low-medium risk)
Extract functions and components with well-defined boundaries:

| File | Contents | Lines | Risk |
|------|----------|-------|------|
| `src/brain-api.js` | Brain API functions + formatBrain* | ~1,200 | Low (reads BRAIN, no circular deps) |
| `src/ai-pipeline.js` | AI generation + quality firewall | ~3,400 | Medium (many cross-references) |
| **Total** | | **~4,600** | |

**Result:** index.jsx drops to ~7,600 lines (Field + App + helpers). This is where most active development happens.

### Phase C: Components (975 more lines, low risk)
| File | Contents | Lines | Risk |
|------|----------|-------|------|
| `src/field.js` | Field() + ANIM_DATA + AnimPhases + Board() | ~975 | Low (React.memo, props-only) |

**Result:** index.jsx is ~6,600 lines — the App component + helpers only.

### Total Impact

| Phase | Lines in index.jsx | Reduction | Risk |
|-------|-------------------|-----------|------|
| Current | 17,936 | — | — |
| After Phase A | ~12,200 | -32% | Near-zero |
| After Phase B | ~7,600 | -58% | Low-medium |
| After Phase C | ~6,600 | -63% | Low |

**Recommendation:** Do Phase A now (1-2 hours, zero risk). Phase B when starting real-time features or BRAIN exploration. Phase C anytime.

---

# N3: THE 70B MODEL — DEFERRED (Long-Term Asset)

## Current Decision: Stick With Opus

**Status:** The 70B is a trained asset on HuggingFace, not an active system. We're keeping Opus as primary and Grok as fallback for now. Here's why.

## Why Not Now

### 1. Hosting Economics Don't Work at Current Scale
A custom 137GB model can't run on serverless inference (Together.ai, Fireworks). It requires a **dedicated GPU endpoint** — an H100 or A100 running 24/7:

| Hosting Option | Monthly Cost | Break-Even vs Opus |
|---------------|-------------|-------------------|
| Together.ai dedicated H100 | ~$3,000-4,300/mo | ~700+ AI scenarios/day |
| RunPod A100 80GB | ~$1,073/mo | ~260+ AI scenarios/day |
| Vast.ai A100 (spot) | ~$800-1,200/mo | ~200+ AI scenarios/day |

At soft launch with 10-50 AI scenarios/day, **dedicated hosting costs 10-50x more than just paying Opus per-call.** The 70B only becomes cheaper when daily volume consistently exceeds 200-700 scenarios/day (depending on provider), which requires hundreds of active Pro users.

### 2. Quality Blind Spots
The training data has thin coverage in key areas:

| Category | Training Scenarios | Risk |
|----------|-------------------|------|
| famous | 21 | High — may hallucinate historical details |
| counts | 28 | Medium — limited count-based reasoning examples |
| rules | 40 | Medium — rule citations need precision |
| of-wall-play, mound-composure, defensive-substitution | 0 each | Cannot generate these at all |

Opus reasons from general knowledge and multi-agent quality gates. The 70B can only pattern-match what it saw. During the critical first-impression phase, quality is more important than cost.

### 3. Ops Burden
Dedicated hosting means: monitoring uptime, managing GPU availability, handling cold starts, scaling up/down, another vendor relationship, another failure mode. For a solo developer at pre-PMF, this is distraction from growth work.

## What Opus Gives Us Right Now

- **Proven quality:** 9.59/10 avg critique score, 96% pass rate across all 15 positions
- **Zero infrastructure:** Pay per call, no servers to manage
- **Clean fallback chain:** Opus → Grok → handcrafted pool
- **Affordable at current scale:** ~$4/day at 30 AI scenarios/day = ~$120/month

## Training Details (For Reference)

- **Base:** Llama-3.1-70B-Instruct
- **Method:** QLoRA (r=32, alpha=64), 3 epochs, 7h 23m
- **Data:** 739 SFT combined + 120 golden (3x weighted) = ~1,099 effective examples
- **Metrics:** Train loss 0.6439, eval perplexity 1.605
- **DPO:** Failed (config issue), 108 pairs available for retry
- **Location:** https://huggingface.co/blafleur/bsm-70b-sft (~137GB, 3 shards)
- **Worker wiring:** `LLM_70B_URL`, `LLM_70B_API_KEY`, `LLM_70B_MODEL` secrets already defined in worker code

## When to Revisit the 70B

The trigger is **cost pressure at scale**, not optimization desire:

| Signal | What It Means | Action |
|--------|-------------|--------|
| 200+ AI scenarios/day sustained | Opus costs ~$800+/month | Evaluate dedicated hosting ROI |
| 500+ Pro subscribers | Revenue justifies infrastructure | Deploy on cheapest viable GPU host |
| Training data doubles (2,000+ examples) | Blind spots shrink significantly | Retrain with expanded data + DPO |
| Serverless providers support custom 70B | Economics flip dramatically | Re-evaluate serverless deployment |

**Every Opus-generated scenario served today is future training data.** The 70B gets better with time — and cheaper to justify.

## Features That Were "70B-Dependent" — Revised Approach

These features don't require the 70B. They can run on Opus at higher cost, gated to Pro users or rate-limited:

| Feature | On Opus | Cost | Approach |
|---------|---------|------|----------|
| Free-response evaluation | Works, higher cost | ~$0.05/eval | Pro-only, 3 per session max |
| Baseball Brain Chat | Works, higher cost | ~$0.07/message | Pro-only, 10 messages/day cap |
| Coach personas | Can be template-based | Free | Use BRAIN.coaching.situational templates, no AI call needed |
| Explanation simplification | Can be pre-generated | ~$0.05/call | Batch-generate for all 644 scenarios once, store results |
| Seasonal content drops | Works with Opus | ~$27/month for 50 | Already affordable, run monthly |

The key insight: **coach personas and explanation simplification don't actually need AI at all.** Templates and batch pre-generation solve them. Free-response and chat are Pro-only features that justify their per-call cost.

---

# N2: REAL-TIME INFRASTRUCTURE

## The Discovery: You're 80% There

The worker already has team infrastructure built:
- `POST /team/create` — coach creates team with code
- `POST /team/join` — player joins with code + playerHash
- `POST /team/sync` — player uploads stats
- `GET /team/report` — coach sees aggregate stats, weak/strong concepts
- `POST /challenge/create` + `POST /challenge/accept` — async friend challenges

**What's missing is the client-side UI and the WebSocket push layer.**

## Why Cloudflare Durable Objects

BSM is already all-in on Cloudflare (Pages, Workers, D1, KV, Vectorize, Workers AI). DOs are the natural next step:

| Feature | DOs Give You |
|---------|-------------|
| WebSocket support | First-class, with Hibernation API (idle = free) |
| Per-room state | Each game room is its own DO with SQLite |
| Auto-scaling | Create one DO per room, Cloudflare handles routing |
| Pricing | Negligible: 50 teams × 15 players = well within free tier |
| Ecosystem | Same Worker code, same D1/KV, same deploy pipeline |

**Cost estimate at scale:** Even 500 weekly coaching sessions with 15 players each stays under $1/month in DO charges. WebSocket Hibernation makes idle rooms essentially free.

## The Killer Feature: Live Coaching (Kahoot Model)

```
1. Coach taps "Start Live Session"
2. 6-digit room code appears (like Kahoot's PIN)
3. Players enter code + pick nickname — NO ACCOUNT NEEDED
4. Coach sees lobby as players join
5. Coach picks scenario (or concept/position, system picks)
6. All players see same scenario simultaneously
7. Players answer → coach sees live bar chart filling up
8. Results shown → coach discusses → next scenario
```

**Why this is the growth lever:**
- One coach = 15 players = 30 parents seeing their kid excited about baseball learning
- Travel ball coaches run 2-hour practices — 15 minutes of "BSM Classroom" becomes routine
- Kahoot proved this: the host model made quiz games go viral in education
- BSM does what Kahoot can't: explain WHY, adapt difficulty, track concept mastery

**Critical insight: NO ACCOUNTS NEEDED.** Room codes are the auth. Player results link to their existing `playerHash`. This means Live Coaching can ship before Phase 2.7 (User Accounts).

## Competitive Positioning

| Platform | What BSM Learns | What BSM Does Better |
|----------|----------------|---------------------|
| **Kahoot** | Room codes, host controls pacing, lobby excitement | Explains WHY (not just right/wrong), adapts difficulty |
| **Gimkit** | Economy layer, team modes, game variety | Deep domain content (644+ scenarios), AI generation |
| **Blooket** | Metagame wrapping, visual rewards, homework mode | Real strategic thinking (not just recall), baseball niche |

## Build Order

### Step 0: Team Leaderboards (No new infrastructure — 2-3 days)
- Client UI for within-team leaderboard
- Auto-sync on scenario completion
- Weekly reset via cron job
- **Why first:** Validates coaches actually use team features. Zero infrastructure risk.

### Step 1: Live Coaching MVP (First Durable Object — 1-2 weeks)
- `GameRoom` DO class with WebSocket Hibernation
- Worker endpoints: `POST /session/create`, `GET /session/ws`
- Client: "Start Live Session" (coach), "Join Session" (player)
- Lobby → push scenario → collect answers → show results
- **Scope:** One scenario at a time, coach manually advances, no timer

### Step 2: Enhanced Live Coaching (1 week)
- Countdown timer (15s / 30s / 60s, coach-configurable)
- "Concept drill" mode (5 scenarios in sequence)
- Session summary + results written to D1

### Step 3: Head-to-Head Multiplayer (2 weeks)
- Matchmaking by age group + adaptive difficulty
- Best-of-5 format
- Score = correctness (70%) + speed (30%) — not pure speed race
- Age-gated: 11+ only (younger players shouldn't feel rushed)

### Step 4: Coach Dashboard (1 week)
- Real-time player status during live sessions
- Push encouragement to individual players
- Concept mastery heatmap
- Historical session reports

---

# THE HIDDEN GEM: BRAIN IS UNDERLEVERAGED

## 30% of BRAIN Data is Orphaned

The BRAIN constant contains 458 lines of deeply sourced baseball analytics. But ~30% of it is defined and never read by any function:

| Orphaned Data | Lines | What It Could Power |
|---------------|-------|-------------------|
| `parkAndEnvironment` | ~30 | Park factor explorer, wind arrows on field |
| `catcherFramingValue` | ~12 | Catcher-specific feedback, framing visualization |
| `leagueTrends` | ~30 | Historical context, "the game is changing" lessons |
| `stealWindow` (delivery/pop time bands) | ~8 | Steal calculator, timing visualization |
| `pitchCountMatrix` (wOBA by bucket × TTO) | ~15 | Pitch count gauge, fatigue teaching |
| `pitchClockViolations` | ~8 | Clock strategy scenarios |
| `pitchCountThresholds.youthByAge` | ~6 | Age-specific pitch limit education |
| `matchupMatrix.leverageIndex` | ~5 | Leverage meter, clutch teaching |
| `getMatchupData()` (complete function, zero callers) | ~20 | Matchup meter before each scenario |

**The irony:** This orphaned data is exactly what would make the app stickier. Park factors, pitch counts, steal windows, matchup meters — these are "discovery features" that keep engaged users exploring beyond the quiz loop.

## "Baseball Brain" — Viable With Zero New Data

Four tabs, each using existing BRAIN data:

### 1. RE24 Explorer
- Drag runners onto bases, select outs
- See "Expected Runs: 1.56" change live
- "What if?" buttons: Bunt (-0.23), Steal (need 72%), Single (+0.62)
- Age-adaptive: 6-8 see "Your team will probably score 1.5 runs!" / 12+ see "Run Expectancy: 1.56"

### 2. Count Dashboard
- Tap any count → see BA, K%, BB%, pitcher/batter recommendations
- Progression arrows: "If strike → 0-1 (.300 BA). If ball → 1-0 (.345 BA)"
- Count-to-count transitions teach patience and plate discipline

### 3. Pitch Lab
- 8 pitch types with velocity, movement, run value
- Best/worst counts per pitch
- Sequencing rules: "After fastball, changeup is most effective because..."
- Eye-level principle visualization

### 4. Concept Map (Skill Tree)
- Visual prerequisite tree of all 76 concepts
- Color-coded by mastery state (unseen / learning / mastered / degraded)
- Tap to see prereqs, age minimum, domain
- "Master 'Count Leverage' to unlock 'Two-Strike Approach'"

**Estimated effort:** 200-300 lines for RE24 Explorer + Count Dashboard. 150-200 lines for Concept Map. Uses existing BRAIN data, no backend changes.

**Future enhancement:** A "Baseball Brain Chat" tab powered by Opus (Pro-only, rate-limited) or eventually the 70B model lets kids ask questions about any of this data conversationally. "Why is a 3-1 count so good for hitters?" The interactive tabs above work without any AI calls.

---

# UNIFIED EXECUTION PLAN

## How These Notes Connect

```
N1 (Extraction) ──enables──→ Better DX for all features below
      │
      ├──enables──→ BRAIN Exploration (Baseball Brain tabs, orphaned data activation)
      │                    │
      │                    └──enables──→ Deeper engagement, stickier product
      │
      └──enables──→ N2 (Real-Time)
                        │
                        ├──→ Team Leaderboards ──validates──→ Coach engagement
                        │
                        ├──→ Live Coaching (Kahoot model) ──drives──→ User acquisition
                        │
                        └──→ Head-to-Head ──drives──→ User retention

N3 (70B) ──deferred──→ Revisit when daily AI volume > 200 scenarios
                        (every Opus scenario served today = future training data)
```

Extraction makes the codebase workable. BRAIN exploration gives depth. Real-time makes it social. Opus keeps quality high while we grow.

## Recommended Execution Order

### Sprint 1: Foundation (Week 1)
**Goal:** Remove architectural debt, activate hidden BRAIN data

| Task | Time | Risk | Impact |
|------|------|------|--------|
| Phase A extraction (SCENARIOS, maps, BRAIN → src/) | 2 hours | Near-zero | 32% smaller dev file |
| Create build.sh, verify index.jsx output identical | 30 min | Zero | Enables multi-file dev |
| Wire orphaned BRAIN data into enrichFeedback | 2 hours | Low | Richer post-answer insights |
| Activate getMatchupData() in coaching lines | 1 hour | Low | Platoon awareness |
| Batch-generate explSimple for all 644 scenarios (Opus, one-time) | 2 hours | Low | Age-appropriate explanations everywhere |

### Sprint 2: Baseball Brain (Week 2)
**Goal:** Surface BRAIN data as interactive exploration features

| Task | Time | Risk | Impact |
|------|------|------|--------|
| Build RE24 Explorer tab | 4 hours | Low | BRAIN data visible to players |
| Build Count Dashboard tab | 3 hours | Low | Count mastery teaching |
| Build Pitch Lab tab | 3 hours | Low | Pitch type education |
| Build Concept Map (visual skill tree) | 4 hours | Low | Progress visualization, goal-setting |
| Coach persona templates (no AI, use BRAIN.coaching) | 2 hours | Low | Personalized feel, zero cost |

### Sprint 3: Social Foundation (Week 3)
**Goal:** Ship team leaderboards, validate coach engagement

| Task | Time | Risk | Impact |
|------|------|------|--------|
| Client-side team UI (join, view, leaderboard) | 2 days | Low | Team feature live |
| Auto-sync on scenario completion | 2 hours | Low | Leaderboards stay current |
| Weekly leaderboard reset (cron) | 1 hour | Low | Fresh competition weekly |
| Coach report UI (weak concepts, team trends) | 1 day | Low | Coach value proposition |

### Sprint 4: Real-Time (Weeks 4-5)
**Goal:** Ship Live Coaching MVP

| Task | Time | Risk | Impact |
|------|------|------|--------|
| GameRoom Durable Object (WebSocket + Hibernation) | 2 days | Medium | Core infrastructure |
| Worker session endpoints (create, ws) | 1 day | Low | Room code system |
| Client lobby + join screens | 1 day | Low | Player experience |
| Coach push → player receive → tally answers | 2 days | Medium | Core game loop |
| Session summary + D1 persistence | 1 day | Low | Results survive session |

### Sprint 5: Depth (Weeks 5-6)
**Goal:** Features that differentiate BSM from every competitor

| Task | Time | Risk | Impact |
|------|------|------|--------|
| Free-response evaluation mode (Opus, Pro-only, 3/session) | 3 days | Medium | Depth beyond multiple-choice |
| Baseball Brain Chat (Opus, Pro-only, 10 msg/day cap) | 2 days | Medium | Conversational learning |
| Enhanced Live Coaching (timer, drill mode, session summary) | 3 days | Low | Polished coach experience |
| Coach dashboard (live player status, push encouragement) | 2 days | Low | Coach retention tool |

### Sprint 6: Growth (Weeks 6-8)
**Goal:** Head-to-head multiplayer + competitive features

| Task | Time | Risk | Impact |
|------|------|------|--------|
| Matchmaking queue DO (by age group + adaptive level) | 2 days | Medium | Multiplayer infrastructure |
| Head-to-head game room (best-of-5) | 3 days | Medium | Competitive play |
| Age-gated: 11+ only, score = 70% correctness + 30% speed | 1 day | Low | Fair competition |
| Post-match review (explanation walkthrough) | 1 day | Low | Learning from competition |
| Historical session reports for coaches | 2 days | Low | Long-term coach value |

---

## Cost Projections

### AI Costs (Opus-only, current architecture)
| Users | AI Scenarios/day | Monthly AI Cost |
|-------|-----------------|----------------|
| 10 Pro | 80 | $326 |
| 100 Pro | 800 | $3,264 |
| 1,000 Pro | 8,000 | $32,640 |

### AI Costs With New Features (Opus, rate-limited)
| Users | AI Scenarios + Pro Features/day | Monthly Cost | Notes |
|-------|--------------------------------|-------------|-------|
| 10 Pro | 80 scenarios + 50 chat/eval | $350 | +$24/mo for chat + free-response |
| 100 Pro | 800 scenarios + 500 chat/eval | $3,500 | +$236/mo |
| 1,000 Pro | 8,000 scenarios + 5,000 chat/eval | $35,000 | Consider 70B at this scale |

### When 70B Becomes Worth It
| Trigger | Daily AI Volume | Monthly Opus Cost | 70B Hosting Cost | Action |
|---------|----------------|-------------------|------------------|--------|
| Not yet | <200/day | <$800/mo | $1,000-3,000/mo | Stay on Opus |
| **Break-even** | **200-700/day** | **$800-2,800/mo** | **$1,000-3,000/mo** | **Evaluate** |
| Clear win | >700/day | >$2,800/mo | $1,000-3,000/mo | Deploy 70B |

### Real-Time Infrastructure
| Scale | Monthly DO Cost |
|-------|----------------|
| 50 teams, weekly sessions | < $1 |
| 500 teams, weekly sessions | ~$2 |
| 5,000 teams, weekly sessions | ~$15 |

Real-time is essentially free at educational scale.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Durable Objects learning curve | Low | Medium | Start with simple GameRoom, iterate |
| File extraction breaks something | Very Low | Low | `diff` output vs original before deploying |
| Coaches don't use team features | Medium | High | Ship leaderboards first to validate before investing in DOs |
| Babel transpilation still slow after extraction | Certain | Medium | Extraction helps dev, not end-user; real fix is build step with pre-transpilation |
| Opus costs grow faster than revenue | Medium | High | Rate-limit Pro features; 70B is the escape valve at scale |
| Baseball Brain tabs feel disconnected from core loop | Low | Medium | Link concepts from quiz explanations to Brain tabs; "Learn more" deep links |
| Free-response evaluation quality inconsistent | Medium | Medium | Start with grading against existing 4 options, not open-ended evaluation |
| Live Coaching session stability | Medium | Medium | Keep sessions simple (one scenario at a time), add complexity incrementally |

---

## Decision Points

Before starting, these need your input:

1. **Extraction timing:** Do Phase A now (2 hours, zero risk), or wait?

2. **Team leaderboards scope:** Minimal (just rankings) or full (weekly MVP, concept trends, coach insights)?

3. **Live Coaching priority:** Near-term build or "once we have users"? Depends on whether coaches are the go-to-market strategy.

4. **Baseball Brain scope:** All 4 tabs together (RE24 + Count + Pitch + Concept Map), or start with 1-2?

5. **Free-response / Chat model:** Use Opus with rate limits (Pro-only, capped), or defer entirely until 70B is viable?

---

*This document synthesizes findings from 4 specialized analysis agents examining the codebase, external pricing data, competitive landscape, and architectural patterns. All line numbers reference index.jsx as of 2026-03-20. Updated to reflect decision to stay on Opus and defer 70B deployment until scale justifies dedicated GPU hosting.*
