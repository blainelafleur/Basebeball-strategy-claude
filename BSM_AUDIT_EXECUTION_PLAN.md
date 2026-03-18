# BSM Quality Audit — Master Execution Plan

**Created**: March 16, 2026
**Version**: 2.0 (rewritten from verified codebase audit)
**Goal**: Take BSM from 7/10 to 9/10 — bulletproof scenarios, accessible UX, self-correcting AI

---

## Status Tracker

| Sprint | Task | Status | Notes |
|--------|------|--------|-------|
| 1 | 1.1: Remove duplicate scenarios (9 dupes across 3 sets) | DONE | Removed f4, f23, lf12. Kept lf3, lf1, rf3, rf5, ct4, ct17. Total: 581 |
| 1 | 1.2: Fix 2 rate violations (2b_new3, lf7) | DONE | 2b_new3 rate[3]: 4→8. lf7 rate[0]: 70→55. |
| 1 | 1.3: Audit explanations for similarity | DONE | Script created. 0 similarity issues. 317 short explanations (intentional). |
| 1 | 1.4: Verify concept/mastery system wiring | DONE | System WORKS — keys on conceptTag via findConceptTag() fallback. Not broken. |
| 1 | 1.5: Enhance colorblind feedback indicators | DONE | Added ✓/~/✗ prefix to "Your Choice" label + text suffixes on option buttons |
| 1 | 1.6: Font scaling for ages 6-8 | DONE | fs() helper: 6-8→1.3x, 9-10→1.1x. Applied to description, options, explanations. |
| 1 | 1.7: Fix low-contrast gray text on dark backgrounds | DONE | 121 color:"#6b7280"→#9ca3af, 4 ternary→#9ca3af, 8 color:"#4b5563"→#9ca3af |
| 1 | 1.V: Sprint 1 verification | DONE | All 5 checks PASS |
| 2 | 2.1: Add 15 outfield scenarios (5 per OF position) | DONE | CF:5, LF:5, RF:5. Covers backup, tag-up, communication, wall-play, fly-ball-priority |
| 2 | 2.2: Concept coverage audit + fill gaps | DONE | 9 scenarios added: secondary-lead(2), catcher-framing(2), first-pitch-strike(1), line-guarding(1), eye-level-change(3) |
| 2 | 2.3: Write CRITIC batch audit script | DONE | scripts/critic_audit.js. Est ~$5.25. Ready to run with ANTHROPIC_API_KEY |
| 2 | 2.4: Write batch AI scenario generation script | DONE | scripts/batch_generate.js. Est ~$140. Ready to run |
| 2 | 2.5: Update all documentation counts | DONE | All docs updated: 605 total scenarios (was 584) |
| 2 | 2.V: Sprint 2 verification | NOT STARTED | |
| 3 | 3.1: Client→worker rejected scenario feedback loop | NOT STARTED | |
| 3 | 3.2: Validate prefetched scenarios before serving | NOT STARTED | |
| 3 | 3.3: Cross-position RAG retrieval | NOT STARTED | |
| 3 | 3.4: Expand ROLE_VIOLATIONS to 6 missing categories | NOT STARTED | |
| 3 | 3.5: Patch quality gate (confidence 0.2 start) | NOT STARTED | |
| 3 | 3.V: Sprint 3 verification | NOT STARTED | |
| 4 | 4.1: Game mode descriptions | NOT STARTED | |
| 4 | 4.2: Free play countdown timer | NOT STARTED | |
| 4 | 4.3: Landscape tablet support | NOT STARTED | |
| 4 | 4.4: Avatar skin tone options | NOT STARTED | |
| 4 | 4.V: Sprint 4 verification | NOT STARTED | |
| — | FINAL: End-to-end verification | NOT STARTED | |

---

## I. Executive Summary

### Current State: 7/10

**What's strong:**
- 584 handcrafted scenarios across 15 position categories — baseball accuracy is solid
- Multi-agent AI pipeline (Planner→Generator→Critic→Rewriter) achieves 96% pass rate at 9.59/10 avg
- QUALITY_FIREWALL has 10 Tier 1 + 6 Tier 2 + 3 Tier 3 checks — catches the big stuff
- SVG field visualization is beautiful (10 themes, 15 animations, pose-aware sprites)
- Game mechanics are varied (6 modes, mastery system, prestige, achievements)
- Age-based adaptations exist (simple explanations, difficulty caps, coach voice)

**What's broken or missing:**
- 9 duplicate scenarios across 3 concept sets dilute the learning pool
- Outfield positions are thin (18-19 scenarios vs 61+ for pitcher)
- Documentation counts in CLAUDE.md are stale/incorrect
- No font scaling for ages 6-8 (14px body text is too small for developing readers)
- Low-contrast gray text (#6b7280, #4b5563) on dark backgrounds fails WCAG AA
- Client-side rejected scenarios don't flow back to worker — AI can't learn from mistakes
- Prefetch serves scenarios validated only by QUALITY_FIREWALL, not the full critic pipeline
- ROLE_VIOLATIONS missing for 6 of 15 categories (batter, baserunner, manager, famous, rules, counts)
- No cross-position RAG — cutoff/relay scenarios miss related position knowledge
- Prompt patches auto-created at confidence 0.5 with no quality gate

### After This Plan: 9/10

- Every scenario teaches correctly with distinct explanations
- All kids 6-18 can read the text and understand feedback without relying on color alone
- AI pipeline self-corrects by learning from client-side rejections
- 700+ high-quality scenarios in the pool
- Documentation matches reality

---

## II. Verified Audit Findings

### A. Scenarios — Ground Truth

**Total: 584 confirmed** (517 standard IDs + 67 non-standard IDs like m_vc1a, r_hr1, b_hr1)

**Per-Position Counts (actual, from SCENARIOS object):**

| Position | Standard IDs | Non-Standard IDs | Total | CLAUDE.md Says | Delta |
|----------|-------------|-------------------|-------|----------------|-------|
| pitcher | p1-p63 (missing p60,p61) | — | 61 | 62 | -1 |
| catcher | ct1-ct30 | — | 30 | 40 | **-10** |
| firstBase | 1b1-1b20 | 1b_new1-1b_new5 | 25 | 31 | **-6** |
| secondBase | 2b1-2b14 | 2b_new1-2b_new5 | 19 | 26 | **-7** |
| shortstop | ss1-ss14 | ss_new1-ss_new5 | 19 | 27 | **-8** |
| thirdBase | 3b1-3b14 | 3b_new1-3b_new5 | 19 | 26 | **-7** |
| leftField | lf1-lf18 | — | 18 | 25 | **-7** |
| centerField | cf1-cf18, cf60 | — | 19 | 27 | **-8** |
| rightField | rf1-rf18 | — | 18 | 25 | **-7** |
| batter | b1-b58 | b_hr1 | 59 | 59 | 0 |
| baserunner | r1-r64 (missing r58) | r_hr1, r_vc2a-d | 67 | 68 | -1 |
| manager | m1-m63 | m_hr1, m_vc*, m_wp* | 79 | 79 | 0 |
| famous | fp1-fp21 | — | 21 | 21 | 0 |
| rules | rl1-rl40 | — | 40 | 40 | 0 |
| counts | cn1-cn28 | — | 28 | 28 | 0 |
| **TOTAL** | **517** | **67** | **584** | **584** | **0** |

> **CRITICAL**: CLAUDE.md per-position counts are WRONG for 10 of 15 categories. The total (584) matches but the distribution doesn't. Some scenarios may be filed under generic "field" arrays or cross-referenced. This needs verification during Sprint 2 Task 2.5.

**Confirmed Duplicates (3 sets, 9 scenarios):**

| Set | Scenario IDs | Lines | Recommendation |
|-----|-------------|-------|----------------|
| "Shallow Fly Communication" | lf3, lf12, rf5 | ~1323, ~1378, ~1682 | Keep lf3, remove lf12. Keep rf5 if rewritten for RF-specific angle, else remove. |
| "Hit the Cutoff / Cutoff Man" | f4, f23, lf1, rf3 | ~1267, ~1281, ~1311, ~1670 | Keep lf1 (best explanations, 88% best rate). Remove f4 and f23. Keep rf3 if distinct. |
| "Framing a Borderline Pitch" | ct4, ct17 | ~2900, ~3038 | Keep ct17 (high-leverage variant, more educational). Repurpose ct4 or remove. |

**Rate Violations (only 2 found — 99.7% compliance):**

| ID | Rates | Best | Issue |
|----|-------|------|-------|
| 2b_new3 | [76, 20, 22, 4] | 0 | Rate[3]=4 is below minimum 5 |
| lf7 | [70, 15, 85, 10] | 2 | Non-best rate[0]=70 exceeds 65 threshold — too close to best (85) |

**Concept System — NEEDS VERIFICATION:**
- The `concept` field contains unique full-text strings (1 per scenario = 584 unique)
- The `conceptTag` field contains reusable category tags (mapped to 48 BRAIN concepts)
- The mastery system's `trackConceptMastery()` function needs to be verified: does it key on `concept` or `conceptTag`?
- If it keys on `concept`, mastery is broken (can never get 3 correct on the same concept)
- If it keys on `conceptTag`, the system works as designed

### B. UI/UX — Ground Truth

**Feedback Symbols (Current State):**
- Option circles DO show ✓/✗ after selection (line ~15142): `{sel?(od?.isOpt?"✓":"✗"):choice!==null&&i===sc.best?"✓":i+1}`
- Best answer shown in unselected options gets ✓
- But NO text labels like "(Best Play)" or "(Okay Play)" — only color + tiny ✓/✗ in 24×24px circle
- Outcome heading uses emojis: 🎯 (correct), 🤔 (acceptable), 📚 (wrong) — these ARE colorblind-friendly
- "Best Strategy" section shows ✅ emoji — colorblind-friendly
- **Gap**: The "Your Choice" section has NO symbol — only color-coded left border

**Font Sizes (Current — all hardcoded, no age scaling):**

| Element | Current Size | Needed for 6-8 |
|---------|-------------|-----------------|
| Scenario title | 18px (Bebas Neue) | 22px |
| Scenario description | 14px | 18px |
| Option button text | 14px | 17px |
| Option number circle | 10px | 12px |
| Explanation (simple) | 14px | 17px |
| Explanation (why) | 13px | 16px |
| Coach message | 13px | 16px |
| Labels ("Your Choice", etc.) | 9px | 11px |
| Keyboard hint | ~10px (color #4b5563) | 12px |

**Low-Contrast Text on Dark Backgrounds:**

| Line(s) | Color | Element | Fix To |
|---------|-------|---------|--------|
| ~15112 | #6b7280 | Pressure meter label | #9ca3af |
| ~15142 | #6b7280 | Unselected option number | #9ca3af |
| ~15150 | #4b5563 | "Press 1-4 or tap" hint | #6b7280 |
| ~15155 | #6b7280 | "← Home" button text | #9ca3af |
| ~15173 | #6b7280 | "Your Choice" label | #9ca3af |
| ~15174 | #6b7280 | Expand/collapse button | #9ca3af |
| ~15246 | #6b7280 | Pro upsell button | #9ca3af |
| ~15299 | #6b7280 | Feedback button text | #9ca3af |
| ~11931 | #6b7280 | "Have a promo code?" | #9ca3af |
| ~11934 | #9ca3af | "Enter Promo Code" label | OK (already lighter) |
| ~13850 | #4b5563 | Unearned level text | #6b7280 |
| ~13904 | #4b5563 | Age group description | #6b7280 |
| ~14003 | #6b7280 | Accuracy/Played/Correct labels | #9ca3af |
| ~14049 | #6b7280 | Progress bar labels | #9ca3af |
| ~14214 | #6b7280 | Concept count text | #9ca3af |

> **NOTE**: The app uses a DARK theme. On dark backgrounds, we need LIGHTER grays for contrast. Fix direction: #4b5563 → #6b7280, #6b7280 → #9ca3af. This is the OPPOSITE of what you'd do on a light background.

**Game Mode Descriptions:**
- Daily Diamond: ✅ Has description ("Brand new 1-scenario challenge every day!")
- Season Mode: ✅ Has progress indicator and stage name
- Speed Round: ⚠️ Only shows "5 scenarios · 15s timer" — no explanation of what it IS
- Survival: ❌ No description — just emoji 💀 and "SURVIVAL" label
- Other modes: Minimal labeling

**Free Play Exhaustion:**
- Shows "Come back tomorrow for your Daily Diamond!" — friendly but no countdown
- Limit hit panel shows celebration + stats + upgrade CTA
- No countdown timer to next reset
- No "while you wait" suggestions

**Landscape/Tablet:** Zero support. No media queries. SVG field is 400×400 hardcoded. All layouts are column-based.

**Avatar Skin Tones:** Not configurable. Guy() component has jersey/cap/bat/pose but no skinTone parameter. Body fills are hardcoded in the SVG paths.

### C. AI Pipeline — Ground Truth

**Client-Side (index.jsx):**
- `generateAIScenario()` at lines ~9867-10825 — orchestrator with 90s budget
- QUALITY_FIREWALL: 10 Tier 1 (hard reject), 6 Tier 2 (warnings), 3 Tier 3 (suggestions)
- ROLE_VIOLATIONS: Covers pitcher, catcher, SS, 2B, 3B, 1B, LF, CF, RF (9 positions)
- **Missing**: batter, baserunner, manager, famous, rules, counts (6 categories)
- CONSISTENCY_RULES: 10 cross-position rules (cutoff assignments, relay leads, force plays, etc.)
- Prefetch: Uses `skipAgent=true` for speed, runs QUALITY_FIREWALL after generation, rejected scenarios fall back to local pool
- **GAP**: Rejected scenarios log to console only — worker never learns

**Server-Side (worker/index.js):**
- Multi-agent pipeline: Planner→Generator→Critic→Rewriter with Claude Opus
- RAG via Vectorize: 715 vectors, queries filtered by position (no cross-position)
- Critic: 21-item checklist + 5-dimension rubric, 9.5/10 pass threshold
- Prompt patches: Auto-created at confidence 0.5 from 3+ flags, 30-day expiry
- Feedback endpoint: `/feedback-scenario` with 5 categories, saves to D1
- **GAP**: No endpoint for receiving client-side quality rejections
- **GAP**: Patches have no quality control — 3 flags from one user can create a patch

**A/B Testing (9 configs):** ai_temperature, ai_system_prompt, bible_injection, brain_data_level, few_shot_count, agent_pipeline, coach_persona, session_planner, explanation_depth

### D. Documentation — Ground Truth

| Document | Status | Issues |
|----------|--------|--------|
| CLAUDE.md | Stale counts | Per-position counts wrong for 10 of 15 categories |
| SCENARIO_BIBLE.md | Stale counts | Same count issues |
| BSM_PROJECT_CONTEXT.md | Stale counts | Same count issues |
| ROADMAP.md | Phase 2.96 IN PROGRESS | Accurate |
| BRAIN_KNOWLEDGE_SYSTEM.md | Current | 21 maps, 48 concepts, v2.4.0 |

---

## III. Sprint 1: "Make It Bulletproof" (~6-8 hrs)

**Priority**: Fix every data error in scenarios. Make the app accessible to all kids.

### Task 1.1 — Remove Duplicate Scenarios

**Context**: 9 duplicate scenarios across 3 concept sets. Removing ~5-6 and keeping the best version of each.

```
Read the SCENARIOS object in index.jsx. Find and handle these confirmed duplicate sets:

SET 1: "Shallow Fly Communication" (3 copies)
- lf3 (line ~1323): Left fielder, soft fly, short left field
- lf12 (line ~1378): Left fielder, looping fly ball, SS running out
- rf5 (line ~1682): Right fielder, shallow right, 2B drifting back
All three teach the same lesson: "outfielders have priority on shallow flies."

ACTION:
- Keep lf3 (clearest scenario setup, best difficulty spread)
- REMOVE lf12 (near-identical to lf3, same position)
- EVALUATE rf5: if it teaches RF-specific angle (different cutoff man, different
  communication partner), KEEP but rename to distinguish. If essentially same lesson
  with RF swapped in, REMOVE.

SET 2: "Hit the Cutoff / Hit the Cutoff Man" (4 copies)
- f4 (line ~1267): Generic field scenario, runners on 1st and 2nd
- f23 (line ~1281): Generic field, runner on 2nd, 1 out
- lf1 (line ~1311): Left fielder specific, runner on 2nd, one out
- rf3 (line ~1670): Right fielder specific variant

ACTION:
- Keep lf1 (most detailed explanations, best rates [88,30,15,10])
- REMOVE f4 and f23 (generic versions superseded by position-specific)
- EVALUATE rf3: if RF-specific (different cutoff man = 1B instead of 3B for LF),
  KEEP. If same generic lesson, REMOVE.

SET 3: "Framing a Borderline Pitch" (2 copies)
- ct4 (line ~2900): 2-2 count, routine situation, teaches "subtle pull"
- ct17 (line ~3038): 3-2 count, bases loaded, teaches "hold still in big moments"

ACTION:
- Keep ct17 (high-leverage variant, more educational depth)
- EVALUATE ct4: These teach DIFFERENT framing approaches (pull vs hold still).
  If ct4's explanations clearly teach a distinct lesson, KEEP but rename to
  "Framing Technique: The Subtle Pull" to distinguish from ct17.
  If explanations overlap, REMOVE ct4.

After handling all three sets, do a final sweep: search the entire SCENARIOS object
for any other scenarios with identical or near-identical `title` values within the
same position category. Report what you find.

Do NOT touch scenarios that teach the same concept but for different positions with
different specifics (e.g., LF cutoff vs RF cutoff with different cutoff men).
Do NOT remove scenarios from the SCENARIO_SERIES arrays if they exist there.

Report: which scenarios you removed, which you kept, and final counts per position.
```

### Task 1.2 — Fix Rate Violations

**Context**: Only 2 rate violations found. Quick fixes.

```
Fix these 2 confirmed rate violations in the SCENARIOS object in index.jsx:

1. Scenario 2b_new3: rates=[76, 20, 22, 4], best=0
   ISSUE: rates[3]=4 is below the minimum of 5
   FIX: Change rates[3] from 4 to 8
   Result: [76, 20, 22, 8]

2. Scenario lf7: rates=[70, 15, 85, 10], best=2
   ISSUE: Non-best option rates[0]=70 exceeds the 65 threshold, too close to best (85)
   FIX: Lower rates[0] from 70 to 55
   Result: [55, 15, 85, 10]
   NOTE: Read lf7's options and explanations first. Verify that option 0 is indeed
   a "tempting but wrong" choice (not the actual best answer mislabeled). If option 0
   is genuinely a good alternative, consider whether `best` should be 0 instead of 2.
   Only change the rate if `best=2` is correct.

After fixing, do a quick programmatic scan of ALL scenarios to confirm:
- Every scenario's rates[best] is the highest value in rates[]
- No rate is below 5 or above 95
- No non-best rate exceeds 65
Report any additional violations found.
```

### Task 1.3 — Audit Explanations for Similarity

**Context**: Some scenarios may have explanations where two options say the same thing differently, wasting a teaching opportunity.

```
Write and run an audit script to check explanation quality across all 584 scenarios.
Save the script as scripts/audit_explanations.js (create the scripts/ directory).

The script should:

1. Parse the SCENARIOS object from index.jsx (read the file, extract scenario data)
2. For each scenario, compare all 4 explanations pairwise (6 pairs per scenario):
   a. Tokenize: split on whitespace, lowercase, remove punctuation
   b. Calculate Jaccard similarity: |intersection| / |union| of word sets
   c. Flag any pair with similarity > 0.50 (50%+ word overlap)
3. Also flag:
   a. Any explanation under 20 words (too short to teach)
   b. Any explanation over 200 words (too long for kids)
4. Output to stdout:
   - Total scenarios checked
   - Scenarios with high-similarity explanation pairs (ID, pair indices, score, the two texts)
   - Scenarios with length violations (ID, index, word count)
   - Summary count

Run the script with: node scripts/audit_explanations.js

Then review the flagged scenarios. For each high-similarity pair:
- Read both explanations
- If they genuinely teach different things despite word overlap, skip (false positive)
- If they say the same thing rephrased, rewrite the weaker one to teach a DIFFERENT
  aspect: e.g., one explains WHY it's wrong tactically, the other explains WHAT
  would happen in the game

For length violations:
- Short explanations: expand to at least 25 words, adding the "why" reasoning
- Long explanations: trim to under 150 words, keeping the core teaching point

Show me the audit output before making any fixes so I can review.
```

### Task 1.4 — Verify Concept/Mastery System Wiring

**Context**: CRITICAL finding — the `concept` field has 584 unique strings while `conceptTag` has reusable categories mapped to 48 BRAIN concepts. If the mastery system keys on `concept` instead of `conceptTag`, mastery is impossible (need 3+ scenarios per concept to master).

```
This is a DIAGNOSTIC task. Read the code, report findings, and fix only if broken.

1. In index.jsx, find the mastery tracking system. Search for:
   - trackConceptMastery, conceptMastery, mastery, masteredConcepts
   - Any function that tracks whether a concept has been "mastered"

2. Determine: does the mastery system key on `scenario.concept` or `scenario.conceptTag`?
   - If it keys on `concept` (unique strings): THE SYSTEM IS BROKEN. No concept can
     ever be mastered because each concept string appears in exactly 1 scenario.
     FIX: Change the mastery system to key on `conceptTag` instead.
   - If it keys on `conceptTag` (reusable categories): The system works as designed.
     VERIFY: Count how many scenarios exist per conceptTag. List any conceptTags
     with fewer than 3 scenarios (minimum needed for mastery: 3 consecutive correct).

3. Also check:
   - Does filterByReadiness() use concept or conceptTag?
   - Does the practice recommendation system use concept or conceptTag?
   - Does the "concepts learned" display show concept or conceptTag?

4. Check that ALL 584 scenarios have a valid `conceptTag` that maps to one of the
   48 entries in BRAIN.concepts. List any scenarios with missing or invalid conceptTags.

Report your findings with exact line numbers and code snippets.
If the mastery system is broken (keys on concept instead of conceptTag), fix it.
If conceptTag coverage has gaps, list them for Sprint 2 Task 2.2 to address.
```

### Task 1.5 — Enhance Colorblind Feedback Indicators

**Context**: The option circles already show ✓/✗ (line ~15142), and the outcome heading uses emojis (🎯/🤔/📚). But the "Your Choice" feedback section relies on color-coded left borders with no text/symbol distinction.

```
In index.jsx, find the outcome/feedback screen that appears after a player selects
an answer. There are TWO feedback areas to enhance:

AREA 1: "Your Choice" section (line ~15171-15177)
- Currently has a color-coded left border (green/yellow/red) and label "Your Choice"
- ADD a symbol prefix to the label:
  - If success (green): "✓ Your Choice — Great Call!"
  - If warning (yellow): "~ Your Choice — Not Bad"
  - If danger (red): "✗ Your Choice — Learning Moment"
- Keep the existing color-coded left border AND add the symbol

AREA 2: "Best Strategy" section (line ~15179-15183)
- Currently shows "✅ Best Strategy" with green left border
- This is already colorblind-friendly (has ✅ emoji). Leave as-is.

AREA 3: Option buttons after selection (line ~15132-15148)
- Currently shows ✓ or ✗ in the 24×24px circle. This is good but small.
- ADD a text suffix after each option's text:
  - Selected + correct: append " ✓ Best Play" in green
  - Selected + acceptable (warning): append " ~ Okay Play" in yellow
  - Selected + wrong: append " ✗" in red (no extra text — "Learning Moment" is above)
  - Unselected best answer: append " ← Best" in green (subtle indicator)
- Style these suffixes: fontSize 11px, fontWeight 700, marginLeft 8px

Do NOT change the existing color scheme — just ADD text/symbol indicators alongside.
The goal: a colorblind user can understand feedback using symbols + text alone.
```

### Task 1.6 — Font Scaling for Ages 6-8

**Context**: All font sizes are hardcoded. The app claims ages 6-18 but UI is designed for 12+. Ages 6-8 need larger text.

```
In index.jsx, add age-based font scaling for the youngest players.

STEP 1: Create a font scale helper near the top of the App() component (or near
where stats.ageGroup is first available):

const fontScale = stats.ageGroup === "6-8" ? 1.3 : stats.ageGroup === "9-10" ? 1.1 : 1;
const fs = (base) => Math.round(base * fontScale);

This gives:
- Ages 6-8: 30% larger text (14px → 18px, 13px → 17px, 10px → 13px)
- Ages 9-10: 10% larger text (14px → 15px)
- Ages 11+: unchanged

STEP 2: Apply fs() to these elements on the PLAY SCREEN:

| Element | Current | Location | Change To |
|---------|---------|----------|-----------|
| Scenario description | fontSize:14 | ~line 15122 | fontSize:fs(14) |
| Option button text | fontSize:14 | ~line 15139 | fontSize:fs(14) |
| Option number | fontSize:10 | ~line 15141 | fontSize:fs(10) |
| Option minHeight | 48px | ~line 15139 | minHeight:fs(48) |

STEP 3: Apply fs() to these elements on the OUTCOME SCREEN:

| Element | Current | Location | Change To |
|---------|---------|----------|-----------|
| Outcome heading | fontSize:26 | ~line 15159 | fontSize:fs(26) |
| "Your Choice" label | fontSize:9 | ~line 15173 | fontSize:fs(9) |
| Chosen option text | fontSize:13 | ~line 15174 | fontSize:fs(13) |
| Explanation simple | fontSize:14 | ~line 15176 | fontSize:fs(14) |
| Explanation why | fontSize:13 | ~line 15176 | fontSize:fs(13) |
| Coach message | fontSize:13 | ~line varies | fontSize:fs(13) |

STEP 4: Apply fs() to lineHeight where font size changes:
- Any element getting fs() should also get lineHeight: fs(14) >= 17 ? 1.6 : 1.5

Do NOT change the home screen, settings, or onboarding fonts — those are less
reading-intensive. Focus on the play and outcome screens where kids spend most time.

Do NOT change Bebas Neue heading fonts (they're decorative, not reading text).
```

### Task 1.7 — Fix Low-Contrast Gray Text on Dark Backgrounds

**Context**: The app uses a dark theme. Gray text (#6b7280, #4b5563) on dark backgrounds fails WCAG AA. Need to go LIGHTER for more contrast — the opposite of what you'd do on a light background.

```
In index.jsx, fix low-contrast text colors on dark backgrounds.

RULES:
- #4b5563 (gray-600, ~4:1 contrast on dark) → replace with #6b7280 (gray-500, ~5.5:1)
- #6b7280 (gray-500, ~5.5:1 contrast on dark) → replace with #9ca3af (gray-400, ~7:1)
- Only change TEXT color instances (color:"#..."), NOT backgrounds, borders, or fills

CONFIRMED INSTANCES TO FIX:

Group 1: #4b5563 → #6b7280 (currently nearly invisible on dark bg)
- Line ~15150: "Press 1-4 or tap" keyboard hint
- Line ~13850: Unearned level text in progression display
- Line ~13904: Age group description text in onboarding

Group 2: #6b7280 → #9ca3af (currently too subtle for labels)
- Line ~15112: Pressure meter label
- Line ~15142: Unselected option number icon color
- Line ~15155: "← Home" button text
- Line ~15173: "Your Choice" label
- Line ~15174: Expand/collapse button
- Line ~15246: Pro upsell button (locked state)
- Line ~15299: Feedback button text
- Line ~11931: "Have a promo code?" button
- Line ~14003: Accuracy/Played/Correct stat labels
- Line ~14049: Progress bar labels
- Line ~14214: Concept count text

APPROACH: Search for each hex value as a text color. Be careful:
- `color:"#6b7280"` → change to `color:"#9ca3af"`
- `borderColor:"#6b7280"` → DO NOT change (borders are fine)
- `background:"#6b7280"` → DO NOT change (backgrounds are different)
- Some instances may use the color in a conditional: `color:someCondition?"#6b7280":"white"`
  — change the #6b7280 in these too

After fixing, search the entire file for any remaining #4b5563 used as text color
and any #6b7280 used as text color. Report what remains and whether it's a text color
or a non-text use.
```

### Task 1.V — Sprint 1 Verification

```
Verify all Sprint 1 changes:

1. DUPLICATES: Search the SCENARIOS object for scenario titles that appear more than
   once within the same position category. Confirm 0 duplicates remain.
   Also count total scenarios and compare to pre-sprint count (584 minus removals).

2. RATES: Scan ALL scenarios and confirm:
   - Every rates[best] is the highest value in its rates array
   - No rate is below 5 or above 95
   - No non-best rate exceeds 65
   Report: "X scenarios checked, Y violations found"

3. EXPLANATIONS: If the audit script from Task 1.3 was created, run it again.
   Confirm no high-similarity pairs remain (or justify any remaining as false positives).

4. CONCEPT SYSTEM: Report whether the mastery system keys on concept or conceptTag,
   and whether it was fixed (if broken). Confirm the fix works by tracing a concept
   through: scenario selection → answer → mastery tracking → mastery display.

5. COLORBLIND: Find the outcome screen and confirm:
   - "Your Choice" section has ✓/~/✗ symbol prefix
   - Option buttons show text suffixes ("✓ Best Play", etc.) after selection
   - A user who can't see green/yellow/red can still understand the feedback

6. FONT SCALING: Find where fontScale/fs() is defined. Confirm:
   - ageGroup "6-8" produces 30% larger fonts
   - The fs() function is applied to scenario description, option buttons,
     explanation text, and coach message
   - ageGroup "13+" produces unchanged fonts (scale = 1)

7. CONTRAST: Search for remaining #4b5563 and #6b7280 as text colors.
   - #4b5563 as text color: should be 0 instances (all changed to #6b7280)
   - #6b7280 as text color: should be 0 instances (all changed to #9ca3af)
   Report any remaining instances and whether they're text or non-text uses.

Format: For each check, report PASS or FAIL with details.
```

---

## IV. Sprint 2: "Fill the Gaps" (~8-12 hrs + ~$170 API)

**Priority**: Fill content holes. Validate quality at scale. Build the scenario pool.

### Task 2.1 — Add 15 Outfield Scenarios (5 per position)

**Context**: Outfield positions have only 18-19 scenarios each (vs 61 for pitcher, 79 for manager). Concept coverage skews toward "of-depth-arm-value" with gaps in communication, backup duties, wall play, and relay positioning.

```
First, read ALL existing outfield scenarios in the SCENARIOS object in index.jsx:
- All lf* scenarios (leftField array)
- All cf* scenarios (centerField array)
- All rf* scenarios (rightField array)

Then read SCENARIO_BIBLE.md sections on outfield positions and the CUTOFF_RELAY_MAP,
BACKUP_MAP, and OF_COMMUNICATION principles.

Create a concept coverage matrix for current outfield scenarios:

| Concept | LF | CF | RF | Gap? |
|---------|----|----|----| -----|
| Fly ball priority/communication | ? | ? | ? | |
| Backup duties | ? | ? | ? | |
| Relay/cutoff positioning | ? | ? | ? | |
| Wall play / corner caroms | ? | ? | ? | |
| Depth positioning | ? | ? | ? | |
| Arm value (throw home vs hold) | ? | ? | ? | |
| Gap coverage (LC/RC) | ? | ? | ? | |
| Tag-up positioning | ? | ? | ? | |

Then write 5 NEW scenarios for each outfield position (15 total) filling the BIGGEST
gaps. Each must follow this exact format:

{
  id: "lf19",  // sequential after highest existing ID
  title: "Wall Ball in the Corner",
  q: "You're the left fielder. Runner on first, one out...",
  options: ["Option A", "Option B", "Option C", "Option D"],
  best: 0,  // index of best answer
  explanations: ["Why A is best...", "Why B is wrong...", "Why C...", "Why D..."],
  rates: [82, 45, 20, 12],  // best 65-90, tempting 40-65, bad 10-35
  concept: "Playing the ball off the wall requires reading the angle and getting your
            body between the ball and the infield to prevent extra bases",
  conceptTag: "wall-play",  // must map to a BRAIN.concepts entry or be a valid new tag
  diff: 2,  // 1=Rookie, 2=Pro, 3=All-Star
  anim: "catch"  // one of the 15 animation types
}

REQUIREMENTS:
- At least 1 diff:1, 2 diff:2, 2 diff:3 per position
- Every scenario must have a valid conceptTag
- Rates must follow SCENARIO_BIBLE distribution
- Explanations must teach WHY, not just describe WHAT happens
- LF scenarios must be LF-specific (LF cutoff is 3B, LF backs up 3B on throws)
- CF scenarios must be CF-specific (CF has priority over corner OFs, CF backs up both)
- RF scenarios must be RF-specific (RF cutoff is 1B, RF backs up 1B on throws)
- Include explSimple for each (1 sentence a 6-year-old understands, per option)
- Language: ages 8-14 reading level

Add each batch to the appropriate position array in SCENARIOS.
Report: final scenario counts per OF position after additions.
```

### Task 2.2 — Concept Coverage Audit & Fill Gaps

**Context**: The mastery system requires 3+ scenarios per conceptTag to allow mastery. Some concepts may be under-represented.

```
Read the BRAIN.concepts object in index.jsx (around lines 3160-3440) to get the
full list of concepts with their IDs, prerequisites, age minimums, and difficulty levels.

Then scan ALL 584 scenarios' conceptTag fields and build a coverage report:

For each concept in BRAIN.concepts:
1. Count how many scenarios have this conceptTag
2. List which positions those scenarios are in
3. List which difficulty levels (diff 1, 2, 3) are represented
4. Flag if: count < 3, missing a needed difficulty, only in 1 position

Output format:
| ConceptTag | Count | Positions | Difficulties | Issues |
|------------|-------|-----------|-------------|--------|
| count-leverage | 28 | pitcher, batter, counts | 1,2,3 | None |
| cutoff-relay | 8 | lf, cf, rf, ss, 2b | 2,3 | Missing diff:1 |
| wall-play | 0 | — | — | NO SCENARIOS |

For the 5 worst-covered concepts (lowest count, most critical to the game):
- Write 2-3 new scenarios each
- Spread across relevant positions
- Include at least diff:1 and diff:2
- Follow same format as Task 2.1

Add to the appropriate position arrays in SCENARIOS.
Report: updated concept coverage table showing improvements.
```

### Task 2.3 — Write CRITIC Batch Audit Script

**Context**: Run the worker's CRITIC (21-item checklist + 5-dimension rubric) against all 584 handcrafted scenarios to find quality issues. Estimated cost: ~$29 for 584 Claude Opus calls.

```
Write a script at scripts/critic_audit.js that:

1. READS index.jsx and extracts all scenarios from the SCENARIOS object
   - Parse each scenario into a JSON object
   - Include: id, title, q, options, best, explanations, rates, concept, conceptTag, diff

2. READS the CRITIC_SYSTEM prompt from worker/index.js
   - Find the critic stage system prompt in the multi-agent pipeline
   - Extract the 21-item checklist and 5-dimension rubric text

3. FOR EACH scenario, calls the Anthropic API (Claude Sonnet for cost efficiency):
   - System prompt: the extracted CRITIC_SYSTEM prompt
   - User message: the scenario JSON
   - Expected response: JSON with checklistResults (21 items), rubricScores (5 dims),
     overallScore, and failureReasons

4. PROCESSES results:
   - Parse the critic's JSON response
   - Record: scenario_id, overallScore, any failed checklist items, lowest rubric dimension
   - Handle: API errors (retry 2x with 5s delay), JSON parse errors, rate limits

5. SAVES results to scripts/critic_audit_results.json:
   {
     "timestamp": "2026-03-16T...",
     "totalScenarios": 584,
     "passed": 560,
     "failed": 24,
     "avgScore": 9.2,
     "results": [ { "id": "p1", "score": 9.5, "passed": true, ... }, ... ],
     "worstScenarios": [ top 20 by lowest score ]
   }

6. OUTPUTS summary to stdout:
   - Total: X scenarios
   - Passed (≥9.0): X
   - Failed (<9.0): X
   - Worst 10: list with ID, score, failure reasons
   - Estimated cost: $X.XX (at Sonnet pricing)
   - Time elapsed

CONFIGURATION:
- Batch size: 5 parallel requests
- Delay between batches: 2 seconds
- Max retries: 2
- API key: read from ANTHROPIC_API_KEY env var
- Model: claude-sonnet-4-6-20250514 (cheaper than Opus for scoring)

DO NOT run the script. Just write it and output the estimated cost calculation.
Show: (584 scenarios × avg ~1500 input tokens + ~500 output tokens) × Sonnet pricing.
I will review and approve before execution.
```

### Task 2.4 — Write Batch AI Scenario Generation Script

**Context**: Populate the scenario pool with 200-500 AI-generated scenarios via the multi-agent pipeline. Estimated cost: ~$140 for 300 Claude Opus calls.

```
Write a script at scripts/batch_generate.js that:

1. DEFINES the generation matrix:
   - 15 positions × 3 difficulty levels = 45 combinations
   - 7 scenarios per combination = 315 total generation attempts
   - Expected ~80% pass rate = ~250 successful scenarios

2. FOR EACH combination, calls the worker's /v1/multi-agent endpoint:
   POST https://bsm-worker.blainelafleur.workers.dev/v1/multi-agent
   Headers: { "Content-Type": "application/json" }
   Body: {
     "position": "pitcher",
     "difficulty": 2,
     "playerAge": 12,
     "conceptsLearned": [],
     "recentWrong": [],
     "aiHistory": []
   }

3. VALIDATES each response:
   - Must be valid JSON with all required fields
   - Must have agentGrade >= 80
   - Run client-side QUALITY_FIREWALL checks (import from index.jsx or replicate):
     a. rates[best] is highest rate
     b. No rate < 5 or > 95
     c. Best rate >= 65
     d. All 4 options are distinct
     e. All 4 explanations are >= 25 words
   - Mark as "passed" or "failed" with reasons

4. SAVES results:
   - Successful: scripts/batch_generated_YYYY-MM-DD.json
   - Failed: scripts/batch_failures_YYYY-MM-DD.json
   - Each entry includes: the scenario, position, difficulty, agentGrade,
     quality check results, generation time

5. OUTPUTS progress every 10 scenarios:
   "Progress: 30/315 | Passed: 24 | Failed: 6 | Avg Grade: 92.3 | Est. Cost: $14.20"

6. OUTPUTS final summary:
   - Success rate by position (which positions have worst AI quality?)
   - Success rate by difficulty (is diff:3 harder to generate?)
   - Average quality score
   - Common failure reasons
   - Total API cost
   - Total time elapsed

CONFIGURATION:
- Concurrency: 2 parallel requests (don't overwhelm the worker)
- Delay between batches: 5 seconds
- Timeout per request: 120 seconds
- Max retries: 1 (don't waste money on persistent failures)

DO NOT run this script. Write it and output:
- Estimated total cost (315 × multi-agent pipeline × Claude Opus pricing)
- Estimated total time (315 requests × ~30s avg = ~2.5 hours with concurrency)
I will review and approve before execution.
```

### Task 2.5 — Update All Documentation Counts

**Context**: Per-position counts in CLAUDE.md, SCENARIO_BIBLE.md, and BSM_PROJECT_CONTEXT.md are stale. After Sprint 1 removals and Sprint 2 additions, counts need updating from the source of truth (the SCENARIOS object).

```
Count the ACTUAL scenarios in the SCENARIOS object in index.jsx. Do this by reading
the code, not by copying from docs.

For each of the 15 position categories, count:
- Standard ID scenarios (e.g., p1, p2, ...)
- Non-standard ID scenarios (e.g., m_vc1a, r_hr1, ...)
- Total per position

Then update these files with the REAL counts:

1. CLAUDE.md — "Scenario Counts" section:
   Update the count line and total. Example format:
   ```
   pitcher:XX  catcher:XX  firstBase:XX  secondBase:XX  shortstop:XX  thirdBase:XX
   leftField:XX  centerField:XX  rightField:XX
   batter:XX  baserunner:XX  manager:XX
   famous:XX  rules:XX  counts:XX
   ```
   Also update "584 handcrafted scenarios" if the total has changed.
   Also update the index.jsx layout line ranges if they've shifted significantly.

2. SCENARIO_BIBLE.md — Counts table:
   Update the scenario counts table with real numbers.
   Add an audit log entry in Section 10: "2026-03-16: Sprint 1+2 quality audit.
   Removed X duplicates. Added Y outfield scenarios. Added Z concept-gap scenarios.
   Fixed A rate violations. New total: NNN."

3. BSM_PROJECT_CONTEXT.md — Position counts:
   Update the "Scenario Breakdown" line with real numbers.

4. MEMORY.md — Scenario counts line:
   Update the "Scenario Counts" line in the memory index.

Double-check: read each file BEFORE editing to make sure you're updating the right
section and not breaking formatting.

Report: old counts vs new counts, total change.
```

### Task 2.V — Sprint 2 Verification

```
Verify all Sprint 2 changes:

1. OUTFIELD SCENARIOS: Count scenarios in leftField, centerField, rightField arrays.
   Confirm each has at least 23 scenarios (was ~18-19 + 5 new).
   For 3 random new scenarios per position, verify:
   - rates[best] is highest rate
   - Rates follow distribution (best 65-90, tempting 40-65, bad 10-35)
   - Explanations teach WHY not just WHAT
   - conceptTag is valid and maps to BRAIN.concepts
   - Content is position-specific (not generic outfield)

2. CONCEPT COVERAGE: Re-run the concept coverage analysis from Task 2.2.
   Confirm: no concept in BRAIN.concepts has fewer than 3 scenarios with its conceptTag
   (or document remaining gaps with justification for why they can't be filled yet).

3. AUDIT SCRIPTS: Confirm scripts/critic_audit.js and scripts/batch_generate.js
   exist, are syntactically valid (node --check), and have clear usage instructions
   in comments at the top.

4. DOCUMENTATION: Open each doc and verify counts match:
   - CLAUDE.md total matches SCENARIOS object count
   - SCENARIO_BIBLE.md total matches
   - BSM_PROJECT_CONTEXT.md total matches
   - All three agree with each other

Format: For each check, report PASS or FAIL with details.
```

---

## V. Sprint 3: "Close the Loop" (~8-12 hrs)

**Priority**: Make the AI pipeline self-correcting. Close the feedback gap.

### Task 3.1 — Client→Worker Rejected Scenario Feedback Loop

**Context**: When QUALITY_FIREWALL rejects an AI scenario on the client side, the worker never learns. This is the single biggest gap in the "self-learning" system.

```
PART A — Worker endpoint (worker/index.js):

1. Add a new POST route: /api/quality-rejection

2. Handler: handleQualityRejection(request, env)
   - Parse body: { scenario, position, failureReasons, failureTier, pipeline, timestamp }
   - Validate: position is valid, failureReasons is array, timestamp is number
   - Insert into D1 table `quality_rejections`:
     CREATE TABLE IF NOT EXISTS quality_rejections (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       position TEXT NOT NULL,
       failure_reasons TEXT NOT NULL,  -- JSON array
       failure_tier INTEGER DEFAULT 1,
       pipeline TEXT,  -- "multi-agent", "standard", "70b"
       scenario_json TEXT,
       created_at TEXT DEFAULT (datetime('now'))
     );
   - Return 200 { ok: true }
   - On error, return 500 (don't crash — this is analytics)

3. Add to the weekly cron handler: analyze quality_rejections
   - Group by position: which positions have highest rejection rates?
   - Group by failure_reason: what's the most common failure?
   - If a position has >20% rejection rate in the past week AND >5 rejections:
     auto-create a prompt patch at confidence 0.2 (below inclusion threshold,
     requires manual approval per Task 3.5)
   - Log analysis results to D1 analytics table

PART B — Client-side (index.jsx):

4. Find where QUALITY_FIREWALL.validate() or similar is called on AI-generated
   scenarios. This is in generateAIScenario() or its helper functions.

5. When a scenario FAILS validation, add a fire-and-forget POST:
   ```
   try {
     fetch(AI_PROXY_URL + '/api/quality-rejection', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         scenario: failedScenario,
         position: position,
         failureReasons: validationResult.failures.map(f => f.rule),
         failureTier: validationResult.tier,
         pipeline: pipelineUsed,
         timestamp: Date.now()
       })
     }).catch(() => {});  // silent fail — analytics only
   } catch(e) {}
   ```

6. Do NOT await this fetch — it must not block gameplay or scenario fallback.
   Do NOT retry on failure. This is purely diagnostic data.

PART C — CORS:

7. Ensure the worker's CORS handler allows POST to /api/quality-rejection
   from the app's origin (bsm-app.pages.dev and localhost).
```

### Task 3.2 — Validate Prefetched Scenarios Before Serving

**Context**: Prefetch uses `skipAgent=true` (standard xAI pipeline, no critic). QUALITY_FIREWALL runs after generation, but rejections are silent — they log to console and fall back to the local pool. The gap: no tracking, no retry.

```
In index.jsx, find the prefetch flow. Search for prefetchAIScenario, skipAgent,
or the pre-cache system.

Current flow:
1. prefetchAIScenario() calls generateAIScenario() with skipAgent=true
2. Result comes back from standard xAI pipeline
3. QUALITY_FIREWALL.validate() runs
4. If passes → cached for serving
5. If fails → console.warn, falls back to local pool
6. No tracking, no feedback

NEW flow:
1. prefetchAIScenario() calls generateAIScenario() with skipAgent=true (unchanged)
2. Result comes back (unchanged)
3. QUALITY_FIREWALL.validate() runs (unchanged)
4. If passes → cached for serving (unchanged)
5. If fails:
   a. Send quality rejection to worker (using Task 3.1's endpoint)
   b. Try local pool fallback (existing behavior)
   c. If local pool also empty, schedule a RETRY prefetch with 30s delay
   d. Track: increment a prefetch_rejection_count in state
   e. If prefetch_rejection_count > 3 in this session, STOP prefetching
      (the AI is having a bad day — don't waste calls)

Additionally:
6. If the prefetched scenario has a `critiqueScore` from the worker's multi-agent
   pipeline (some scenarios might come through that route), enforce critiqueScore >= 8.0
7. Add a console.info log with timing: "Prefetch for [position]: [pass/fail] in [X]ms"

Do NOT change prefetch to use the agent pipeline — that's too slow/expensive for
background generation. The fix is: keep the cheap pipeline, but track and limit
failures.
```

### Task 3.3 — Cross-Position RAG Retrieval

**Context**: RAG queries in the worker filter by position, so a shortstop cutoff scenario won't retrieve third base or outfield knowledge about the same relay play. This limits cross-position coordination teaching.

```
In worker/index.js, find the queryVectorize() function and the GENERATOR stage
where RAG results are injected.

1. Define CROSS_POSITION_CONCEPTS near the top of the worker file:

const CROSS_POSITION_CONCEPTS = {
  "cutoff-relay": ["shortstop","secondBase","thirdBase","leftField","centerField","rightField","pitcher","catcher","firstBase"],
  "bunt-defense": ["pitcher","catcher","firstBase","thirdBase","shortstop","secondBase"],
  "double-play": ["shortstop","secondBase","firstBase","pitcher","catcher"],
  "steal-defense": ["pitcher","catcher","shortstop","secondBase"],
  "fly-ball-priority": ["centerField","leftField","rightField","shortstop","secondBase"],
  "rundown": ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase"],
  "backup-coverage": ["pitcher","centerField","leftField","rightField"],
  "pickoff": ["pitcher","catcher","firstBase","shortstop"],
  "first-third": ["pitcher","catcher","shortstop","secondBase","thirdBase"],
  "tag-up": ["leftField","centerField","rightField","catcher","thirdBase"]
};

2. In the GENERATOR stage's RAG query section, AFTER the primary position query:

   const primaryResults = await queryVectorize(env, query, { position, topK: 3 });

   // Check if this concept involves cross-position coordination
   const crossPositions = CROSS_POSITION_CONCEPTS[targetConcept];
   let crossResults = [];
   if (crossPositions) {
     // Pick 1-2 related positions (not the primary)
     const related = crossPositions.filter(p => p !== position).slice(0, 2);
     for (const relPos of related) {
       const r = await queryVectorize(env, query, { position: relPos, topK: 1 });
       crossResults.push(...r);
     }
   }

   // Merge and deduplicate
   const allResults = deduplicateByContent([...primaryResults, ...crossResults]);
   // Cap at 5 total to prevent prompt bloat
   const ragBlock = allResults.slice(0, 5).map(r => r.metadata.content).join('\n\n');

3. Add the deduplicateByContent helper:
   - Compare by a content hash or first 100 chars
   - Remove exact duplicates

4. In the GENERATOR system prompt, add a note when cross-position context is included:
   "Note: The following knowledge includes perspectives from related positions
   involved in this play. Use this to ensure your scenario accurately describes
   coordination between positions."

Keep it lightweight — max 2 extra RAG queries, max 5 total results, same token budget.
```

### Task 3.4 — Expand ROLE_VIOLATIONS to Missing Categories

**Context**: ROLE_VIOLATIONS covers 9 field positions but NOT batter, baserunner, manager, famous, rules, or counts. AI can generate impossible scenarios for these categories with no validation.

```
In index.jsx, find the ROLE_VIOLATIONS object (search for ROLE_VIOLATIONS).

Add validation rules for the 6 missing categories:

1. BATTER role violations:
   - Should NOT describe fielding, throwing to bases, or covering positions
   - Should NOT describe pitching actions
   - SHOULD focus on: swing decisions, pitch recognition, baserunning after contact,
     bunting, count strategy
   Regex patterns:
   /you\s+(field|throw\s+to\s+(first|second|third)|cover\s+(first|second|third|home)|pitch|deliver)/i

2. BASERUNNER role violations:
   - Should NOT describe fielding, catching, pitching, or batting
   - SHOULD focus on: stealing, leads, reads, tag-up, sliding, advancing
   Regex patterns:
   /you\s+(field|catch\s+the\s+(ball|throw)|pitch|bat|swing|throw\s+to\s+(first|second|third))/i

3. MANAGER role violations:
   - Should NOT describe the manager performing physical plays
   - Manager makes DECISIONS: lineup, substitution, strategy calls, signs
   Regex patterns:
   /you\s+(throw|catch|field|tag|dive|slide|pitch|bat|swing|bunt|run\s+to)/i
   Exception: "you signal" or "you call" are fine (those are manager actions)

4. FAMOUS role violations:
   - Lighter validation — these describe historical plays
   - Should use third person for the famous player OR second person if role-playing
   - Check: if the scenario mentions a specific player name AND uses "you" to
     describe a DIFFERENT position's actions, flag it
   Regex: No generic regex — just validate that the position in the scenario metadata
   matches the actions described

5. RULES role violations:
   - Options should test RULE KNOWLEDGE, not physical ability
   - If all 4 options describe physical plays and none reference a rule, flag it
   Validation: count options containing rule-related words (rule, legal, illegal,
   allowed, violation, called, ruled, umpire, interference, obstruction, balk).
   If 0 of 4 options contain any rule word, flag as possible violation.

6. COUNTS role violations:
   - Must involve a specific count situation (0-0 through 3-2)
   - If the count in the situation object doesn't match the count described in
     the description text, flag it
   Validation: extract count from situation.count and from description text,
   compare for consistency

Add these to the ROLE_VIOLATIONS object using the same pattern as existing entries.
Integrate into the validation flow where ROLE_VIOLATIONS is checked.
```

### Task 3.5 — Patch Quality Gate

**Context**: Prompt patches auto-created at confidence 0.5 from just 3 flags. One user flagging 3 scenarios creates a patch that affects all future generation for that position for 30 days. No quality control.

```
In worker/index.js, find the patch creation and injection code. Search for
prompt_patches, PATCH_TEMPLATES, handleFeedbackScenario, or confidence.

CHANGES:

1. PATCH CREATION (in handleFeedbackScenario or similar):
   - Change initial confidence from 0.5 to 0.2
   - 0.2 is BELOW the injection threshold (patches at 0.2 are logged but not used)
   - Add a `status` field: "pending" (new), "approved" (manual), "auto" (from cron)
   - Add `created_by`: "auto-feedback" or "admin"

2. INJECTION THRESHOLD (where patches are loaded into prompts):
   - Find where patches are queried and injected into the generator prompt
   - Change the confidence threshold from current (likely 0.3 or 0.5) to 0.3
   - Only inject patches with confidence >= 0.3 AND status IN ('approved', 'auto')
   - Patches with status='pending' are NEVER injected regardless of confidence

3. NEW ADMIN ENDPOINT: POST /admin/approve-patch
   - Auth: require ADMIN_KEY header
   - Body: { patchId, newConfidence, status }
   - Validates: newConfidence between 0.1 and 1.0, status in ('approved', 'rejected')
   - Updates the patch in D1
   - Returns the updated patch

4. NEW ADMIN ENDPOINT: GET /admin/pending-patches
   - Auth: require ADMIN_KEY header
   - Query: SELECT * FROM prompt_patches WHERE status='pending' ORDER BY created_at DESC
   - Returns: list of pending patches with their position, content, flag count, created_at

5. WEEKLY CRON CHANGES:
   - Current behavior: auto-increase confidence by 0.15 weekly
   - New behavior:
     a. Only increase confidence if the patch's position still has >10% flag rate
        in the past 7 days
     b. Cap auto-increase at confidence 0.4 (need manual approval to go higher)
     c. Set status to 'auto' when auto-increasing (distinguishes from admin-approved)
   - Add auto-decay: patches not referenced in 14 days lose 0.1 confidence
   - Add auto-expiry: patches at confidence <= 0.1 are deleted (or archived)

6. LOGGING:
   - When a patch is injected, log: patch_id, position, confidence, status
   - When a patch is created/updated/deleted, log to D1 analytics

This prevents a single user's flags from poisoning generation while keeping the
self-learning loop functional for genuine quality issues that accumulate organically.
```

### Task 3.V — Sprint 3 Verification

```
Verify all Sprint 3 changes:

1. QUALITY REJECTION ENDPOINT:
   - Read worker/index.js and confirm POST /api/quality-rejection exists
   - Confirm it inserts into quality_rejections D1 table
   - Read index.jsx and confirm the fire-and-forget POST fires on QUALITY_FIREWALL
     rejection of AI scenarios
   - Confirm the fetch does NOT use await (non-blocking)
   - Confirm error handling wraps the fetch in try/catch with silent catch

2. PREFETCH VALIDATION:
   - Read the prefetch flow in index.jsx
   - Confirm rejected prefetched scenarios trigger the quality rejection POST
   - Confirm retry logic: 30s delay, max 3 retries per session
   - Confirm prefetch stops after 3+ consecutive rejections

3. CROSS-POSITION RAG:
   - Read queryVectorize usage in worker/index.js GENERATOR stage
   - Confirm CROSS_POSITION_CONCEPTS map exists with at least 10 concept entries
   - Confirm cross-position queries fire when targetConcept matches a map key
   - Confirm total RAG results are capped at 5 (no prompt bloat)
   - Confirm deduplication function exists

4. ROLE_VIOLATIONS:
   - Read the ROLE_VIOLATIONS object in index.jsx
   - Confirm entries exist for: batter, baserunner, manager, famous, rules, counts
   - For each new category, verify at least 1 regex pattern exists
   - Confirm these new categories are integrated into the validation flow
     (same place where pitcher/catcher/etc. violations are checked)

5. PATCH QUALITY GATE:
   - Read patch creation in worker/index.js
   - Confirm initial confidence is 0.2 (not 0.5)
   - Confirm injection threshold is 0.3 minimum
   - Confirm status='pending' patches are never injected
   - Confirm POST /admin/approve-patch exists with ADMIN_KEY auth
   - Confirm GET /admin/pending-patches exists with ADMIN_KEY auth
   - Confirm weekly cron caps auto-increase at 0.4

Format: For each check, report PASS or FAIL with code evidence.
```

---

## VI. Sprint 4: "Polish" (~4-6 hrs)

**Priority**: UX refinements that make the app feel complete.

### Task 4.1 — Game Mode Descriptions

**Context**: Speed Round shows only "5 scenarios · 15s timer" with no explanation. Survival shows only emoji + label. New players can't tell what each mode does.

```
In index.jsx, find the home screen game mode buttons/cards. Search for "Season",
"Speed Round", "Survival", "Daily Diamond", or the game mode selection grid.

Add a 1-sentence subtitle description below each mode name:

| Mode | Current Label | Add Description |
|------|--------------|-----------------|
| Daily Diamond | "DAILY DIAMOND" + "Brand new..." | Already has one ✓ — leave as-is |
| Season Mode | Progress bar + stage name | Add: "Master every position on your road to the Hall of Fame" |
| Speed Round | "5 scenarios · 15s timer" | Replace with: "Race the clock — 15 seconds per question!" |
| Survival | 💀 "SURVIVAL" | Add: "Get it wrong and you're out — how far can you go?" |

Style for descriptions:
- fontSize: 11px (or fs(11) if font scaling from Task 1.6 exists)
- color: "#9ca3af" (the contrast-fixed gray from Task 1.7)
- marginTop: 2px
- fontWeight: 400
- maxWidth: 200px (prevent text from spreading too wide)

For Pro-only modes (if any exist beyond these):
- Add 🔒 icon and "(PRO)" text next to the mode name for free users
- On tap, show the upgrade panel instead of starting the mode

Keep the existing layout structure — only add the subtitle text.
```

### Task 4.2 — Free Play Countdown Timer

**Context**: When free plays are exhausted, user sees "Come back tomorrow for your Daily Diamond!" with no timeline and no alternatives. Kid hits a wall and leaves.

```
In index.jsx, find the free play exhaustion handling. Search for DAILY_FREE,
remaining, atLimit, "Come back tomorrow", or the limit-hit panel.

Current: "✨ Come back tomorrow for your Daily Diamond!" (line ~14759)

CHANGE 1: Replace with countdown
- Calculate time until next daily reset (midnight local time or whenever the reset happens)
- Show: "Your plays reset in X hours" (or "X hours, Y minutes" if < 3 hours)
- Update the display on component mount (no live ticking needed — just calculate once)

Implementation:
const now = new Date();
const resetTime = new Date(now);
resetTime.setDate(resetTime.getDate() + 1);
resetTime.setHours(0, 0, 0, 0);  // midnight
const hoursLeft = Math.ceil((resetTime - now) / (1000 * 60 * 60));
const minsLeft = Math.ceil((resetTime - now) / (1000 * 60)) % 60;

CHANGE 2: Add "while you wait" section in the limit-hit panel
After the countdown, add:
- "While you wait:" heading (fontSize 13, color #f59e0b, fontWeight 700)
- "📊 Review what you learned today" → button that scrolls to or opens session recap
- "🗺 Explore all 15 positions" → button that shows position picker in browse mode
- "⭐ Check your achievements" → button that opens achievements screen

CHANGE 3: Move upgrade CTA below the "while you wait" options
- Keep the existing "Ask a Parent About All-Star Pass" button
- But position it BELOW the free alternatives
- Add: "With All-Star Pass: unlimited plays every day!" (fontSize 11, color #9ca3af)

Do NOT add a live-ticking countdown (updates every second). That's distracting for kids.
Just calculate the remaining time on render and show a static message.
```

### Task 4.3 — Landscape Tablet Support

**Context**: No landscape handling exists. Most kids use tablets. In landscape, the column layout wastes horizontal space — the field compresses to tiny height.

```
In index.jsx, add landscape-aware layout for tablets.

STEP 1: Add orientation detection in the App() component:
const [isLandscape, setIsLandscape] = useState(
  () => window.innerWidth > window.innerHeight && window.innerWidth > 600
);

useEffect(() => {
  const handleResize = () => {
    setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth > 600);
  };
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, []);

STEP 2: On the PLAY SCREEN (scenario + options), when isLandscape:
- Wrap the field + scenario in a flex container with flexDirection: "row"
- Left side (40%): SVG field component
- Right side (60%): scenario description + option buttons
- Set field maxWidth to 380px (prevent oversizing)
- Set options container to overflow-y: auto with maxHeight: calc(100vh - 60px)

STEP 3: On the OUTCOME SCREEN (feedback), when isLandscape:
- Left side: SVG field (keep showing the animation result)
- Right side: feedback text, explanation, coach message

STEP 4: Portrait stays exactly as-is. The isLandscape flag only activates when:
- window.innerWidth > window.innerHeight (landscape orientation)
- AND window.innerWidth > 600 (tablet-sized, not tiny phone rotated)

STEP 5: Test considerations:
- The SVG viewBox is "0 0 400 340" — verify it scales correctly in a 40%-width container
- Option buttons should not become too narrow — set minWidth: 250px on the right side
- If screen is too small for side-by-side (< 700px width in landscape), fall back to column

Keep it simple. This is one flexDirection change + a width constraint. Don't restructure
the entire layout — just wrap the existing play/outcome screen content in a conditional flex.
```

### Task 4.4 — Avatar Skin Tone Options

**Context**: Guy() component draws one skin tone for all players. No skinTone parameter exists. In 2026, representation matters.

```
In index.jsx, find the Guy() component (SVG player sprite) and the avatar
customization screen.

STEP 1: Define skin tone palette
const SKIN_TONES = [
  "#FDDBB4",  // Light
  "#E8B98D",  // Medium-light
  "#C68642",  // Medium
  "#8D5524",  // Medium-dark
  "#4A2C12"   // Dark
];

STEP 2: Add skinTone parameter to Guy() component
Change the function signature to include: skinTone = "#E8B98D" (default medium-light)

Find all SVG elements in Guy() that render skin-colored body parts:
- Face/head (typically a circle or ellipse)
- Hands (small circles at arm ends)
- Arms/forearms (if visible)
- Neck (if separate from head)

Replace their hardcoded fill colors with the skinTone parameter.
Leave non-skin elements unchanged (jersey, cap, pants, bat).

STEP 3: Add skinTone to avatar state
- In the DEFAULT state object, add: avatarSkin: 1 (default to index 1 = medium-light)
- Where Guy() is rendered on the play screen, pass:
  skinTone={SKIN_TONES[stats.avatarSkin || 1]}

STEP 4: Add skin tone selection to avatar customization screen
Find the avatar customization panel (where jersey/cap/bat colors are selected).
Add a new row: "Skin Tone" with 5 circular swatches.

Style per swatch:
- width: 32px, height: 32px, borderRadius: "50%"
- background: SKIN_TONES[i]
- border: selected ? "3px solid white" : "2px solid rgba(255,255,255,0.2)"
- cursor: "pointer"
- transition: "transform 0.15s"
- On hover: transform: "scale(1.15)"

Make ALL 5 tones available to ALL users (free and Pro). Skin tone is
representation, not a premium feature. Do not gate this behind Pro.

STEP 5: Save to localStorage
The skinTone selection should persist with the rest of avatar state.
When saving stats to localStorage (bsm_v5), include avatarSkin.
When loading, default to 1 if not present.

Keep it minimal — 5 swatches in a row, same UI pattern as jersey/cap selection.
```

### Task 4.V — Sprint 4 Verification

```
Verify all Sprint 4 changes:

1. GAME MODE DESCRIPTIONS:
   - Find the home screen game mode section
   - Confirm Speed Round has a description (not just "5 scenarios · 15s timer")
   - Confirm Survival has a description (not just emoji + "SURVIVAL")
   - Confirm descriptions use fontSize 11px and color #9ca3af (or contrast-fixed equivalent)
   - Confirm Daily Diamond and Season Mode descriptions are unchanged/intact

2. FREE PLAY COUNTDOWN:
   - Find the limit-hit panel
   - Confirm it shows "Your plays reset in X hours" (not "Come back tomorrow")
   - Confirm "while you wait" section has 3 action links (review, explore, achievements)
   - Confirm upgrade CTA appears BELOW the free alternatives
   - Verify the time calculation doesn't produce negative numbers or "0 hours"

3. LANDSCAPE SUPPORT:
   - Find the isLandscape state and the resize/orientationchange listeners
   - Confirm the play screen uses flexDirection:"row" when isLandscape is true
   - Confirm the field is constrained to 40% width with maxWidth
   - Confirm portrait layout is unchanged (no isLandscape wrapping on narrow screens)
   - Confirm the threshold is width > height AND width > 600

4. AVATAR SKIN TONES:
   - Find the SKIN_TONES array (should have 5 entries)
   - Confirm Guy() accepts and uses a skinTone parameter
   - Confirm avatar customization screen has a "Skin Tone" row with 5 swatches
   - Confirm ALL tones are available to free users (no Pro gate)
   - Confirm avatarSkin is saved to and loaded from localStorage (bsm_v5)
   - Confirm the default skin tone renders correctly when avatarSkin is undefined

Format: For each check, report PASS or FAIL with code evidence.
```

---

## VII. What NOT To Do

These are explicit anti-patterns. Do NOT pursue these during the audit sprints:

1. **Don't deploy the 70B fine-tuned model** — Together.ai dedicated endpoints cost $720+/mo. Claude Opus multi-agent at ~$84/mo for 10 scenarios/day is cheaper until you have hundreds of active users. The 70B is a cost optimization play, not a quality play.

2. **Don't build more self-learning infrastructure** — the feedback→patches→reports→weekly cron system is COMPLETE. It needs DATA (users playing), not more code. Sprint 3 closes the last feedback gap; after that, the system is ready to learn.

3. **Don't add more game modes** — 6 modes is already more than most competitors. Polish the existing modes before adding new ones.

4. **Don't optimize the worker further** — it handles 100K req/day on Cloudflare free tier. You have 1 user. Optimization is premature until you have traffic.

5. **Don't chase the DPO training fix** — the 108 preference pairs are from synthetic data, not real user preferences. Wait until real users generate preference signals.

6. **Don't restructure index.jsx into multiple files** — the single-file architecture is intentional (artifact compatibility, easy iteration). Don't split it.

7. **Don't add a database migration system** — D1 tables are created manually in the dashboard. This is fine at current scale.

8. **Don't add user accounts yet** — Phase 2.7 is planned but depends on Cloudflare D1 and COPPA compliance. Don't start it mid-audit.

---

## VIII. Final Verification — Full End-to-End

Run this after ALL 4 sprints are complete.

```
Run a complete end-to-end test of the app:

1. FRESH START:
   - Clear localStorage (delete bsm_v5 key)
   - Open preview.html (npx serve . then open localhost:3000/preview.html)
   - Complete onboarding: select age 7 (ages 6-8 group)
   - Verify fonts are ~30% larger than default (18px description, 17px options)
   - Play 3 scenarios across different positions
   - After each answer, verify:
     a. ✓/✗ symbols appear alongside colors on options
     b. "Your Choice" section has symbol prefix (✓/~/✗)
     c. Gray text is readable (not washed out)
     d. Explanations use simple language (explSimple for 6-8)

2. FULL SESSION (switch to age 12):
   - Play 15 scenarios: 5 pitcher, 5 batter, 5 centerField
   - Verify no duplicate scenarios appear in the same session
   - Verify explanations for each option are distinct (not the same lesson rephrased)
   - Verify rates display correctly (best answer shown after selection)
   - After session, verify session recap shows correct stats

3. OUTFIELD COVERAGE:
   - Play 10 leftField, 10 centerField, 10 rightField scenarios
   - Verify variety: not all the same concept
   - Verify position-specific content (LF mentions LF duties, not generic)

4. FREE LIMIT:
   - Play until free plays exhausted (8 plays)
   - Verify countdown appears ("Your plays reset in X hours")
   - Verify "while you wait" options appear (review, explore, achievements)
   - Verify each "while you wait" link works
   - Verify upgrade CTA appears below alternatives

5. AI GENERATION (if credentials available):
   - Set isPro=true in localStorage
   - Generate 5 AI scenarios: pitcher diff:1, batter diff:2, shortstop diff:3,
     manager diff:2, rules diff:1
   - Verify all pass and display correctly
   - Check browser console: no quality firewall rejections
   - Trigger a prefetch — verify it generates and caches

6. LANDSCAPE (resize browser to 1024x768):
   - Verify play screen shows field on left, scenario on right
   - Play a scenario in landscape — verify feedback also shows side-by-side
   - Resize to portrait (375x667) — verify layout reverts to column
   - Resize to small landscape (500x350) — verify it stays column (below 600 threshold)

7. AVATAR:
   - Open customization screen
   - Verify skin tone swatches appear (5 options)
   - Select different skin tone — verify Guy() updates immediately
   - Verify all 5 tones are available (no Pro lock)
   - Close and reopen customization — verify selection persisted
   - Play a scenario — verify the field sprite uses selected skin tone

8. DOCUMENTATION CONSISTENCY:
   - Open CLAUDE.md, SCENARIO_BIBLE.md, BSM_PROJECT_CONTEXT.md
   - Verify all three have matching scenario counts
   - Verify counts match the actual SCENARIOS object in index.jsx
   - Check ROADMAP.md — verify audit sprint is noted

Report: PASS/FAIL for each of the 8 test areas, with details on any failures.
After fixing failures, re-run only the failed tests to confirm resolution.
```

---

## IX. Cost & Time Estimates

| Sprint | Estimated Time | API Cost | Priority |
|--------|---------------|----------|----------|
| Sprint 1 | 6-8 hours | $0 | CRITICAL — do first |
| Sprint 2 | 8-12 hours | ~$170 ($29 critic + $140 batch gen) | HIGH |
| Sprint 3 | 8-12 hours | $0 | HIGH |
| Sprint 4 | 4-6 hours | $0 | MEDIUM |
| **Total** | **26-38 hours** | **~$170** | |

**Sprint 2 API costs are optional** — the scripts (Tasks 2.3, 2.4) are written first and costs estimated. Execution is manual-approval only.

---

## X. Dependencies

```
Sprint 1 has NO dependencies — start immediately

Sprint 2 depends on:
  - Task 2.1 (outfield scenarios) depends on Task 1.1 (duplicates removed)
  - Task 2.2 (concept coverage) depends on Task 1.4 (mastery system verified)
  - Task 2.5 (docs update) depends on ALL other Sprint 1+2 tasks

Sprint 3 has NO dependencies on Sprint 1/2 — can run in parallel if desired
  - BUT recommended after Sprint 1 so scenario quality is fixed before AI pipeline changes
  - Tasks 3.1-3.5 are independent of each other (can be parallelized)

Sprint 4 has NO dependencies on Sprint 3
  - Task 4.1 (mode descriptions) is independent
  - Task 4.2 (countdown) is independent
  - Task 4.3 (landscape) depends on Task 1.6 (font scaling) for proper rendering
  - Task 4.4 (skin tones) is independent
```

---

## XI. Files Modified

| File | Sprints | Changes |
|------|---------|---------|
| `index.jsx` | 1, 2, 3, 4 | Scenarios, feedback UI, font scaling, contrast, prefetch, ROLE_VIOLATIONS, layout, avatar |
| `worker/index.js` | 3 | Quality rejection endpoint, cross-position RAG, patch quality gate |
| `scripts/audit_explanations.js` | 1 | NEW — explanation similarity audit script |
| `scripts/critic_audit.js` | 2 | NEW — CRITIC batch scoring script |
| `scripts/batch_generate.js` | 2 | NEW — batch AI scenario generation script |
| `CLAUDE.md` | 2 | Updated scenario counts |
| `SCENARIO_BIBLE.md` | 2 | Updated counts + audit log entry |
| `BSM_PROJECT_CONTEXT.md` | 2 | Updated state snapshot |
| `ROADMAP.md` | 2 | Audit sprint notes |
