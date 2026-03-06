# Claude Code Prompt: Phase 6 — Prompt Architecture Polish

## Context
You're working on Baseball Strategy Master (`index.jsx`, ~12,200 lines). This is Phase 6 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context. This phase reorders the agent prompt to prioritize coaching over data, adds explicit wrong-option design guidance, and rotates few-shot examples.

**Prerequisites:** Phases 1-3 should be done first (this phase builds on the archetypes from Phase 2 and the coaching voice from Phase 3).

## Changes (3 total)

### 6A. Reorder prompt sections in `buildAgentPrompt()`

**Location:** `buildAgentPrompt()` at line ~8297, specifically the return statement that assembles the final prompt string (around line ~8438).

Current order:
```
tier1 → qualityRules → topics → brainData → examples → fewShot → avoid → context → voice → patch → template
```

New order:
```
tier1 → qualityRules → archetypes → examples → fewShot → wrongOptionDesign → topics → brainData (slimmed) → avoid → context → voice → patch → template
```

Key changes:
1. **Archetypes** (from Phase 2) move UP — right after quality rules, before any data
2. **Examples and fewShot** move UP — before topics and brain data
3. **Wrong option design** (new, from 6B below) goes after examples
4. **Brain data** stays near the bottom — it's reference material, not the primary instruction
5. **Topics** (the concept/subject of the scenario) stays before brain data

The principle: **Coaching mandate → Game structure → Examples → Reference data**. The AI should internalize the coaching voice and option structure before it ever sees statistical tables.

### 6B. Add wrong option design instruction

**Location:** In `buildAgentPrompt()`, add this as a new section (the `wrongOptionDesign` variable referenced in 6A).

```javascript
const wrongOptionDesign = `
WRONG OPTION DESIGN:
Each wrong option should represent a DIFFERENT type of mistake:
1. BEGINNER MISTAKE — What someone who doesn't know the concept would try. This is the most common error coaches see in young players. Rate: 15-30.
2. EXPERIENCED PLAYER'S MISTAKE — Sounds smart but is wrong in THIS specific situation. This is where real learning happens — the player has to think about WHY it's wrong even though it sounds reasonable. Rate: 45-60.
3. PANIC REACTION — What happens when a player freezes, rushes, or doesn't think before acting. Rate: 10-25.

The EXPERIENCED PLAYER'S MISTAKE (option 2) is the most important. It's what separates a good scenario from a mediocre one. If you can't think of a plausible-sounding wrong answer, the scenario concept probably isn't rich enough.
`
```

### 6C. Rotate few-shot examples per concept

**Location:** In `buildAgentPrompt()`, find where few-shot examples are assembled.

Currently the same example(s) are shown every time. Change to maintain a small pool per position and rotate randomly:

```javascript
// Instead of always using the same few-shot example, rotate from a pool
const FEW_SHOT_POOL = {
  pitcher: [
    // 3-5 curated examples for pitcher scenarios
    { /* example scenario object 1 */ },
    { /* example scenario object 2 */ },
    { /* example scenario object 3 */ },
  ],
  catcher: [ /* ... */ ],
  batter: [ /* ... */ ],
  // etc. for each position
}

// Select 1 random example from the pool
const pool = FEW_SHOT_POOL[position] || FEW_SHOT_POOL.batter || []
const fewShotExample = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null
```

For the few-shot examples themselves, pull from the best handcrafted scenarios in the `SCENARIOS` object. Pick 3-5 scenarios per position that:
- Have clear, coaching-voice explanations
- Have strategically distinct options (not 4 of the same action)
- Cover the most common concepts for that position
- Represent good difficulty balance (not too easy)

You can extract these programmatically: look at the handcrafted scenarios and pick ones that would score highest on the grading criteria.

**NOTE:** If the current few-shot implementation is simple (just one hardcoded example), start with 3 examples per position for the most common positions (pitcher, batter, baserunner, shortstop, catcher) and add more later. Don't try to build 5 examples for all 15 positions in one pass.

## Verification

1. Read the assembled prompt in the console log (`[BSM] AI raw` or similar) — confirm the order matches: coaching rules → archetypes → examples → data
2. Brain data should appear near the END of the prompt, not in the middle
3. Run 5 AI scenarios — check that wrong options represent different mistake types (not 3 of the same kind)
4. Run 10 scenarios for the same position — the few-shot example should vary (not the same one every time)
5. Compare prompt lengths before and after — with Phase 1's brain data slimming + this reorder, prompts should be noticeably shorter and more focused

## Important

- Don't remove any prompt sections — just reorder them
- The JSON output template MUST stay at the very end of the prompt (the AI needs it as the final instruction before generating)
- If archetypes or wrongOptionDesign sections are empty (e.g., no archetype for this concept), just skip that section — don't inject blank lines
- The few-shot pool doesn't need to be exhaustive at launch — even 1-2 examples per common position is better than the same example every time
