# Baseball Strategy Master

## What This Is
An educational web app that teaches baseball strategy to kids (ages 6-18) through interactive decision-making scenarios. Players pick a position (pitcher, batter, fielder, baserunner, manager), face a realistic game situation, choose from 4 options, and get immediate color-coded feedback explaining WHY their choice was good or bad.

## Tech Stack
- **Single-file React app** (`index.jsx`, ~1134 lines)
- Renders as a `.jsx` artifact in Claude.ai, or can be deployed standalone
- No build tools, no bundler — just one file with everything
- Uses React hooks (useState, useEffect, useCallback, useRef)
- SVG-based baseball field visualization (inline in React)
- Web Audio API for sound effects
- localStorage for persistence (progress, achievements, settings)
- Claude API integration for AI-generated scenarios (called from the browser)

## File Structure
Everything lives in `index.jsx`. The file is organized as:
```
Lines 1-7:      Imports and header
Lines 8-370:    SCENARIOS object (57 handcrafted scenarios across 5 positions)
Lines 371-420:  ACHIEVEMENTS array (18 achievements)
Lines 421-548:  Helper functions, sound system, AI integration
Lines 549-706:  Field() component (SVG baseball field + 15 animations)
Lines 707-740:  Board() component (scoreboard display)
Lines 741-790:  Onboarding/position selection UI components
Lines 791-1134: Main App() component (game state, UI, logic)
```

## Key Architecture Decisions
1. **Single file** — This is intentional. It's designed to work as a Claude.ai artifact and be easy to iterate on. Don't split it into multiple files.
2. **Handcrafted scenarios first** — 57 scenarios with carefully tuned difficulty, explanations, and success rates. AI scenarios supplement these, they don't replace them.
3. **No backend** — Everything runs client-side. The only external call is to Claude API for AI scenario generation.
4. **localStorage persistence** — Player progress, achievements, settings, and stats all persist in the browser.

## Game Mechanics
- **5 positions**: pitcher, batter, fielder, baserunner, manager
- **3 difficulty levels**: Rookie (diff:1), Pro (diff:2), All-Star (diff:3)
- **Scoring**: Points based on choice quality × difficulty multiplier
- **Feedback colors**: GREEN (optimal choice), YELLOW (acceptable), RED (poor)
- **Each scenario has**: 4 options, 1 best answer, 4 explanations, 4 success rates, a concept, an animation type
- **Progression**: XP → level ups → unlock harder scenarios
- **Achievements**: 18 unlockable achievements for various milestones
- **Daily streaks**: Consecutive days playing tracked and rewarded

## AI Integration
- Uses Claude API (`claude-sonnet-4-20250514`) via `generateAIScenario()`
- Sends player context: level, position accuracy, mastered concepts, recent wrong answers
- Triggers: "AI Coach's Challenge" button (after 3 games) or automatic when handcrafted scenarios exhausted
- Purple "🤖 AI" badge shown during AI-generated scenarios
- 10-second timeout with cancel button and fallback to handcrafted

## Field Visualization
- SVG-based, fan-shaped broadcast angle
- Pixel-art style player sprites using `Guy()` component
- Key coordinates: Home(200,282) 1B(284,206) 2B(200,140) 3B(116,206) Mound(200,218)
- 15 animation types: steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze
- Bright kid-friendly colors (grass #52c46a, dirt #dab07a)
- Runners shown with golden glow rings, batter has bat, catcher has mask

## Design Philosophy
- **Kid-friendly first** — bright colors, fun animations, encouraging feedback
- **Educational value** — every wrong answer teaches something, detailed explanations
- **Real baseball strategy** — authentic MLB scenarios and statistics
- **Backyard Baseball vibe** — not ESPN broadcast, not simulation. Fun and inviting.
- **Progressive disclosure** — start simple, unlock complexity as they learn

## Things To Know When Editing
- The `SCENARIOS` object is the content backbone. Each position has 10-12 scenarios.
- Success rates in scenarios (the `rates` array) correspond to the 4 options. Higher = better choice.
- The `best` field is a 0-indexed reference to which option is optimal.
- Animations are triggered by the `anim` field and rendered in the Field component.
- Sound effects use Web Audio API oscillators (no audio files needed).
- The `recentWrong` array in state tracks the last 5 mistakes for AI personalization.
- localStorage keys: `bbsm_*` prefix for all stored data.

## Common Tasks
- **Add a new scenario**: Add an object to the appropriate position array in SCENARIOS
- **Add an achievement**: Add to ACHIEVEMENTS array, ensure unlock logic exists in App()
- **Change field visuals**: Edit the Field() function (SVG elements)
- **Modify game logic**: Edit the App() function's state management and handlers
- **Adjust AI behavior**: Edit generateAIScenario() and the system prompt it uses

## GitHub
- Repo: https://github.com/blainelafleur/Basebeball-strategy-claude
- Main file: index.jsx
- Deploy target: Replit (https://baseball-strategy-master-blafleur.replit.app/)

## Style Preferences
- Use simple, everyday language in commit messages and comments
- Keep code compact but readable — this is a single-file app, space matters
- Prefer inline styles in React over external CSS (artifact compatibility)
- Use descriptive variable names for game logic, short names for SVG coordinates
