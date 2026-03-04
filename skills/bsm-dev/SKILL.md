# BSM Development Skill

## Purpose
This skill makes any Claude session immediately productive on the Baseball Strategy Master codebase. Read this before doing any work.

## Quick Start
1. Read `CLAUDE.md` for architecture overview
2. Read `AUTONOMOUS_RELEASE_PLAN.md` for current task queue
3. Run `node scripts/validate-scenarios.js` to check scenario health
4. Run `node scripts/audit-code.js` to check code health
5. Pick the next unchecked `[ ]` task from the release plan

## Architecture (Cheat Sheet)

**Single file app:** `index.jsx` (~12,000 lines, ~1.7 MB)
- Lines 1-10: Imports
- Lines 11-2800: SCENARIOS object (584+ scenarios, 15 positions)
- Lines 2800-2870: Position metadata, themes, achievements
- Lines 2870-2920: DEFAULT state, position suggestions
- Lines 2920-3050: Helpers (sound, spaced repetition)
- Lines 3050-3160: Knowledge maps (7 maps)
- Lines 3160-3440: BRAIN constant + Brain API
- Lines 3440-3610: generateAIScenario()
- Lines 3610-3700: Sound system, utilities
- Lines 3700-3850: Field() SVG component
- Lines 3850-3910: Board() component
- Lines 3910-end: App() main component

**Worker:** `worker/index.js` — Cloudflare Worker proxy for xAI API + auth + analytics

## Making Changes Safely

### Before any change:
```bash
node scripts/validate-scenarios.js  # Check scenarios
node scripts/audit-code.js          # Check code
```

### After any change:
```bash
node scripts/validate-scenarios.js  # Verify no regressions
node scripts/audit-code.js          # Verify no new issues
```

### Scenario editing rules:
- Every scenario MUST have: id, title, diff (1-3), description, situation, options (4), best (0-3), explanations (4), rates (4), concept, anim
- conceptTag should reference a valid BRAIN.concepts key
- explSimple (optional) provides age 6-10 friendly explanations
- Rates: best option should have highest value
- Follow SCENARIO_BIBLE.md for quality standards

### Code editing rules:
- Keep it as one file (index.jsx)
- Use inline styles (artifact compatibility)
- Prefer React hooks (useState, useEffect, useCallback, useRef)
- Test with `preview.html` for CDN React + Babel rendering
- localStorage key: `bsm_v5`

## Common Tasks

### Add a scenario:
Find the position array in SCENARIOS, add object matching the schema above.

### Fix a bug:
Check QA_BUG_REPORT.md first. The bug may already be documented.

### Improve AI quality:
Edit the system prompt in generateAIScenario(). Key constraints are role boundaries, minimum explanation length, and age-appropriate language.

### Update documentation:
After changes, update CLAUDE.md (line counts, scenario counts) and mark tasks in AUTONOMOUS_RELEASE_PLAN.md.

## Key Contacts
- Owner: Blaine (blafleur@vested.marketing)
- Repo: https://github.com/blainelafleur/Basebeball-strategy-claude
- Production: https://bsm-app.pages.dev/preview
- Worker: bsm-ai-proxy.blafleur.workers.dev
