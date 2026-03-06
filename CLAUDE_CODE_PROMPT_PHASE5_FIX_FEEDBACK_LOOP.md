# Claude Code Prompt: Phase 5 — Fix the Feedback Loop

## Context
You're working on Baseball Strategy Master. The worker is in `worker/index.js` and the app is `index.jsx`. This is Phase 5 of the AI quality improvement plan. Read `AI_IMPROVEMENT_PLAN.md` for full context.

The D1 database has all the tables for a self-learning feedback loop, but it's disconnected: every pool scenario has `concept_tag: ""`, there are 0 prompt patches, and 0 weekly reports have ever been generated. This phase activates the existing plumbing.

## Changes (3 total)

### 5A. Populate `concept_tag` on pool submission

**Location:** `worker/index.js` — find the `/pool/submit` or pool insertion handler.

When a scenario is submitted to the pool, extract a `concept_tag` from the scenario's concept text using keyword matching:

```javascript
function extractConceptTag(conceptText) {
  if (!conceptText) return ''
  const TAG_MAP = {
    'steal': 'steal-window',
    'pickoff': 'pickoff-mechanics',
    'pick.?off': 'pickoff-mechanics',
    'first.?pitch': 'first-pitch-strike',
    'count': 'count-leverage',
    'relay': 'relay-double-cut',
    'cutoff': 'cutoff-alignment',
    'cut.?off': 'cutoff-alignment',
    'backup': 'backup-duties',
    'back.?up': 'backup-duties',
    'bunt': 'bunt-defense',
    'double.?play': 'double-play-turn',
    'force': 'force-vs-tag',
    'tag.?up': 'tag-up-rules',
    'fly.?ball': 'fly-ball-priority',
    'pitch.?clock': 'pitch-clock-strategy',
    'two.?strike': 'two-strike-approach',
    '2.?strike': 'two-strike-approach',
    'situational': 'situational-hitting',
    'pitch.?call': 'pitch-calling',
    'pitch.?sequence': 'pitch-sequencing',
    'hold': 'holding-runners',
    'squeeze': 'squeeze-play',
    'hit.?and.?run': 'hit-and-run',
    'rundown': 'rundown',
    'sacrifice': 'sacrifice-bunt',
    'infield.?fly': 'infield-fly-rule',
    'ibb': 'ibb-strategy',
    'intentional': 'ibb-strategy',
  }
  const lc = conceptText.toLowerCase()
  for (const [pattern, tag] of Object.entries(TAG_MAP)) {
    if (new RegExp(pattern, 'i').test(lc)) return tag
  }
  return ''
}
```

Then in the pool insert SQL, use this function:

```javascript
const conceptTag = extractConceptTag(scenario.concept || scenario.scenario_json?.concept || '')
// INSERT INTO scenario_pool (..., concept_tag, ...) VALUES (..., ?, ...)
```

Also, backfill existing pool scenarios that have empty concept_tag. You can do this as a one-time migration or add an endpoint. The simplest approach is to add logic in the worker that checks on startup or via a `/pool/backfill-tags` endpoint:

```javascript
// Backfill: Update existing rows with empty concept_tag
const rows = await env.DB.prepare('SELECT id, concept FROM scenario_pool WHERE concept_tag = ""').all()
for (const row of rows.results) {
  const tag = extractConceptTag(row.concept)
  if (tag) {
    await env.DB.prepare('UPDATE scenario_pool SET concept_tag = ? WHERE id = ?').bind(tag, row.id).run()
  }
}
```

### 5B. Auto-generate prompt patches from feedback patterns

**Location:** `worker/index.js` — in the `/feedback/submit` or flag submission handler.

After inserting a flag into `scenario_feedback`, check if the position+category combo has reached a threshold (3+ flags), and if so, auto-create a prompt patch:

```javascript
// After inserting the flag...
const flagCount = await env.DB.prepare(
  'SELECT COUNT(*) as cnt FROM scenario_feedback WHERE position = ? AND flag_category = ? AND created_at > datetime("now", "-7 days")'
).bind(position, flagCategory).first()

if (flagCount?.cnt >= 3) {
  // Check if there's already an active patch for this position+category
  const existingPatch = await env.DB.prepare(
    'SELECT id FROM prompt_patches WHERE position = ? AND trigger_type = ? AND active = 1 AND expires_at > datetime("now")'
  ).bind(position, flagCategory).first()

  if (!existingPatch) {
    const PATCH_TEMPLATES = {
      confusing_text: `QUALITY ALERT for ${position}: Recent player feedback reports confusing explanations. Write SHORT, CLEAR sentences. Start explanations with "You..." or "The problem with..." NO filler phrases. NO abstract language. Be specific about what happens on the field.`,
      wrong_answer: `ACCURACY ALERT for ${position}: Recent player feedback reports incorrect best answers. Double-check that the best option follows standard coaching consensus. Verify the game situation makes the answer possible.`,
      unrealistic: `REALISM ALERT for ${position}: Recent player feedback reports unrealistic game situations. Ensure the scenario could actually happen in a real game. Check that outs, runners, score, and inning are consistent.`,
      too_easy: `DIFFICULTY ALERT for ${position}: Recent data shows scenarios are too easy. Make wrong options more plausible. Include at least one "sounds smart but wrong" option rated 45-60.`,
    }

    const patchText = PATCH_TEMPLATES[flagCategory] || `QUALITY ALERT for ${position}: Multiple player flags (${flagCategory}). Review and improve scenario quality.`

    await env.DB.prepare(
      'INSERT INTO prompt_patches (position, patch_text, trigger_type, confidence, expires_at, active) VALUES (?, ?, ?, ?, datetime("now", "+7 days"), 1)'
    ).bind(position, patchText, flagCategory, 0.8).run()
  }
}
```

**Also verify** that `buildAgentPrompt()` in `index.jsx` actually reads and injects prompt patches. Search for "prompt_patches" or "patch" in `buildAgentPrompt()` — there should already be code that fetches and injects patches. If it's not there or it's commented out, enable it.

### 5C. Fix weekly report cron

**Location:** `worker/wrangler.toml` and `worker/index.js`

1. **In `wrangler.toml`**, ensure there's a cron trigger:
```toml
[triggers]
crons = ["0 6 * * 1"]  # Every Monday at 6am UTC
```

2. **In `worker/index.js`**, ensure the `scheduled` event handler exists and writes to `weekly_ai_report`:

```javascript
export default {
  async scheduled(event, env, ctx) {
    // Generate weekly AI quality report
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const stats = await env.DB.prepare(`
      SELECT
        position,
        COUNT(*) as total_plays,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
        ROUND(AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100, 1) as correct_rate,
        SUM(CASE WHEN is_ai = 1 THEN 1 ELSE 0 END) as ai_plays
      FROM learning_events
      WHERE created_at > ?
      GROUP BY position
    `).bind(weekAgo).all()

    const flags = await env.DB.prepare(`
      SELECT position, flag_category, COUNT(*) as cnt
      FROM scenario_feedback
      WHERE created_at > ?
      GROUP BY position, flag_category
    `).bind(weekAgo).all()

    const poolStats = await env.DB.prepare(`
      SELECT COUNT(*) as total, AVG(quality_score) as avg_quality,
        SUM(CASE WHEN retired = 1 THEN 1 ELSE 0 END) as retired
      FROM scenario_pool
    `).first()

    const report = {
      period: `${weekAgo} to ${new Date().toISOString()}`,
      learning: stats.results,
      flags: flags.results,
      pool: poolStats,
      generated_at: new Date().toISOString()
    }

    await env.DB.prepare(
      'INSERT INTO weekly_ai_report (report_json, period_start, period_end) VALUES (?, ?, ?)'
    ).bind(JSON.stringify(report), weekAgo, new Date().toISOString()).run()
  },
  // ... existing fetch handler
}
```

Make sure the `weekly_ai_report` table exists. If not, create it:
```sql
CREATE TABLE IF NOT EXISTS weekly_ai_report (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_json TEXT,
  period_start TEXT,
  period_end TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Verification

1. Submit a test flag via the app — check D1 that `scenario_feedback` gets a row
2. Submit 3 flags for the same position+category — check D1 that `prompt_patches` gets a row with `active = 1`
3. Check that `concept_tag` is populated on new pool submissions (not empty string)
4. Run the backfill endpoint/logic — check that existing pool scenarios now have concept_tags
5. Verify `wrangler.toml` has the cron trigger
6. Deploy worker: `cd worker && npx wrangler deploy`
7. Check D1 `weekly_ai_report` table exists

## Important

- The concept_tag backfill should be idempotent — running it twice shouldn't cause problems
- Prompt patches expire after 7 days (self-healing — if the problem is fixed, the patch disappears)
- The weekly report cron runs on Cloudflare's infrastructure — it doesn't need the app to be open
- Don't change the existing feedback submission flow on the client side — just enhance the server-side handler
