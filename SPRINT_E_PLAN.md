# Sprint E: Advanced Features — Execution Plan
## Incorporating ALL TPA Notes + Audit Findings

**Date:** 2026-03-20
**Status:** Ready for execution

---

## What's Already Done (Sprints A-D)

- Hooks hoisted, IQ calculation fixed, tap targets enlarged, onboarding added
- Cross-tab `navigateBrain()` + 4 deep links active
- "Test Yourself" on 6 tabs, interaction tracking, tap sounds
- "Double" button, RE24 heatmap, youth bunt disclaimer, youth steal preset
- 9 Famous Moments (was 4), truncated text fixed, park selection fixed

## What Sprint E Covers (TPA-Informed)

### E1. Build Your Inning Sandbox (~60 lines)
**TPA Risk E3:** Don't duplicate runner logic — reuse existing What-If button functions.
**TPA Edge Case 6:** Need cumulative run counter separate from RE24 delta.
**TPA Edge Case 2:** Young mode uses whole numbers ("You scored 1 run!") not decimals.

### E2. Number Animation Component (~35 lines)
**TPA P1:** Used by RE24, WP%, Matchup BA, Pitch Count velocity. Build once, use everywhere.
**TPA Edge Case 2:** Stars for young players can't animate same way — use a "pop" on star count change.
**Connects:** `rePrevRE` state finally gets used (was stored but never rendered since initial build).

### E3. Pitch Trajectory SVGs (~100 lines, start with 3 pitches)
**TPA Risk E4:** "80 lines will realistically need 150-200. Start with 3 pitches."
**Build:** Fastball (straight + slight rise), Curveball (12-to-6 drop), Changeup (matches FB then drops). Add remaining 5 later.
**Include:** "Throw" button + slow-motion toggle.

### E4. Animated Steal Race (~30 lines)
**TPA notes:** Static bars → animated bars filling over 2 seconds on "Race!" button.

### E5. Pitch Count Speedometer Gauge (~40 lines)
**TPA notes:** SVG semicircle arc with 5 color zones + needle.
**TPA Edge Case 2:** Young labels: "Fresh / Getting tired / Very tired / Stop!"

### E6. Concept Map Domain-Grouped Tree View (~80 lines)
**TPA Risk E8:** "65+ SVG nodes will lag. Start with per-domain views."
**Approach:** Show one domain at a time (7-12 nodes), not all 65+. Use domain filter already built. Draw prerequisite lines between nodes within the visible domain. Keep the list as fallback.

### E7. WP Line Graph (~50 lines)
**TPA notes:** Replace bar chart with SVG polyline. Multi-line toggle for different score diffs.

### E8. Tab Challenges — 3 Starters (~50 lines)
**TPA Risk 4:** "Frame as games, not homework."
- RE24: "Build an inning that scores 3+ runs" (requires B1 sandbox)
- Pitch Lab: "Build a sequence scoring 12+ points"
- Steal: "Find the exact timing where the play is bang-bang (within 0.05s)"
**TPA insight:** Award IQ points (15 per challenge), track in brainExplored.

### E9. Haptic Feedback (~5 lines)
`navigator.vibrate?.(10)` on key interactions. Check API availability. No-op on desktop.

### E10. Brain Exploration → Explanation Personalization (~15 lines)
**TPA Section 6 — "The Missing Piece":** If `brainExplored.steal.interactions > 5`, inject "Remember your Steal Calculator experiments..." into steal-related enrichFeedback insights. Same for RE24, counts, etc.

### E11. Edge Case Fixes (~20 lines)
- Deep links to age-locked tabs: check minAge before showing "Explore →"
- "Practice This" with 0 scenarios: show "No challenges available yet" instead of dead button
- IQ visit debounce: only count visit if dwell time > 2 seconds
- brainExplored preservation across prestige resets

---

## Execution Order

| # | Item | Lines | Depends On | Priority |
|---|------|-------|-----------|----------|
| 1 | E11: Edge case fixes | ~20 | Nothing | Critical (prevents bugs) |
| 2 | E2: Number animation | ~35 | Nothing | High (used by E1, E4) |
| 3 | E1: Build Your Inning | ~60 | E2 for animated counters | High (top engagement feature) |
| 4 | E8: Tab challenges (3) | ~50 | E1 for RE24 challenge | High (gamification) |
| 5 | E3: Pitch trajectories (3 pitches) | ~100 | Nothing | High (Pitch Lab centerpiece) |
| 6 | E4: Animated steal race | ~30 | Nothing | Medium |
| 7 | E5: Speedometer gauge | ~40 | Nothing | Medium |
| 8 | E6: Domain tree view | ~80 | Nothing | Medium |
| 9 | E7: WP line graph | ~50 | Nothing | Medium |
| 10 | E10: Brain→explanation personalization | ~15 | Nothing | Medium |
| 11 | E9: Haptic feedback | ~5 | Nothing | Low |

**Total: ~485 lines, 11 items**

---

## TPA Warnings to Follow During Execution

1. **State audit first** — Count all Brain useState. If >45, consider grouping.
2. **IQ debounce** — Add 2-second dwell time check before counting visits.
3. **Age 6-8 on every feature** — Every item needs an `isYoung` check.
4. **Start pitch SVGs with 3, not 8** — Fastball, curveball, changeup only.
5. **Domain tree, not full tree** — Show 7-12 nodes per domain, not 65+ at once.
6. **Frame challenges as games** — "Can you score 3 runs?" not "Complete the exercise."
7. **Test the Quiz→Brain→Quiz full loop** after implementation.
