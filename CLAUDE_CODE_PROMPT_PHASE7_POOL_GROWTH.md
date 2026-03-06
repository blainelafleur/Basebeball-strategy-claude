# Claude Code Prompt: Phase 7 — Pool Growth

## Context
You're working on Baseball Strategy Master (`index.jsx` + `worker/index.js`). This is Phase 7 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context.

Currently the D1 scenario pool has 22 scenarios but 10 of 15 positions have ZERO pool scenarios. The pool is heavily skewed toward pitcher (11) and batter (6). This phase seeds the pool with scenarios for underserved positions and lowers the quality gate temporarily for small pools.

**Prerequisites:** Phases 1-5 should be done first — the scenarios generated here should benefit from concept weighting, coaching voice, and option archetypes.

## Changes (2 total)

### 7A. Seed pool for underserved positions

This is a MANUAL/SEMI-AUTOMATED task, not a pure code change.

**Approach:**
1. For each of the 10 positions with 0 pool scenarios (secondBase, shortstop, thirdBase, leftField, centerField, rightField, firstBase, baserunner, manager, counts/rules/famous), generate 5 AI scenarios using the app
2. Review each one for quality — does it sound like a coach? Are the options distinct? Is the difficulty right?
3. If it passes review, submit it to the pool via the existing pool submission endpoint

**Alternatively**, create a batch seeding script:

```javascript
// Script to batch-generate and submit pool scenarios
// Run this from the browser console or as a Node script that calls the worker

const SEED_POSITIONS = [
  'secondBase', 'shortstop', 'thirdBase',
  'leftField', 'centerField', 'rightField',
  'firstBase', 'baserunner', 'manager'
]

const SCENARIOS_PER_POSITION = 5

for (const position of SEED_POSITIONS) {
  for (let i = 0; i < SCENARIOS_PER_POSITION; i++) {
    // Generate via the agent pipeline
    // Submit to pool if quality_score >= 7.5 (lowered gate)
    // Log results for manual review
  }
}
```

The actual implementation depends on how the pool submission works. If there's a `/pool/submit` endpoint in the worker, you can call it directly. If pool submission happens client-side, you'd need to automate via the browser.

**Minimum goal:** At least 3 pool scenarios for every position. This ensures the three-tier serving (cache → pool → fresh) always has pool candidates.

### 7B. Lower pool quality gate for underserved positions

**Location:** `worker/index.js` — find the pool submission handler where quality_score is checked.

Currently scenarios need a quality_score of 8.0+ to enter the pool (or whatever the current threshold is). For positions with fewer than 3 pool scenarios, lower the gate:

```javascript
// In the pool submission handler:
const existingCount = await env.DB.prepare(
  'SELECT COUNT(*) as cnt FROM scenario_pool WHERE position = ? AND retired = 0'
).bind(position).first()

const qualityGate = (existingCount?.cnt || 0) < 3 ? 7.5 : 8.0

if (qualityScore >= qualityGate) {
  // Insert into pool
  await env.DB.prepare(
    'INSERT INTO scenario_pool (position, difficulty, concept, concept_tag, title, scenario_json, quality_score, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(position, difficulty, concept, conceptTag, title, JSON.stringify(scenario), qualityScore, 'ai').run()
}
```

This is self-correcting: once a position has 3+ scenarios, the gate goes back to 8.0 automatically.

## Verification

1. Check D1 `scenario_pool` table — all 15 positions should have at least 1 scenario (ideally 3+)
2. Query: `SELECT position, COUNT(*) FROM scenario_pool WHERE retired = 0 GROUP BY position`
3. Play scenarios from underserved positions — they should come from the pool (not fresh generation)
4. Check that the lowered gate works: submit a 7.5-quality scenario for a position with < 3 pool entries — it should be accepted
5. Submit a 7.5-quality scenario for a position with 3+ entries — it should be rejected

## Important

- This is the LOWEST priority phase — don't rush it before the quality improvements in Phases 1-5 are working
- The batch seeding is best done AFTER all prompt improvements are live, so the generated scenarios benefit from better prompts
- Manual review is important for seed scenarios — don't auto-accept everything above 7.5
- The lowered gate is a TEMPORARY measure — once all positions have 5+ pool scenarios, you can raise it back to 8.0 or even 8.5
- Don't seed scenarios for "famous", "rules", or "counts" categories — those are better served by handcrafted content
