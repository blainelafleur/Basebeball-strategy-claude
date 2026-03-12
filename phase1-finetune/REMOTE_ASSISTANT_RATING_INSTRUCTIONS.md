# BSM Scenario Rating — Instructions for Raters

## Your Mission
You are rating AI-generated baseball strategy scenarios. Your ratings will train the world's best baseball education AI — an app that teaches kids ages 6-18 how to think through real game situations. **Your honest, careful ratings directly determine how good this AI becomes.** Rate tough. Rate honest. Don't inflate scores to be nice.

## What You'll Be Rating
Each scenario is a baseball game situation with:
- A **description** (the game situation)
- **4 options** (what the player could do)
- **1 best answer** (marked with a green border)
- **4 explanations** (why each choice is good or bad)
- **Success rates** (% chance each option works)
- A **concept** (what the scenario teaches)

## The 5-Dimension Rubric (1-10 Scale)

### 1. Factual Accuracy
*Are the baseball rules, strategies, and positions correct?*

| Score | Meaning |
|-------|---------|
| 10 | Every fact is correct. Rules, positions, cutoffs, priorities all right. |
| 7-9 | Mostly correct, minor nitpick (e.g., slightly off rate, but strategy is sound). |
| 4-6 | One noticeable error (e.g., wrong backup assignment, iffy rule interpretation). |
| 1-3 | Major error (e.g., pitcher told to play cutoff, wrong force/tag call, balk rule wrong). |

**Common errors to watch for:**
- Pitcher being assigned cutoff/relay duties (WRONG — pitchers back up, they don't relay)
- Catcher leaving home plate unattended (WRONG — catcher stays home)
- Fly ball priority reversed (CF has priority over corners; infield yields to outfield)
- Wrong force/tag situations (runner must be forced if preceding base is occupied)
- Infield fly called with 2 outs or less than 2 runners (doesn't apply)

### 2. Explanation Strength
*Does the best explanation clearly teach WHY the answer is correct?*

| Score | Meaning |
|-------|---------|
| 10 | Explains the principle, uses specific reasoning, kid walks away smarter. |
| 7-9 | Good explanation but could be more specific or teaching-focused. |
| 4-6 | Vague. Says "good choice" but doesn't explain the underlying principle. |
| 1-3 | Wrong reasoning, misleading, or doesn't explain anything. |

### 3. Age-Appropriateness
*Does the language match the target audience?*

| Difficulty | Target Age | What to expect |
|-----------|-----------|----------------|
| Rookie (diff 1) | Ages 6-10 | Simple words, short sentences, no jargon |
| Pro (diff 2) | Ages 9-14 | Some baseball terms okay, clear explanations |
| All-Star (diff 3) | Ages 13-18+ | Advanced concepts, stats references okay |

| Score | Meaning |
|-------|---------|
| 10 | Perfect for the target age. A kid of that age would understand and enjoy it. |
| 7-9 | Slightly too complex or too simple, but close. |
| 4-6 | Noticeably mismatched (e.g., advanced stats talk for a 7-year-old). |
| 1-3 | Completely wrong for the age group. |

### 4. Educational Value
*Does this scenario teach something specific and useful?*

| Score | Meaning |
|-------|---------|
| 10 | Clear teaching moment. Kid learns a real baseball principle they can use. |
| 7-9 | Teaches something, but could be more specific or memorable. |
| 4-6 | Generic. Doesn't really teach a specific concept. |
| 1-3 | No educational value. Filler content. |

### 5. Variety & Engagement
*Is the situation fresh, realistic, and interesting to read?*

| Score | Meaning |
|-------|---------|
| 10 | Unique scenario. Vivid game situation. Would keep a kid engaged. |
| 7-9 | Good scenario but slightly formulaic or seen-before feeling. |
| 4-6 | Boring or generic setup. "Runner on first, what do you do?" |
| 1-3 | Completely unengaging or unrealistic situation. |

## Preferred Explanation Pick
After rating the 5 dimensions, you'll pick which of the 4 explanations is **strongest for teaching a kid**. This isn't always the "best answer" explanation — sometimes a wrong-answer explanation teaches better. Pick the one that would make a 10-year-old go "Oh, NOW I get it!"

## Daily Workflow

### Checklist (do this each day):
- [ ] Open `rating-tool.html` in your browser
- [ ] Load the scenario JSON file
- [ ] Click "Unrated" filter to see remaining scenarios
- [ ] Rate 20 scenarios (about 45-60 minutes)
- [ ] Click "Export Rated" when done
- [ ] Send the exported JSON file back to Blaine
- [ ] Note any flagged errors in comments

### Target: 20 scenarios per day

## Worked Example

Here's how to rate a scenario:

**Scenario**: "You're the pitcher. Top 1st, nobody on, 0 outs. Leadoff hitter up. What's your approach?"
- A. Throw a fastball strike (85%) ← BEST
- B. Start with a curveball to surprise him (40%)
- C. Waste a pitch high and inside (30%)
- D. Throw a changeup to set up your fastball (50%)

**Best explanation**: "Getting ahead 0-1 is huge. Pitchers who throw first-pitch strikes have ERAs nearly 2 runs lower."

**My ratings:**
- Factual Accuracy: **9** (stats are accurate, strategy is correct)
- Explanation Strength: **8** (good stat, but could explain WHY getting ahead matters more)
- Age-Appropriateness: **9** (diff 1 = Rookie, language is clear and simple)
- Educational Value: **9** (teaches a specific, actionable principle)
- Variety & Engagement: **7** (classic scenario but a bit generic — "leadoff hitter, top 1st")

**Preferred Explanation**: A (teaches the "first-pitch strike" principle clearly)

**Comment**: "Good scenario. Option D explanation could be stronger — it should mention that changeups work better when the batter is already timing fastball."

## Boundaries — What NOT to Do
- Do NOT change any scenario text or code
- Do NOT rate based on personal preference for how baseball "should" be played — rate based on whether the scenario accurately teaches established strategy
- Do NOT rush through ratings — a careful rating is worth 10 rushed ones
- Do NOT inflate scores. If it's a 5, give it a 5. We need honest data.
- Do NOT skip the "Preferred Explanation" pick — this is critical for training

## When to Flag Issues (use the comments box)
- Any factual error you're confident about
- Any explanation that could mislead a kid
- Language that's way too advanced/simple for the difficulty level
- Any scenario that feels "off" even if you can't pinpoint why

## Questions?
Contact Blaine directly. When in doubt about a baseball rule, flag it in comments rather than guessing. We'd rather you note "not sure about this balk call" than guess wrong.

**Thank you — your work here directly builds the best baseball education tool on the planet.**
