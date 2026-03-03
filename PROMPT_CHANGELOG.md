# AI Prompt Changelog

Tracks every change to the AI scenario generation prompts — what changed, why, and what happened.

## Format

Each entry follows:
```
### [DATE] — Short Title
**Level:** 1.x / 2.x / 3.x
**Change:** What was modified in the prompt
**Rationale:** Why this change was made
**Metrics Before:** (if available)
**Metrics After:** (fill in after measurement window)
**A/B Test:** test name / variant (if applicable)
**Rollback?** Yes/No — reason
```

---

## Changelog

### 2026-03-03 — Bible Principles Injection (Level 1.1)
**Level:** 1.1
**Change:** Added `BIBLE_PRINCIPLES[position]` block (~200-400 words per position) into the AI prompt, injecting Knowledge Hierarchy tiers, detailed tactical rules, coaching consensus, and edge-case guidance extracted from SCENARIO_BIBLE.md.
**Rationale:** The Scenario Bible was invisible to the AI. POS_PRINCIPLES gave ~100-150 words; the Bible provides 3-5x more detail including specific do/don't rules, role boundaries, and coaching consensus citations.
**Metrics Before:** Baseline AI quality unmeasured (no separate tracking).
**Metrics After:** TBD — track via `aiMetrics` in state and `bible_injection` A/B test.
**A/B Test:** `bible_injection` — variant "bible" (useBible: true) vs control (useBible: false).
**Rollback?** No.

---

### 2026-03-03 — Brain Analytical Data Injection (Level 1.2)
**Level:** 1.2
**Change:** Added `formatBrainForAI(position, situation)` output into the prompt — includes RE24 matrix data, count leverage, steal break-even percentages, bunt delta, TTO fatigue, scoring probability, win probability, and pitch type tendencies.
**Rationale:** The Brain constant had extensive analytical data (RE24, count stats, pitch types, scoring probability) that the AI never saw. Now the AI can generate scenarios grounded in real MLB analytics.
**Metrics Before:** AI had no access to RE24, count data, or probabilistic reasoning.
**Metrics After:** TBD — track via `brain_data_level` A/B test (full vs minimal).
**A/B Test:** `brain_data_level` — variant "full" vs "minimal".
**Rollback?** No.

---

### 2026-03-03 — Expanded Few-Shot Examples (Level 1.3)
**Level:** 1.3
**Change:** `getAIFewShot()` now returns 1-3 examples instead of 1. Primary example is position-matched (unchanged). Added concept-matched example from handcrafted scenarios and a different-difficulty example for style diversity.
**Rationale:** A single few-shot example couldn't convey the range of difficulty, explanation depth, or concept variety in the 539 handcrafted scenarios. More examples improve pattern matching.
**Metrics Before:** 1 few-shot example per prompt.
**Metrics After:** TBD — track via `few_shot_count` A/B test (1 vs 3).
**A/B Test:** `few_shot_count` — variant "three" (count: 3) vs control "one" (count: 1).
**Rollback?** No.

---

### 2026-03-03 — Source Quality Tracking (Level 1.4)
**Level:** 1.4
**Change:** Added `aiMetrics` and `hcMetrics` objects to DEFAULT state. `trackSourceQuality()` now called from the answer handler to separately track correct-answer rates on AI-generated vs handcrafted scenarios.
**Rationale:** No way to compare AI vs handcrafted quality. Now we can measure if AI scenarios teach as well as handcrafted ones.
**Metrics Before:** No separate tracking.
**Metrics After:** Ongoing — compare `aiMetrics.correct/aiMetrics.total` vs `hcMetrics.correct/hcMetrics.total`.
**A/B Test:** N/A (always-on measurement).
**Rollback?** No.

---

### 2026-03-03 — Agent Pipeline with Shadow Mode (Level 3.3-3.7)
**Level:** 3.3-3.7
**Change:** Three-stage Planner→Generator→Grader agent pipeline. Planner uses KNOWLEDGE_BASE to select teaching goal, concept, difficulty, and context. Generator builds a focused prompt from the plan. Grader runs 8+ quality checks including concept alignment and difficulty matching. Wired via `agent_pipeline` A/B test in shadow mode.
**Rationale:** Standard prompt engineering has a ceiling. The agent pipeline structures the generation process: first decide WHAT to teach, then HOW to generate it, then VERIFY quality — mimicking how a curriculum designer works.
**Metrics Before:** Single-prompt generation with post-hoc validation only.
**Metrics After:** TBD — compare agent vs standard via A/B test. Track grade scores, pass rates, and player correct-answer rates.
**A/B Test:** `agent_pipeline` — variant "agent" (useAgent: true) vs control (standard pipeline).
**Rollback?** No — shadow mode means agent failures silently fall back to standard pipeline.

---

### 2026-03-03 — Cross-Player Learning Loop (Level 3.6)
**Level:** 3.6
**Change:** `buildLearningContribution()` + `queueLearningContribution()` + `flushLearningBatch()` now batch and send anonymized per-answer data (concept, correct, difficulty, position, age group) to `/analytics/population-difficulty` Worker endpoint.
**Rationale:** Zero cross-player learning previously. If 500 kids all struggle with cutoff relays, that signal now aggregates on the server. Difficulty calibration endpoint reads this data to identify concepts with extreme correct rates.
**Metrics Before:** Each player's data isolated in localStorage.
**Metrics After:** TBD — monitor population difficulty data via `/analytics/difficulty-calibration`.
**A/B Test:** N/A (always-on data collection, calibration applied separately).
**Rollback?** No.

---

## How to Add New Entries

When modifying the AI prompt in `generateAIScenario()`, `buildAgentPrompt()`, or related functions:

1. Add a new entry at the top of the Changelog section
2. Fill in all fields — especially the A/B test name if one exists
3. After 1-2 weeks of data, fill in "Metrics After" with observed results
4. If metrics are worse, note "Rollback? Yes" and explain what was reverted
