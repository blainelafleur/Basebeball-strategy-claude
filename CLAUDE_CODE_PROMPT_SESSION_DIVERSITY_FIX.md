# Claude Code Prompt: Session Diversity & Agent Pipeline Activation Fix

## Context
The AI scenario generation is producing repetitive scenarios because:
1. The agent pipeline is A/B-tested at 50/50 — half of users never get it
2. The session planner locks onto a learning path (e.g., `count_mastery`) and feeds 5 similar concepts in a row, causing grok to produce near-identical titles
3. Topic staleness rejection catches these duplicates but can't fix them — retries with the same concept produce more duplicates

## Changes Required (3 changes in index.jsx)

---

### Change 1: Enable agent pipeline for ALL users (remove A/B gating)

**File:** `index.jsx`
**Find** the A/B test configuration for `agent_pipeline` (around line 7494):

```javascript
  agent_pipeline: {
    id: "agent_pipeline_v2",
    variants: [
      { id: "control", weight: 50, config: { useAgent: false } },
      { id: "agent", weight: 50, config: { useAgent: true } }
    ]
  },
```

**Replace with:**

```javascript
  agent_pipeline: {
    id: "agent_pipeline_v3",
    variants: [
      { id: "agent", weight: 100, config: { useAgent: true } }
    ]
  },
```

**Why:** The agent pipeline has been upgraded with all quality fixes (auto-fix-before-grade, lowered threshold, detailed logging). No reason to keep 50% of users on the standard pipeline. Setting weight to 100 ensures every session uses the agent pipeline.

---

### Change 2: Add concept diversity to session planner — interleave path items with variety

**File:** `index.jsx`
**Find** the `planSession` function (around line 7625). Look for the section where it adds learning path items (around line 7661-7672):

```javascript
  // Try structured learning path first
  const activePath = getCurrentPath(masteryData, position)
  if (activePath) {
    const pathItems = getNextInPath(activePath, masteryData, 4).filter(it => isAllowed(it.tag) && !usedTags.has(it.tag))
    for (const item of pathItems) {
      if (added >= 4 || plan.length >= 7) break
      plan.push({ type: item.type === "assessment" ? "assessment" : "progression", concept: item.tag, path: activePath.name })
      usedTags.add(item.tag)
      added++
    }
    console.log("[BSM Session] Using learning path:", activePath.name, "progress:", activePath.progress + "/" + activePath.sequence.length)
  }
```

**Replace with:**

```javascript
  // Try structured learning path first — but limit to 2 consecutive path items
  // to prevent topic fatigue (e.g., 5 "first-pitch" scenarios in a row)
  const activePath = getCurrentPath(masteryData, position)
  if (activePath) {
    const pathItems = getNextInPath(activePath, masteryData, 2).filter(it => isAllowed(it.tag) && !usedTags.has(it.tag))
    for (const item of pathItems) {
      if (added >= 4 || plan.length >= 7) break
      plan.push({ type: item.type === "assessment" ? "assessment" : "progression", concept: item.tag, path: activePath.name })
      usedTags.add(item.tag)
      added++
    }
    console.log("[BSM Session] Using learning path:", activePath.name, "progress:", activePath.progress + "/" + activePath.sequence.length)
  }
```

**Key change:** `getNextInPath(activePath, masteryData, 4)` → `getNextInPath(activePath, masteryData, 2)`. This limits path items to 2 per session instead of 4, so the remaining 2-3 concept slots get filled by the general fallback (learning/unseen concepts from other topic areas). The result: sessions interleave path progression with diverse concepts instead of 5 count-related scenarios in a row.

---

### Change 3: Add title keyword diversity hint to standard pipeline prompt

**File:** `index.jsx`
**Find** in the standard `generateAIScenario` function, the section where `recentAI` titles are added to the prompt for dedup (around line 8444):

```javascript
  if (recentAI.length > 0) weakAreas.push(`AVOID REPEATS — these AI scenarios were already generated for this position: ${recentAI.map(h => h.title).join(", ")}. Create something DIFFERENT.`)
```

**Replace with:**

```javascript
  if (recentAI.length > 0) {
    weakAreas.push(`AVOID REPEATS — these AI scenarios were already generated for this position: ${recentAI.map(h => h.title).join(", ")}. Create something DIFFERENT.`)
    // Extract keywords from recent titles to help AI avoid them
    const recentTitleWords = new Set()
    const stopWords = new Set(["the","a","an","in","on","at","to","and","or","of","for","with","is","it","by","as","from","this","that","be","are","was","not","but","do","has","had","you","your","we","our","they","their","my","its","no","if","up","out","count","play","base","game","run","pitch","hit","ball","strike"])
    recentAI.slice(-5).forEach(h => {
      (h.title || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w)).forEach(w => recentTitleWords.add(w))
    })
    if (recentTitleWords.size > 0) {
      weakAreas.push(`TITLE DIVERSITY — do NOT use these words in your title: ${[...recentTitleWords].join(", ")}. Choose a completely different angle, situation, and title.`)
    }
  }
```

**Why:** The current "AVOID REPEATS" instruction lists titles but doesn't explicitly ban the repeated keywords. Grok sees "First Pitch Focus, First Pitch Command" and generates "First Pitch Steal" — technically different title but same keywords. By extracting and banning the keywords, we force truly different titles.

---

## Verification

After applying these changes:
1. Refresh the app and play 6+ scenarios as pitcher
2. Console should now show `[BSM Agent]` logs (agent pipeline active for all users)
3. Session plan should show max 2 path items with 2-3 diverse concepts mixed in
4. Topic staleness rejections should drop significantly
5. Titles should have much more variety (different words, not just "First Pitch X" and "3-1 Count Y")
