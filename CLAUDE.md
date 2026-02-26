# Baseball Strategy Master

## What This Is
An educational web app that teaches baseball strategy to kids (ages 6-18) through interactive decision-making scenarios. Players pick a position (pitcher, catcher, infielder, outfielder, batter, baserunner, manager — 15 categories total), face a realistic game situation, choose from 4 options, and get immediate color-coded feedback explaining WHY their choice was good or bad. Includes season mode, survival mode, speed round, daily diamond, and AI-generated scenarios.

## Tech Stack
- **Single-file React app** (`index.jsx`, ~4,970 lines)
- Renders via `preview.html` with CDN React + Babel, or as a Claude.ai artifact
- No build tools, no bundler — just one file with everything
- Uses React hooks (useState, useEffect, useCallback, useRef)
- SVG-based baseball field visualization (inline in React, 10 themes)
- Web Audio API for sound effects (no audio files)
- localStorage for persistence (key: `bsm_v5`)
- xAI Grok API for AI-generated scenarios via Cloudflare Worker proxy (`worker/`)

## File Structure
```
index.jsx          — The entire app (~4,970 lines)
preview.html       — Loads index.jsx with CDN React + Babel
worker/
  index.js         — Cloudflare Worker proxy for xAI API
  wrangler.toml    — Worker deployment config
SCENARIO_BIBLE.md  — Scenario quality framework
ROADMAP.md         — Master project roadmap
CLAUDE.md          — This file
```

### index.jsx layout (approximate ranges)
```
Lines 1-10:         Imports and header
Lines 11-2800:      SCENARIOS object (460 handcrafted scenarios across 15 categories)
Lines 2800-2870:    Position metadata, field themes, achievements
Lines 2870-2920:    DEFAULT state object, position suggestions, difficulty graduation
Lines 2920-3050:    Helper functions: sound system, generateAIScenario(), spaced repetition
Lines 3050-3200:    Field() component (SVG baseball field + 15 animations, 10 themes)
Lines 3200-3260:    Board() component (scoreboard display)
Lines 3260-4970:    Main App() component (game state, UI, all screens)
```

## Key Architecture Decisions
1. **Single file** — Intentional. Designed for easy iteration. Don't split into multiple files.
2. **Handcrafted scenarios first** — 460 scenarios with carefully tuned difficulty, explanations, and success rates. AI scenarios supplement these, they don't replace them.
3. **Cloudflare Worker as AI proxy** — API key stored as Worker secret, never exposed to browser. Free tier covers 100K requests/day.
4. **localStorage persistence** — Player progress, achievements, settings, and stats persist in the browser (key: `bsm_v5`).
5. **Pro gating client-side** — `stats.isPro` in localStorage. Known spoofable; acceptable at current scale. Server-side verification planned for Phase 3.

## Game Mechanics
- **15 position categories**: pitcher, catcher, firstBase, secondBase, shortstop, thirdBase, leftField, centerField, rightField, batter, baserunner, manager + famous, rules, counts
- **3 difficulty levels**: Rookie (diff:1), Pro (diff:2), All-Star (diff:3)
- **Scoring**: Points based on choice quality x difficulty multiplier
- **Feedback colors**: GREEN (optimal choice), YELLOW (acceptable), RED (poor)
- **Each scenario has**: 4 options, 1 best answer, 4 explanations, 4 success rates, a concept, an animation type
- **Progression**: XP -> level ups -> season stages (Rookie through Hall of Fame)
- **Prestige**: After Hall of Fame, restart with +10% XP bonus per season
- **Free tier**: 8 plays/day, Daily Diamond exempt
- **Pro tier**: Unlimited plays, AI scenarios, all themes/avatar, streak freeze, 2x XP

## AI Integration
- Uses xAI Grok (`grok-4-1-fast`) via Cloudflare Worker proxy
- Worker URL: `AI_PROXY_URL` constant in index.jsx
- Sends player context: level, position accuracy, mastered concepts, recent wrong answers
- Has `x_search` tool enabled for real-time X/Twitter baseball data
- Triggers: "AI Coach's Challenge" button (Pro only) or when scenarios exhausted
- Purple "AI" badge shown during AI-generated scenarios
- 15-second timeout with cancel button and fallback to handcrafted
- JSON validation on AI response — falls back gracefully on invalid output

## Field Visualization
- SVG-based, fan-shaped broadcast angle
- 10 themes: Classic, Night, Sunny, Dome, Retro, Spring Training, World Series, Sandlot, Winter Classic, All-Star Game
- Pose-aware player sprites using `Guy()` component (6 poses: pitcher/catcher/batter/infielder/outfielder/runner)
- Key coordinates: Home(200,290) 1B(290,210) 2B(200,135) 3B(110,210) Mound(200,218)
- 15 animation types: steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze

## Scenario Counts (460 total)
```
pitcher:59  batter:58  baserunner:57  manager:58  catcher:30
firstBase:20  secondBase:21  shortstop:22  thirdBase:21
leftField:21  centerField:22  rightField:21
famous:20  rules:18  counts:18
```

## Key State Fields (DEFAULT object)
- `gp`: games played, `ds`: daily streak, `bs`: best streak
- `cl`: completed scenario IDs, `lv`: current level, `xp`: experience points
- `isPro`, `proExpiry`, `proPlan`: subscription state
- `avatarJersey`, `avatarCap`, `avatarBat`: avatar customization indices
- `season`: prestige season number
- `theme`: field theme name
- `wrongCounts`: per-scenario wrong answer tracking (spaced repetition)
- `diffGrad`: per-position difficulty graduation for ages 6-8
- `lastStreakFreezeDate`: Pro streak freeze tracking
- `funnel`: conversion event tracking array
- `firstPlayDate`, `lastPlayDate`, `sessionCount`: analytics
- `tutorialDone`: first-play tutorial completion flag

## Monetization (Phase 2)
- **Upgrade panel**: Parent-gated (random math problem, sessionStorage)
- **Stripe Payment Links**: Monthly ($4.99) and yearly ($29.99) — URLs in index.jsx
- **Pro gating**: themes (3 free / 7 locked), avatar (2/2/1 free), coach mascot, AI, streak freeze, 2x XP
- **Conversion funnel**: 5 touchpoints tracked via `trackFunnel()`

## Common Tasks
- **Add a new scenario**: Add an object to the appropriate position array in SCENARIOS. Follow `SCENARIO_BIBLE.md` format.
- **Change field visuals**: Edit the Field() function (SVG elements)
- **Modify game logic**: Edit the App() function's state management and handlers
- **Adjust AI behavior**: Edit generateAIScenario() and the system prompt
- **Update AI proxy**: Edit `worker/index.js`, deploy with `cd worker && npx wrangler deploy`
- **Preview locally**: `npx serve .` then open localhost:3000/preview

## GitHub
- Repo: https://github.com/blainelafleur/Basebeball-strategy-claude
- Main file: index.jsx
- Deploy target: Replit (https://baseball-strategy-master-blafleur.replit.app/)

## Style Preferences
- Use simple, everyday language in commit messages and comments
- Keep code compact but readable — this is a single-file app, space matters
- Prefer inline styles in React over external CSS (artifact compatibility)
- Use descriptive variable names for game logic, short names for SVG coordinates
