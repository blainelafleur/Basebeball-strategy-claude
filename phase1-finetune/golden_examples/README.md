# Golden Examples Dataset (v2)

## What Are Golden Examples?

100 world-class baseball strategy scenarios curated as the quality standard for BSM. Every future training run (SFT and DPO) automatically includes these as the foundation.

## Uses

- **Few-shot prompting** — injected into AI generation prompts so the model knows what "great" looks like
- **Training foundation** — merged into every SFT dataset automatically via `dataset_formatter.py`
- **Quality benchmark** — any new scenario (AI or handcrafted) should match this quality bar
- **Validation holdout** — reserve 10-20 for evaluating fine-tuned models

## Composition

| Source | Count | Description |
|--------|-------|-------------|
| Handcrafted | 40 | Best Gold-tier scenarios from 584 handcrafted set (clientScore=100 in audit) |
| AI-Generated | 30 | Top coach-rated AI scenarios (avg rating >= 7.5) + high-quality synthetic AI-style |
| Synthetic Edge Cases | 30 | Hand-crafted scenarios covering rare rules, complex relays, age-specific content |

## Quality Requirements (ALL 100 pass)

- Best answer rate: 78-90
- At least one tempting wrong answer: 42-65
- Other wrong answers: 12-35
- Rate sum: 170-190
- 4 options, 4 non-empty explanations
- 2nd person perspective
- Valid BSM category (one of 15 positions)

## Position Distribution

| Position | Handcrafted | AI-Generated | Synthetic | Total |
|----------|-------------|--------------|-----------|-------|
| baserunner | 2 | 3 | 3 | 8 |
| batter | 3 | 2 | 3 | 8 |
| catcher | 3 | 2 | 3 | 8 |
| manager | 3 | 2 | 3 | 8 |
| thirdBase | 3 | 1 | 4 | 8 |
| centerField | 3 | 2 | 2 | 7 |
| leftField | 3 | 2 | 2 | 7 |
| pitcher | 3 | 2 | 2 | 7 |
| rules | 1 | 1 | 5 | 7 |
| counts | 3 | 2 | 1 | 6 |
| firstBase | 2 | 1 | 3 | 6 |
| secondBase | 3 | 1 | 2 | 6 |
| shortstop | 2 | 3 | 1 | 6 |
| rightField | 2 | 2 | 1 | 5 |
| famous | 2 | 1 | 0 | 3 |

Difficulty mix: Rookie=28, Pro=47, All-Star=25

## Synthetic Edge Cases Cover

- Rare rules: infield fly, balk, obstruction, appeal plays, dropped third strike
- Complex relays: double cut, tandem relay
- Defensive techniques: rundown, pickoff tags, popup priority, first-and-third defense
- Age-specific: pitch count awareness for youth
- High-leverage: squeeze plays, 3-0 green light, bases loaded walks

## Schema

Each line in `golden_examples.jsonl` is a JSON object:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Short scenario title |
| `diff` | number | 1=Rookie, 2=Pro, 3=All-Star |
| `cat` | string | One of 15 BSM position categories |
| `conceptTag` | string | Concept taxonomy tag |
| `description` | string | Game situation (2nd person) |
| `situation` | object | {inning, outs, count, runners, score} |
| `options` | string[4] | Four answer choices |
| `best` | number | Index of best answer (0-3) |
| `explanations` | string[4] | Why each option is good/bad |
| `rates` | number[4] | Success rates per option |
| `concept` | string | Teaching concept |
| `anim` | string | Field animation type |
| `source` | string | "handcrafted", "ai-generated", or "synthetic" |
| `coachScore` | number\|null | Coach rating average (AI only) |

## How It's Used in Training

`dataset_formatter.py` automatically:
1. Loads all 100 golden examples
2. Converts each to SFT format (prompt + completion)
3. Merges them into `sft_combined.jsonl` alongside handcrafted + coach-rated data
4. Golden examples appear first in the combined file for maximum training signal

## Files

- `golden_examples.jsonl` — The combined 100 scenarios (this is the file used by training)
- `handcrafted_40.jsonl` — 40 handcrafted source scenarios
- `ai_generated_30.jsonl` — 30 AI-generated source scenarios
- `synthetic_30.jsonl` — 30 synthetic edge case source scenarios
- `build_handcrafted_40.py` — Script that selected the 40 from audit Gold tier
- `build_ai_generated_30.py` — Script that selected/created the 30 AI scenarios
