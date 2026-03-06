# Claude Code Prompt: Phase 2 — Option Quality + Difficulty

## Context
You're working on Baseball Strategy Master (`index.jsx`, ~12,200 lines). This is Phase 2 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context. This phase fixes two problems: (1) AI scenarios are too easy (69.6% correct vs 55.3% for handcrafted), and (2) wrong options are often "4 slightly different throws" with no strategic distinction.

## Changes (4 total)

### 2A. Add `OPTION_ARCHETYPES` for top 25 position+concept combos

**Location:** Add this constant near line ~8130 (before `getConceptWeight()`), or near `CONCEPT_FUNDAMENTAL_WEIGHTS` if Phase 1 is already done.

Create an `OPTION_ARCHETYPES` object mapping `"position:concept"` keys to 4 option archetypes. These are HINTS for the AI, not literal text. The AI should use them as structural guidance for what KINDS of options to generate.

```javascript
const OPTION_ARCHETYPES = {
  'shortstop:cutoff-roles': {
    moment: 'Extra-base hit to left side, runner advancing',
    correct: 'Sprint to relay position between OF and home',
    kid_mistake: 'Run to cover 2B instead of being the relay',
    sounds_smart: 'Back up another fielder',
    clearly_wrong: 'Stay near position and wait'
  },
  'shortstop:double-play-turn': {
    moment: 'Ground ball to left side, runner on first',
    correct: 'Field cleanly, make quick transfer, throw to first on the turn',
    kid_mistake: 'Rush the throw without securing the ball first',
    sounds_smart: 'Hold the ball and take the sure out at first',
    clearly_wrong: 'Try to tag the runner instead of using the force'
  },
  'shortstop:relay-double-cut': {
    moment: 'Ball hit to deep outfield gap, runners moving',
    correct: 'Line up as relay between OF and target base',
    kid_mistake: 'Go to the nearest base to cover',
    sounds_smart: 'Call off the other middle infielder to take the relay',
    clearly_wrong: 'Run toward the outfielder to help'
  },
  'catcher:pitch-calling': {
    moment: 'Ahead in count, runner on base',
    correct: 'Call pitch based on hitter weakness + count advantage',
    kid_mistake: 'Just call fastball because we\'re ahead',
    sounds_smart: 'Pitch out to check the runner',
    clearly_wrong: 'Throw whatever the pitcher wants regardless of situation'
  },
  'catcher:steal-window': {
    moment: 'Runner on first showing steal signs',
    correct: 'Call pitchout or fastball up, quick release to second',
    kid_mistake: 'Wait to see if runner actually goes',
    sounds_smart: 'Signal for pickoff instead of preparing the throw-through',
    clearly_wrong: 'Ignore the runner and focus only on the batter'
  },
  'catcher:first-third': {
    moment: 'Runners on 1st and 3rd, runner on 1st breaks for 2nd',
    correct: 'Look runner back at 3rd, throw through to 2B',
    kid_mistake: 'Throw directly to 2B without checking 3rd runner',
    sounds_smart: 'Pump fake and hold the ball',
    clearly_wrong: 'Throw to 3rd base'
  },
  'pitcher:first-pitch-strike': {
    moment: 'New batter stepping in, no runners',
    correct: 'Attack the zone with a strike to get ahead',
    kid_mistake: 'Nibble the corner trying to be too perfect',
    sounds_smart: 'Start with off-speed to surprise the hitter',
    clearly_wrong: 'Throw as hard as possible regardless of location'
  },
  'pitcher:count-leverage': {
    moment: 'Ahead in count with runners on',
    correct: 'Expand the zone — make the hitter chase',
    kid_mistake: 'Groove a fastball to avoid a walk',
    sounds_smart: 'Waste a pitch way outside',
    clearly_wrong: 'Just throw strikes down the middle'
  },
  'pitcher:pickoff-mechanics': {
    moment: 'Runner with a big lead, pitcher in stretch',
    correct: 'Quick look, use pickoff move to keep runner close',
    kid_mistake: 'Step off the rubber every time (wastes tempo)',
    sounds_smart: 'Quick-pitch the batter to catch the runner leaning',
    clearly_wrong: 'Ignore the runner and just pitch'
  },
  'batter:two-strike-approach': {
    moment: 'Two strikes, runner in scoring position',
    correct: 'Shorten up, protect the plate, focus on contact',
    kid_mistake: 'Still swing for the fences with 2 strikes',
    sounds_smart: 'Take a pitch to see what the pitcher throws',
    clearly_wrong: 'Try to bunt for a hit with 2 strikes'
  },
  'batter:count-leverage': {
    moment: 'Hitter\'s count (2-0 or 3-1), runner on base',
    correct: 'Sit on your pitch — look for something to drive',
    kid_mistake: 'Swing at anything because it might be a strike',
    sounds_smart: 'Take the pitch and wait for an even better count',
    clearly_wrong: 'Try to bunt for a sacrifice'
  },
  'batter:situational-hitting': {
    moment: 'Runner on 3rd, less than 2 outs, need 1 run',
    correct: 'Focus on getting the ball in play to the right side or in the air',
    kid_mistake: 'Try to hit a home run to score the runner easily',
    sounds_smart: 'Bunt the runner home (wrong with less than 2 outs in most situations)',
    clearly_wrong: 'Wait for a walk to load the bases'
  },
  'baserunner:tag-up': {
    moment: 'Runner on 3rd, fly ball to medium-deep outfield',
    correct: 'Tag up on the catch, read the throw, score',
    kid_mistake: 'Start running on contact instead of tagging',
    sounds_smart: 'Go halfway and see what happens',
    clearly_wrong: 'Stay at third no matter what'
  },
  'baserunner:force-vs-tag': {
    moment: 'Runner on 2nd, ground ball to short',
    correct: 'Know whether it\'s a force or tag situation and react accordingly',
    kid_mistake: 'Run to the next base regardless of where the ball is hit',
    sounds_smart: 'Stay at the base to avoid being doubled off',
    clearly_wrong: 'Run back to the previous base'
  },
  'baserunner:secondary-lead': {
    moment: 'Runner on first, pitch is being delivered',
    correct: 'Take secondary lead as pitch crosses plate, read the result',
    kid_mistake: 'Stand on the base until the ball is hit',
    sounds_smart: 'Take a huge primary lead instead of a controlled secondary',
    clearly_wrong: 'Start running to second on the pitch'
  },
  'baserunner:steal-breakeven': {
    moment: 'Runner on 1st, close game, catcher has strong arm',
    correct: 'Check the breakeven math — need 70%+ success rate to attempt',
    kid_mistake: 'I\'m fast so I should steal',
    sounds_smart: 'Wait for a passed ball or wild pitch instead',
    clearly_wrong: 'Steal on the first pitch no matter what'
  },
  'firstBase:holding-runners': {
    moment: 'Runner on 1st, pitcher in stretch',
    correct: 'Hold runner close, give target, react to batted ball after pitch',
    kid_mistake: 'Play behind the runner (too far from bag)',
    sounds_smart: 'Crowd the runner to intimidate them',
    clearly_wrong: 'Move to fielding position before the pitch'
  },
  'firstBase:bunt-defense': {
    moment: 'Bunt situation, runner on 1st or 1st and 2nd',
    correct: 'Charge on the bunt, field, and make the right throw based on situation',
    kid_mistake: 'Stay back at the bag instead of charging',
    sounds_smart: 'Always throw to 2nd for the lead runner',
    clearly_wrong: 'Wait for the ball to come to you'
  },
  'secondBase:double-play-turn': {
    moment: 'Ground ball to the right side, runner on first',
    correct: 'Get to the bag, receive throw, make quick turn to first',
    kid_mistake: 'Stand on the base and wait for the ball to come',
    sounds_smart: 'Cheat toward second early before the pitch',
    clearly_wrong: 'Go to first base to try to beat the runner'
  },
  'thirdBase:bunt-defense': {
    moment: 'Bunt situation, runner on 1st or 2nd',
    correct: 'Crash hard, bare-hand if needed, throw to the right base',
    kid_mistake: 'Wait back at third in case the runner advances',
    sounds_smart: 'Only charge on a bunt toward the third-base line',
    clearly_wrong: 'Stay back and let the pitcher and catcher handle it'
  },
  'centerField:fly-ball-priority': {
    moment: 'Fly ball between CF and corner outfielder',
    correct: 'Call for it — center fielder has priority over corners',
    kid_mistake: 'Defer to the corner outfielder who called first',
    sounds_smart: 'Both go for it and figure it out at the last second',
    clearly_wrong: 'Assume the other fielder will get it'
  },
  'centerField:backup-duties': {
    moment: 'Ball hit to right side of infield',
    correct: 'Sprint in to back up the throw to first base',
    kid_mistake: 'Stay in center field position',
    sounds_smart: 'Back up second base instead',
    clearly_wrong: 'Watch the play and react only if there\'s an error'
  },
  'leftField:cutoff-alignment': {
    moment: 'Base hit to left, runner rounding second',
    correct: 'Hit the cutoff man chest-high on the correct line',
    kid_mistake: 'Throw all the way to third or home (skipping cutoff)',
    sounds_smart: 'Hold the ball to keep the trailing runner at first',
    clearly_wrong: 'Lob it in casually'
  },
  'rightField:cutoff-alignment': {
    moment: 'Single to right, runner on 2nd heading home',
    correct: 'Hit the cutoff man on the line to home plate',
    kid_mistake: 'Try to throw all the way home from right field',
    sounds_smart: 'Throw to third to prevent the batter from advancing',
    clearly_wrong: 'Hold the ball and run it in'
  },
  'manager:pitching-change': {
    moment: 'Starter tiring in 6th, pitch count rising, lead narrowing',
    correct: 'Monitor pitch count + effectiveness, have bullpen ready, make change at right time',
    kid_mistake: 'Leave the starter in because he started the game',
    sounds_smart: 'Pull him immediately at first sign of trouble',
    clearly_wrong: 'Wait until the starter gives up the lead'
  }
}
```

**Then inject into `buildAgentPrompt()` (line ~8297):**

After the quality rules section but BEFORE the brain data/topics sections, add:

```javascript
// Option archetype injection
const archetypeKey = `${position}:${plan?.concept || ''}`
const archetype = OPTION_ARCHETYPES[archetypeKey]
const archetypeSection = archetype ? `
OPTION BLUEPRINT (use as structural guide, NOT literal text):
Typical moment: ${archetype.moment}
Option A (correct fundamental): ${archetype.correct}
Option B (common kid mistake): ${archetype.kid_mistake}
Option C (sounds smart but wrong here): ${archetype.sounds_smart}
Option D (clearly wrong): ${archetype.clearly_wrong}
Generate specific game language — do NOT copy these hints word-for-word.
` : ''
```

Then include `archetypeSection` in the prompt string after quality rules and before topics/brainData.

### 2B. Add "yellow option" requirement to agent prompt

**Location:** In `buildAgentPrompt()` (line ~8297), find the section where OPTION RULES or SCORE RULES are defined.

Add this text to the prompt:

```
CRITICAL OPTION RULE: At least ONE wrong option must be "acceptable but not optimal" (rate 45-65).
This is the YELLOW option — something a decent player might do that isn't terrible but isn't the best play.
DO NOT make all 3 wrong options obviously terrible. Real baseball decisions involve choosing between
two reasonable options, not picking the one sane choice among three absurd ones.
```

### 2C. Tighten rate spreads in auto-fix

**Location:** In `generateWithAgentPipeline()` around line ~8660, find the rate auto-fix section (after the rates normalization but before the explanation padding).

Add a yellow-zone enforcer:

```javascript
// Ensure at least one yellow option (45-65 range) among wrong answers
if (scenario.rates && scenario.rates.length === 4 && scenario.best !== undefined) {
  const bestIdx = scenario.best
  const yellowExists = scenario.rates.some((r, i) => i !== bestIdx && r >= 45 && r <= 65)
  if (!yellowExists) {
    // Find the highest-rated wrong option and boost it to yellow zone
    const wrongIdxs = scenario.rates.map((r, i) => ({r, i})).filter(x => x.i !== bestIdx).sort((a,b) => b.r - a.r)
    if (wrongIdxs.length > 0) {
      scenario.rates[wrongIdxs[0].i] = 50 + Math.floor(Math.random() * 10) // 50-59
    }
  }
}
```

Place this AFTER the existing rate normalization code (where worst rate is capped at 40) but BEFORE the explanation padding. You'll also need to update the "worst rate <= 40" cap to exclude the yellow option:

```javascript
// Ensure worst rate <= 40 (but don't touch yellow options)
scenario.rates = scenario.rates.map((r, i) => {
  if (i === scenario.best) return r
  if (r >= 45 && r <= 65) return r  // preserve yellow options
  return r > 40 ? Math.min(40, r) : r
})
```

### 2D. Add difficulty + option diversity validation to grading

**Location 1:** `gradeAgentScenario()` at line ~8461

Add these checks:

```javascript
// All wrong options too obviously wrong
const wrongRates = scenario.rates?.filter((_, i) => i !== scenario.best) || []
if (wrongRates.every(r => r < 30)) {
  score -= 10
  deductions.push('all_wrong_too_obvious')
}
if (!wrongRates.some(r => r >= 45 && r <= 65)) {
  score -= 5
  deductions.push('no_yellow_option')
}
```

**Location 2:** `gradeScenario()` at line ~7484, in the section that checks option quality (section 4):

```javascript
// If all 4 options start with the same action verb → deduct
const verbs = scenario.options?.map(o => (o || '').split(' ')[0].toLowerCase())
if (verbs && verbs.length === 4 && new Set(verbs).size === 1) {
  score -= 15
  deductions.push('all_options_same_verb')
}
```

## Verification

1. Open the app, select shortstop, click "AI Coach's Challenge"
2. Check the generated scenario's options — they should be strategically distinct:
   - One correct/best play
   - One common mistake beginners make
   - One that sounds reasonable but is wrong in this situation
   - One clearly bad choice
3. Check rates — at least one wrong option should be in the 45-65 "yellow" range
4. Play 5 AI scenarios — correct rate should feel harder (closer to 55% than 70%)
5. Check console for any new deductions: `all_wrong_too_obvious`, `no_yellow_option`, `all_options_same_verb`
6. Test a concept WITH an archetype (e.g., shortstop:cutoff-roles) and one WITHOUT — both should generate properly

## Important

- The 25 archetypes are STRUCTURAL GUIDES, not literal text. The prompt tells the AI to generate specific game language.
- Concepts without archetypes get no blueprint — the AI generates freely (fine for grok-4 on less common concepts).
- The yellow option enforcement works as a safety net — ideally grok-4 generates a yellow option naturally from the prompt instruction.
- Don't change the grading threshold (45) — just add new deduction categories.
