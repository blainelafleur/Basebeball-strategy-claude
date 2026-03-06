# Claude Code Prompt: Phase 1 — Concept Weighting + Brain Data Slimming

## Context
You're working on Baseball Strategy Master (`index.jsx`, ~12,200 lines). This is Phase 1 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context. This phase addresses 2 root causes: (1) flat concept weighting means a shortstop gets pitch-clock scenarios as often as cutoff-relay, and (2) `formatBrainForAI()` dumps ALL statistical data into every prompt regardless of concept relevance.

## Changes (3 total)

### 1A. Add `CONCEPT_FUNDAMENTAL_WEIGHTS` constant + modify `getConceptWeight()`

**Location:** Add the constant just before `getConceptWeight()` at line ~8134.

Add a lookup table mapping each of the 15 position categories to their core concepts with weight multipliers. Default is 1x (no boost). Higher multipliers = more likely to be selected.

```javascript
const CONCEPT_FUNDAMENTAL_WEIGHTS = {
  pitcher: {
    'first-pitch-strike': 3, 'count-leverage': 2.5, 'pitch-sequencing': 2,
    'pickoff-mechanics': 2, 'pitch-clock-strategy': 1.5, 'fielding-position': 1.5
  },
  catcher: {
    'pitch-calling': 3, 'steal-window': 2.5, 'first-third': 2,
    'blocking-technique': 2, 'framing': 1.5, 'pop-time': 1.5
  },
  firstBase: {
    'holding-runners': 3, 'cutoff-alignment': 2.5, 'bunt-defense': 2.5,
    'scoop-technique': 2, 'double-play-turn': 2, 'backup-duties': 1.5
  },
  secondBase: {
    'double-play-turn': 3, 'relay-double-cut': 2.5, 'cutoff-alignment': 2.5,
    'fly-ball-priority': 2, 'bunt-defense': 2, 'rundown': 1.5
  },
  shortstop: {
    'cutoff-roles': 3, 'relay-double-cut': 3, 'double-play-turn': 3,
    'fly-ball-priority': 2.5, 'bunt-defense': 2, 'force-vs-tag': 2
  },
  thirdBase: {
    'bunt-defense': 3, 'cutoff-alignment': 2.5, 'tag-play': 2.5,
    'force-vs-tag': 2, 'fly-ball-priority': 2, 'relay-double-cut': 1.5
  },
  leftField: {
    'fly-ball-priority': 3, 'backup-duties': 2.5, 'cutoff-alignment': 2.5,
    'relay-double-cut': 2, 'wall-play': 2, 'tag-up-rules': 1.5
  },
  centerField: {
    'fly-ball-priority': 3, 'backup-duties': 3, 'cutoff-alignment': 2.5,
    'relay-double-cut': 2.5, 'wall-play': 2, 'communication': 2
  },
  rightField: {
    'fly-ball-priority': 3, 'backup-duties': 2.5, 'cutoff-alignment': 2.5,
    'relay-double-cut': 2, 'throw-selection': 2, 'tag-up-rules': 1.5
  },
  batter: {
    'two-strike-approach': 3, 'count-leverage': 3, 'situational-hitting': 2.5,
    'pitch-recognition': 2.5, 'sacrifice-bunt': 2, 'hit-and-run': 2
  },
  baserunner: {
    'tag-up': 3, 'force-vs-tag': 3, 'secondary-lead': 2.5,
    'steal-breakeven': 2, 'lead-distance': 2, 'first-to-third': 2
  },
  manager: {
    'pitching-change': 2.5, 'defensive-alignment': 2.5, 'lineup-strategy': 2,
    'bullpen-management': 2, 'ibb-strategy': 2, 'pinch-hit': 2
  },
  famous: {},
  rules: {},
  counts: {
    'count-leverage': 3, 'two-strike-approach': 2.5, 'first-pitch-strike': 2.5,
    'pitch-sequencing': 2
  }
}
```

**Then modify `getConceptWeight()` (line ~8134):**

Find the line `let weight = 10` inside `getConceptWeight()` and change it to:

```javascript
let weight = 10 * (CONCEPT_FUNDAMENTAL_WEIGHTS[position]?.[tag] || 1)
```

This is the ONLY line change needed in the function. Everything else (mastery modifiers, age gates, prerequisites) stays the same and stacks on top.

### 1B. Make `formatBrainForAI()` concept-aware

**Location:** `formatBrainForAI()` at line ~7047

Add a `targetConcept` parameter and a `CONCEPT_DATA_RELEVANCE` mapping. Only include brain data sections that are relevant to the target concept.

1. Change the function signature to accept `targetConcept` as a third parameter:
```javascript
// Before:
getBrainDataForSituation(position, situation) {
// After:
getBrainDataForSituation(position, situation, targetConcept) {
```

2. Add this mapping inside or just before the function:
```javascript
const CONCEPT_DATA_RELEVANCE = {
  re24: ['bunt-re24', 'steal-breakeven', 'ibb-strategy', 'scoring-probability', 'win-probability', 'situational-hitting', 'sacrifice-bunt', 'squeeze-play'],
  counts: ['count-leverage', 'two-strike-approach', 'first-pitch-strike', 'pitch-sequencing', 'pitch-calling'],
  steal: ['steal-breakeven', 'secondary-lead', 'lead-distance', 'steal-window', 'pickoff-mechanics'],
  bunt: ['bunt-re24', 'squeeze-play', 'bunt-defense', 'sacrifice-bunt'],
  pitchType: ['pitch-sequencing', 'count-leverage', 'pitch-calling', 'pitch-recognition']
}
```

3. Inside the function, wrap each data section with a relevance check. The pattern is:
```javascript
// Before each data dump section, check if the concept needs it:
const includeRE24 = !targetConcept || CONCEPT_DATA_RELEVANCE.re24.includes(targetConcept)
const includeCounts = !targetConcept || CONCEPT_DATA_RELEVANCE.counts.includes(targetConcept)
const includeSteal = !targetConcept || CONCEPT_DATA_RELEVANCE.steal.includes(targetConcept)
const includeBunt = !targetConcept || CONCEPT_DATA_RELEVANCE.bunt.includes(targetConcept)
const includePitchType = !targetConcept || CONCEPT_DATA_RELEVANCE.pitchType.includes(targetConcept)

// Then wrap each section:
if (includeRE24) { /* ...existing RE24 data injection... */ }
if (includeCounts) { /* ...existing count data injection... */ }
// etc.
```

**ALWAYS keep** the compact TACTICAL RULES summary and CALCULATED ANALYSIS sections — those are short and universally useful. Only skip the raw data tables.

4. Update the call site in `planScenario()` (line ~8253) to pass the selected concept:
```javascript
// Before:
const brainData = KNOWLEDGE_BASE.getBrainDataForSituation(position, {})
// After:
const brainData = KNOWLEDGE_BASE.getBrainDataForSituation(position, {}, selectedConcept)
```

Also check `generateAIScenario()` and `generateWithAgentPipeline()` for any other call sites to `getBrainDataForSituation` and pass the concept there too.

### 1C. Concept-specific knowledge map injection

**Location:** Around line ~8250 in `planScenario()` where `getKnowledgeMapsForPosition()` is called.

Currently all maps for the position are injected. Change to only inject the one relevant map.

Add a mapping:
```javascript
const CONCEPT_MAP_RELEVANCE = {
  'cutoff-roles': 'CUTOFF_RELAY_MAP',
  'cutoff-alignment': 'CUTOFF_RELAY_MAP',
  'relay-double-cut': 'CUTOFF_RELAY_MAP',
  'bunt-defense': 'BUNT_DEFENSE_MAP',
  'sacrifice-bunt': 'BUNT_DEFENSE_MAP',
  'first-third': 'FIRST_THIRD_MAP',
  'tag-up': 'TAGUP_SACRIFICE_FLY_MAP',
  'tag-up-rules': 'TAGUP_SACRIFICE_FLY_MAP',
  'backup-duties': 'BACKUP_MAP',
  'rundown': 'RUNDOWN_MAP',
  'double-play-turn': 'DP_POSITIONING_MAP',
  'hit-and-run': 'HIT_RUN_MAP',
  'pickoff-mechanics': 'PICKOFF_MAP',
}
```

Then change the map injection to:
```javascript
const relevantMapKey = CONCEPT_MAP_RELEVANCE[selectedConcept]
const maps = relevantMapKey
  ? KNOWLEDGE_BASE.getSpecificMap(relevantMapKey)  // new method — or just lookup from KNOWLEDGE_MAPS directly
  : ''
```

If `getSpecificMap` doesn't exist, you can access `KNOWLEDGE_MAPS[relevantMapKey]` directly, or add a thin wrapper. The key point: only inject ONE map, not all of them.

## Verification

After making these changes:

1. Search the file for `getConceptWeight` — confirm it uses the new `CONCEPT_FUNDAMENTAL_WEIGHTS` lookup
2. Search for `getBrainDataForSituation` — confirm all call sites pass the concept parameter
3. Search for `getKnowledgeMapsForPosition` — confirm the call in `planScenario` now uses concept-specific injection
4. Open the app in browser, select shortstop, click "AI Coach's Challenge"
5. Watch the console for `[BSM Agent] Plan:` — the concept should heavily favor cutoff/relay/DP
6. Check `[BSM] AI raw` console log — the prompt should be noticeably shorter (no irrelevant data tables)
7. Repeat for batter — concepts should favor two-strike/count-leverage/situational-hitting
8. Repeat for a position with no concept weights (e.g., famous) — should still work with default weight of 1

## Important

- Do NOT change the mastery, age gate, or prerequisite logic in `getConceptWeight()` — those stack on top of the new fundamental weights
- Do NOT remove any data from `BRAIN` or `KNOWLEDGE_MAPS` — just control what gets injected into the prompt
- If `targetConcept` is null/undefined, ALL data should still be included (backward compatibility)
