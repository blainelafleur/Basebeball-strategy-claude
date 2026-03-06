# Claude Code Prompt: Phase 4 — Strategic Validation

## Context
You're working on Baseball Strategy Master (`index.jsx`, ~12,200 lines). This is Phase 4 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context. This phase adds firewall checks that catch strategic impossibilities before scenarios reach players — things like recommending a double play with 2 outs or having the pitcher be the cutoff man.

## Changes (2 total)

### 4A. Add 3 new `QUALITY_FIREWALL.tier1` checks

**Location:** `QUALITY_FIREWALL` object at line ~7183. Add these 3 new checks to the `tier1` array.

**Check 1: `situationActionContradiction`**

Catches scenarios where the game situation makes the recommended action impossible:

```javascript
{
  name: 'situationActionContradiction',
  check: (s) => {
    const outs = s.situation?.outs
    const best = s.options?.[s.best]?.toLowerCase() || ''
    const allText = (s.options || []).join(' ').toLowerCase() + ' ' + (s.explanations || []).join(' ').toLowerCase()
    const sit = s.situation || {}

    // Double play impossible with 2 outs
    if (outs === 2 && /double\s*play|turn\s*two|6-4-3|4-6-3/.test(allText)) {
      return { pass: false, reason: 'dp_with_2_outs' }
    }
    // Sacrifice bunt pointless with 2 outs
    if (outs === 2 && /sacrifice\s*bunt|sac\s*bunt/.test(best)) {
      return { pass: false, reason: 'sac_bunt_with_2_outs' }
    }
    // Tag-up framing wrong with 2 outs (should be "run on contact")
    if (outs === 2 && /tag\s*up|tagging\s*up/.test(best)) {
      return { pass: false, reason: 'tag_up_with_2_outs' }
    }
    // Infield fly only with < 2 outs and runners on 1st+2nd or bases loaded
    if (outs === 2 && /infield\s*fly/.test(allText)) {
      return { pass: false, reason: 'infield_fly_with_2_outs' }
    }
    // Steal with 2 outs and big lead is pointless
    if (outs === 2 && /steal|stolen\s*base/.test(best)) {
      const score = sit.score || {}
      const lead = (score.home || 0) - (score.away || 0)
      if (Math.abs(lead) >= 3) {
        return { pass: false, reason: 'steal_2_outs_big_lead' }
      }
    }
    return { pass: true }
  }
}
```

**Check 2: `principleContradiction`**

Catches scenarios where the best answer violates position principles. This check needs `position` passed to the validate function (see 4B).

```javascript
{
  name: 'principleContradiction',
  check: (s, position) => {
    const best = s.options?.[s.best]?.toLowerCase() || ''
    const bestExpl = s.explanations?.[s.best]?.toLowerCase() || ''
    const combined = best + ' ' + bestExpl

    // Pitcher should NEVER be the cutoff or relay man
    if (position === 'pitcher' && /cutoff|relay|cut.?off/.test(combined)) {
      return { pass: false, reason: 'pitcher_as_cutoff' }
    }
    // Center fielder has priority over corners — should never defer
    if (position === 'centerField' && /defer|let.*fielder|give\s*way/.test(combined)) {
      return { pass: false, reason: 'cf_deferring_to_corner' }
    }
    // Catcher stays home — should not run to cover a base (except in very rare situations)
    if (position === 'catcher' && /cover\s*(first|second|third|2nd|3rd|1st)\s*base/.test(combined)) {
      return { pass: false, reason: 'catcher_leaving_home' }
    }
    // Baserunner doesn't direct the defense
    if (position === 'baserunner' && /yell|signal|direct|tell.*fielder|wave/.test(combined)) {
      return { pass: false, reason: 'baserunner_directing_defense' }
    }
    return { pass: true }
  }
}
```

**Check 3: `optionActionDiversity`**

Catches "4 slightly different throws" or "4 versions of the same action":

```javascript
{
  name: 'optionActionDiversity',
  check: (s) => {
    const options = s.options || []
    if (options.length !== 4) return { pass: true }

    const verbs = options.map(o => (o || '').split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''))
    if (new Set(verbs).size === 1 && verbs[0].length > 0) {
      return { pass: false, reason: 'all_options_same_action_verb' }
    }
    return { pass: true }
  }
}
```

### 4B. Pass `position` to `QUALITY_FIREWALL.validate()`

**Location:** The `validate()` method inside `QUALITY_FIREWALL` (around line ~7397), plus its call sites.

1. **Change the validate method signature:**

Find `validate(scenario)` or `validate: (scenario)` and change to `validate(scenario, position)`:

```javascript
// Before:
validate(scenario) {
// After:
validate(scenario, position) {
```

Then inside the validate method, pass `position` to each check:

```javascript
// Before (in the loop that runs tier1 checks):
const result = check.check(scenario)
// After:
const result = check.check(scenario, position)
```

Do the same for tier2 and tier3 checks if they exist.

2. **Update all call sites:**

Search the file for every place `QUALITY_FIREWALL.validate(` is called and add the `position` parameter:

```javascript
// There should be ~2-3 call sites. Each one needs position added:
// Before:
QUALITY_FIREWALL.validate(scenario)
// After:
QUALITY_FIREWALL.validate(scenario, position)
```

Common locations: around line ~9296 (in `generateAIScenario`), around line ~9856 (possibly in another generation path), and in `generateWithAgentPipeline` around line ~8568-8718.

## Verification

1. Search the codebase for `QUALITY_FIREWALL.validate(` — every call site should now pass `position`
2. Check that the 3 new checks are in the `tier1` array
3. Test edge cases manually by inspecting AI output:
   - Generate a scenario with 2 outs — it should NOT mention double play
   - Generate a pitcher scenario — the best answer should NOT have the pitcher as cutoff
   - Generate a centerField scenario — CF should NOT defer to corner outfielders
4. Check console for new rejection reasons: `dp_with_2_outs`, `pitcher_as_cutoff`, `all_options_same_action_verb`, etc.

## Important

- The `principleContradiction` check only applies to the BEST answer — wrong options CAN violate principles (that's what makes them wrong)
- Don't be too aggressive with regex — false positives cause valid scenarios to be rejected
- The `position` parameter should be optional (default to null) so existing code doesn't break if a call site is missed
- These checks are HARD REJECTS (tier1) — if they fail, the scenario is regenerated, not patched
