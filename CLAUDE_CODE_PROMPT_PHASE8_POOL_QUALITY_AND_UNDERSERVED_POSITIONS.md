# Phase 8: Pool Quality Fixes + Underserved Position AI Generation

## Context & Problem Statement

Phase 7A pool seeding revealed that **AI scenario generation is broken for baserunner and manager positions**, and **AI-generated scenarios for other underserved positions (2B, SS, 3B, RF, 1B) are scoring too low to enter the scenario pool**. The pool currently has 0 entries for 10 out of 15 positions — only pitcher (11), batter (6), centerField (2), catcher (2), and leftField (1) have any pool scenarios.

### Root Causes Identified (from D1 database forensics + code tracing)

**Problem 1: Baserunner AI generation fails with parse errors**
- D1 `error_logs` shows `error_type: "ai_parse"`, `error_message: "invalid JSON"` for baserunner
- The AI (Grok-4) returns malformed JSON for baserunner scenarios
- All 3 baserunner plays in learning_events show `is_ai=0` — every attempt fell back to handcrafted
- The baserunner prompt may be confusing the AI because baserunner options are conceptually different from fielder options (lead distance, read pitcher's move, tag-up timing vs. physical fielding actions)

**Problem 2: Manager AI generation fails with duplicate detection**
- D1 `error_logs` shows `error_type: "ai_parse"`, `error_message: "Duplicate: matches recent AI..."` for manager
- All 4 manager plays show `is_ai=0`
- Manager has the broadest action space (pitching changes, IBBs, defensive alignment, steal signs, pinch hitters, lineups) but the AI keeps generating the same scenario titles
- The deduplication logic at line ~9415-9427 builds a keyword exclusion list from recent titles, but manager scenario titles are more abstract ("Pitching Change Decision", "Walk or Pitch") and the keywords overlap heavily

**Problem 3: Client-side quality threshold too aggressive for underserved positions**
- `gradeScenario()` (line 7600-7852) starts at 100 and deducts for issues
- Pool submission requires `grade.score >= 75` (line 9980)
- Even though the worker has a lowered gate of 7.5 for positions with < 3 pool entries, the client-side filter at `grade.score >= 75` blocks scenarios before they ever reach the worker
- For positions that DID generate AI scenarios (2B: 4 AI, SS: 6 AI, 3B: 5 AI, RF: 6 AI, 1B: 5 AI), NONE entered the pool — all scored below 75

**Problem 4: No few-shot rotation for baserunner/manager**
- `getAIFewShot()` provides example scenarios, but these positions may have weak/limited examples
- Manager has the most complex decision space but may share the generic fallback example
- Baserunner examples need to model the unique option structure (all options are about running/leading/reading, not fielding)

---

## Expert Audit: What a 30-Year Coach Would Expect

Here's how a veteran coach (think a former college head coach or pro minor league manager) would evaluate AI-generated scenarios for each underserved position. Use this as your quality north star.

### Baserunner Scenarios — Coach's Expectations

A great baserunner scenario should:
1. **Set up a clear read situation**: The runner needs a specific piece of information to act — pitcher's first move, outfielder's arm strength, catcher's throw time, ball off the bat angle
2. **Present realistic lead distances and steal timing**: Options should include concrete actions like "extend your lead to 12 feet", "shorten your lead and hold", "get your secondary lead and read the ball"
3. **Match the game context to the decision**: Trailing by 1 in the 7th with 1 out on 2nd base is a VERY different steal decision than leading by 3 in the 3rd
4. **Include common young player mistakes**: Running on a line drive (should freeze), not tagging up on a deep fly, taking too big a lead with a lefty on the mound, missing the coach's signs
5. **Teach the WHY behind running decisions**: "You don't steal 3rd with 2 outs because you score on most singles from 2nd anyway" — the RE24 reasoning in kid language

**Common AI mistakes for baserunner:**
- Making options about things the baserunner doesn't control (yelling at pitcher, signaling batter)
- Options that mix pre-pitch decisions with post-contact decisions (e.g., "take a big lead" vs "slide head-first")
- Scenarios where the "best" answer is just "run" with no strategic nuance
- Not specifying which base the runner is on (critical for option validity)

### Manager Scenarios — Coach's Expectations

A great manager scenario should:
1. **Present a genuine in-game decision with tradeoffs**: Not "should I leave the pitcher in?" but "your starter is at 85 pitches in the 6th with a 2-run lead, he's given up 2 hard-hit balls this inning but his pitch count was fine through 5. The #8 hitter is up with a lefty in the bullpen ready. What do you do?"
2. **Include matchup-based thinking**: Lefty/righty splits, pitcher fatigue (TTO effect), defensive alignment based on spray charts
3. **Test bullpen management timing**: When to get the reliever up, when to go to the closer, when a mound visit is better than a change
4. **Challenge RE24 intuitions**: Sacrifice bunt with nobody out (usually bad per RE24), IBB loading bases (usually bad), defensive positioning vs. guarding the line late
5. **Distinguish youth vs. pro decisions**: At youth levels, arm health trumps matchups. Pitch counts matter more. No kid should throw 100 pitches.

**Common AI mistakes for manager:**
- Abstract options like "make a smart move" or "trust your instincts"
- IBB being the best answer when the go-ahead run would be put on base (violates The Book)
- Pitching changes that ignore context (pulling a pitcher at 45 pitches for no reason)
- Options that mix different decision types (one option about pitching, another about batting order)
- Duplicate scenarios about the same narrow topic (IBB or pitching change only)

### Infield Positions (2B, SS, 3B, 1B) — Coach's Expectations

A veteran coach wants scenarios that test:
1. **Positioning decisions** (DP depth vs. normal vs. infield in) — not just "field the ball"
2. **Relay/cutoff assignments** — who goes where on which hit. This is the bread and butter of infield play and the most testable knowledge
3. **Communication** — who calls the fly ball, who covers which base on a steal
4. **Bunt defense responsibilities** — this varies by runner situation and most kids get it wrong
5. **Force vs. tag awareness** — when is the runner forced, when does force get removed

**Common AI mistake**: Creating scenarios where all 4 options are "throw to different bases" — this tests arm aim, not strategy. A good scenario makes you THINK about the game situation before deciding.

### Outfield Positions (RF specifically) — Coach's Expectations

1. **Backup responsibilities**: RF backing up 1B is the most overlooked outfield fundamental
2. **Throw target decisions**: Do you hit the cutoff (1B) or go straight to the base? When?
3. **Fly ball priority**: CF has priority. Corner OFs defer.
4. **Wall play**: How to play a ball off the wall vs. diving attempt
5. **Gap coverage communication**: Who takes the ball in the RF-CF gap

---

## Changes Required (8 items)

### Change 1: Fix baserunner JSON parse failures
**File**: `index.jsx`, inside `generateAIScenario()` (~line 9490-9546)
**What**: Add baserunner-specific prompt reinforcement that constrains option structure

The baserunner prompt should include:
```
BASERUNNER OPTION STRUCTURE: Every option must be a physical running/positioning action the baserunner takes:
- Lead distance: "Take an aggressive 15-foot lead" / "Shorten your lead to 8 feet"
- Steal/hold: "Break for [base] on the pitcher's first move" / "Hold at [base]"
- Tag-up: "Tag up and sprint to [next base] after the catch" / "Hold at [base] after the catch"
- Read the ball: "Freeze on the line drive, then advance if it drops" / "Break immediately on contact"
- Secondary lead: "Get your secondary lead and read the ball off the bat"
NEVER include: yelling, signaling, calling plays, or any action where the baserunner communicates to others.
```

Also add a JSON structural hint specifically for baserunner:
```
IMPORTANT: Your response must be ONLY valid JSON starting with { and ending with }. No markdown fences, no explanation text. The JSON must parse with JSON.parse().
```

### Change 2: Fix manager duplicate detection failures
**File**: `index.jsx`, inside the `weakAreas` dedup logic (~line 9414-9427)
**What**: Improve the keyword exclusion for manager position by:

1. Add manager-specific topic rotation: Instead of just excluding title keywords, inject a **mandatory topic directive** that rotates through manager's diverse action space:
```javascript
const MANAGER_TOPIC_ROTATION = [
  "pitching change timing (TTO effect, pitch count, fatigue signs)",
  "defensive positioning (infield in, DP depth, guarding the line)",
  "sacrifice bunt decision (RE24 analysis — when it helps vs hurts)",
  "intentional walk decision (when IBB is justified vs harmful)",
  "pinch hitter matchup (lefty/righty splits, platoon advantage)",
  "stolen base green light (break-even rate, game context)",
  "bullpen management (closer usage, matchup reliever, long man)",
  "mound visit timing (buy time vs calm pitcher vs signal bullpen)",
  "defensive substitution (late-game defense-first move)",
  "first-and-third defense call (throw through vs cut vs hold)"
];
```
Pick the topic with the fewest recent AI plays for this position to force diversity.

2. Make the title dedup use fuzzy matching instead of exact keyword exclusion — two scenarios about "pitching changes" should match even with different title wording.

### Change 3: Lower client-side pool submission threshold for underserved positions
**File**: `index.jsx`, line 9980
**Current code**:
```javascript
if (grade.score >= 75) {
  submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0)
}
```
**New code**:
```javascript
// Dynamic client-side threshold: lower bar for underserved positions (matches worker's approach)
const poolStats = getLocalPoolStats(position) // count of scenarios in local pool for this position
const clientPoolThreshold = (poolStats?.count || 0) < 3 ? 65 : 75
if (grade.score >= clientPoolThreshold) {
  submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0)
}
```

Add a helper function:
```javascript
function getLocalPoolStats(position) {
  try {
    const pool = JSON.parse(localStorage.getItem('bsm_local_pool') || '{}')
    const posScenarios = (pool[position] || [])
    return { count: posScenarios.length }
  } catch { return { count: 0 } }
}
```

Also query the server pool count (non-blocking) and cache it:
```javascript
// On app init, fetch pool stats for threshold calibration
let _serverPoolCounts = {}
fetch(WORKER_BASE + "/scenario-pool/stats").then(r => r.json()).then(d => {
  _serverPoolCounts = d.counts || {}
}).catch(() => {})
```

### Change 4: Tune gradeScenario() deductions for underserved positions
**File**: `index.jsx`, function `gradeScenario()` (line 7600-7852)
**What**: Several deductions are too aggressive and cause legitimate scenarios to fail:

1. **Section 2, line 7635**: `explanation_too_generic` deduction (-3 per explanation) fires when explanation doesn't contain digits or situation words. For baserunner explanations that discuss "timing" and "momentum" without mentioning specific inning/score, this is valid coaching content. **Fix**: Add "timing|momentum|speed|lead|jump|read|pitcher|catcher|delivery|pickoff" to the pattern match for baserunner position.

2. **Section 7, line 7822**: `concept_missing_why` deduction (-5) requires words like "because|so that|in order to". Some concepts naturally use different causal language like "allowing you to", "this lets you", "giving you". **Fix**: Expand the pattern: add `|allowing|lets you|gives you|means|ensures|prevents|avoids|risks`.

3. **Section 8, line 7836**: `description_missing_decision_prompt` deduction (-5) requires the last sentence to contain "what should|what do you|how should|your move|you need to|the decision". Many valid descriptions end with "What's the play?" or "What's your next move?" **Fix**: Add `|what.*play|next move|your call|what.*call` to the pattern.

### Change 5: Add position-specific few-shot examples for baserunner and manager
**File**: `index.jsx`, wherever `getAIFewShot()` is defined
**What**: Add high-quality handcrafted few-shot examples specifically for baserunner and manager. These should be "gold standard" scenarios that pass all quality checks with score 90+.

**Baserunner few-shot example** (model this on handcrafted scenario `sr1c` or `sr7a3e` style):
```json
{
  "title": "Reading the Pitcher's First Move",
  "diff": 2,
  "description": "Bottom of the 6th, your team trails 3-4. You're on first base with 1 out and a 2-1 count on the batter. The pitcher has been slow to home plate all game — his delivery takes about 1.5 seconds. Your coach gave you the steal sign. You're watching the pitcher come set. What should the baserunner do?",
  "situation": {"inning":"Bot 6","outs":1,"count":"2-1","runners":[1],"score":[3,4]},
  "options": [
    "Take your normal lead and break for second the moment the pitcher lifts his front leg",
    "Extend your lead to 14 feet and get a great jump by reading the pitcher's first move to home",
    "Shorten your lead and hold — wait for a better count to steal",
    "Take a walking lead and break late, hoping the catcher won't expect it"
  ],
  "best": 1,
  "explanations": [
    "Breaking on the leg lift is too early — some pitchers lift and still throw over to first. With 1 out in the 6th and your team trailing by one, getting picked off would be devastating. You need to read his first move toward home, not just any movement.",
    "With a 1.5-second delivery and the steal sign on, you have a great chance — but only if you read the pitcher correctly. Extend your lead to challenge him, then key on his first move toward home plate. In a 2-1 count, the pitcher is more likely to throw a fastball to avoid falling behind 3-1, which means a longer time to second. This is the highest-percentage steal technique.",
    "Your coach gave you the steal sign — holding goes against the play call. In a one-run game in the 6th with 1 out, a steal of second puts you in scoring position where a single ties it. The 2-1 count favors this attempt because the pitcher will likely throw a fastball.",
    "A walking lead looks clever but actually hurts your jump. The crossover step from a standard athletic stance gets you to top speed faster than a walking start. With a 1.5-second delivery, you have time — but only with a proper first step, not a shuffle."
  ],
  "rates": [45, 85, 25, 35],
  "concept": "Reading the pitcher's first move to home plate gives you the best stolen base jump because it confirms the pitch is coming, unlike guessing on leg lift alone."
}
```

**Manager few-shot example:**
```json
{
  "title": "Third Time Through the Order",
  "diff": 2,
  "description": "Top of the 7th, your team leads 5-3. Your starter has thrown 78 pitches and just gave up a double to lead off the inning. He's been strong — 6 innings, 3 runs — but this is his third time through the order and the last 2 batters hit the ball hard. Your best setup man is warm in the bullpen. The #4 hitter is up next. What should the manager do?",
  "situation": {"inning":"Top 7","outs":0,"count":"-","runners":[2],"score":[5,3]},
  "options": [
    "Leave the starter in — he's earned the right to pitch out of this jam",
    "Make a mound visit to settle him down, then see how he handles the next batter",
    "Pull the starter now and bring in the setup man with the runner on second",
    "Have the starter intentionally walk the #4 hitter to set up a double play"
  ],
  "best": 2,
  "explanations": [
    "Your starter has been great, but the data is clear: batters hit about 30 points higher the third time through the lineup. He just gave up a hard double to start the inning, and the previous two batters also hit the ball hard. Loyalty to a pitcher who 'earned it' is one of the most common managerial mistakes — the game situation matters more than rewarding effort.",
    "A mound visit buys time, but it doesn't fix the third-time-through-the-order effect. The #4 hitter has already seen your starter's best stuff twice. The mound visit delay might actually give the hitter more time to prepare. With a 2-run lead and nobody out, you can't afford to let this inning snowball.",
    "This is the textbook move. Your starter did his job — 6 strong innings. But three hard-hit balls signals his stuff is flattening out. The third-time-through-the-order penalty is real: batters see velocity and movement better each time. Bringing in the setup man with fresh stuff gives you the best chance to hold the 2-run lead with nobody out and a runner on second.",
    "Intentionally walking the #4 hitter puts the go-ahead run on base with nobody out. Even if it sets up a double play, you're giving the other team a free baserunner. The Book shows IBBs are almost always wrong — especially with no outs, where the DP doesn't end the inning. A walk here turns a manageable situation into a crisis."
  ],
  "rates": [30, 40, 85, 15],
  "concept": "Batters hit significantly better the third time through the order because they've adapted to the pitcher's stuff, so bringing in a reliever when hard contact starts is better than loyalty to the starter."
}
```

### Change 6: Add DECISION_WINDOWS and REAL_GAME_SITUATIONS for baserunner/manager
**File**: `index.jsx`, wherever `DECISION_WINDOWS` and `REAL_GAME_SITUATIONS` are defined
**What**: Ensure both baserunner and manager have proper entries in these objects, since the AI prompt injects them (line 9356-9377).

**DECISION_WINDOWS additions:**
```javascript
baserunner: {
  "pre-pitch": "Lead distance, steal attempt, positioning, read the pitcher's move",
  "on-contact": "React to ball off bat — freeze on line drive, advance on ground ball, read fly ball depth",
  "after-catch": "Tag-up decision, advance or hold after outfielder catches fly ball",
  "between-pitches": "Adjust lead, read catcher's signs, evaluate count"
},
manager: {
  "between-batters": "Pitching changes, defensive substitutions, positioning shifts, mound visits",
  "before-pitch": "Steal sign, bunt sign, hit-and-run sign, pitchout call",
  "between-innings": "Bullpen warm-up decisions, pinch-hitter prep, lineup card adjustments",
  "during-at-bat": "Intentional walk signal, mound visit timing, defensive alignment mid-AB"
}
```

**REAL_GAME_SITUATIONS additions** (at least 3 per position):
```javascript
baserunner: [
  { setup: "Runner on 2nd, 1 out, ground ball to shortstop", real_decision: "Hold at 2nd — SS is looking at you and the throw to first is routine. Advance only on ball hit to right side or through the infield.", common_mistake: "AI has runner always advance on ground balls regardless of where ball is hit" },
  { setup: "Runner on 1st, 0 outs, fly ball to medium-depth center", real_decision: "Tag up but don't go — medium CF fly is not deep enough to advance. Return to 1st after the catch.", common_mistake: "AI has runner tag up and advance on every fly ball, even shallow ones" },
  { setup: "Runner on 3rd, line drive hit to left fielder", real_decision: "Freeze immediately — if the liner is caught, you need to be on the bag. Only score if it drops and you can read it cleanly.", common_mistake: "AI has runner break for home on contact instead of freezing on line drives" }
],
manager: [
  { setup: "Starter at 90 pitches in the 7th, 2-run lead, facing bottom of order", real_decision: "Let him face the 7-8-9 hitters if he's sharp. Save the bullpen for the top of the order in the 8th.", common_mistake: "AI pulls starter based on pitch count alone without considering opponent, game state, or bullpen usage" },
  { setup: "Down 1 run, runner on 1st, 0 outs, weak hitter up", real_decision: "Sacrifice bunt is justified here — weak hitter, need 1 run, move runner to scoring position with your better hitters coming up.", common_mistake: "AI always says 'bunting lowers RE24' without considering that RE24 analysis changes when the batter is weak and only 1 run is needed" },
  { setup: "Tie game, bottom 9th, runners on 2nd and 3rd, 1 out, their cleanup hitter up", real_decision: "Intentional walk to load the bases — sets up force at home and double play. The cleanup hitter is their most dangerous bat.", common_mistake: "AI says IBB is always wrong, but with 2nd+3rd occupied and 1 out, loading bases for the force/DP is textbook" }
]
```

### Change 7: Add pool submission console logging for debugging
**File**: `index.jsx`, function `submitToServerPool()` (line 10604-10621)
**What**: Add diagnostic logging so pool submission failures are visible:

```javascript
function submitToServerPool(scenario, position, qualityScore, auditScore) {
  if ((qualityScore || 0) < 7.5) {
    console.log("[BSM Pool] Skipped — quality too low:", qualityScore, "for", position)
    return
  }
  console.log("[BSM Pool] Submitting to server pool:", position, qualityScore, scenario.title)
  fetch(WORKER_BASE + "/scenario-pool/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario, position,
      quality_score: qualityScore,
      audit_score: auditScore || 0,
      source: "ai"
    })
  }).then(r => r.json()).then(data => {
    if (data.status === "added") console.log("[BSM Pool] ✅ Added to server pool:", scenario.title, "score:", qualityScore)
    else if (data.status === "duplicate_updated") console.log("[BSM Pool] 🔄 Updated existing:", scenario.title)
    else console.log("[BSM Pool] ❌ Rejected:", JSON.stringify(data))
  }).catch(err => console.warn("[BSM Pool] Submit failed:", err.message))
}
```

### Change 8: Add gradeScenario() score logging for AI scenarios
**File**: `index.jsx`, where gradeScenario is called for AI scenarios (~line 9970-9982)
**What**: Log the grade score and deductions so we can see why scenarios are being rejected:

```javascript
const grade = gradeScenario(scenario, position);
scenario.qualityGrade = grade.score;
console.log(`[BSM Grade] ${position}: score=${grade.score}/100, pass=${grade.pass}, deductions=[${grade.deductions.join(', ')}]`)
if (grade.score > 0) {
  fetch(WORKER_BASE + "/analytics/scenario-grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_id: scenario.id, position, score: grade.score, pass: grade.pass, deductions: grade.deductions, source: "standard" })
  }).catch(() => {});
}
// Upload to community pool if quality is high enough
const poolStats = getLocalPoolStats(position)
const serverCount = _serverPoolCounts?.[position] || 0
const combinedCount = (poolStats?.count || 0) + serverCount
const clientPoolThreshold = combinedCount < 3 ? 65 : 75
console.log(`[BSM Pool Gate] ${position}: grade=${grade.score}, threshold=${clientPoolThreshold}, poolCount=${combinedCount}`)
if (grade.score >= clientPoolThreshold) {
  submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0)
}
```

---

## Verification Plan

After implementing all 8 changes:

1. **Unit test gradeScenario()**: Feed the two few-shot examples (baserunner + manager from Change 5) through `gradeScenario()` and verify they score 85+
2. **Test AI generation locally**: Open the app in preview, click "AI Coach's Challenge" for baserunner and manager, verify AI scenarios generate without falling back to handcrafted
3. **Check console logs**: Verify `[BSM Grade]` and `[BSM Pool Gate]` logs show scores and threshold decisions
4. **Query D1 pool after 5+ plays per position**: Run `SELECT position, COUNT(*) FROM scenario_pool WHERE retired=0 GROUP BY position` and verify baserunner and manager have > 0 entries
5. **Expert audit**: Read through 3 AI-generated baserunner and 3 manager scenarios and verify they match the "30-year coach" expectations described above

## Files Modified
- `index.jsx` — All 8 changes (no new files needed)

## Risk Assessment
- **Low risk**: Changes 3, 4, 7, 8 are threshold adjustments and logging — they can't break existing scenarios
- **Medium risk**: Changes 1, 2, 5, 6 modify prompt content — test with 5+ generations per position before deploying
- **No risk to handcrafted scenarios**: All changes only affect the AI generation and pool submission pipeline
