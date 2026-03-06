# Claude Code Prompt: Phase 3 — Explanation Quality + Coaching Voice

## Context
You're working on Baseball Strategy Master (`index.jsx`, ~12,200 lines). This is Phase 3 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context. This phase fixes the #1 source of player flags: "confusing text" (69% of all flags). The root cause is boilerplate padding in explanations and Wikipedia-style prose instead of coaching voice.

## Changes (4 total)

### 3A. Replace boilerplate padding with position-specific coaching closers

**Location:** `generateWithAgentPipeline()` around lines 8666-8684 — the auto-fix section that pads short explanations.

Currently, when an explanation is too short (< 40 chars or < 2 sentences), it appends: `"In this situation with X outs in the Y of the inning, this decision has real consequences for the game."` This is the EXACT text players flag as confusing.

**Replace the entire explanation padding block (lines 8666-8684) with this:**

```javascript
// Auto-fix: Replace short explanations with coaching closers instead of boilerplate
const COACHING_CLOSERS = {
  pitcher: [
    "Every pitch is a chess move — think about what the batter expects.",
    "Your job on the mound is to control the tempo and keep batters guessing.",
    "Trust your stuff and let your defense work behind you.",
    "Stay ahead in the count and you control the at-bat.",
    "The best pitchers make the batter put the ball where the defense is.",
    "Don't try to be perfect — just hit your spots and compete."
  ],
  catcher: [
    "You're the quarterback of the defense — every decision starts with you.",
    "Think one play ahead: where's the throw going if the runner breaks?",
    "Stay low, stay ready, and trust your arm.",
    "Good catchers control the running game before the steal attempt.",
    "Frame it, block it, throw it — that's the job every pitch.",
    "Talk to your pitcher. Keep him confident and focused."
  ],
  firstBase: [
    "First base is about footwork and focus — one play at a time.",
    "Stretch saves outs. A good pick saves runs.",
    "When you hold a runner, you're changing the whole game.",
    "Know where the throw is going before the ball is hit.",
    "Good first basemen make tough throws look easy."
  ],
  secondBase: [
    "The middle of the diamond is where games are won.",
    "Quick feet and a quick release — that's the double play.",
    "Know the runner's speed before the pitch. It changes everything.",
    "Cover your area and trust your partner to cover his.",
    "Positioning is half the play. Be in the right spot before the pitch."
  ],
  shortstop: [
    "Shortstop is the captain of the infield. Own every ground ball.",
    "Line up your relay and let your arm do the work.",
    "On a double play, catch it clean first — speed comes from your hands, not rushing.",
    "Know the situation before every pitch. Where's your throw going?",
    "The best shortstops make the routine play every single time."
  ],
  thirdBase: [
    "Third base is all about reactions — be ready before the pitch.",
    "On a bunt, crash hard and trust your arm.",
    "The hot corner demands quick decisions — read the ball off the bat.",
    "Know when to charge and when to stay back. Situation tells you.",
    "A strong throw from deep third saves a lot of hits."
  ],
  leftField: [
    "Hit the cutoff man. Every time. No exceptions.",
    "Back up third on every play you can get to.",
    "Read the ball off the bat — your first step decides everything.",
    "Line drives in the gap test your routes. Practice them.",
    "A good left fielder keeps doubles from becoming triples."
  ],
  centerField: [
    "You're the boss of the outfield. Call for everything you can get to.",
    "Back up every throw — be the last line of defense.",
    "Your first step on fly balls is the most important step in the game.",
    "Communication is half the job. Talk to your corners.",
    "A good center fielder covers for everyone and complains about nothing."
  ],
  rightField: [
    "Right field has the longest throw in the game — hit your cutoff.",
    "Your throw to third base can change the whole inning.",
    "Read the ball off the bat and take a good angle.",
    "Back up first on every infield throw you can get to.",
    "A strong, accurate arm in right field is a weapon."
  ],
  batter: [
    "The best hitters think before the pitch, not during it.",
    "Know what you're looking for before you step in the box.",
    "A good at-bat isn't always a hit — it's making the pitcher work.",
    "With two strikes, your job changes. Protect the plate.",
    "Situation tells you what kind of swing to take. Listen to it.",
    "The pitcher's job is to get you out. Your job is to not help him."
  ],
  baserunner: [
    "Smart baserunning wins more games than fast baserunning.",
    "Read the situation before you commit — you can't undo a bad jump.",
    "The best baserunners make their decisions before the pitch.",
    "Know the outfielder's arm before you test it.",
    "Never make the first or third out at third base.",
    "Your coach is your eyes. Trust the signs."
  ],
  manager: [
    "Good managers put their players in positions to succeed.",
    "Every decision has a tradeoff. The best choice isn't always obvious.",
    "Think two innings ahead. What does this move set up?",
    "Trust your preparation. The numbers help, but the game tells you more.",
    "Matchups matter. Put the right player in the right spot at the right time."
  ],
  famous: [
    "The greats made good decisions look easy — but they all started by learning the basics.",
    "Study the legends and you'll see: fundamentals never go out of style."
  ],
  rules: [
    "Knowing the rules gives you an edge. Use them.",
    "The best players know the rulebook as well as they know their swing."
  ],
  counts: [
    "The count changes everything. Know your advantage.",
    "Every count has a story. Learn to read it.",
    "Ahead or behind — the count tells you what to do next."
  ]
}

if (scenario.explanations && scenario.explanations.length === 4) {
  scenario.explanations = scenario.explanations.map((expl, i) => {
    if (!expl) return "This choice affects how the play unfolds."
    const sentences = (expl.match(/[.!?]+/g) || []).length
    if (expl.length < 40 || sentences < 2) {
      // Add a coaching closer instead of boilerplate
      const closers = COACHING_CLOSERS[position] || COACHING_CLOSERS.batter
      const closer = closers[Math.floor(Math.random() * closers.length)]
      const cleanExpl = expl.endsWith('.') || expl.endsWith('!') || expl.endsWith('?') ? expl : expl + '.'
      return `${cleanExpl} ${closer}`
    }
    return expl
  })
}
```

### 3B. Add explanation quality rules + banned phrases to agent prompt

**Location:** In `buildAgentPrompt()` (line ~8297), find the AUDIT CHECKLIST or quality rules section.

Add these rules:

```
EXPLANATION RULES:
- Wrong answer explanations must say what SPECIFICALLY goes wrong (e.g., "the runner advances to third" NOT "this could lead to problems")
- Best answer explanation must name the POSITIVE OUTCOME (e.g., "you cut down the lead runner" NOT "this maintains defensive pressure")
- BANNED PHRASES (never use): "this decision has real consequences", "maintaining defensive pressure", "this could lead to", "this approach fails by", "this action allows you to", "in this situation", "real consequences for the game", "based on the current situation"
- Write like a COACH talking to a player after the play: "Here's why that works..." or "The problem with that is..."
- Every explanation must be 1-3 sentences. No more. Short and specific beats long and vague.
```

### 3C. Add coaching voice contrast examples to the prompt

**Location:** In `buildAgentPrompt()` (line ~8297), in or near the examples/few-shot section.

Add GOOD vs BAD explanation pairs so the AI understands the voice:

```
EXPLANATION VOICE (follow GOOD, never write like BAD):
GOOD: "You throw to the cutoff man because he's lined up with home — if you try to throw all the way home from deep center, the ball bounces and the trail runner takes third. Trust the relay."
BAD: "Throwing to the cutoff man is the correct decision as it maintains proper relay alignment and prevents defensive breakdowns that could allow additional baserunner advancement."

GOOD: "With two strikes, you choke up and protect the plate. Swinging for the fence here means you're probably striking out, and the runner on third is counting on you to put it in play."
BAD: "In a two-strike situation with runners in scoring position, adopting a shortened swing approach maximizes contact probability while maintaining situational awareness of baserunner positioning."

GOOD: "The problem with throwing to second here is the runner on third scores easily. You just traded an out for a run. Bad deal."
BAD: "This approach fails by prioritizing the secondary baserunner while neglecting the immediate scoring threat, resulting in a suboptimal defensive outcome."
```

### 3D. Best explanation must reference 2+ situation elements

**Location:** `gradeScenario()` at line ~7484, in the section that checks explanation quality.

Currently there's a check that the best explanation references ANY situation element. Strengthen this to require 2+:

```javascript
// Best explanation must reference at least 2 situation elements
const bestExpl = (scenario.explanations?.[scenario.best] || '').toLowerCase()
const sitRefs = [
  /\bout(s)?\b/.test(bestExpl),           // outs
  /inning|frame/.test(bestExpl),            // inning
  /score|lead|trail|tie|ahead|behind/.test(bestExpl),  // score
  /runner|base|first|second|third|home/.test(bestExpl), // runners
  /count|strike|ball|0-|1-|2-|3-/.test(bestExpl),      // count
].filter(Boolean).length

if (sitRefs < 2) {
  score -= 8
  deductions.push('best_explanation_lacks_situation_refs')
}
```

Replace the existing single-reference check with this stronger version.

## Verification

1. Generate an AI scenario and check explanations — NO boilerplate ("this decision has real consequences for the game")
2. Short explanations should get a coaching closer like "Every pitch is a chess move" instead of generic filler
3. Check that explanations are specific: "the runner scores from third" not "this could lead to problems"
4. Check the console for the new deduction `best_explanation_lacks_situation_refs`
5. Play 5-10 scenarios — explanations should sound like a coach, not a textbook
6. Check that BANNED PHRASES don't appear in any AI-generated explanations

## Important

- The `COACHING_CLOSERS` constant should be placed near the top of `generateWithAgentPipeline()` or as a module-level constant — NOT inside a tight loop
- The banned phrases list in the prompt is a strong signal to grok-4 — it should significantly reduce Wikipedia-voice
- Don't remove the explanation length checks from grading — just change what gets appended when explanations ARE too short
