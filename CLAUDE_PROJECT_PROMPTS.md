# Baseball Strategy Master — Claude Project Setup

> Use this file to set up a Claude Desktop project for collaborating on the knowledge system. It contains the project system prompt and 10 targeted task prompts.

---

## Project Setup Checklist

1. Create a new project in Claude Desktop
2. Upload `SCENARIO_BIBLE.md` as project knowledge
3. Upload `BRAIN_KNOWLEDGE_SYSTEM.md` as project knowledge
4. Paste the system prompt below into the project's "Instructions" field
5. Use the targeted prompts as conversation starters

---

## Project System Prompt

Paste this into your Claude project's **Instructions** field:

```
You are the world's leading baseball strategy knowledge architect, working on Baseball Strategy Master — an educational app teaching baseball strategy to kids ages 6-18 through interactive scenarios.

You have two reference documents in this project:
- SCENARIO_BIBLE.md — The quality framework: knowledge hierarchy, position principles, knowledge maps, quality checklist, data tables, audit log
- BRAIN_KNOWLEDGE_SYSTEM.md — The in-code knowledge engine: BRAIN constant (RE24, counts, concepts), 7 knowledge maps, POS_PRINCIPLES, coach lines, AI prompt template

RULES YOU MUST FOLLOW:
1. KNOWLEDGE HIERARCHY: MLB Rules > Measurable Data (FanGraphs, Statcast) > Coaching Consensus (ABCA, USA Baseball) > Situational Judgment. Never contradict a higher tier.
2. CITE SOURCES: When adding knowledge, specify which tier and ideally which source (e.g., "per FanGraphs RE24 2015-2024 averages").
3. INTERNAL CONSISTENCY: Every new principle, map, or scenario must not contradict existing content in either document. Cross-check before proposing.
4. AGE-APPROPRIATE: Content must work for ages 6-18. Tag complexity levels. Use the BRAIN.concepts prerequisite graph to ensure progression.
5. POSITION BOUNDARIES: Never assign a role to the wrong position (pitcher is NEVER cutoff, catcher stays home, etc.).
6. DATA ACCURACY: All statistics must be sourced from real MLB data. Do not invent numbers. If you're unsure of an exact stat, say so.
7. FORMAT FOR CODE: When proposing additions to the BRAIN constant, knowledge maps, or POS_PRINCIPLES, output them in the exact JavaScript format used in index.jsx so they can be copy-pasted.
8. EXPLAIN THE WHY: Every piece of knowledge should include WHY it matters strategically, not just WHAT the rule is.

When I ask you to expand or improve content, always:
- Show what exists now (quote the relevant section)
- Explain what's missing or could be better
- Propose the specific addition/change with exact formatting
- Note any cross-references or consistency checks needed
```

---

## Targeted Prompts

### Category A: Expanding the Knowledge Base

---

### Prompt 1 — "Find Knowledge Gaps"

```
Review both reference documents and identify the top 10 knowledge gaps — areas where real baseball strategy exists but our system doesn't cover it yet. For each gap:
1. What the missing knowledge is
2. Which tier it falls under (Rules/Data/Coaching/Situational)
3. Which positions it affects
4. Whether it should go in SCENARIO_BIBLE.md, BRAIN_KNOWLEDGE_SYSTEM.md, or both
5. A draft of the content to add

Prioritize gaps that would make the biggest difference in scenario quality and AI accuracy.
```

---

### Prompt 2 — "Expand a Knowledge Map"

```
I want to expand the [MAP NAME] knowledge map. The current version covers [X].

Review the current map content, then:
1. Identify edge cases or variations not currently covered
2. Propose expanded content with the same "non-negotiable" authority level
3. Format it as both a SCENARIO_BIBLE.md section AND the JavaScript constant for index.jsx
4. List which scenarios (by position) would benefit from this expansion
5. Suggest 2-3 new scenario concepts that could use this expanded knowledge
```

---

### Prompt 3 — "Add a New Knowledge Map"

```
I want to create a new authoritative knowledge map for [TOPIC — e.g., "Pickoff Moves", "Pitch Clock Strategy", "Defensive Shifts", "Infield Fly Situations", "Passed Ball/Wild Pitch Coverage"].

Design it following the same format as existing maps:
1. Title with "(non-negotiable)" authority marker
2. Clear assignment tables by situation
3. Position-specific responsibilities
4. Cardinal rules / never-do rules
5. MAP_RELEVANCE entry (which positions need this map)
6. MAP_AUDIT entry (self-check for AI scenarios)
7. SCENARIO_BIBLE.md section (Section 3.XX)
8. JavaScript constant for index.jsx
```

---

### Category B: Strengthening Data & Statistics

---

### Prompt 4 — "Audit and Expand Statistical Data"

```
Review all statistical data in BRAIN.stats and the Scenario Bible's data tables. For each data point:
1. Verify it's still accurate (note any that may be outdated)
2. Identify missing data that would improve scenario quality
3. Propose additions to BRAIN.stats with exact values and sources

Specifically look for gaps in:
- RE24 edge cases (e.g., different by era, home/away, NL/AL)
- Count data nuances (e.g., count after foul ball on 0-2, RISP splits by count)
- Fielding metrics (e.g., range factor, UZR concepts for scenario explanations)
- Pitching metrics (e.g., spin rate impact, pitch tunneling, sequencing data)
- Baserunning metrics beyond steal break-even (e.g., extra base taken %, lead distance data)
```

---

### Prompt 5 — "Build a New BRAIN.stats Section"

```
I want to add a new statistical section to BRAIN.stats for [TOPIC — e.g., "defensive positioning data", "pitch type effectiveness", "clutch performance splits", "weather/park effects"].

Design it:
1. What data to include (with real MLB source values)
2. The JavaScript object structure matching BRAIN.stats format
3. A new Brain API function to access/use this data
4. How it connects to the AI prompt (formatBrainStats addition)
5. How it could appear in the UI (enrichFeedback addition)
6. 2-3 scenario concepts that would use this data
```

---

### Category C: Improving AI Quality

---

### Prompt 6 — "Stress-Test the AI Prompt"

```
Act as a devil's advocate and try to find ways the current AI prompt template (in BRAIN_KNOWLEDGE_SYSTEM.md) could produce wrong scenarios. For each vulnerability:
1. Describe the failure mode (what could go wrong)
2. Give a concrete example of a bad scenario it might generate
3. Propose a specific prompt addition or guardrail to prevent it
4. Show the exact text to add to the prompt template

Focus on:
- Position boundary violations the ROLE_VIOLATIONS regex might miss
- Situations where coaching consensus conflicts (and the prompt doesn't resolve it)
- Edge cases in game situations (e.g., extra innings, ghost runner, unusual counts)
- Ways the AI might generate technically correct but misleading explanations
```

---

### Prompt 7 — "Expand the Concept Prerequisite Graph"

```
Review BRAIN.concepts (20 current tags). The concept graph controls what scenarios beginners see.

1. Identify 10-15 new concept tags that should exist, following the same format: {name, domain, prereqs[], ageMin, diff}
2. Show where each new tag fits in the prerequisite chain
3. Ensure no circular dependencies
4. Map each new tag to existing scenarios that should get tagged with it
5. Identify which new scenarios would need to be written to teach these concepts
6. Update the findConceptTag() keyword mapping for each new tag
```

---

### Category D: Coach Line Quality

---

### Prompt 8 — "Level Up Coach Lines"

```
Review the full coach line system. Currently there are:
- ~25 generic success lines
- ~20 generic warning lines
- ~20 generic danger lines
- 4 position-specific success + 4 danger lines per fielding position (1 each for famous/rules/counts)
- 11 streak milestone lines (at 3-10, 15, 20, 25)
- 25 facts
- 20 situational brain lines

Propose improvements:
1. Replace any generic/weak lines with more specific, memorable ones
2. Add 2-3 more position-specific lines per position (especially for positions with only generic famous/rules/counts strings)
3. Add 5-10 new brain-stat facts using data from BRAIN.stats
4. Add 5-10 new situational coaching lines for BRAIN.coaching.situational
5. Every line should either teach something or make the kid feel good about learning. No filler.
```

---

### Category E: Cross-System Verification

---

### Prompt 9 — "Full Consistency Audit"

```
Cross-reference SCENARIO_BIBLE.md against BRAIN_KNOWLEDGE_SYSTEM.md and find every inconsistency, gap, or contradiction:

1. Do POS_PRINCIPLES match the Scenario Bible's position principles exactly?
2. Do knowledge map constants match their Scenario Bible sections?
3. Does BRAIN.stats data match the Scenario Bible's data tables?
4. Are there principles in the Bible that aren't enforced in the AI prompt?
5. Are there concepts in BRAIN.concepts that don't have corresponding Bible sections?
6. Does the AI self-audit checklist cover everything in the quality checklist?

For each finding, specify: what's wrong, which document to fix, and the exact correction.
```

---

### Prompt 10 — "Competitive Knowledge Benchmark"

```
Our competitors are:
- Thinking Baseball ($20/mo, 8K scenarios, defense-only)
- BASIQs (7K free, quiz tool)
- Baseball Brains (paid, too fast for young readers)

Based on what a world-class baseball strategy teaching system should include, identify:
1. Knowledge areas where our system is already best-in-class
2. Knowledge areas where competitors likely have more depth
3. The top 5 expansions that would make our knowledge system definitively the best in the world
4. For each expansion: scope, effort estimate, which documents to modify, and draft content
```

---

## Verification Steps

After setup, test with these:

1. **Quick check**: Start a new chat and ask "Summarize what you know about our knowledge system." Claude should reference both documents and demonstrate understanding of the hierarchy, maps, and BRAIN data.

2. **First real test**: Use Prompt 1 ("Find Knowledge Gaps"). The response should be specific, reference existing content by section, and propose additions in the correct format.

3. **Code format test**: Ask "Add a new knowledge map for pickoff moves." The response should include both a SCENARIO_BIBLE.md section and a JavaScript constant matching the existing code style.
