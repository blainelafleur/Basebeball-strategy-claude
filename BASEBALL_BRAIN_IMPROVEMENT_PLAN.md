# Baseball Brain — Unified Improvement Plan
## Combined from: TPA Code Audit + TPA UX Audit + Cowork Live QA

**Date:** 2026-03-20
**Sources:** BASEBALL_BRAIN_AUDIT.md (TPA), IDEAS_AND_INSIGHTS.md (TPA Round 1), BRAIN_QA_REPORT.md (Cowork)

---

## How This Plan Was Built

Three independent reviews were conducted:
1. **TPA Round 1** — Code-level review of RE24 Explorer + Count Dashboard, found hooks violation, state mutation bugs, missing features from plan
2. **TPA Round 2** — Full UX audit of all 11 tabs from 3 perspectives (13yo player, UX designer, baseball coach), produced 33 items
3. **Cowork Live QA** — Actually played the game on desktop at 1281x960, tested all tabs + deep links + navigation, gave "A-" grade

### Cross-Reference: Where All Three Agree

| Issue | TPA R1 | TPA R2 | Cowork | Verdict |
|-------|--------|--------|--------|---------|
| Base tap targets too small | YES | YES | YES | **CONFIRMED — all 3 found this** |
| No first-visit onboarding | YES | YES | YES | **CONFIRMED — all 3 found this** |
| Tab strip discoverability | — | YES | YES | **CONFIRMED — 2 of 3** |
| Missing "Double" button | YES | YES | — | Confirmed |
| Pitch sequence click misses | — | — | YES | **Cowork-only — needs code investigation** |
| Truncated history text | — | — | YES | **Cowork-only — real bug** |
| BrainIQ never increments | — | YES | — | Confirmed (code bug) |
| No animated numbers | YES | YES | — | Confirmed |
| Missing "Build Your Inning" | YES | YES | — | Confirmed |
| Park selection by type not park | — | YES | — | Confirmed |
| Nested scroll in Concept Map | — | YES | — | Confirmed |
| No cross-tab deep links | YES | YES | — | Confirmed |
| Missing pitch trajectory SVGs | — | YES | — | Confirmed |

### Cowork Findings NOT in TPA Audits

| Cowork Finding | Valid? | Action |
|----------------|--------|--------|
| "Sequence clicks sometimes miss" in Pitch Lab | **VALID** — likely a touch target issue on pitch cards during sequence mode (cards have padding:8px, borderRadius:10, onClick competes with the sequence handler) | Fix: ensure sequence-mode click handler takes priority |
| "Truncated fun fact text" in History tab | **VALID** — the league trends ticker at line ~3991 slices the string with `.split(".")[0]+"."` which cuts mid-number if the sentence has decimals | Fix: use full string or better truncation |
| "No Practice This for mastered concepts" | **VALID** — good UX suggestion. Mastered concepts should show "Review This →" | Add to Sprint B |
| "Only Infield In has situation toggles" | **VALID** — DP Depth should also show justified/not justified based on runners on 1st + outs | Add to Sprint D |
| "TTO tooltip needed" in Matchup | **VALID** — "TTO" is jargon even for 13yo. Need inline explanation | Add to Sprint A |
| "More Famous Moments" | **AGREED** by all — 4 is thin, need 8-12 | Already in Sprint D |
| "Sounds/animations missing" | **VALID** — Brain is silent compared to the quiz with its Web Audio sounds. At minimum, add a tap sound on interactions | Add to Sprint C |
| "Share discoveries" | **NICE-TO-HAVE** — clipboard share for Brain facts would be cheap and viral | Add to Sprint D |

### TPA Findings Cowork DIDN'T Find

This makes sense — Cowork tested on desktop (1281x960), so mobile-specific issues were invisible:
- Touch target sizes (desktop has mouse precision)
- Nested scrolling issues (desktop scroll works differently)
- Tab strip scroll indicators (wider screen shows more tabs)
- Color-blind accessibility (automated testing)

Also, Cowork couldn't see:
- BrainIQ bug (requires checking localStorage code logic)
- Park selection by-type-not-by-park (Cowork may not have noticed same data for different parks)
- Missing daily fact rotation (requires multi-session testing)

---

## Unified Execution Plan

### Sprint A: Critical Fixes + Quick Wins (~120 lines, 2-3 hours)
*Remove every source of first-visit friction. Fix real bugs.*

| # | Item | Source | What | Lines |
|---|------|--------|------|-------|
| A1 | First-visit onboarding | ALL 3 | One-time tooltip: "Tap a base to add a runner, then try the buttons below!" Pulsing glow on base diamonds. Dismiss on first base tap. Track via `brainExplored._onboarded`. | ~25 |
| A2 | Fix BrainIQ calculation | TPA R2 | Replace circular ternary with `tabsVisited * 5`. Display IQ in Brain header as badge with title. | ~20 |
| A3 | Enlarge base tap targets | ALL 3 | Add invisible 28x28 hit areas around each base diamond. Enlarge diamond SVG from 180x140 to 220x170. | ~10 |
| A4 | Tab strip scroll indicator | TPA R2 + Cowork | Add right-edge fade gradient (`maskImage`) + auto-scroll to active tab on deep link (`scrollIntoView`). | ~12 |
| A5 | Fix truncated history text | Cowork | Change `lt.strikeoutRate.trend.split(".")[0]+"."` to use the full trend string or slice at sentence boundary. | ~2 |
| A6 | Fix park selection (individual parks) | TPA R2 | Change `parkType` state to `selParkIdx`. Show individual park data. | ~15 |
| A7 | Fix nested scroll in Concept Map | TPA R2 | Remove `maxHeight:400` and `overflowY:auto` from concept list. | ~2 |
| A8 | Add empty-state prompts | TPA R2 | RE24: "Tap a base to place a runner!" Pitch Lab: "Tap a pitch to learn about it." History: "Pick a famous moment!" | ~12 |
| A9 | Fix daily fact rotation | TPA R2 | Set `brainFactIdx` from date: `Math.floor(Date.now()/86400000) % 20` | ~3 |
| A10 | Add TTO tooltip in Matchup | Cowork | Add inline text: "Times Through Order (TTO) — how many times this batter has faced this pitcher today" | ~3 |
| A11 | Fix pitch sequence click misses | Cowork | In sequence mode, add `e.stopPropagation()` and ensure sequence handler fires before card select handler. | ~5 |

### Sprint B: Engagement & Game Loops (~210 lines, 4-5 hours)
*Make Brain sticky. Give kids a reason to come back.*

| # | Item | Source | What | Lines |
|---|------|--------|------|-------|
| B1 | "Build Your Inning" sandbox | TPA R1+R2 | Toggle button → track runs, outs, actions through a full half-inning. Show total at 3 outs: "You scored X runs! Average: 0.47." High score tracking. | ~60 |
| B2 | Animated number transitions | TPA R1+R2 | `NumberAnim` component (useRef + rAF, 400ms ease-out). Apply to RE24 value, WP%, Matchup BA. | ~40 |
| B3 | Cross-tab deep links | TPA R1+R2 | `navigateBrain(tab, state)` function. Add "See the steal math →" after steal in RE24, "What pitch here?" in Counts → Pitch Lab, etc. 10 links from the TPA mapping table. | ~50 |
| B4 | "Test Yourself" on every tab | TPA R2 | Footer button finds a scenario matching the tab's concept and launches quiz. Return to Brain after answering. | ~40 |
| B5 | "Review This →" for mastered concepts | Cowork | Concept Map shows review button for mastered concepts, finding a scenario for that concept. | ~10 |
| B6 | Tap sounds on Brain interactions | Cowork | Add `snd.play('tap')` on base toggle, What-If buttons, count select, preset buttons. Reuse existing Web Audio system. | ~10 |

### Sprint C: Visual Polish (~200 lines, 4-5 hours)
*Make it feel premium, not prototype-y.*

| # | Item | Source | What | Lines |
|---|------|--------|------|-------|
| C1 | Pitch trajectory SVGs | TPA R2 | Side-view SVG (300x100) showing pitch path. 8 unique paths (straight, drop, break, sweep). "Throw" button + slow-motion toggle. | ~80 |
| C2 | Animated steal race | TPA R2 | "Race!" button → both bars animate from 0 to final width over 2s. CSS transition or rAF. | ~30 |
| C3 | Speedometer gauge for Pitch Count | TPA R2 | SVG semicircle arc with 5 color zones + needle. Replace big number as primary visual (keep number as label). | ~40 |
| C4 | Tab mastery rings | TPA R2 | Small SVG circle arc on each tab icon showing exploration %. Derive from `brainExplored[tab]`. | ~25 |
| C5 | RE24 matrix heatmap | TPA R2 | Add cell background gradient (green high → red low) to the full matrix table. | ~5 |
| C6 | Color-blind accessibility | TPA R2 | Add text labels ("Hitter's count" / "Pitcher's count") visible at all ages. Add ↑/↓ arrows on delta badges. | ~15 |
| C7 | "Double" What-If button | TPA R1+R2 | Runners on 2nd/3rd score, runner on 1st → 3rd, batter → 2nd. Show delta. | ~15 |

### Sprint D: Content & Depth (~160 lines, 3-4 hours)
*Fill gaps, add depth, fix educational issues.*

| # | Item | Source | What | Lines |
|---|------|--------|------|-------|
| D1 | 4-8 more Famous Moments | ALL | Buckner 1986, Gibson HR 1988, Bumgarner 2014, Pine Tar Game, Moneyball/OBP revolution, Jeter flip play 2001. Each ~10 lines. | ~60 |
| D2 | Youth bunt disclaimer | TPA R1 | When vocabTier ≤ 3 + bunt tapped: "At your level, bunting works better than these MLB numbers suggest." | ~5 |
| D3 | Youth steal preset | Cowork + TPA | "Youth League" preset in Steal Calculator with age-adjusted timing. | ~5 |
| D4 | DP Depth situation toggles | Cowork | Add runner/outs toggles for DP Depth preset (not just Infield In). Show "justified" when R1 + <2 outs. | ~20 |
| D5 | Share Brain discoveries | Cowork | "Share" button → copies fact to clipboard: "Did you know? A runner on 3rd with 0 outs scores 85% of the time! — Baseball Strategy Master" | ~15 |
| D6 | Tab challenges (5 starter) | TPA R2 | RE24: "Score 4+ runs in an inning." Pitch Lab: "Build a 12+ point sequence." Steal: "Find the fastest combo that gets thrown out." Track completion. Award IQ. | ~55 |

### Sprint E: Advanced Features (~370 lines, 6-8 hours)
*The "wow factor" — do when everything else is solid.*

| # | Item | Source | What | Lines |
|---|------|--------|------|-------|
| E1 | RPG skill tree for Concept Map | TPA R2 | SVG graph layout replacing flat list. Nodes by domain, lines between prereqs, color by mastery. | ~120 |
| E2 | Pitch tunneling overlay | TPA R2 | Two pitch paths overlaid in same SVG. Label at divergence point. | ~50 |
| E3 | WP line graph (multi-line) | TPA R2 | Replace bar chart with polyline. Toggle multiple score diffs as colored lines. | ~60 |
| E4 | Draggable fielders | TPA R2 | Field SVG with movable Guy() sprites. Stats update on drag. Snap to presets. | ~100 |
| E5 | Brain streak tracking | TPA R2 | Track consecutive days visiting Brain. Show in header. Rewards at 7/14/30 days. | ~20 |
| E6 | Haptic feedback | TPA R2 | `navigator.vibrate?.(10)` on key interactions across all tabs. | ~10 |

---

## Effort Summary

| Sprint | Items | Lines | Time | Focus |
|--------|-------|-------|------|-------|
| **A: Critical Fixes** | 11 | ~120 | 2-3 hrs | Remove friction, fix bugs |
| **B: Engagement** | 6 | ~210 | 4-5 hrs | Game loops, cross-links, sounds |
| **C: Visual Polish** | 7 | ~200 | 4-5 hrs | Animations, gauge, trajectories |
| **D: Content** | 6 | ~160 | 3-4 hrs | Moments, youth fixes, challenges |
| **E: Advanced** | 6 | ~370 | 6-8 hrs | Skill tree, tunneling, draggables |
| **TOTAL** | **36** | **~1,060** | **~22 hrs** | |

---

## Validation Matrix

Every item in this plan was found by at least one independent reviewer:

| Item | TPA R1 | TPA R2 | Cowork | Count |
|------|--------|--------|--------|-------|
| A1 (onboarding) | ✓ | ✓ | ✓ | 3/3 |
| A2 (IQ bug) | | ✓ | | 1/3 |
| A3 (tap targets) | ✓ | ✓ | ✓ | 3/3 |
| A4 (tab scroll) | | ✓ | ✓ | 2/3 |
| A5 (truncated text) | | | ✓ | 1/3 |
| A6 (park selection) | | ✓ | | 1/3 |
| A7 (nested scroll) | | ✓ | | 1/3 |
| A8 (empty states) | | ✓ | ✓ | 2/3 |
| A9 (fact rotation) | | ✓ | | 1/3 |
| A10 (TTO tooltip) | | | ✓ | 1/3 |
| A11 (seq clicks) | | | ✓ | 1/3 |
| B1 (sandbox) | ✓ | ✓ | | 2/3 |
| B2 (number anim) | ✓ | ✓ | | 2/3 |
| B3 (cross-links) | ✓ | ✓ | | 2/3 |
| B4 (test yourself) | | ✓ | | 1/3 |
| B5 (review mastered) | | | ✓ | 1/3 |
| B6 (sounds) | | | ✓ | 1/3 |
| C1 (pitch SVGs) | | ✓ | | 1/3 |
| C7 (Double button) | ✓ | ✓ | | 2/3 |
| D1 (more moments) | | ✓ | ✓ | 2/3 |

Items found by 3/3 reviewers are the highest confidence. Items found by 1/3 were still validated as real issues.

---

## Recommended Start

**Sprint A first.** It's 11 small fixes totaling ~120 lines. Every item removes a source of confusion or fixes a real bug. A kid who opens Brain after Sprint A will:
- See a tooltip telling them what to do (A1)
- Be able to tap bases easily (A3)
- See all tabs exist (A4)
- Get a different fact each day (A9)
- See their IQ score (A2)

That's the difference between "confused → leaves" and "curious → explores."

---

*This plan consolidates findings from 3 independent reviews. All line estimates are approximations. Sprint order is by impact, not difficulty.*
