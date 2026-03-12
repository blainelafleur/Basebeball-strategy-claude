# BSM Scenario Rating — Instructions for Raters

## What You're Doing
You are rating AI-generated baseball strategy scenarios. Your ratings will be used to train the world's best baseball education AI. Your expertise matters — rate honestly and flag errors.

## Setup (One Time)
1. Open the file `rating-tool.html` in your web browser (Chrome, Safari, or Firefox)
2. Click "Load scenarios" and select the JSON file you received
3. The tool saves your progress automatically — you can close and reopen anytime

## How to Rate Each Scenario

### Read the scenario carefully:
- Read the game situation (inning, outs, count, runners, score)
- Read all 4 options
- Check which option is marked as "best" (green border)
- Read all 4 explanations

### Rate each dimension 1-10:

| Dimension | What to look for | 10 means | 1 means |
|-----------|-----------------|----------|---------|
| **Factual Accuracy** | Are the rules correct? Cutoff assignments? Run expectancy logic? | Every fact is correct | Major rule error or role violation |
| **Explanation Strength** | Does the best explanation argue FOR the answer and teach WHY? | Clear, specific, teaches the concept | Vague, generic, doesn't explain why |
| **Age-Appropriateness** | Does the language match the difficulty level? | Perfect for the target age | Way too complex or too simple |
| **Educational Value** | Does this teach a specific, useful baseball concept? | Kid will learn something real | No educational value, filler content |
| **Variety & Engagement** | Is the situation fresh and vivid? | Unique scenario, exciting to read | Boring, formulaic, seen it before |

### Pick the strongest explanation:
- Click the explanation that does the BEST job teaching a kid WHY that answer is right or wrong
- This is used for preference training — pick the one YOU would want to show a 10-year-old

### Flag issues in comments (optional but helpful):
- "Wrong cutoff assignment — SS doesn't go to 3rd on this play"
- "Fly ball priority is reversed — CF has priority over LF"
- "Language too advanced for Rookie difficulty"
- "Great scenario, very realistic"

## Common Tier 1 Errors to Watch For
These are the most serious errors — always flag them:
- **Wrong cutoff/relay**: Pitcher doesn't relay, catcher doesn't leave home
- **Wrong fly ball priority**: CF > corners, infield yields to outfield
- **Wrong force/tag**: Runner forced when no force exists (or vice versa)
- **Wrong backup assignments**: Who backs up which base
- **Balk rule errors**: Pitcher doing something that isn't actually a balk
- **Infield fly errors**: Called when rule doesn't apply (less than 2 runners, 2 outs)

## Daily Target
- **Rate 20 scenarios per session** (takes about 45–60 minutes)
- Quality > speed — a careful rating is worth more than a rushed one
- Take a break if you're getting fatigued

## When You're Done
1. Click "Export Rated" at the top of the page
2. This downloads a `coach-ratings-YYYY-MM-DD.json` file
3. Send that file back to Blaine

## Keyboard Shortcuts
- **← / →** arrows: Navigate between scenarios
- **Cmd+Enter**: Submit and go to next

## Questions?
Contact Blaine directly. When in doubt about a baseball rule, flag it in comments rather than guessing.
