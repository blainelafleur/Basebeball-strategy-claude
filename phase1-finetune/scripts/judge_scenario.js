#!/usr/bin/env node
/**
 * BSM Universal Scenario Judge
 *
 * Two-pass quality gate for ANY scenario source (synthetic batches,
 * remote assistant exports, manual coach-ratings, or raw JSON).
 *
 *   Pass 1: Local QUALITY_FIREWALL — 10 Tier 1 hard-reject checks,
 *           6 Tier 2 warnings, 3 Tier 3 suggestions, role violations
 *   Pass 2: LLM-as-Judge — 5-dimension rubric via frontier model
 *
 * Usage:
 *   node scripts/judge_scenario.js synthetic_batch_2026-03-12.json
 *   node scripts/judge_scenario.js coach-ratings-2026-03-12.json
 *   node scripts/judge_scenario.js some-scenarios.json --threshold 7.5
 *   node scripts/judge_scenario.js batch.json --add           # auto-add passing to datasets
 *   node scripts/judge_scenario.js batch.json --dry           # score only, no file writes
 *   node scripts/judge_scenario.js batch.json --firewall-only # skip LLM judge, local checks only
 *
 * Accepts:
 *   - Array of raw scenario objects [{title, description, options, ...}, ...]
 *   - Array of coach-rating objects [{scenario: {...}, ratings: {...}, ...}, ...]
 *   - Synthetic batch output from generate_synthetic_batch.js
 *   - Any mix — auto-detects format per item
 */

const fs = require("fs");
const path = require("path");

// ── Config ──
const WORKER_URL = "https://bsm-ai-proxy.blafleur.workers.dev";
const STANDARD = "/v1/chat/completions";
const CONCURRENCY = 3;
const REQUEST_TIMEOUT_MS = 60000;
const DEFAULT_THRESHOLD = 8.0;
const LLM_DATA_DIR = path.join(__dirname, "..", "llm_data");

const POSITION_NAMES = {
  pitcher: "Pitcher", catcher: "Catcher", firstBase: "First Base",
  secondBase: "Second Base", shortstop: "Shortstop", thirdBase: "Third Base",
  leftField: "Left Field", centerField: "Center Field", rightField: "Right Field",
  batter: "Batter", baserunner: "Baserunner", manager: "Manager",
  famous: "Famous Plays", rules: "Rules & Umpiring", counts: "Count Strategy"
};
const DIFF_NAMES = { 1: "Rookie", 2: "Pro", 3: "All-Star" };
const VALID_ANIMS = [
  "steal", "score", "hit", "throwHome", "doubleplay", "strike", "strikeout",
  "groundout", "flyout", "catch", "advance", "walk", "bunt", "safe", "freeze"
];

// ════════════════════════════════════════════════════════════════════════════
// QUALITY_FIREWALL — Ported from index.jsx
// ════════════════════════════════════════════════════════════════════════════

const SEMANTIC_OVERLAPS = [
  ["throw over to first", "pick off", "step off the rubber", "check the runner", "throw to first"],
  ["sacrifice bunt", "bunt the runner over", "lay down a bunt", "push a bunt"],
  ["throw home", "throw to the plate", "fire home", "throw to home plate"],
  ["tag up", "advance after the catch", "score on the fly ball", "leave on the catch"],
  ["steal second", "take off for second", "go on the pitch", "run on the pitch"],
  ["take the pitch", "don't swing", "hold up", "watch it go by", "let it go"],
  ["swing away", "look for your pitch", "sit on a fastball", "drive the ball"],
  ["call time", "step out of the box", "ask for time", "call timeout"],
  ["intentional walk", "put him on", "walk him", "issue the walk"],
  ["go to the bullpen", "bring in the reliever", "make a pitching change", "call for the bullpen"],
  ["cover the bag", "get to the base", "be at the bag", "cover first", "cover second", "cover third"],
  ["back up the throw", "back up the play", "get behind the throw", "back up home"],
  ["pitch out", "pitchout", "call a pitchout", "pitch out to the catcher"],
  ["hold the runner", "keep the runner close", "shorten the lead", "check the runner at first"],
  ["hit and run", "swing and run", "hit behind the runner"],
  ["relay the throw", "be the cutoff", "cut the ball", "be the relay man"],
];

const ROLE_VIOLATIONS = {
  pitcher: [
    /pitcher.*cutoff/i, /pitcher.*relay\s*man/i, /pitcher.*lines?\s*up.*between/i,
    /pitcher.*covers?\s*(second|2nd|third|3rd)\b/i, /pitcher.*fake.*third.*throw.*first/i,
    /pitcher.*relay.*second/i, /pitcher.*stays.*on.*mound.*wild.*pitch/i,
    /pitcher.*backs?\s*up\s*(second|2nd)\b/i,
  ],
  catcher: [
    /catcher.*cutoff/i, /catcher.*goes?\s*out.*cutoff/i,
    /catcher.*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay/i,
    /catcher.*looks.*runner.*before.*field/i,
  ],
  shortstop: [/SS\s*covers?\s*(1st|first)\b.*bunt/i, /shortstop\s*covers?\s*(1st|first)\b.*bunt/i],
  secondBase: [/2B\s*covers?\s*(3rd|third)\b.*bunt/i, /second\s*base.*covers?\s*(3rd|third)\b.*bunt/i],
  thirdBase: [
    /third.*base.*stays.*at.*third.*wild.*pitch.*runner.*third/i,
    /third.*base.*cutoff.*right.*field/i, /third.*base.*relay.*right/i,
    /third\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*cf/i,
    /third\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*rf/i,
  ],
  firstBase: [/first\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*lf/i],
  leftField: [
    /left.*field.*cutoff.*center/i,
    /left\s*field(er)?\s*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay.*(second|2nd)/i,
    /left\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(second|2nd|2b)\b/i,
  ],
  centerField: [
    /center\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(third|3rd|3b)\b/i,
    /center\s*field(er)?.*cutoff.*3b/i, /center\s*field(er)?.*cutoff.*third/i,
    /cf.*cutoff.*3b/i,
  ],
  rightField: [
    /right.*field.*cutoff.*left/i,
    /right\s*field(er)?\s*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay.*(third|3rd)/i,
    /right\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(third|3rd|3b)\b/i,
  ],
};

const VALID_CATS = new Set([
  "pitcher", "catcher", "firstBase", "secondBase", "shortstop", "thirdBase",
  "leftField", "centerField", "rightField", "batter", "baserunner", "manager",
  "famous", "rules", "counts"
]);

const QUALITY_FIREWALL = {
  tier1: {
    // Check 0: JSON structure — all required fields present with correct types
    jsonStructure(sc) {
      if (!sc.title || typeof sc.title !== "string") return "Missing or invalid title";
      if (!sc.description || typeof sc.description !== "string" || sc.description.length < 20)
        return "Missing or too-short description";
      if (!Array.isArray(sc.options) || sc.options.length !== 4)
        return "options must be array of exactly 4";
      if (!Array.isArray(sc.explanations) || sc.explanations.length !== 4)
        return "explanations must be array of exactly 4";
      if (!Array.isArray(sc.rates) || sc.rates.length !== 4)
        return "rates must be array of exactly 4 numbers";
      if (typeof sc.best !== "number" || sc.best < 0 || sc.best > 3)
        return "best must be 0-3";
      if (!sc.situation || typeof sc.situation !== "object")
        return "Missing situation object";
      if (!sc.concept || typeof sc.concept !== "string")
        return "Missing concept";
      // Check for markdown contamination in any text field
      const allText = [sc.title, sc.description, sc.concept, ...(sc.options || []), ...(sc.explanations || [])].join(" ");
      if (/```|^\s*#{1,3}\s/m.test(allText))
        return "Markdown contamination in text fields (backticks or headers found)";
      // Validate category
      if (sc.cat && !VALID_CATS.has(sc.cat))
        return `Invalid category '${sc.cat}' — must be one of ${[...VALID_CATS].join(", ")}`;
      // Validate diff
      if (sc.diff && ![1, 2, 3].includes(sc.diff))
        return `Invalid difficulty ${sc.diff} — must be 1, 2, or 3`;
      // Validate anim
      if (sc.anim && !VALID_ANIMS.includes(sc.anim))
        return `Invalid animation '${sc.anim}'`;
      return null;
    },
    flyBallPriority(sc) {
      const allText = [sc.description, ...(sc.options || []), ...(sc.explanations || [])].join(" ");
      if (/infielder.*has\s*priority.*over.*outfielder/i.test(allText))
        return "Fly ball priority reversed: outfielders have priority over infielders";
      if (/infielder.*calls?\s*off.*outfielder/i.test(allText) && /correct|right|best/i.test(allText))
        return "Infielder calling off outfielder on fly ball is incorrect";
      return null;
    },
    forceTagError(sc) {
      const bestExp = (sc.explanations || [])[sc.best] || "";
      const runners = sc.situation?.runners || [];
      if (runners.includes(1) && /tag\s*(the\s*)?runner.*at\s*(second|2nd)/i.test(bestExp) && !/tag.*play/i.test(bestExp))
        return "Force/tag error: runner on 1st creates force at 2nd, but explanation describes tag play";
      if (runners.length === 3 && /tag\s*(the\s*)?runner.*at\s*home/i.test(bestExp))
        return "Force/tag error: bases loaded creates force at home, but explanation describes tag play";
      return null;
    },
    positionImpossibility(sc) {
      const bestOpt = (sc.options || [])[sc.best] || "";
      const bestExp = (sc.explanations || [])[sc.best] || "";
      const bestText = bestOpt + " " + bestExp;
      const runners = sc.situation?.runners || [];
      const hasRISP = runners.includes(2) || runners.includes(3);
      if (hasRISP && /catcher.*(goes|runs|sprints)\s*(to|toward)\s*(first|1st|second|2nd|third|3rd)/i.test(bestText))
        return "Position impossibility: catcher should not leave home plate with RISP";
      return null;
    },
    explanationLength(sc) {
      const exps = sc.explanations || [];
      const best = sc.best;
      if (exps.length !== 4 || typeof best !== "number") return null;
      if (typeof exps[best] === "string") {
        const bestWords = exps[best].trim().split(/\s+/).length;
        if (bestWords < 40) return "Best explanation too short: " + bestWords + " words (min 40)";
      }
      for (let i = 0; i < 4; i++) {
        if (typeof exps[i] === "string") {
          const words = exps[i].trim().split(/\s+/).length;
          if (words < 25) return "Explanation " + (i + 1) + " too short: " + words + " words (min 25)";
        }
      }
      return null;
    },
    optionDistinctness(sc) {
      const opts = (sc.options || []).map(o => typeof o === "string" ? o : "");
      if (opts.length !== 4) return null;
      const norm = opts.map(o => o.toLowerCase().replace(/[^a-z\s]/g, "").trim());
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (norm[i] === norm[j]) return "Duplicate options: " + (i + 1) + " and " + (j + 1);
          const stripped = [
            norm[i].replace(/\b(not|dont|do not|never|no)\b/g, "").replace(/\s+/g, " ").trim(),
            norm[j].replace(/\b(not|dont|do not|never|no)\b/g, "").replace(/\s+/g, " ").trim()
          ];
          if (stripped[0].length > 5 && stripped[0] === stripped[1])
            return "Negation-only variants: options " + (i + 1) + " and " + (j + 1);
        }
      }
      return null;
    },
    rateSanity(sc) {
      const rates = sc.rates || [];
      const best = sc.best;
      if (rates.length !== 4 || typeof best !== "number") return null;
      if (Math.min(...rates) >= 50) return "Worst option has " + Math.min(...rates) + "% — should be < 50%";
      if (rates[best] < 65) return "Best answer only has " + rates[best] + "% — should be >= 65%";
      return null;
    },
    brainContradiction(sc) {
      const sit = sc.situation || {};
      const runners = sit.runners || [];
      const outs = sit.outs ?? 0;
      const bestOption = (sc.options?.[sc.best] || "").toLowerCase();
      const bestExpl = (sc.explanations?.[sc.best] || "").toLowerCase();
      if ((runners.includes(1) || runners.includes(2)) && /\bsteal\b|go on first/i.test(bestOption)) {
        if (!/risk|gamble|aggressive|break.even|percentage|success rate/i.test(bestExpl))
          return "Steal recommended without acknowledging break-even threshold";
      }
      if (outs === 2 && /bunt|sacrifice/i.test(bestOption))
        return "Sacrifice bunt pointless with 2 outs";
      return null;
    },
    situationActionContradiction(sc) {
      const outs = sc.situation?.outs;
      const best = (sc.options?.[sc.best] || "").toLowerCase();
      const allText = (sc.options || []).join(" ").toLowerCase() + " " + (sc.explanations || []).join(" ").toLowerCase();
      if (outs === 2 && /double\s*play|turn\s*two|6-4-3|4-6-3/.test(allText))
        return "Double play impossible with 2 outs";
      if (outs === 2 && /sacrifice\s*bunt|sac\s*bunt/.test(best))
        return "Sacrifice bunt pointless with 2 outs";
      if (outs === 2 && /tag\s*up|tagging\s*up/.test(best))
        return "Tag-up wrong framing with 2 outs";
      if (outs === 2 && /infield\s*fly/.test(allText))
        return "Infield fly rule only applies with < 2 outs";
      return null;
    },
    principleContradiction(sc, position) {
      if (!position) return null;
      const best = (sc.options?.[sc.best] || "").toLowerCase();
      const bestExpl = (sc.explanations?.[sc.best] || "").toLowerCase();
      const combined = best + " " + bestExpl;
      if (position === "pitcher" && /cutoff|relay|cut.?off/.test(combined))
        return "Pitcher should never be the cutoff or relay man";
      if (position === "centerField" && /defer|let.*fielder|give\s*way/.test(combined))
        return "Center fielder has priority — should never defer to corner OF";
      if (position === "catcher" && /cover\s*(first|second|third|2nd|3rd|1st)\s*base/.test(combined))
        return "Catcher should not leave home to cover a base";
      if (position === "baserunner" && /yell|signal|direct|tell.*fielder|wave/.test(combined))
        return "Baserunner cannot direct the defense";
      return null;
    },
    optionActionDiversity(sc) {
      const options = sc.options || [];
      if (options.length !== 4) return null;
      const verbs = options.map(o => (o || "").split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""));
      if (new Set(verbs).size === 1 && verbs[0].length > 0)
        return "All 4 options start with same verb '" + verbs[0] + "'";
      return null;
    },
    roleViolation(sc, position) {
      if (!position) return null;
      const violations = ROLE_VIOLATIONS[position] || [];
      const allText = [sc.description, ...(sc.options || []), ...(sc.explanations || [])].join(" ");
      const matched = violations.find(rx => rx.test(allText));
      if (matched) return "Role violation: " + matched.toString().slice(0, 80);
      return null;
    },
  },

  tier2: {
    optionOverlap(sc) {
      const opts = sc.options || [];
      if (opts.length !== 4) return null;
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const a = opts[i].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
          const b = opts[j].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
          const shared = a.filter(w => w.length > 3 && b.includes(w));
          const overlap = shared.length / Math.min(a.length, b.length);
          if (overlap > 0.7) return "Options " + (i + 1) + " and " + (j + 1) + " share " + Math.round(overlap * 100) + "% words";
        }
      }
      for (const group of SEMANTIC_OVERLAPS) {
        const matching = [];
        for (let i = 0; i < opts.length; i++) {
          if (group.some(phrase => opts[i].toLowerCase().includes(phrase))) matching.push(i);
        }
        if (matching.length >= 2)
          return "Semantic overlap: options " + matching.map(i => i + 1).join(" & ") + " (" + group[0] + ")";
      }
      return null;
    },
    explanationCoherence(sc) {
      const opts = sc.options || [];
      const exps = sc.explanations || [];
      const best = sc.best;
      if (opts.length !== 4 || exps.length !== 4 || typeof best !== "number") return null;
      const optWords = (opts[best] || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 4);
      if (optWords.length === 0) return null;
      const shared = optWords.filter(w => (exps[best] || "").toLowerCase().includes(w));
      if (shared.length === 0) return "Best explanation shares no words with option text";
      return null;
    },
    perspectiveCheck(sc) {
      const desc = (sc.description || "").toLowerCase();
      const posNames = /\b(the\s+)?(pitcher|catcher|first baseman|second baseman|shortstop|third baseman|left fielder|center fielder|right fielder|batter|baserunner|manager|hitter|fielder|outfielder|infielder)\s+(should|needs to|must|has to|decides|wants to|calls for|is |was |will |would |can |could |throws|sees|gets|goes|reads|doesn)/i;
      if (posNames.test(desc)) return "3rd-person perspective in description — should use 'you'";
      if (/what should the \w+ do/i.test(desc)) return "Asks 'what should the [position] do?' instead of 'you'";
      return null;
    },
    situationConsistency(sc) {
      const desc = (sc.description || "").toLowerCase();
      const sit = sc.situation || {};
      const runners = sit.runners || [];
      if (runners.length === 0 && /bases?\s*loaded|runner(s)?\s*(on|at)/i.test(desc))
        return "Description mentions runners but situation.runners is empty";
      if (runners.length === 3 && /bases?\s*empty|no(body)?\s*on/i.test(desc))
        return "Description says bases empty but situation has bases loaded";
      return null;
    },
    ageVocab(sc) {
      if (sc.diff !== 1) return null;
      const advancedTerms = /\b(RE24|run expectancy|leverage index|win probability added|WPA|WAR|OPS\+|xBA|barrel rate|launch angle|platoon split|TTO|times through order)\b/i;
      const allText = [sc.description, ...(sc.options || []), ...(sc.explanations || [])].join(" ");
      const match = allText.match(advancedTerms);
      if (match) return "Diff-1 uses advanced term '" + match[0] + "'";
      return null;
    },
    countConsistency(sc) {
      const count = sc.situation?.count;
      if (!count || count === "-") return null;
      const allText = [sc.description, ...(sc.options || []), ...(sc.explanations || [])].join(" ");
      const HITTER_COUNTS = ["1-0", "2-0", "2-1", "3-0", "3-1"];
      const PITCHER_COUNTS = ["0-1", "0-2", "1-2"];
      if (HITTER_COUNTS.includes(count) && /pitcher['s]*\s*count/i.test(allText))
        return count + " is a hitter's count but text says 'pitcher's count'";
      if (PITCHER_COUNTS.includes(count) && /hitter['s]*\s*count/i.test(allText))
        return count + " is a pitcher's count but text says 'hitter's count'";
      return null;
    },
  },

  tier3: {
    explanationBalance(sc) {
      const exps = sc.explanations || [];
      if (exps.length !== 4) return null;
      const lens = exps.map(e => (e || "").length);
      const avg = lens.reduce((a, b) => a + b, 0) / 4;
      const maxDev = Math.max(...lens.map(l => Math.abs(l - avg)));
      if (maxDev > avg * 0.8) return "Explanation lengths vary >80% from avg (" + Math.min(...lens) + "-" + Math.max(...lens) + " chars)";
      return null;
    },
    conceptTeachability(sc) {
      const bestExp = (sc.explanations || [])[sc.best] || "";
      const causalWords = /\b(because|so that|this means|the reason|this is why|which means|this ensures|this prevents|the key is|the advantage)\b/i;
      if (!causalWords.test(bestExp) && bestExp.length < 100)
        return "Best explanation may not explain WHY — no causal language found";
      return null;
    },
    rateCalibration(sc) {
      const rates = sc.rates || [];
      const best = sc.best;
      if (rates.length !== 4 || typeof best !== "number") return null;
      const warnings = [];
      if (rates[best] > 90) warnings.push("best rate " + rates[best] + "% > 90%");
      if (rates[best] < 70) warnings.push("best rate " + rates[best] + "% < 70%");
      const worstRate = Math.min(...rates.filter((_, i) => i !== best));
      if (worstRate > 35) warnings.push("worst non-best rate " + worstRate + "% > 35%");
      return warnings.length > 0 ? warnings.join("; ") : null;
    },
  },

  validate(scenario, position) {
    const tier1Fails = [];
    const tier2Warns = [];
    const tier3Suggestions = [];
    for (const [name, fn] of Object.entries(this.tier1)) {
      const result = fn(scenario, position || null);
      if (result) tier1Fails.push({ check: name, message: result });
    }
    for (const [name, fn] of Object.entries(this.tier2)) {
      const result = fn(scenario, position || null);
      if (result) tier2Warns.push({ check: name, message: result });
    }
    for (const [name, fn] of Object.entries(this.tier3)) {
      const result = fn(scenario, position || null);
      if (result) tier3Suggestions.push({ check: name, message: result });
    }
    return { pass: tier1Fails.length === 0, tier1Fails, tier2Warns, tier3Suggestions };
  },
};

// ════════════════════════════════════════════════════════════════════════════
// LLM-as-Judge
// ════════════════════════════════════════════════════════════════════════════

function buildJudgePrompt(scenario) {
  return `You are an expert baseball coach and educational content reviewer. Rate this baseball strategy scenario for kids ages 6-18.

SCENARIO:
${JSON.stringify(scenario, null, 2)}

Rate each dimension 1-10. Be strict — real coaches will use these to teach kids.

RUBRIC:
1. factualAccuracy: Is every baseball fact, rule, and strategy correct? (positions, force/tag, cutoff alignment, fly ball priority, count leverage)
2. explanationStrength: Do explanations teach WHY with causal reasoning? ("because...", "this means...", "the reason is...") Are they 25+ words each, with the best answer at 40+?
3. ageAppropriateness: Is language right for the difficulty? Rookie(6-9yo)=simple words, Pro(10-13yo)=baseball terms OK, All-Star(14-18yo)=advanced stats OK
4. educationalValue: Will a kid learn a real, transferable baseball concept? Does it go beyond just picking the right answer?
5. varietyEngagement: Is the game situation realistic and specific? Are options genuinely different actions (not just negations)? Is it engaging?

CRITICAL CHECKS (score 1 if any of these are true):
- Pitcher acting as cutoff/relay man
- Infielder having priority over outfielder on fly balls
- Force play described as tag play (or vice versa)
- Double play mentioned with 2 outs
- Sacrifice bunt with 2 outs
- Catcher leaving home with RISP
- 3rd-person perspective instead of "you"
- Options that are duplicates or negation-only variants

Return ONLY valid JSON (no markdown, no backticks):
{"scores":{"factualAccuracy":0,"explanationStrength":0,"ageAppropriateness":0,"educationalValue":0,"varietyEngagement":0},"average":0.0,"issues":[],"summary":""}`;
}

async function llmJudge(scenario) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(`${WORKER_URL}${STANDARD}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-4",
        messages: [
          { role: "system", content: "You are a strict baseball education quality reviewer. Return ONLY raw JSON. No markdown. No backticks. No text before or after." },
          { role: "user", content: buildJudgePrompt(scenario) }
        ],
        temperature: 0.2,
        max_tokens: 500
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content || "";
    let clean = content.replace(/```(?:json)?\s*/g, "").replace(/```\s*/g, "").trim();
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("No JSON in judge response");
    clean = clean.slice(start, end + 1);
    const rating = JSON.parse(clean);
    const dims = ["factualAccuracy", "explanationStrength", "ageAppropriateness", "educationalValue", "varietyEngagement"];
    const scores = rating.scores || {};
    const values = dims.map(d => typeof scores[d] === "number" ? scores[d] : 5);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      scores: Object.fromEntries(dims.map((d, i) => [d, values[i]])),
      average: Math.round(avg * 100) / 100,
      issues: rating.issues || [],
      summary: rating.summary || ""
    };
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Format detection + normalization
// ════════════════════════════════════════════════════════════════════════════

function extractScenario(item) {
  // Coach-rating format: {scenario: {...}, ratings: {...}, position: "...", ...}
  if (item.scenario && typeof item.scenario === "object" && item.scenario.options) {
    const sc = item.scenario;
    return {
      ...sc,
      cat: sc.cat || item.position || "unknown",
      diff: sc.diff || (item.difficulty === "beginner" ? 1 : item.difficulty === "intermediate" ? 2 : item.difficulty === "advanced" ? 3 : 1),
      _sourceFormat: "coach-rating",
      _coachScore: item.overallScore || null,
      _coachRatings: item.ratings || null,
      _preferredExplanation: item.preferredExplanation ?? null,
      _coachComments: item.coachComments || "",
    };
  }
  // Raw scenario format: {title, description, options, best, explanations, rates, ...}
  if (item.options && item.explanations && item.rates) {
    return {
      ...item,
      cat: item.cat || item.position || "unknown",
      _sourceFormat: "raw",
    };
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SFT + DPO builders
// ════════════════════════════════════════════════════════════════════════════

function buildSFTExample(sc, judgeScore) {
  const pos = POSITION_NAMES[sc.cat] || sc.cat;
  const diffName = DIFF_NAMES[sc.diff] || "Rookie";
  const prompt = `Generate a baseball strategy scenario for a ${pos} player.

Difficulty: ${diffName} (level ${sc.diff})
Target concept: ${sc.concept || ""}
${sc.conceptTag ? `Concept tag: ${sc.conceptTag}` : ""}

Requirements:
- Write from 2nd person perspective ("You are...")
- Include 4 options with exactly 1 best answer
- Each option needs a success rate (best=75-90, tempting wrong=40-65, bad=10-35)
- Each explanation must teach WHY the answer is good or bad
- Include a realistic game situation (inning, outs, count, runners, score)
- Match language to ${diffName} difficulty level`;

  const clean = {
    title: sc.title, description: sc.description, situation: sc.situation,
    options: sc.options, best: sc.best, explanations: sc.explanations,
    rates: sc.rates, concept: sc.concept || "", conceptTag: sc.conceptTag || "",
    diff: sc.diff, anim: sc.anim || "freeze"
  };

  return {
    prompt, completion: JSON.stringify(clean),
    metadata: {
      source: sc._sourceFormat === "coach-rating" ? "coach-rated-judged" : "synthetic-judged",
      position: sc.cat, judgeScore, coachScore: sc._coachScore || null,
      generatedAt: sc.generatedAt || new Date().toISOString()
    }
  };
}

function buildDPOPairs(sc) {
  const pairs = [];
  const best = sc.best;
  const explanations = sc.explanations || [];
  if (explanations.length !== 4) return pairs;
  const context = `Scenario: ${sc.description}\nOptions: ${(sc.options || []).join(", ")}\nCorrect answer: ${(sc.options || [])[best] || ""}`;

  // If coach picked a preferred explanation, use that as chosen
  const chosenIdx = sc._preferredExplanation != null ? sc._preferredExplanation : best;

  for (let i = 0; i < 4; i++) {
    if (i !== chosenIdx && explanations[i]) {
      pairs.push({
        prompt: context, chosen: explanations[chosenIdx], rejected: explanations[i],
        metadata: {
          source: sc._sourceFormat === "coach-rating" ? "coach-rated-judged" : "synthetic-judged",
          position: sc.cat, chosen_idx: chosenIdx, rejected_idx: i
        }
      });
    }
  }
  return pairs;
}

// ════════════════════════════════════════════════════════════════════════════
// Pool runner
// ════════════════════════════════════════════════════════════════════════════

async function runJudgePool(scenarios, concurrency, threshold, firewallOnly) {
  const results = [];
  const queue = [...scenarios];
  let completed = 0;
  const total = scenarios.length;
  const startTime = Date.now();

  async function worker() {
    while (queue.length > 0) {
      const sc = queue.shift();
      completed++;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // Pass 1: Firewall
      const fw = QUALITY_FIREWALL.validate(sc, sc.cat);
      sc._firewall = fw;

      if (!fw.pass) {
        sc._judgeScore = 0;
        sc._verdict = "FIREWALL_REJECT";
        console.log(`  [${completed}/${total}] FIREWALL "${sc.title}" — ${fw.tier1Fails[0].message.slice(0, 70)}`);
        results.push(sc);
        continue;
      }

      if (firewallOnly) {
        sc._judgeScore = null;
        sc._verdict = fw.tier2Warns.length > 0 ? "FIREWALL_WARN" : "FIREWALL_PASS";
        const warnTag = fw.tier2Warns.length > 0 ? ` [${fw.tier2Warns.length} warns]` : "";
        console.log(`  [${completed}/${total}] LOCAL_OK "${sc.title}"${warnTag} (${elapsed}s)`);
        results.push(sc);
        continue;
      }

      // Pass 2: LLM Judge
      try {
        const rating = await llmJudge(sc);
        sc._judgeScore = rating.average;
        sc._judgeDetails = rating;
        const pass = rating.average >= threshold;
        sc._verdict = pass ? "PASS" : "JUDGE_REJECT";
        const icon = pass ? "PASS" : "FAIL";
        const warnTag = fw.tier2Warns.length > 0 ? ` [${fw.tier2Warns.length} warns]` : "";
        console.log(`  [${completed}/${total}] ${icon} ${rating.average.toFixed(1)} "${sc.title}"${warnTag} (${elapsed}s)`);
      } catch (e) {
        sc._judgeScore = 0;
        sc._verdict = "JUDGE_ERROR";
        sc._judgeDetails = { scores: {}, average: 0, issues: [e.message], summary: "Judge error" };
        console.log(`  [${completed}/${total}] ERROR "${sc.title}": ${e.message.slice(0, 50)}`);
      }
      results.push(sc);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

// ════════════════════════════════════════════════════════════════════════════
// Main
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  let threshold = DEFAULT_THRESHOLD;
  const threshIdx = args.indexOf("--threshold");
  if (threshIdx !== -1 && args[threshIdx + 1]) threshold = parseFloat(args[threshIdx + 1]);
  // Filter out flags AND their values (e.g., "--threshold 8.0" removes both tokens)
  const flagValues = new Set();
  if (threshIdx !== -1 && args[threshIdx + 1]) flagValues.add(threshIdx + 1);
  const inputFiles = args.filter((a, i) => !a.startsWith("--") && !flagValues.has(i));
  const eqArg = args.find(a => a.startsWith("--threshold="));
  if (eqArg) threshold = parseFloat(eqArg.split("=")[1]);
  if (isNaN(threshold)) threshold = DEFAULT_THRESHOLD;

  const addToDatasets = args.includes("--add");
  const dryRun = args.includes("--dry");
  const firewallOnly = args.includes("--firewall-only");

  if (inputFiles.length === 0) {
    console.error(`Usage: node scripts/judge_scenario.js <file.json> [more.json ...] [--threshold 8.0] [--add] [--dry] [--firewall-only]

Options:
  --threshold N    Pass threshold (default: 8.0)
  --add            Auto-add passing scenarios to SFT + DPO datasets
  --dry            Score only, don't write any files
  --firewall-only  Run local QUALITY_FIREWALL only, skip LLM judge`);
    process.exit(1);
  }

  // Load all input files
  let rawItems = [];
  for (const f of inputFiles) {
    const p = path.resolve(f);
    if (!fs.existsSync(p)) { console.error("File not found: " + p); process.exit(1); }
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    const items = Array.isArray(data) ? data : [data];
    rawItems.push(...items);
  }

  // Normalize to scenarios
  const scenarios = [];
  let skippedFormat = 0;
  for (const item of rawItems) {
    const sc = extractScenario(item);
    if (sc) scenarios.push(sc);
    else skippedFormat++;
  }

  console.log("=".repeat(60));
  console.log("  BSM UNIVERSAL SCENARIO JUDGE");
  console.log("=".repeat(60));
  console.log(`  Files:     ${inputFiles.map(f => path.basename(f)).join(", ")}`);
  console.log(`  Scenarios: ${scenarios.length} (${skippedFormat} skipped bad format)`);
  console.log(`  Threshold: ${threshold}/10`);
  console.log(`  Mode:      ${firewallOnly ? "FIREWALL ONLY" : dryRun ? "DRY RUN" : addToDatasets ? "LIVE + ADD TO DATASETS" : "SCORE ONLY"}`);
  console.log("=".repeat(60));

  if (scenarios.length === 0) {
    console.log("\n  No valid scenarios found.");
    return;
  }

  // Format breakdown
  const formats = {};
  for (const sc of scenarios) formats[sc._sourceFormat] = (formats[sc._sourceFormat] || 0) + 1;
  console.log(`  Formats:   ${Object.entries(formats).map(([k, v]) => `${k}:${v}`).join(" ")}`);

  // Run judge
  console.log("");
  const judged = await runJudgePool(scenarios, CONCURRENCY, threshold, firewallOnly);

  // Categorize results
  const passed = judged.filter(s => s._verdict === "PASS" || (firewallOnly && s._verdict !== "FIREWALL_REJECT"));
  const fwRejected = judged.filter(s => s._verdict === "FIREWALL_REJECT");
  const judgeRejected = judged.filter(s => s._verdict === "JUDGE_REJECT");
  const judgeErrors = judged.filter(s => s._verdict === "JUDGE_ERROR");

  // Report
  console.log("\n" + "=".repeat(60));
  console.log("  JUDGE RESULTS");
  console.log("=".repeat(60));
  console.log(`  Total:              ${judged.length}`);
  console.log(`  Firewall rejected:  ${fwRejected.length}`);
  if (!firewallOnly) {
    console.log(`  Judge rejected:     ${judgeRejected.length}`);
    console.log(`  Judge errors:       ${judgeErrors.length}`);
  }
  console.log(`  PASSED:             ${passed.length}`);
  console.log(`  Pass rate:          ${((passed.length / judged.length) * 100).toFixed(1)}%`);

  if (!firewallOnly && passed.length > 0) {
    const withScores = passed.filter(s => s._judgeScore > 0);
    if (withScores.length > 0) {
      const avgScore = (withScores.reduce((a, s) => a + s._judgeScore, 0) / withScores.length).toFixed(2);
      console.log(`  Avg pass score:     ${avgScore}`);
    }
  }

  // Top 5
  if (!firewallOnly) {
    const sorted = [...judged].filter(s => s._judgeScore > 0).sort((a, b) => b._judgeScore - a._judgeScore);
    if (sorted.length > 0) {
      console.log("\n  Top 5:");
      sorted.slice(0, 5).forEach((s, i) =>
        console.log(`    ${i + 1}. ${s._judgeScore.toFixed(1)} "${s.title}" (${s.cat}/${s.conceptTag || "—"})`)
      );
    }
  }

  // Show rejections
  const allRejected = [...fwRejected, ...judgeRejected, ...judgeErrors];
  if (allRejected.length > 0) {
    console.log("\n  Rejected (" + allRejected.length + "):");
    allRejected.slice(0, 8).forEach(s => {
      if (s._verdict === "FIREWALL_REJECT") {
        console.log(`    FIREWALL "${s.title}" — ${s._firewall.tier1Fails[0].message.slice(0, 70)}`);
      } else if (s._verdict === "JUDGE_ERROR") {
        console.log(`    ERROR    "${s.title}" — ${s._judgeDetails?.issues?.[0] || "unknown"}`);
      } else {
        console.log(`    JUDGE    "${s.title}" — ${s._judgeScore.toFixed(1)} (${s._judgeDetails?.summary?.slice(0, 60) || "below threshold"})`);
      }
    });
  }

  // Save detailed results
  if (!dryRun) {
    const date = new Date().toISOString().slice(0, 10);
    const resultsPath = path.join(path.dirname(path.resolve(inputFiles[0])), `judge_results_${date}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify({
      date, threshold, firewallOnly,
      total: judged.length,
      passed: passed.length,
      firewallRejected: fwRejected.length,
      judgeRejected: judgeRejected.length,
      judgeErrors: judgeErrors.length,
      passRate: ((passed.length / judged.length) * 100).toFixed(1) + "%",
      scenarios: judged.map(s => ({
        id: s.id, title: s.title, cat: s.cat, conceptTag: s.conceptTag,
        sourceFormat: s._sourceFormat,
        verdict: s._verdict,
        judgeScore: s._judgeScore,
        judgeDetails: s._judgeDetails || null,
        coachScore: s._coachScore || null,
        firewallPass: s._firewall?.pass,
        firewallTier1: s._firewall?.tier1Fails || [],
        firewallTier2: s._firewall?.tier2Warns || [],
        firewallTier3: s._firewall?.tier3Suggestions || [],
      }))
    }, null, 2));
    console.log(`\n  Detailed results: ${resultsPath}`);
  }

  // Add to datasets
  if (addToDatasets && !dryRun && passed.length > 0) {
    const actualPassed = passed.filter(s => s._judgeScore === null || s._judgeScore >= threshold);

    fs.mkdirSync(LLM_DATA_DIR, { recursive: true });

    const sftPath = path.join(LLM_DATA_DIR, "sft.jsonl");
    let newSFT = 0;
    const sftStream = fs.createWriteStream(sftPath, { flags: "a" });
    for (const sc of actualPassed) {
      sftStream.write(JSON.stringify(buildSFTExample(sc, sc._judgeScore)) + "\n");
      newSFT++;
    }
    sftStream.end();

    const dpoPath = path.join(LLM_DATA_DIR, "dpo.jsonl");
    let newDPO = 0;
    const dpoStream = fs.createWriteStream(dpoPath, { flags: "a" });
    for (const sc of actualPassed) {
      for (const pair of buildDPOPairs(sc)) {
        dpoStream.write(JSON.stringify(pair) + "\n");
        newDPO++;
      }
    }
    dpoStream.end();

    await new Promise(r => setTimeout(r, 500));

    // Rebuild combined
    const goldenPath = path.join(LLM_DATA_DIR, "sft_golden.jsonl");
    const handcraftedPath = path.join(LLM_DATA_DIR, "sft_handcrafted.jsonl");
    const combinedPath = path.join(LLM_DATA_DIR, "sft_combined.jsonl");
    const parts = [];
    for (const p of [goldenPath, handcraftedPath, sftPath]) {
      if (fs.existsSync(p)) parts.push(fs.readFileSync(p, "utf8").trimEnd());
    }
    fs.writeFileSync(combinedPath, parts.filter(Boolean).join("\n") + "\n");
    const combinedCount = fs.readFileSync(combinedPath, "utf8").trim().split("\n").length;

    console.log("\n  Dataset updates:");
    console.log(`    + ${newSFT} SFT examples`);
    console.log(`    + ${newDPO} DPO pairs`);
    console.log(`    sft_combined.jsonl: ${combinedCount} total`);

    // Golden candidates
    const goldCandidates = actualPassed.filter(s => s._judgeScore >= 9.5);
    if (goldCandidates.length > 0) {
      const date = new Date().toISOString().slice(0, 10);
      const goldPath = path.join(path.dirname(path.resolve(inputFiles[0])), `golden_candidates_${date}.json`);
      // Append to existing golden candidates if same day
      let existing = [];
      if (fs.existsSync(goldPath)) {
        try { existing = JSON.parse(fs.readFileSync(goldPath, "utf8")); } catch {}
      }
      fs.writeFileSync(goldPath, JSON.stringify([...existing, ...goldCandidates], null, 2));
      console.log(`    ${goldCandidates.length} golden candidates (>= 9.5)`);
    }
  }
}

main().catch(e => { console.error("\nFATAL:", e.message); process.exit(1); });
