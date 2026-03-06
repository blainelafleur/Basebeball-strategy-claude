# ⚾ Baseball Strategy Master — Project Intelligence Brief
**For new conversations, Claude Code sessions, and Cowork automation tasks**
*Version 2.4 · March 2026*

---

## 1. What This App Is

Baseball Strategy Master is a scenario-based baseball strategy education app for players ages 6–18. Players read a game situation, choose from four options, and receive explanations of why the correct play was right. The goal is improving baseball IQ — not mechanics, but strategic thinking.

| Dimension | Description |
|-----------|-------------|
| Core loop | Read scenario → Choose answer → Get explanation + coach feedback |
| Players | Ages 6–18; skill levels from T-ball to varsity |
| Tiers | Free (limited plays) vs. Pro (unlimited + AI-generated personalized scenarios) |
| Success metric | Players get right answers faster over time AND can explain why |
| Tech stack | Cloudflare Workers + D1 backend; single-file React (index.jsx) frontend deployed on Cloudflare Pages |
| Dev workflow | Blaine generates code in Claude → pastes into Windsurf → deploys via Cloudflare Pages |

> **⚠️ The #1 Rule:** The app teaches children. Every scenario, explanation, coach line, and stat must be accurate, age-appropriate, and kind. When in doubt, err on the side of simplicity and encouragement.

---

## 2. Key Files You Must Know

Two documents are the authoritative source of truth for all content decisions. Search project knowledge for both before proposing any changes to scenarios, coach lines, statistics, or position rules.

| File | What It Contains |
|------|-----------------|
| `SCENARIO_BIBLE.md` | Quality framework: 4-tier knowledge hierarchy, position principles, knowledge maps, quality checklist, data tables, audit log. THE editorial standard. |
| `BRAIN_KNOWLEDGE_SYSTEM.md` | In-code knowledge engine: BRAIN constant (RE24, counts, concepts), 7 knowledge maps, POS_PRINCIPLES, coach lines, AI prompt template. THE technical implementation. |
| `index.jsx` | The entire frontend app — scenarios, AI generation, coach system, UI — in a single React file. Never edit without reading SCENARIO_BIBLE first. |
| `worker/index.js` | Cloudflare Worker backend: authentication, Stripe webhooks, AI proxy, D1 database queries. |
| `scripts/validate-scenarios.js` | Automated quality checker. Run before and after adding scenarios to catch structural errors. |

---

## 3. The Knowledge Hierarchy — Non-Negotiable

Every piece of baseball knowledge in this app is governed by a strict 4-tier hierarchy. Higher tiers always win. Never propose anything that contradicts a higher tier.

| Tier | Source | Examples | Rule |
|------|--------|----------|------|
| 1 | MLB Official Rules | Force vs. tag, infield fly, fair/foul, obstruction, dropped 3rd strike | NEVER contradict. Zero exceptions. |
| 2 | Measurable Data (FanGraphs, Statcast, Baseball Reference) | RE24 run expectancy, steal break-even %, count leverage, TTO penalty | NEVER contradict without citing a higher tier. Cite exact source. |
| 3 | Coaching Consensus (ABCA, USA Baseball) | Cutoff assignments, bunt coverage, relay positioning | Follow unless Tier 1 or 2 disagrees. Mark as "coaching consensus." |
| 4 | Situational Judgment | Aggressive vs. conservative reads, matchup calls | Present as options with tradeoffs — NEVER as the only right answer. |

### Key Data Points Already in the System (BRAIN constant)

**RE24 values (FanGraphs 2015–2024 averages):**
- Empty bases: 0.00 RE | Runner on 1st: 0.85 | 1st & 2nd: 1.46 | Bases loaded: 2.29
- These govern when bunting lowers run expectancy vs. raises it — DO NOT invent new RE24 values

**Steal break-even thresholds (Statcast era):**
- Ages 13+: ~72% success rate to break even | Ages 11–12: ~65% | Ages 9–10: ~60%

**Count leverage:**
- 0-2 count: .163 batting average | 3-0 count: .353 | Full count: .270

**Times-Through-Order penalty:**
- 3rd time through lineup: batters hit ~30 points higher (Baseball Prospectus)

---

## 4. Position Rules — The Hard Stops

These are categorical errors that invalidate a scenario. The QUALITY_FIREWALL in index.jsx catches many automatically, but check before proposing content.

### 🚫 Position Violations That Are NEVER Allowed

- **Pitcher as cutoff man.** The pitcher NEVER takes a cutoff throw. SS, 2B, or 3B are always the cutoff depending on the play.
- **Catcher leaving home plate unguarded.** On a throw home, catcher blocks the plate. On a passed ball, catcher goes to the ball — not into the outfield.
- **Outfielder as relay man.** Outfielders throw to the relay man (usually SS or 2B). They don't relay to themselves.
- **Wrong backup positions.** Pitcher backs up 3B/home on extra-base hits to left. CF backs up throws to 2B. Consult CUTOFF_RELAY_MAP before assigning backups.
- **Physically impossible premises.** "You tagged the runner but he slipped away" — if you tagged him, he's out. No impossible scenarios.
- **Score perspective errors.** score=[HOME, AWAY]. If inning is "Bot X", offensive position = HOME team = score[0]. If "Top X", offensive position = AWAY = score[1]. "Trailing 4-3" means player's team score is 3, opponent is 4. ALWAYS verify.

Cross-reference `CUTOFF_RELAY_MAP` and `FLY_BALL_PRIORITY_MAP` constants in index.jsx when writing any scenario involving throws, relays, or fly ball communication.

---

## 5. Content Standards — What Good Looks Like

### 5a. Scenario Quality

| ✅ GOOD | ❌ BAD |
|---------|--------|
| Description sets up a real, physically possible game situation | Scenario premise is impossible |
| All 4 options are legitimate baseball plays | Options include "wait and see" or two options are the same play |
| Best explanation argues FOR the correct answer using this game's specific context | Best explanation describes why another answer is also good |
| Wrong explanations cite specific consequences of that wrong choice | Wrong explanations are generic ("that's not the right call") |
| Language is age-appropriate — simple for diff 1, analytical for diff 3 | Jargon like "RE24", "wOBA", "R3", "OBP" in descriptions or options |
| Score, inning, and outs are internally consistent throughout | Description says "trailing" but scoreboard shows the player's team winning |
| Difficulty 1: correct answer rate ~70–90% on first attempt | Correct answer rate <20% (confusing) or >95% (trivial) |

### 5b. Coach Lines — The Most-Abused Element

Coach lines are short messages displayed after a player answers. Every coach line must either TEACH something specific about baseball strategy OR provide genuine encouragement. Filler destroys the educational tone.

**Rules:**
- **MUST teach or genuinely encourage.** Bad: "Perfect call, slugger!" (empty praise). Good: "Smart play — stealing with 2 outs and 2 strikes is almost always wrong because you'd be running into a possible strikeout."
- **Perspective must match position.** Defensive lines (double play situations, pitch counts) must NOT appear for Batter or Baserunner. Filter by `isOffensivePosition` vs. `isDefensivePosition`.
- **No misused terminology.** "Slugger" for a fielder scenario, "great pitch" shown to the batter, "perfect bunt" for a non-bunt scenario — all wrong.
- **Pro users get situational lines.** The `BRAIN.coaching.situational` map keys are bound to game state (RE24, count, inning, score). These are the most valuable lines — treat them carefully.

### 5c. AI-Generated Scenarios — The 10 Most Common Errors

When reviewing or improving AI generation, watch for these in priority order:

| # | Error | Fix |
|---|-------|-----|
| 1 | Explanation-answer mismatch | Best explanation must argue FOR the best option — read it and ask "does this paragraph justify option[best]?" |
| 2 | Score perspective error | score=[HOME, AWAY]. Bot inning = offensive team is HOME. Top inning = offensive team is AWAY. Double-check every score reference. |
| 3 | Impossible premise | Physical impossibilities must be caught before the scenario is accepted. |
| 4 | Position violation | Pitcher as cutoff, catcher leaving home, wrong backup — cross-check CUTOFF_RELAY_MAP every time. |
| 5 | Jargon in descriptions | RE24, wOBA, OBP, R3 are only for `explDepth.data` — never in description, options, or simple explanations. |
| 6 | Contradictory options | Two options that say essentially the same thing, or one option that combines two contradictory actions. |
| 7 | Wrong tying/go-ahead run label | "Tying run" = run that ties the game. "Go-ahead run" = run that gives the lead. These are NOT interchangeable. |
| 8 | Wrong-perspective coach line | Coach line about double plays showing up for a baserunner scenario. |
| 9 | Age-inappropriate vocabulary | Diff 1 scenarios for ages 6–10 must not contain terms forbidden in `AGE_GATE['6-8'].forbidden`. |
| 10 | Missing or wrong conceptTag | Every scenario needs a conceptTag that maps to a concept in BRAIN.concepts. Check the keyword mapping. |

---

## 6. How to Propose Changes — The Required Format

Every proposal to add or change content, code, or knowledge must follow this pattern.

### Required Format for Any Content Change

**Step 1 — Show what exists now**
Quote the relevant section from SCENARIO_BIBLE.md or BRAIN_KNOWLEDGE_SYSTEM.md.

**Step 2 — Explain what's missing or could be better**
Be specific. "The catcher section lacks scenarios for catcher's interference" is good. "More scenarios" is not.

**Step 3 — Propose the specific change with exact JavaScript formatting**
All additions to `SCENARIOS[]`, `POS_PRINCIPLES`, `BRAIN` constant, or knowledge maps must be output in the exact JavaScript object format used in index.jsx so they can be copy-pasted without modification.

**Step 4 — Note cross-references and consistency checks**
Which other maps, positions, or scenarios does this touch? Does any existing scenario describe the same play from a different position? Does the proposed change match CUTOFF_RELAY_MAP?

> **📋 After Any Change Is Made:** Update SCENARIO_BIBLE.md's audit log (Section 10) with: date, what changed, version number, and any downstream impacts. Update `BRAIN_VERSION` and `KNOWLEDGE_CHANGELOG` in index.jsx.

---

## 7. Current State Snapshot (Version 2.4)

| Item | Status |
|------|--------|
| Handcrafted scenarios | 539 across 15 position categories (as of v2.4.0, 2026-02-27) |
| AI generation | Live via xAI Grok (grok-4-1-fast) through Cloudflare Worker proxy |
| Knowledge maps | 7 maps integrated into AI prompt (cutoff/relay, fly ball priority, count leverage, RE24, steal break-even, age gates, coach voices) |
| Quality firewall | 10 automated checks (3 tiers: hard fails, warnings, suggestions) run on every AI-generated scenario |
| Playtesting | Underway — two-page overview doc exists for distribution to playtesters |
| Remote assistant | Active — content production only (scenarios, stats, coach lines). No code, design, or business decisions. |
| BRAIN version | 2.4.0 — see KNOWLEDGE_CHANGELOG in index.jsx for full history |

### Positions by Scenario Count (Thinly Covered = Priority for Expansion)

| Position | Count | Notes |
|----------|-------|-------|
| Pitcher | 59+ | Rich — not a priority |
| Batter | 58+ | Rich — not a priority |
| Manager | 58+ | Rich — not a priority |
| Catcher | 30+ | Decent — targeted expansion helpful |
| Shortstop | 16+ | ⚠️ Thin — HIGH priority for expansion |
| Center Field | 16+ | ⚠️ Thin — HIGH priority for expansion |
| 2B / 1B / 3B / LF / RF | 14–15 each | ⚠️ Thin — HIGH priority for expansion |

---

## 8. What's Next — Active Priorities

| Order | Task | Context |
|-------|------|---------|
| 1 | Situational Mastery Scenario Clusters | Next in the 20-prompt Phase 2 sequence (Prompts 13–16 range). Creates clusters of scenarios that teach the same concept from multiple positions. |
| 2 | Corner + Secondary Position Expansion | 80+ new scenarios planned for SS, 2B, 1B, 3B, LF, RF. Remote assistant drafts; Blaine audits against SCENARIO_BIBLE. |
| 3 | Famous Plays Database | ~50 historical MLB plays coded as scenarios. Remote assistant does research; code integration is Claude's job. |
| 4 | Playtester Feedback Integration | As feedback arrives, prioritize: broken scenarios first, then confusing explanations, then balance/difficulty. |
| 5 | Cowork Automation (Exploring) | Potential use of Cowork to give Claude direct file access and send instructions to Windsurf, streamlining remaining Phase 2 prompts. |

---

## 9. Working With the Remote Assistant

The remote assistant (based in the Philippines) contributes content production work independently without direct codebase access.

**✅ CAN DO:** Write scenario drafts, research statistics, audit coach lines, write famous plays descriptions, verify MLB rule citations.

**🚫 CANNOT DO:** Any code changes, design decisions, pricing/business decisions, edits to index.jsx or any .js/.jsx file.

### When creating deliverables for the remote assistant:
- Use copy-paste-ready formats with explicit structure
- Include worked examples for every format requirement
- Add explicit boundaries and error examples (show what NOT to do)
- Provide a checklist they can mark off for each deliverable
- Never assume familiarity with the code or technical architecture

---

## 10. Technical Gotchas — Learn From Past Mistakes

| Situation | What to Know |
|-----------|-------------|
| Adding new SQL tables | CANNOT be done via Windsurf or Worker routes. Must be executed manually in the Cloudflare D1 dashboard. Creating a migration file is not enough — it must be run manually. |
| Worker route changes | CAN be done via Windsurf. Deploy with `npx wrangler deploy` from the `worker/` directory. |
| AI generation was 0% success | Root cause: single-message API call (system only, no user message). Fixed in AI_SCENARIO_QUALITY_PLAN.md. Always use system + user message structure. |
| Relay/cutoff assignment errors | Most common content error. ALWAYS cross-check CUTOFF_RELAY_MAP before assigning cutoff roles in any scenario, regardless of position being written. |
| Score perspective in AI scenarios | Most common AI generation bug. score=[HOME,AWAY]. Bot inning = HOME team bats. Verify every score reference before accepting a generated scenario. |
| Coach lines with no context | Generic lines like "Perfect call, slugger!" are filler. Every line must teach or genuinely encourage with specificity. |
| Prompt too long → AI timeout | grok-4-1-fast with a 10,000+ char prompt was timing out (50% failure rate). Prompt reduction to ~1,500 chars for the user message fixed response time. |

---

## 11. What Claude Is Expected to Do

Claude is the primary development and content intelligence partner for this project.

**Code Generation** — Generate complete, paste-ready JavaScript/React code for:
- New `SCENARIOS[]` array entries
- `BRAIN` constant additions
- `POS_PRINCIPLES` updates
- Knowledge map modifications
- AI prompt improvements
- Worker route changes

**Content Architecture** — Design and maintain the knowledge system:
- Propose scenario frameworks and clusters
- Write quality-checked coach lines
- Create remote assistant guides with examples
- Run consistency audits across positions
- Produce polished external docs (Word .docx format)

### How Blaine Works With Claude
- **Prompt-by-prompt sequence:** We work through the 20-prompt Phase 2 plan one prompt per conversation. Each conversation starts with the project context loaded.
- **Paste workflow:** Claude generates code → Blaine copies → pastes into Windsurf → reviews → deploys. Output must be self-contained and paste-ready.
- **Document workflow:** Claude generates Word .docx files for external documents (playtester guides, remote assistant briefs, etc.).
- **Audit workflow:** When asked to audit content, cross-check against BOTH documents and report with Tier 1/2/3 violation levels.

---

## 12. Quick Reference Checklists

### Before Adding ANY Scenario
- [ ] Premise is physically possible in baseball
- [ ] Correct answer matches the explanation for the correct answer
- [ ] Score, inning, and outs are internally consistent
- [ ] All 4 options are distinct, legitimate baseball plays
- [ ] If cutoffs/relays are involved → cross-checked CUTOFF_RELAY_MAP
- [ ] Language matches the difficulty level (no jargon in diff 1)
- [ ] Scenario has a `conceptTag` that exists in `BRAIN.concepts`
- [ ] Scenario has appropriate `ageMin`/`ageMax`

### Before Adding ANY Coach Line
- [ ] Teaches something specific OR provides genuine (not empty) encouragement
- [ ] Perspective is correct for the position category (offense/defense/universal)
- [ ] Terminology is used correctly
- [ ] If a situational line, has the right key in `BRAIN.coaching.situational`

### Before Proposing ANY Statistic
- [ ] Sourced from FanGraphs, Statcast, or Baseball Reference
- [ ] Cited with source and approximate date range
- [ ] Matches or improves upon what's already in `BRAIN.stats`
- [ ] If unsure of exact value, say so — never invent a number

---

*Authoritative sources: SCENARIO_BIBLE.md · BRAIN_KNOWLEDGE_SYSTEM.md · index.jsx*
