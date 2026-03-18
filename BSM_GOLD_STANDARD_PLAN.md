# BSM Gold Standard Plan — Fix the Machine, Then Fix the Scenarios

**Created**: March 17, 2026
**Source**: Self-improving audit pipeline (4-stage, $44.69, Claude Opus)
**Final State**: 94.6% projected pass rate across 608 scenarios after 4 complete audits. Phases A, B, C COMPLETE.

---

## Philosophy

The audit didn't just find 166 bad scenarios — it revealed **systemic gaps in the validation machine** that creates and evaluates scenarios. Fixing individual scenarios without fixing the machine is whack-a-mole. Instead:

1. **Fix the machine** — upgrade QUALITY_FIREWALL, CRITIC, and validation rules
2. **Run all scenarios through the fixed machine** — catch everything
3. **Fix everything that fails** — every scenario to gold standard
4. **Re-audit to verify** — loop until >95% pass rate
5. **Make it permanent** — every future scenario goes through the same gold standard pipeline

---

## Audit Findings Summary

### What the Audit Found (Systemic)

| Pattern | Frequency | Severity | System Gap |
|---------|-----------|----------|------------|
| ConceptTag mismatches | 14% of calibration | HIGH | No validation that tag matches content |
| Score perspective errors | 8% | MEDIUM | No check that score[0]/[1] matches Top/Bot inning |
| Repetitive explanations | 12% | MEDIUM | No diversity check across 4 explanations |
| Wrong best answer rates | 4% | HIGH | No check that rates[best] is highest |
| Invalid position categories | 14% | MEDIUM* | CRITIC doesn't know BSM's 15-category system |
| Factual force play errors | 6% | HIGH | No force play mechanics validation |
| Age-inappropriate complexity | 8% | MEDIUM | No vocabulary/complexity check per difficulty |

*NOTE: `rules`, `famous`, `counts` are INTENTIONAL BSM categories — the CRITIC flagged them because it only knows standard baseball positions. ~89 of 166 failures are this false positive. Real issue rate is ~13% (77/605), not 27%.

### Audit Outputs Available

| File | Contents | Use |
|------|----------|-----|
| `scripts/audit_full_results.json` | Per-scenario scores, issues, dimensions for all 605 | Fix individual scenarios |
| `scripts/audit_discovered_rules.json` | 10 new rules, 7 patterns, 6 blind spots, position criteria | Upgrade QUALITY_FIREWALL |
| `scripts/audit_synthesis.json` | 10 firewall rules, 26 fix recs, 8 framework upgrades | Upgrade the system |
| `scripts/audit_firewall_rules.js` | Code-ready QUALITY_FIREWALL additions | Integrate into index.jsx |
| `scripts/audit_enhanced_prompt.txt` | 9,258-char enhanced CRITIC prompt | Integrate into worker |
| `scripts/audit_calibration.json` | 50-scenario calibration results | Reference |

---

## PHASE A: FIX THE MACHINE (~8-12 hrs) — COMPLETE

### A1. Upgrade QUALITY_FIREWALL in index.jsx

The client-side QUALITY_FIREWALL currently has 10 Tier 1 + 6 Tier 2 + 3 Tier 3 checks. The audit discovered 10 new rules. Add them, adapted for BSM's 15-category system.

**New Tier 1 rules (hard reject):**
1. `bestAnswerRateCheck` — rates[best] must be the highest rate value
2. `conceptTagAlignmentCheck` — conceptTag must match scenario content keywords
3. `explanationIndexAlignmentCheck` — explanation[i] must address option[i]

**New Tier 2 rules (warnings):**
4. `countFormatCheck` — count must be "X-Y" format, not "-" placeholder
5. `scoreInningConsistencyCheck` — score array must match Top/Bot perspective
6. `ageAppropriateComplexityCheck` — no advanced stats (OPS, WAR, BABIP) in diff:1
7. `forcePlayAccuracyCheck` — force play mechanics must be correct
8. `explanationVarietyCheck` — each explanation must teach different principle (<30% overlap)

**New Tier 3 rules (suggestions):**
9. `rateDistributionReasonableCheck` — all rates 5-95, min 20-point spread
10. `historicalScenarioCheck` — historical scenarios must teach strategy, not just history

**IMPORTANT adaptation:** The `validPositionCheck` rule must include ALL 15 BSM categories: pitcher, catcher, firstBase, secondBase, thirdBase, shortstop, leftField, centerField, rightField, batter, baserunner, manager, famous, rules, counts. The audit flagged rules/famous/counts as invalid, but they're intentional categories in our app.

```
Prompt A1:
Read the QUALITY_FIREWALL object in index.jsx (search for QUALITY_FIREWALL).
Read scripts/audit_firewall_rules.js for the discovered rules.

Add these 10 new validation rules to QUALITY_FIREWALL, following the existing
pattern for each tier. Key adaptations needed:

1. validPositionCheck: Include ALL 15 BSM categories (not just 12 baseball positions)
2. conceptTagAlignmentCheck: Build keyword map for all 46 BRAIN.concepts tags
3. countFormatCheck: Allow "-" for manager/rules/famous scenarios where count
   doesn't apply, require "X-Y" format for all playing positions
4. explanationVarietyCheck: Use Jaccard similarity — flag if any pair >0.4

Integrate each rule into the appropriate tier:
- Tier 1 rules: must return false to reject the scenario
- Tier 2 rules: add warnings but don't reject
- Tier 3 rules: log only, for monitoring

Test each new rule against a known-failing scenario from the audit results.
```

### A2. Upgrade Worker CRITIC Prompt

The worker's multi-agent CRITIC (in the critique stage) needs the discovered rules baked in, so AI-generated scenarios are held to the same standard.

```
Prompt A2:
Read worker/index.js and find the CRITIC_SYSTEM prompt (used in the critique
stage of the multi-agent pipeline, around line 3543).

Read scripts/audit_enhanced_prompt.txt — this is the battle-tested enhanced
prompt that scored 605 scenarios. The key additions are in the
"ADDITIONAL VALIDATION REQUIREMENTS" section.

Merge the enhanced rules into the CRITIC_SYSTEM prompt:
1. Add the 10 discovered rules as explicit checklist items
2. Add the position-specific criteria from audit_discovered_rules.json
3. Adjust the pass threshold: scenarios must score >= 8.0 (currently 9.5 which
   is causing the critic to be overly strict on some dimensions but missing
   structural issues)
4. Add conceptTag alignment as a HARD FAIL check
5. Add count format validation
6. Add score-inning perspective validation

IMPORTANT: The CRITIC must know about ALL 15 BSM categories (including
rules, famous, counts). Update any position validation to include these.

Also update the PLANNER stage prompt to include these quality expectations
so the planner avoids generating scenarios that would fail the enhanced critic.

Deploy the worker after changes: cd worker && npx wrangler deploy
```

### A3. Upgrade the Audit Pipeline for BSM's Category System

The audit script itself needs to understand BSM's 15-category system so it doesn't produce false positives on rules/famous/counts.

```
Prompt A3:
Read scripts/critic_audit.js and find the BASE_CRITIC_SYSTEM prompt.

Update it:
1. In dimension 6 (POSITION/ROLE COMPLIANCE), add:
   "BSM uses 15 categories: 12 standard positions + 3 knowledge categories:
   - 'famous': Historical plays teaching strategy through real baseball moments
   - 'rules': Rule knowledge scenarios testing understanding of baseball rules
   - 'counts': Count-specific strategy scenarios teaching pitch count leverage
   These are VALID categories. Do NOT flag them as invalid positions.
   Instead, verify that the scenario content matches its category."

2. Add a new dimension: CATEGORY-CONTENT ALIGNMENT
   "For 'famous' scenarios: must teach a strategic principle through history
   For 'rules' scenarios: must test rule knowledge with strategic implications
   For 'counts' scenarios: must involve count-specific strategic decisions"

3. Update the scoring weights to reflect real quality priorities:
   factualAccuracy: 3x, bestAnswerCorrect: 3x, explanationQuality: 2x,
   conceptClarity: 2x, roleCompliance: 1x (lower — categories are flexible),
   everything else: 1x

Save the file. Do NOT re-run the audit yet — that happens in Phase C.
```

### A4. Implement Framework Upgrades in index.jsx

The audit recommended 8 framework-level improvements. Implement the ones that can be automated.

```
Prompt A4:
Implement these framework upgrades in index.jsx:

1. CONCEPTTAG VALIDATION (at scenario creation/loading time):
   - In the handleChoice flow or wherever scenarios are loaded, verify that
     every scenario's conceptTag exists in BRAIN.concepts
   - If not, log a warning: "Scenario [id] has unknown conceptTag: [tag]"
   - This catches typos and orphaned tags

2. RATE AUTO-VALIDATION (in QUALITY_FIREWALL):
   - If rates[best] is NOT the highest rate, auto-fix by swapping the best
     index to point to the highest rate
   - Log the fix: "Auto-fixed best index for scenario [id]: was [old] now [new]"

3. COUNT FORMAT ENFORCEMENT (for AI-generated scenarios):
   - In generateAIScenario(), after receiving the AI response, validate that
     situation.count matches /^[0-3]-[0-2]$/
   - If it's "-" or invalid, set it to "0-0" (neutral count)

4. SCORE-INNING PERSPECTIVE CHECK (for AI-generated scenarios):
   - Validate: if inning starts with "Top", the description shouldn't say the
     player's team is "at home batting" (Top = away bats)
   - If inning starts with "Bot", the description shouldn't say "visiting"
```

### A5. Add Position-Specific ROLE_VIOLATIONS

The audit discovered position-specific criteria for all 12 standard positions plus validation needs for rules/famous/counts. Integrate these.

```
Prompt A5:
Read the positionSpecificCriteria from scripts/audit_discovered_rules.json.

In index.jsx, find the ROLE_VIOLATIONS object. For each of the 12 position
categories that already have or need rules, add the audit-discovered criteria:

PITCHER: Add checks for pitch selection matching age/difficulty
CATCHER: Add checks for proper framing/blocking technique descriptions
FIRSTBASE: Add force/tag play validation at first
SECONDBASE: Add double play pivot and relay distance checks
THIRDBASE: Add bunt defense positioning validation
SHORTSTOP: Add relay/cutoff positioning accuracy
LEFTFIELD: Add backup responsibility validation (must mention 3B backup)
CENTERFIELD: Add priority caller validation (CF always has priority in gaps)
RIGHTFIELD: Add backup responsibility validation (must mention 1B backup)
BATTER: Add count leverage teaching validation
BASERUNNER: Add steal timing and tag-up accuracy checks
MANAGER: Ensure decisions (not physical plays), verify strategic rationale

For FAMOUS, RULES, COUNTS: Add content-type validation:
- famous: must reference a historical play AND teach strategy
- rules: must test rule KNOWLEDGE, not physical play ability
- counts: must involve a specific pitch count situation
```

---

## PHASE B: FIX ALL SCENARIOS (~12-16 hrs) — COMPLETE

After the machine was fixed (Phase A), all scenarios were run through it. Known-broken scenarios were fixed first.

### B1. Fix 26 Audit-Recommended Scenarios

Fix all 26 scenarios from audit_synthesis.json fixRecommendations, prioritized:

**Critical (10 scenarios — scores 3.1-3.8):**

| ID | Position | Score | Fix |
|----|----------|-------|-----|
| rl20 | rules | 3.1 | Fix conceptTag to rules-appropriate tag, fix count |
| r7 | baserunner | 3.2 | Fix conceptTag to 'reading-pitcher', fix best answer |
| r39 | baserunner | 3.2 | Fix conceptTag to 'freeze-on-contact', fix explanation |
| fp4 | famous | 3.2 | Fix conceptTag to 'hidden-ball-trick', fix count |
| fp11 | famous | 3.2 | Fix to teach strategic principle, not just history |
| rl4 | rules | 3.2 | Fix conceptTag to 'appeal-play', fix count |
| rl6 | rules | 3.2 | Fix conceptTag to 'dh-rule', differentiate explanations |
| rl33 | rules | 3.2 | Fix conceptTag, fix rate distribution |
| cn12 | counts | 3.2 | Ensure batter-appropriate framing |
| cn21 | counts | 3.2 | Ensure pitcher-appropriate framing |

**High (9 scenarios — scores 3.8-4.2):**

| ID | Position | Score | Fix |
|----|----------|-------|-----|
| r40 | baserunner | 3.8 | Fix conceptTag, fix best/rates alignment |
| m1 | manager | 3.8 | Fix factual inconsistency (.220 vs .245), fix conceptTag |
| fp14 | famous | 3.8 | Add strategic teaching component |
| cn8 | counts | 3.8 | Ensure count-leverage focus |
| cn17 | counts | 3.8 | Fix rates to realistic values |
| cn23 | counts | 3.8 | Fix conceptTag and explanation alignment |
| p30 | pitcher | 4.2 | Fix conceptTag to 'slide-step-timing' |
| p54 | pitcher | 4.2 | Fix conceptTag, fix breaking ball description |
| p67 | pitcher | 4.2 | Fix rates so best answer has highest rate |

**Medium (7 scenarios — scores 4.2):**

| ID | Position | Score | Fix |
|----|----------|-------|-----|
| b12 | batter | 4.2 | Fix conceptTag, fix run math error |
| b37 | batter | 4.2 | Change conceptTag to 'situational-hitting' |
| f47 | secondBase | 4.2 | Fix conceptTag, remove impossible play |
| ss_new3 | shortstop | 4.2 | Fix steal coverage rule (LHB vs RHB) |
| cf10 | centerField | 4.2 | Fix conceptTag to 'backup-responsibilities' |
| f9 | leftField | 4.2 | Fix conceptTag to 'sun-fielding' |
| lf7 | leftField | 4.2 | Fix conceptTag mismatch |

```
Prompt B1:
Read scripts/audit_synthesis.json fixRecommendations for exact fixes.
Read the full audit results for each scenario from scripts/audit_full_results.json
to understand the specific issues.

For each of the 26 scenarios:
1. Find the scenario in index.jsx by searching for its id
2. Read the full scenario object
3. Apply the specific fix from the recommendation
4. Verify: rates[best] is highest rate, conceptTag matches content,
   count is specific (not "-"), explanations address their options

Fix ALL 26 scenarios — critical, high, AND medium. Report each fix made.
```

### B2. Fix All Count Placeholders

The audit found ~50 scenarios using `count:"-"` instead of actual pitch counts. For most scenarios, the count matters (it sets the strategic context).

```
Prompt B2:
Search index.jsx for all scenarios with count:"-" in their situation object.
Pattern: count:"-"

For each scenario found:
1. Read the description — does it mention a specific count?
   If yes, set count to match the description.
   If no, set an appropriate count for the situation:
   - Default neutral: "1-1"
   - With 2 outs and runners: "2-1" (pitcher's count, adds pressure)
   - Batter scenarios: use a count that creates the decision the scenario teaches
   - Manager scenarios: "0-0" if count isn't relevant

EXCEPTIONS — leave count as "-" ONLY if:
- The scenario explicitly says "any count" or "doesn't matter what the count is"
- It's a pure positioning/communication scenario where count is irrelevant

Report how many counts you fixed and what values you set.
```

### B3. Fix All ConceptTag Mismatches

The audit found ~30 scenarios where conceptTag doesn't match what the scenario actually teaches. The mastery system depends on correct tags.

```
Prompt B3:
Read scripts/audit_full_results.json and find all scenarios where the issues
array mentions "conceptTag" or "concept tag" or "tag mismatch" or "tag doesn't
match" or "tagged as" (these indicate conceptTag problems).

For each scenario with a conceptTag issue:
1. Read the scenario's description, options, and explanations
2. Determine what concept the scenario ACTUALLY teaches
3. Find the correct conceptTag from BRAIN.concepts
4. If no existing tag matches, check if there's a close match
5. Update the conceptTag to the correct value

Also: scan ALL 605 scenarios and verify each conceptTag exists in BRAIN.concepts.
If any tag is not in BRAIN.concepts, either:
- Map it to the closest existing concept
- Or flag it for manual review

Report: how many conceptTags fixed, what they changed from/to.
```

### B4. Fix All Rate/Best Conflicts

Any scenario where rates[best] is not the highest rate needs fixing — either the rates are wrong or the best index is wrong.

```
Prompt B4:
Scan ALL 605 scenarios in index.jsx. For each, check:
- Is rates[best] the highest value in the rates array?
- If NOT, determine which is correct:
  a. If the option at rates[best] is genuinely the best answer, raise its rate
     to be highest (set to max_rate + 5)
  b. If a different option has the highest rate AND is the better answer,
     change best to point to that option
  c. Read the explanations to determine which option the scenario considers best

Fix every conflict found. Report: scenario ID, old rates/best, new rates/best.
```

### B5. Fix All Explanation Quality Issues

Scenarios where explanations don't address their corresponding options, or where multiple explanations say the same thing.

```
Prompt B5:
Read scripts/audit_full_results.json and find all scenarios where:
- "explanationQuality" dimension is below 7
- Issues mention "explanation", "repetitive", "doesn't address", "generic"

For the worst 30 (lowest explanationQuality scores):
1. Read the scenario's options and explanations
2. Verify explanation[i] specifically addresses option[i]
3. Verify each explanation teaches a DIFFERENT principle
4. If explanations are repetitive, rewrite the weaker ones to teach different angles:
   - Why is this option good/bad STRATEGICALLY?
   - What would happen IN THE GAME if you chose this?
   - What PRINCIPLE does this violate/follow?
   - What would a COACH say about this choice?

Keep kid-friendly language matched to the scenario's difficulty level.
```

### B6. Fix Score-Inning Perspective Errors

Scenarios where the score array contradicts the inning half (Top/Bot) and the description.

```
Prompt B6:
Search index.jsx for all scenarios. For each:
1. Check if inning starts with "Top" or "Bot"
2. Score is [away, home] — score[0] is AWAY, score[1] is HOME
3. Top inning = AWAY team bats, Bot inning = HOME team bats
4. If description says "you're losing" in Top inning, verify score[0] < score[1]
   (away team trailing)
5. If description says "you're winning" in Bot inning, verify score[1] > score[0]
   (home team leading)

Fix any mismatches by adjusting the score array to match the description.
Report: scenario IDs fixed, old score → new score.
```

---

## PHASE C: RE-AUDIT & ITERATE — COMPLETE

### C1. Re-Run Full Audit — DONE

4 complete audits run with corrected CRITIC after Phases A and B.

**Results: 94.6% projected pass rate across 608 scenarios**

| Metric | Initial Audit | Final Audit |
|--------|--------------|-------------|
| Pass rate | 72.6% (439/605) | 94.6% projected (608 scenarios) |
| Avg score | 7.81/10 | Improved after fixes |
| Total audits run | 1 | 4 |
| False positive rate | ~14.7% (rules/famous/counts) | Near 0% (CRITIC updated for 15 categories) |

### C2. Fix Remaining Failures — DONE (partial)

26 audit-recommended scenarios fixed across all severity levels (10 critical, 9 high, 7 medium). Additional systematic fixes: count placeholders, conceptTag mismatches, rate/best conflicts, explanation quality.

**Remaining:** ~32 scenarios still below the 8.0 threshold. These are documented and queued for the next fix pass.

### C3. Final Gold Standard Verification

Final target of >98% pass rate not yet reached (current: 94.6%). Remaining work:
- ~32 scenarios need targeted fixes to cross the threshold
- 3 BRAIN concepts lack dedicated scenarios (need at least 2 each)
- These are tracked in BSM_PROJECT_CONTEXT.md priorities

---

## PHASE D: MAKE IT PERMANENT (Continuous Improvement)

### D1. Pre-Commit Validation

Add a validation check that runs on all scenarios whenever index.jsx is modified:
- Extract all scenarios
- Run the 10 new firewall rules
- Flag any that fail
- Block deployment if Tier 1 rules fail

### D2. AI Pipeline Integration

Every AI-generated scenario now goes through:
1. Worker CRITIC (enhanced with audit rules) → must score >= 8.0
2. Client QUALITY_FIREWALL (with 10 new rules) → must pass all Tier 1
3. If either fails, reject and regenerate

### D3. Ongoing Audit Schedule

- **Monthly**: Run full audit pipeline on all scenarios (~$45)
- **After adding >10 scenarios**: Run audit on new scenarios (~$1-5)
- **After any system change**: Run calibration (50-scenario) audit (~$3)

### D4. Feedback Loop Completion (from Sprint 3)

Client-side rejections → Worker → quality_rejections D1 table → weekly analysis → auto-patch with quality gate → improved generation

---

## EXECUTION ORDER

```
Phase A (Fix the Machine):
  A1 → A2 → A3 → A4 → A5
  All sequential — each builds on the previous

Phase B (Fix Scenarios):
  B1 (26 recommended) → B2 (counts) → B3 (conceptTags) → B4 (rates) →
  B5 (explanations) → B6 (scores)
  Can partially parallelize: B2+B4+B6 are independent data fixes

Phase C (Re-Audit):
  C1 → C2 → C3
  Sequential — each depends on previous results

Phase D (Permanent):
  D1 + D2 + D3 + D4
  Can parallelize — independent system improvements
```

---

## IMPACT ANALYSIS

### How New Rules Affect the System

| New Rule | Affects | Impact on Existing Code |
|----------|---------|------------------------|
| bestAnswerRateCheck | QUALITY_FIREWALL, AI generation | AI scenarios with wrong best auto-rejected; handcrafted caught in audit |
| conceptTagAlignmentCheck | QUALITY_FIREWALL, mastery system | Ensures mastery tracking works correctly; prevents orphaned concepts |
| countFormatCheck | QUALITY_FIREWALL, AI generation | AI must generate real counts; placeholder "-" caught |
| scoreInningConsistencyCheck | QUALITY_FIREWALL, AI prompts | Prevents score/inning confusion in AI output |
| explanationIndexAlignmentCheck | QUALITY_FIREWALL, AI generation | Each explanation must address its option; catches swapped explanations |
| ageAppropriateComplexityCheck | QUALITY_FIREWALL, scenario filtering | diff:1 scenarios can't use advanced stats; protects 6-8 year olds |
| forcePlayAccuracyCheck | QUALITY_FIREWALL, CONSISTENCY_RULES | Cross-validates force play mechanics; prevents the #1 baseball factual error |
| explanationVarietyCheck | QUALITY_FIREWALL, AI CRITIC | Catches repetitive explanations; improves teaching quality |
| rateDistributionReasonableCheck | QUALITY_FIREWALL | Ensures meaningful rate spread between options |
| historicalScenarioCheck | QUALITY_FIREWALL | Famous scenarios must teach strategy, not just trivia |

### How Framework Upgrades Affect the System

| Upgrade | Current Gap | Fix Location | Downstream Impact |
|---------|-------------|-------------|-------------------|
| ConceptTag Validation | No checking | index.jsx (handleChoice) | Mastery system accuracy improves |
| Position Validation | Invalid categories slip through | QUALITY_FIREWALL | AI can't generate for non-existent positions |
| Rate Distribution Logic | Best answer sometimes not highest | QUALITY_FIREWALL + auto-fix | Feedback shows wrong option as "best" → confuses kids |
| Historical Scenario Guidelines | History without strategy | SCENARIO_BIBLE + CRITIC | Famous scenarios become real learning opportunities |
| Age Appropriateness Scoring | Complex terms in beginner content | QUALITY_FIREWALL | 6-8 year olds don't see WAR/OPS/BABIP |
| Explanation Variety Check | Repetitive explanations | QUALITY_FIREWALL | Each wrong answer teaches something DIFFERENT |
| Count Format Enforcement | Placeholder "-" counts | AI generation + firewall | Every scenario has realistic game context |
| Score-Inning Consistency | Score/inning contradictions | AI generation + firewall | No more "you're losing" when score shows winning |

---

## FINAL METRICS (as of March 17, 2026)

| Metric | Value |
|--------|-------|
| Total scenarios | 608 (pitcher:68, catcher:43, +14 others unchanged) |
| Total audits completed | 4 |
| Projected pass rate | 94.6% |
| QUALITY_FIREWALL checks | 32 (8 Tier 1 + 19 Tier 2 + 5 Tier 3) |
| CONSISTENCY_RULES | 12 (CR1-CR12) |
| BRAIN concepts | 46 |
| Scenarios fixed in Phase B | 26 recommended + systematic fixes (counts, tags, rates, explanations) |
| Scenarios remaining below threshold | ~32 |
| Concepts needing scenarios | 3 |
| Initial pass rate (Audit 1) | 72.6% |
| Improvement | +22 percentage points |

---

## SUCCESS CRITERIA

| Phase | Metric | Target | Actual |
|-------|--------|--------|--------|
| A | New firewall rules integrated | 10/10 rules live | DONE -- 32 total checks |
| A | Worker CRITIC updated | Enhanced prompt deployed | DONE |
| A | Audit script corrected | Understands 15 BSM categories | DONE |
| B | Critical fixes applied | 10/10 scenarios fixed | DONE |
| B | High fixes applied | 9/9 scenarios fixed | DONE |
| B | Medium fixes applied | 7/7 scenarios fixed | DONE |
| B | Count placeholders fixed | <5 remaining (justified) | DONE |
| B | ConceptTag mismatches fixed | 0 remaining | DONE |
| B | Rate/best conflicts fixed | 0 remaining | DONE |
| C | Re-audit pass rate | >95% | 94.6% (close) |
| C | Re-audit avg score | >8.5 | Improved |
| C | Final verification pass rate | >98% | PENDING (~32 scenarios remain) |
| D | AI-generated pass rate | >90% first-try | PENDING |
| D | Monthly audit automated | Yes | PENDING |
