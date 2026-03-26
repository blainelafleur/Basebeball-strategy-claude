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
]

// Position-action boundaries — shared by agent and standard pipelines
const POS_ACTIONS_MAP = {
  pitcher: "Pitcher=pitch selection, pitch location, pickoff attempts, fielding batted balls, covering 1B on grounders right side, backing up bases.",
  catcher: "Catcher=calling pitches, setting up location targets, blocking, throwing out runners, framing, fielding bunts/WP/PB.",
  batter: "Batter=swing decisions, bunt, take, protect the plate, hit-and-run swing.",
  baserunner: "Baserunner=lead distance, jump timing, steal/hold, tag-up, sliding, secondary lead, advance/hold decisions, reading ball off bat.",
  manager: "Manager=pitching changes, IBB signals, defensive alignment/shifts, steal/bunt signs, pinch hitters, lineup decisions.",
  firstBase: "FirstBase=holding runners at 1B, scooping low throws, stretch footwork, charging bunts, cutoff on CF/RF throws home, 3-6-3 DP, fielding grounders.",
  secondBase: "SecondBase=turning DPs (pivot at 2B), covering 1B on bunts, covering 2B on steals (LHB), relay on LF/CF throws, fielding grounders, positioning.",
  shortstop: "Shortstop=turning DPs (feed to 2B), covering 2B on steals (RHB), relay on CF/RF throws, fielding grounders, cutoff alignment, positioning depth.",
  thirdBase: "ThirdBase=guarding the line, charging bunts/slow rollers, bare-hand plays, tagging runners at 3B, fielding grounders, positioning depth.",
  leftField: "LeftField=tracking fly balls, throwing to cutoff/bases, backing up 3B/SS, playing the wall, reading balls off bat.",
  centerField: "CenterField=tracking fly balls, calling off corner OFs, throwing to cutoff/relay, backing up other OFs, gap coverage.",
  rightField: "RightField=tracking fly balls, throwing to 3B/cutoff, backing up 1B/2B, playing the wall, strongest arm to 3B.",
}

// Role violation regexes — reject ACTUALLY wrong baseball (module-level so all pipelines can access)
const ROLE_VIOLATIONS = {
  pitcher: [
    /pitcher.*cutoff/i, /pitcher.*relay\s*man/i, /pitcher.*lines?\s*up.*between/i,
    /pitcher.*covers?\s*(second|2nd|third|3rd)\b/i, /pitcher.*fake.*third.*throw.*first/i,
    /pitcher.*relay.*second/i, /pitcher.*stays.*on.*mound.*wild.*pitch/i, /pitcher.*backs?\s*up\s*(second|2nd)\b/i,
  ],
  catcher: [
    /catcher.*cutoff/i, /catcher.*goes?\s*out.*cutoff/i,
    /catcher.*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay/i, /catcher.*looks.*runner.*before.*field/i,
  ],
  shortstop: [/SS\s*covers?\s*(1st|first)\b.*bunt/i, /shortstop\s*covers?\s*(1st|first)\b.*bunt/i],
  secondBase: [/2B\s*covers?\s*(3rd|third)\b.*bunt/i, /second\s*base.*covers?\s*(3rd|third)\b.*bunt/i],
  thirdBase: [/third.*base.*stays.*at.*third.*wild.*pitch.*runner.*third/i, /third.*base.*cutoff.*right.*field/i, /third.*base.*relay.*right/i, /third\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*cf/i, /third\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*rf/i],
  firstBase: [/first\s*base(man)?\s*(is|as)\s*(the)?\s*cutoff.*lf/i],
  leftField: [/left.*field.*cutoff.*center/i, /left\s*field(er)?\s*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay.*(second|2nd)/i, /left\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(second|2nd|2b)\b/i],
  centerField: [/center\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(third|3rd|3b)\b/i, /center\s*field(er)?.*cutoff.*3b/i, /center\s*field(er)?.*cutoff.*third/i, /cf.*cutoff.*3b/i],
  rightField: [/right.*field.*cutoff.*left/i, /right\s*field(er)?\s*(is|as|acts?\s+as|becomes?)\s*(the\s*)?relay.*(third|3rd)/i, /right\s*field(er)?\s*(back(s)?\s*up|cover(s)?)\s*(third|3rd|3b)\b/i],
  batter: [/you\s+(field|throw\s+to\s+(first|second|third)|cover\s+(first|second|third|home)|pitch|deliver)/i],
  baserunner: [/you\s+(field|catch\s+the\s+(ball|throw)|pitch|bat|swing|throw\s+to)/i],
  manager: [/you\s+(throw|catch|field|tag|dive|slide|pitch|bat|swing|bunt|run\s+to)/i],
}

// xAI health tracking — skip xAI pipelines for 5min after connect timeouts
let _xaiDownUntil = 0
const XAI_COOLDOWN = 5 * 60 * 1000 // 5 minutes
function markXaiDown() { _xaiDownUntil = Date.now() + XAI_COOLDOWN; console.warn("[BSM] xAI marked down for 5 minutes") }
function isXaiDown() { return Date.now() < _xaiDownUntil }

// QUALITY_FIREWALL — Automated checks for every scenario (handcrafted or AI)
// Tier 1: hard reject | Tier 2: warn + flag | Tier 3: quality suggestions
// ============================================================================
const QUALITY_FIREWALL = {
  // --- TIER 1: Hard failures (reject the scenario) ---
  tier1: {
    // Check 1: Extended role violations (supplements ROLE_VIOLATIONS above)
    flyBallPriority(scenario) {
      const allText = [scenario.description, ...(scenario.options||[]), ...(scenario.explanations||[])].join(" ")
      // Infielder should NOT have priority over outfielder on fly balls
      if (/infielder.*has\s*priority.*over.*outfielder/i.test(allText)) return "Fly ball priority reversed: outfielders have priority over infielders"
      if (/infielder.*calls?\s*off.*outfielder/i.test(allText) && /correct|right|best/i.test(allText)) return "Infielder calling off outfielder on fly ball is incorrect"
      return null
    },
    // Check 2: Force/tag confusion in explanations
    forceTagError(scenario) {
      const bestExp = (scenario.explanations || [])[scenario.best] || ""
      // If scenario has a force situation but best explanation describes tagging
      const runners = scenario.situation?.runners || []
      const outs = scenario.situation?.outs ?? 0
      // Runner on 1st with <2 outs = force at 2nd
      if (runners.includes(1) && /tag\s*(the\s*)?runner.*at\s*(second|2nd)/i.test(bestExp) && !/tag.*play/i.test(bestExp)) {
        return "Force/tag error: runner on 1st creates force at 2nd, but explanation describes tag play"
      }
      // Bases loaded = force everywhere
      if (runners.length === 3 && /tag\s*(the\s*)?runner.*at\s*home/i.test(bestExp)) {
        return "Force/tag error: bases loaded creates force at home, but explanation describes tag play"
      }
      return null
    },
    // Check 3: Position impossibilities
    positionImpossibility(scenario) {
      const allText = [scenario.description, ...(scenario.options||[]), ...(scenario.explanations||[])].join(" ")
      const bestOpt = (scenario.options || [])[scenario.best] || ""
      const bestExp = (scenario.explanations || [])[scenario.best] || ""
      const bestText = bestOpt + " " + bestExp
      // Catcher leaving home with RISP to back up a base (correct answer)
      const runners = scenario.situation?.runners || []
      const hasRISP = runners.includes(2) || runners.includes(3)
      if (hasRISP && /catcher.*(goes|runs|sprints)\s*(to|toward)\s*(first|1st|second|2nd|third|3rd)/i.test(bestText)) {
        return "Position impossibility: catcher should not leave home plate with runners in scoring position"
      }
      return null
    },
    // Check 4a: Explanation minimum length — reject stub explanations
    // Thresholds calibrated for handcrafted scenarios (concise but effective) + AI scenarios
    explanationLength(scenario) {
      const exps = scenario.explanations || []
      const best = scenario.best
      if (exps.length !== 4 || typeof best !== "number") return null
      // Best answer explanation must be at least 10 words (educational depth)
      if (typeof exps[best] === "string") {
        const bestWords = exps[best].trim().split(/\s+/).length
        if (bestWords < 10) return "Explanation too short: best answer explanation is " + bestWords + " words (min 10)"
      }
      // All explanations must be at least 6 words (no empty stubs)
      for (let i = 0; i < 4; i++) {
        if (typeof exps[i] === "string") {
          const words = exps[i].trim().split(/\s+/).length
          if (words < 6) return "Explanation too short: option " + (i+1) + " is " + words + " words (min 6)"
        }
      }
      return null
    },
    // Check 4b: Option distinctness — reject exact duplicates and negation-only variants
    optionDistinctness(scenario) {
      const opts = (scenario.options || []).map(o => typeof o === "string" ? o : "")
      if (opts.length !== 4) return null
      const norm = opts.map(o => o.toLowerCase().replace(/[^a-z\s]/g, "").trim())
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          if (norm[i] === norm[j]) return "Duplicate options: " + (i+1) + " and " + (j+1) + " are identical"
          // Negation-only variant: "Do X" vs "Don't do X"
          const stripped = [norm[i].replace(/\b(not|dont|do not|never|no)\b/g, "").replace(/\s+/g," ").trim(), norm[j].replace(/\b(not|dont|do not|never|no)\b/g, "").replace(/\s+/g," ").trim()]
          if (stripped[0].length > 5 && stripped[0] === stripped[1]) return "Negation-only variants: options " + (i+1) + " and " + (j+1) + " differ only by negation"
        }
      }
      return null
    },
    // Check 4c: Success rate sanity — best answer must be highest, worst must be <50%
    rateSanity(scenario) {
      const rates = scenario.rates || []
      const best = scenario.best
      if (rates.length !== 4 || typeof best !== "number") return null
      const minRate = Math.min(...rates)
      if (minRate >= 50) return "Rate sanity: worst option has " + minRate + "% success — should be below 50%"
      if (rates[best] < 65) return "Rate sanity: best answer only has " + rates[best] + "% — should be at least 65%"
      return null
    },
    // Check 5: IBB contradiction only (bunt/steal moved to Tier 2 — too context-dependent)
    brainContradiction(scenario) {
      const sit = scenario.situation || {}
      const runners = sit.runners || []
      const outs = sit.outs ?? 0
      const bestOption = (scenario.options?.[scenario.best] || "").toLowerCase()

      // Check: Does best answer recommend IBB when it raises RE24 significantly?
      if (/intentional.*walk|\bIBB\b/i.test(bestOption)) {
        const re24Before = getRunExpectancy(runners, outs)
        const newRunners = [...new Set([...runners, 1])].sort()
        const re24After = getRunExpectancy(newRunners, outs)
        if (re24After - re24Before > 0.30) {
          return `Brain contradiction: IBB raises RE24 from ${re24Before.toFixed(2)} to ${re24After.toFixed(2)} (+${(re24After-re24Before).toFixed(2)})`
        }
      }

      return null
    },
    // Check 6: Situation-action contradiction — game state makes action impossible
    situationActionContradiction(scenario) {
      const outs = scenario.situation?.outs
      const best = (scenario.options?.[scenario.best] || '').toLowerCase()
      const allText = (scenario.options || []).join(' ').toLowerCase() + ' ' + (scenario.explanations || []).join(' ').toLowerCase()
      const sit = scenario.situation || {}
      if (outs === 2 && /double\s*play|turn\s*two|6-4-3|4-6-3/.test(allText)) return "Situation contradiction: double play impossible with 2 outs"
      if (outs === 2 && /sacrifice\s*bunt|sac\s*bunt/.test(best)) return "Situation contradiction: sacrifice bunt pointless with 2 outs"
      if (outs === 2 && /tag\s*up|tagging\s*up/.test(best)) return "Situation contradiction: tag-up wrong framing with 2 outs (should be run on contact)"
      if (outs === 2 && /infield\s*fly/.test(allText) && !/does\s*not\s*apply|doesn.t\s*apply|NOT\s*apply|only\s*applies?\s*with\s*less/i.test(allText)) return "Situation contradiction: infield fly rule only applies with < 2 outs"
      if (outs === 2 && /steal|stolen\s*base/.test(best)) {
        const score = sit.score || []
        if (Array.isArray(score) && score.length === 2 && Math.abs((score[0]||0) - (score[1]||0)) >= 3) {
          return "Situation contradiction: steal with 2 outs and 3+ run lead is pointless"
        }
      }
      return null
    },
    // Check 7: Position principle contradiction — best answer violates position rules
    principleContradiction(scenario, position) {
      if (!position) return null
      const best = (scenario.options?.[scenario.best] || '').toLowerCase()
      const bestExpl = (scenario.explanations?.[scenario.best] || '').toLowerCase()
      const combined = best + ' ' + bestExpl
      if (position === 'pitcher' && /cutoff|relay|cut.?off/.test(combined)) return "Principle contradiction: pitcher should never be the cutoff or relay man"
      if (position === 'centerField' && /defer|let.*fielder|give\s*way/.test(combined)) return "Principle contradiction: center fielder has priority — should never defer to corner OF"
      if (position === 'catcher' && /cover\s*(first|second|third|2nd|3rd|1st)\s*base/.test(combined)) return "Principle contradiction: catcher should not leave home to cover a base"
      if (position === 'baserunner' && /\byell\b|\bsignal\b|\bdirect\b(?!ion)|\btell\b.*fielder|\bwave\b/.test(combined)) return "Principle contradiction: baserunner cannot direct the defense"
      return null
    },
    // Audit-discovered: Best answer must have highest rate
    bestAnswerRateCheck(scenario) {
      const rates = scenario.rates || []
      const best = scenario.best
      if (rates.length !== 4 || typeof best !== "number") return null
      const maxRate = Math.max(...rates)
      if (rates[best] !== maxRate) {
        const actualBest = rates.indexOf(maxRate)
        return "Best answer rate conflict: best=" + best + " (rate " + rates[best] + ") but option " + actualBest + " has higher rate " + maxRate
      }
      return null
    },
    // Check: Position-action boundary — reject when ALL options are actions for a DIFFERENT position
    // Catches: batter scenario served to catcher, defensive scenario served to batter, etc.
    positionActionBoundary(scenario, position) {
      if (!position) return null
      const opts = (scenario.options || []).map(o => (o||"").toLowerCase()).join(" ")
      const desc = (scenario.description || "").toLowerCase()
      const combined = opts + " " + desc

      // Batting actions — should ONLY appear for batter position
      const BATTING_ACTIONS = /\b(swing|look for a (fastball|pitch|curve|slider|changeup)|take the (first )?pitch|protect the plate|work the count|hit (behind|to)|pull for|drive the ball|foul off|bunt for a hit|attack .* pitch|wait for.*pitch)\b/i
      // Defensive fielding — should NOT appear for batter/baserunner
      const FIELDING_ACTIONS = /\b(throw to (first|second|third|home)|field the (ball|grounder|bunt)|turn the double play|tag the runner|cover (first|second|third|home)|relay.*throw|cutoff position|back up)\b/i
      // Pitching actions — should ONLY appear for pitcher
      const PITCHING_ACTIONS = /\b(throw a (fastball|curve|slider|changeup|sinker)|pitch (location|selection)|throw (inside|outside|high|low)|pitchout|work ahead|nibble|establish the fastball)\b/i
      // Baserunning actions — should ONLY appear for baserunner
      const BASERUNNING_ACTIONS = /\b(steal (second|third)|take a lead|get a jump|tag up and (go|advance|score)|round (second|third)|slide into|break for home|secondary lead)\b/i

      // Defensive positions should not have ALL batting options
      const DEFENSIVE = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
      if (DEFENSIVE.includes(position)) {
        const battingMatches = (scenario.options || []).filter(o => BATTING_ACTIONS.test(o||""))
        if (battingMatches.length >= 3) return "Position boundary: " + position + " scenario has " + battingMatches.length + "/4 batting options — wrong position"
      }
      // Batter should not have ALL defensive/fielding options
      if (position === "batter") {
        const fieldingMatches = (scenario.options || []).filter(o => FIELDING_ACTIONS.test(o||""))
        if (fieldingMatches.length >= 3) return "Position boundary: batter scenario has " + fieldingMatches.length + "/4 fielding options — wrong position"
      }
      // Non-pitcher should not have ALL pitching options
      if (position !== "pitcher") {
        const pitchingMatches = (scenario.options || []).filter(o => PITCHING_ACTIONS.test(o||""))
        if (pitchingMatches.length >= 3) return "Position boundary: " + position + " scenario has " + pitchingMatches.length + "/4 pitching options — wrong position"
      }
      // Non-baserunner should not have ALL baserunning options (except manager who can signal)
      if (position !== "baserunner" && position !== "manager") {
        const runningMatches = (scenario.options || []).filter(o => BASERUNNING_ACTIONS.test(o||""))
        if (runningMatches.length >= 3) return "Position boundary: " + position + " scenario has " + runningMatches.length + "/4 baserunning options — wrong position"
      }
      return null
    },
    // Check: Animation-situation mismatch
    animationSituationMismatch(scenario) {
      const anim = scenario.anim || ""
      const outs = scenario.situation?.outs
      const runners = scenario.situation?.runners || []
      if (anim === "doubleplay" && outs === 2) return "Animation mismatch: doubleplay impossible with 2 outs"
      if (anim === "steal" && runners.length === 0) return "Animation mismatch: steal animation but no runners on base"
      if (anim === "score" && runners.length === 0) return "Animation mismatch: score animation but no runners on base"
      if (anim === "advance" && runners.length === 0) return "Animation mismatch: advance animation but no runners on base"
      if (anim === "bunt" && outs === 2) return "Animation mismatch: bunt with 2 outs is rarely correct"
      return null
    },
    // Check: Score-description consistency (catches "trailing" when leading, etc.)
    scoreDescriptionConsistency(scenario) {
      const desc = (scenario.description || "").toLowerCase()
      const sit = scenario.situation || {}
      const score = sit.score || []
      const inning = sit.inning || ""
      if (score.length !== 2 || !inning) return null
      const [home, away] = score
      const isBot = /^bot/i.test(inning)
      const isTop = /^top/i.test(inning)
      // Bot: home team bats; Top: away team bats
      if (isBot) {
        if (/trailing|losing|behind|down \d/.test(desc) && home > away) return "Score-description: Bot inning, home leads " + home + "-" + away + " but desc says trailing"
        if (/leading|winning|ahead|up \d/.test(desc) && home < away) return "Score-description: Bot inning, home trails " + home + "-" + away + " but desc says leading"
      }
      if (isTop) {
        if (/trailing|losing|behind|down \d/.test(desc) && away > home) return "Score-description: Top inning, away leads " + away + "-" + home + " but desc says trailing"
        if (/leading|winning|ahead|up \d/.test(desc) && away < home) return "Score-description: Top inning, away trails " + away + "-" + home + " but desc says leading"
      }
      return null
    },
    // Check: Concept tag must map to a known BRAIN concept
    conceptTagValidity(scenario) {
      if (!scenario.conceptTag) return "Missing conceptTag"
      const knownConcepts = BRAIN?.concepts ? Object.keys(BRAIN.concepts) : []
      if (knownConcepts.length > 0 && !knownConcepts.includes(scenario.conceptTag)) {
        // Also check if it's a valid kebab-case format (AI generates new concepts sometimes)
        if (!/^[a-z][a-z0-9-]+$/.test(scenario.conceptTag)) return "Invalid conceptTag format: " + scenario.conceptTag
      }
      return null
    },
  },

  // --- TIER 2: Warnings (flag for review but don't reject) ---
  tier2: {
    // Moved from Tier 1: Option diversity (stylistic, not structural)
    optionActionDiversity(scenario) {
      const options = scenario.options || []
      if (options.length !== 4) return null
      const verbs = options.map(o => (o || '').split(' ')[0].toLowerCase().replace(/[^a-z]/g, ''))
      if (new Set(verbs).size === 1 && verbs[0].length > 0) return "Option diversity: all 4 options start with the same word '" + verbs[0] + "'"
      return null
    },
    // Moved from Tier 1: Explanation-option alignment (quality signal)
    explanationOptionAlignment(scenario) {
      const opts = scenario.options || []
      const exps = scenario.explanations || []
      if (opts.length !== 4 || exps.length !== 4) return null
      const misaligned = []
      for (let i = 0; i < 4; i++) {
        const optWords = (opts[i]||"").toLowerCase().split(/\s+/).filter(w => w.length > 4)
        const expLower = (exps[i]||"").toLowerCase()
        const matches = optWords.filter(w => expLower.includes(w))
        if (matches.length === 0 && optWords.length > 2) misaligned.push(i)
      }
      if (misaligned.length >= 2) return "Explanation alignment: explanations " + misaligned.join(",") + " don't reference their corresponding options"
      return null
    },
    // Moved from Tier 1: Bunt/steal brain checks (context-dependent, not always wrong)
    brainBuntStealCheck(scenario) {
      const sit = scenario.situation || {}
      const runners = sit.runners || []
      const outs = sit.outs ?? 0
      const bestOption = (scenario.options?.[scenario.best] || "").toLowerCase()
      const bestExpl = (scenario.explanations?.[scenario.best] || "").toLowerCase()
      if (runners.length > 0 && outs < 2) {
        const rKey = runnersKey(runners)
        const buntDelta = BRAIN.stats.buntDelta?.[`${rKey}_${outs}`]
        if (buntDelta && buntDelta < -0.15 && /bunt|sacrifice/i.test(bestOption)) {
          if (!/risk|aggressive|trade.?off|cost|statistically/i.test(bestExpl)) {
            return `Brain warning: bunt recommended but bunt delta is ${buntDelta} (may be justified by game context)`
          }
        }
      }
      if ((runners.includes(1) || runners.includes(2)) && /\bsteal\b|go on first/i.test(bestOption)) {
        if (!/risk|gamble|aggressive|break.even|percentage|success rate/i.test(bestExpl)) {
          return "Brain warning: steal recommended without acknowledging break-even threshold"
        }
      }
      return null
    },
    // Check 6: Count edge mislabel
    countConsistency(scenario) {
      const count = scenario.situation?.count
      if (!count || count === "-") return null
      const [balls, strikes] = count.split("-").map(Number)
      const allText = [scenario.description, ...(scenario.options||[]), ...(scenario.explanations||[])].join(" ")
      const cd = BRAIN.stats?.countData?.[count]
      if (!cd) return null
      if (cd.edge === "hitter" && /pitcher['s]*\s*count/i.test(allText)) {
        return "Count mismatch: " + count + " is a hitter's count but text says 'pitcher's count'"
      }
      if (cd.edge === "pitcher" && /hitter['s]*\s*count/i.test(allText)) {
        return "Count mismatch: " + count + " is a pitcher's count but text says 'hitter's count'"
      }
      return null
    },
    // Check 7: Option overlap — two options are too similar (word overlap + semantic overlap)
    optionOverlap(scenario) {
      const opts = scenario.options || []
      if (opts.length !== 4) return null
      // 7a. Word overlap check
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const a = opts[i].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)
          const b = opts[j].toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/)
          const shared = a.filter(w => w.length > 3 && b.includes(w))
          const overlap = shared.length / Math.min(a.length, b.length)
          if (overlap > 0.7) return "Option overlap: options " + (i+1) + " and " + (j+1) + " share " + Math.round(overlap*100) + "% of significant words"
        }
      }
      // 7b. Semantic overlap — catch actions that are subsets/prerequisites of each other
      for (const group of SEMANTIC_OVERLAPS) {
        const matching = []
        for (let i = 0; i < opts.length; i++) {
          const optLower = opts[i].toLowerCase()
          if (group.some(phrase => optLower.includes(phrase))) matching.push(i)
        }
        if (matching.length >= 2) {
          return "Semantic overlap: options " + matching.map(i => i + 1).join(" and ") + " describe related/identical actions (" + group[0] + ")"
        }
      }
      return null
    },
    // Check 8: Explanation coherence — best answer explanation must reference the chosen option
    explanationCoherence(scenario) {
      const opts = scenario.options || []
      const exps = scenario.explanations || []
      const best = scenario.best
      if (opts.length !== 4 || exps.length !== 4 || typeof best !== "number") return null
      const bestOpt = (opts[best] || "").toLowerCase()
      const bestExp = (exps[best] || "").toLowerCase()
      // Extract significant words (4+ chars) from the best option
      const optWords = bestOpt.replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 4)
      if (optWords.length === 0) return null
      const shared = optWords.filter(w => bestExp.includes(w))
      if (shared.length === 0) return "Explanation coherence: best answer explanation shares no significant words with option text — may describe wrong option"
      return null
    },
    // Check 8a: 3rd-person perspective — description should use "you" not "the pitcher"
    perspectiveCheck(scenario) {
      const desc = (scenario.description || "").toLowerCase()
      const posNames = /\b(the\s+)?(pitcher|catcher|first baseman|second baseman|shortstop|third baseman|left fielder|center fielder|right fielder|batter|baserunner|manager|hitter|fielder|outfielder|infielder)\s+(should|needs to|must|has to|decides|wants to|calls for|is |was |will |would |can |could |throws|sees|gets|goes|reads|doesn)/i
      const match = desc.match(posNames)
      if (match) return "3rd-person perspective: description says '" + match[0].trim() + "' — should use 'you' (2nd person)"
      if (/what should the \w+ do/i.test(desc)) return "3rd-person perspective: description asks 'What should the [position] do?' — should ask 'What should you do?'"
      return null
    },
    // Check 8b: Situation-description consistency — verify description matches situation object
    situationConsistency(scenario) {
      const desc = (scenario.description || "").toLowerCase()
      const sit = scenario.situation || {}
      const warnings = []
      // Check outs mention
      if (typeof sit.outs === "number" && desc.length > 20) {
        const outsWords = {"0": /no\s*outs|nobody\s*out|none\s*out|0\s*out/i, "1": /one\s*out|1\s*out/i, "2": /two\s*outs?|2\s*outs?/i}
        const outsText = outsWords[String(sit.outs)]
        const wrongOuts = Object.entries(outsWords).filter(([k]) => k !== String(sit.outs)).some(([,rx]) => rx.test(desc))
        if (wrongOuts) warnings.push("description mentions different out count than situation.outs=" + sit.outs)
      }
      // Check runner mention contradictions
      const runners = sit.runners || []
      if (runners.length === 0 && /bases?\s*loaded|runner(s)?\s*(on|at)/i.test(desc)) warnings.push("description mentions runners but situation.runners is empty")
      if (runners.length === 3 && /bases?\s*empty|no(body)?\s*on/i.test(desc)) warnings.push("description says bases empty but situation has bases loaded")
      return warnings.length > 0 ? "Situation mismatch: " + warnings.join("; ") : null
    },
    // Check 8b: Age-inappropriate vocabulary in easy scenarios
    ageVocab(scenario) {
      if (scenario.diff !== 1) return null
      const advancedTerms = /\b(RE24|run expectancy|leverage index|win probability added|WPA|WAR|OPS\+|xBA|barrel rate|launch angle|platoon split|TTO|times through order)\b/i
      const allText = [scenario.description, ...(scenario.options||[]), ...(scenario.explanations||[])].join(" ")
      const match = allText.match(advancedTerms)
      if (match) return "Age-inappropriate: diff-1 scenario uses advanced term '" + match[0] + "'"
      return null
    },
    // Audit-discovered: Count should be real balls-strikes, not placeholder
    countFormat(scenario) {
      const count = scenario.situation?.count
      if (!count) return null
      if (count === "-") return "Count placeholder: count is '-' instead of specific balls-strikes (e.g., '1-1')"
      if (!/^[0-3]-[0-2]$/.test(count)) return "Count format: '" + count + "' is not valid balls-strikes format"
      return null
    },
    // Audit-discovered: Score array must match Top/Bot inning perspective
    // Convention: score=[HOME, AWAY]. Bot inning = HOME bats. Top inning = AWAY bats.
    // Note: This check can't know the player's team (offensive vs defensive) — that's handled
    // by the position-aware check in gradeScenario. Here we catch the most obvious cases.
    scoreInningPerspective(scenario) {
      const sit = scenario.situation
      if (!sit || !sit.inning || !sit.score) return null
      const desc = (scenario.description || "").toLowerCase()
      const isTop = sit.inning.startsWith("Top")
      const isBot = sit.inning.startsWith("Bot")
      const [home, away] = sit.score  // score=[HOME, AWAY]
      // Bot inning: HOME team bats. If home leads but desc says "losing" — likely mismatch
      if (isBot && home > away && /you['re]*\s*(losing|behind|trailing)/i.test(desc)) return "Score-inning mismatch: Bot inning (home bats), home leads " + home + "-" + away + " but description says losing"
      // Top inning: AWAY team bats. If away leads but desc says "losing" — likely mismatch
      if (isTop && away > home && /you['re]*\s*(losing|behind|trailing)/i.test(desc)) return "Score-inning mismatch: Top inning (away bats), away leads " + away + "-" + home + " but description says losing"
      return null
    },
    // Audit-discovered: Explanation variety — 4 explanations should teach 4 different things
    explanationVariety(scenario) {
      const exps = (scenario.explanations || []).map(e => (e||"").toLowerCase())
      if (exps.length !== 4) return null
      const stopWords = new Set(["the","a","an","is","are","was","were","to","of","in","for","on","it","and","or","but","that","this","with","you","your","they","not","if","can","will","be","do","have","has","had"])
      const tokenize = s => s.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 4; j++) {
          const a = new Set(tokenize(exps[i])), b = new Set(tokenize(exps[j]))
          const intersection = [...a].filter(w => b.has(w)).length
          const union = new Set([...a, ...b]).size
          const jaccard = union > 0 ? intersection / union : 0
          if (jaccard > 0.55) return "Explanation repetition: explanations " + i + " and " + j + " are " + Math.round(jaccard*100) + "% similar"
        }
      }
      return null
    },
    // Audit-discovered: Force play mechanics accuracy
    forcePlayAccuracy(scenario) {
      const allText = [scenario.description||"",...(scenario.explanations||[])].join(" ")
      const runners = scenario.situation?.runners || []
      // No force at third unless runner on second AND first
      if (!runners.includes(1) && runners.includes(2) && /force\s*(out\s*)?(at|to)\s*(third|3rd)/i.test(allText)) {
        return "Force play error: no force at third without runner on first (runner on 2nd only = tag play at 3rd)"
      }
      return null
    },
    // Gold Standard: All 4 explanations must contain causal reasoning, not just the best
    allExplanationsCausal(scenario) {
      const exps = scenario.explanations || []
      if (exps.length !== 4) return null
      const causalWords = /\b(because|so that|this means|the reason|which means|the key is|the advantage|this ensures|this prevents|this is why|if you|that way|otherwise|since|after all|remember|given that|the problem|the risk|the benefit|the downside|what happens|the result|by doing|instead of|rather than|the tradeoff|which lets|which gives|which puts|and that|so the|meaning|leads to|results in|causing|allowing|preventing)\b/i
      const weak = exps.filter((e, i) => !causalWords.test(e) && (e||"").split(/\s+/).length < 50)
      if (weak.length >= 3) return "Explanation quality: " + weak.length + " of 4 explanations lack causal reasoning ('because', 'which means', etc.) and are under 50 words"
      return null
    },
    // Gold Standard: Rate sum should be in reasonable range (catches extreme outliers)
    rateSumRange(scenario) {
      const rates = scenario.rates || []
      if (rates.length !== 4) return null
      const sum = rates.reduce((a, b) => a + b, 0)
      if (sum < 145 || sum > 210) return "Rate sum out of range: " + sum + " (expected 145-210)"
      return null
    },
    // Gold Standard: Detect non-strategic absurd options that reduce teaching value
    absurdOptionDetection(scenario) {
      const opts = scenario.options || []
      const absurd = /\b(give up|quit|refuse to|yell at|argue with|walk off|ignore the|do nothing|don't play|leave the field|throw a tantrum)\b/i
      const flagged = opts.filter(o => absurd.test(o))
      if (flagged.length > 0) return "Absurd option detected: '" + flagged[0].substring(0, 50) + "...' — every option should be something a real player might consider"
      return null
    },
    // Moved to Tier 2: ConceptTag keyword alignment (quality signal, not structural failure)
    conceptTagAlignment(scenario) {
      const tag = scenario.conceptTag
      if (!tag) return null
      const conceptKeywords = {
        "force-vs-tag":["force","tag play","force out","tag out","throw to first","get the out","touch the base","step on","runner on","no force","field","grounder","ground ball","glove","batting order","designated hitter","DH"],
        "fly-ball-priority":["fly ball","priority","call","popup","dive","catch","sinking","line drive","play it on a hop"],
        "cutoff-roles":["cutoff","cutoff man","relay","throw home"],"bunt-defense":["bunt","bunt defense","charging","squeeze"],
        "steal-breakeven":["steal","stolen base","breakeven","success rate"],"pickoff-mechanics":["pickoff","pick off","pick-off","holding runner","hold","runner","step off","slide step","quick pitch","first move","throw over","stretch","windup","lead","back-pick","keep him close","quick to the plate"],
        "tag-up":["tag up","tagging","sacrifice fly","sac fly","fly ball","catch","runner on third","throw home","cutoff man","score","advance","relay","freeze","line drive","doubled off"],
        "backup-duties":["backup","back up","backing up","behind","trail","position","hustle","overthrow","sprint","anticipate","instinct"],
        "hit-and-run":["hit and run","hit-and-run","runner goes"],
        "double-play-turn":["double play","DP","pivot","turn two","feed","flip","toss","second base","underhand","overhand","ground ball","shovel"],
        "relay-double-cut":["relay","double cut","double relay","trail man","cutoff","line up","extra-base","outfielder"],
        "of-communication":["communication","call","priority","gap","shade","right-center","left-center","who takes","i got it","yours","mine"],
        "of-depth-arm-value":["depth","positioning","arm","throw","fly ball","drop step","read","carry","wind","sun","first step","deep","shallow","charge","defensive sub","back up","sinking","line drive","play it safe","carom","wall","corner","angle","dive"],
        "of-wall-play":["wall","carom","corner","fence"],
        "count-leverage":["count","ahead","behind","0-2","3-0","leverage","pitch","strike","ball","0-0","0-1","1-0","1-1","2-0","2-1","3-1","3-2","advantage","hitter's count","pitcher's count"],
        "pitch-sequencing":["sequence","pitch","fastball","changeup","slider","curveball","mix","setup","pattern"],
        "two-strike-approach":["two strike","2 strike","0-2","1-2","protect","shorten","choke","foul off","battle","contact","put the ball in play","2-2","last strike","swing hard","strikeout"],
        "situational-hitting":["situational","productive out","advance","hit","approach","swing","contact","at-bat","plate","hitter","batter","aggressive","sacrifice","ground ball","walk-off","homer","run","score","pitch","put the ball in play"],
        "catcher-framing":["framing","frame","present","glove","stick","receive","target","quiet hands"],
        "secondary-lead":["secondary lead","secondary","shuffle","halfway","read","reaction","break","blooper","advance","retreat","drop","tweener"],
        "eye-level-change":["eye level","high to low","tunneling"],
        "line-guarding":["guard the line","line","late inning","protect"],
        "infield-positioning":["positioning","depth","in","back","normal"],
        "rundown-mechanics":["rundown","run down","chase","tag","right to the base","belongs","trespass","trapped","between"],
        "wild-pitch-coverage":["wild pitch","passed ball","block","dirt","bounce","catcher","knuckleball","mitt","sprint","get past","bounced away"],
        "obstruction-interference":["obstruction","interference","illegal","rule","dead ball","live ball","pine tar","hits the runner","runner hit"],
        "infield-fly":["infield fly","infield fly rule"],
        "first-third":["first and third","first-and-third","double steal","1st and 3rd","runners on first","runner on 1st","runner on 3rd"],
        "scoring-probability":["scoring probability","run expectancy","RE24","run on contact","score","advance","outs","sprint home","tying run","runs"],
        "dp-positioning":["double play depth","DP depth","double play","DP","ground ball","sinker","grounder","turn two","force","depth","covers","bag","steal coverage"],
      }
      const keywords = conceptKeywords[tag]
      if (!keywords) return null
      const coreContent = [scenario.description||"",scenario.concept||"",...(scenario.options||[])].join(" ").toLowerCase()
      const fullContent = [scenario.description||"",scenario.concept||"",...(scenario.options||[]),...(scenario.explanations||[])].join(" ").toLowerCase()
      const coreMatch = keywords.some(kw => coreContent.includes(kw))
      const fullMatchCount = keywords.filter(kw => fullContent.includes(kw)).length
      if (!coreMatch && fullMatchCount < 2) return "ConceptTag alignment: tag '" + tag + "' — core content doesn't mention related keywords"
      return null
    },
  },

  // --- TIER 3: Quality suggestions (log only) ---
  tier3: {
    // Check 11: Explanation length balance
    explanationBalance(scenario) {
      const exps = scenario.explanations || []
      if (exps.length !== 4) return null
      const lens = exps.map(e => e.length)
      const avg = lens.reduce((a,b) => a+b, 0) / 4
      const maxDev = Math.max(...lens.map(l => Math.abs(l - avg)))
      if (maxDev > avg * 0.8) return "Explanation imbalance: lengths vary by more than 80% from average (range: " + Math.min(...lens) + "-" + Math.max(...lens) + " chars)"
      return null
    },
    // Check 12: Best explanation teaches WHY (has causal language)
    conceptTeachability(scenario) {
      const bestExp = (scenario.explanations || [])[scenario.best] || ""
      const causalWords = /\b(because|so that|this means|the reason|this is why|which means|this ensures|this prevents|the key is|the advantage)\b/i
      if (!causalWords.test(bestExp) && bestExp.length < 100) {
        return "Teachability: best explanation may not explain WHY — no causal language found and explanation is short (" + bestExp.length + " chars)"
      }
      return null
    },
    // Audit-discovered: Rate values should be reasonable with meaningful spread
    rateDistributionReasonable(scenario) {
      const rates = scenario.rates || []
      if (rates.length !== 4) return null
      const spread = Math.max(...rates) - Math.min(...rates)
      if (spread < 20) return "Rate spread: only " + spread + " points between best and worst (should be 20+)"
      if (rates.some(r => r < 5 || r > 95)) return "Rate extreme: rate outside 5-95 range: [" + rates.join(",") + "]"
      return null
    },
    // Audit-discovered: Historical/famous scenarios must teach strategy, not just trivia
    historicalTeachingValue(scenario) {
      const title = (scenario.title||"").toLowerCase()
      const concept = (scenario.concept||"").toLowerCase()
      const historicalNames = ["merkle","baez","gibson","koufax","clemente","bonds","buckner","ripken","mays","ruth","jeter","robinson","mantle","williams","dimaggio"]
      const isHistorical = historicalNames.some(n => title.includes(n))
      if (!isHistorical) return null
      const strategicWords = /\b(learn|teach|principle|strategy|decision|because|key|lesson|takeaway|when you|always|never)\b/i
      if (!strategicWords.test(concept)) return "Historical scenario: '" + scenario.title + "' may not teach a strategic principle — concept should explain what the player learns"
      return null
    },
    // Check 13: Success rate calibration
    rateCalibration(scenario) {
      const rates = scenario.rates || []
      const best = scenario.best
      if (rates.length !== 4 || typeof best !== "number") return null
      const warnings = []
      if (rates[best] > 90) warnings.push("best rate " + rates[best] + "% is above 90%")
      if (rates[best] < 70) warnings.push("best rate " + rates[best] + "% is below 70%")
      const worstRate = Math.min(...rates.filter((_, i) => i !== best))
      if (worstRate > 35) warnings.push("worst non-best rate " + worstRate + "% is above 35%")
      return warnings.length > 0 ? "Rate calibration: " + warnings.join("; ") : null
    },
  },

  // Run all checks on a scenario. Returns { pass, tier1Fails, tier2Warns, tier3Suggestions }
  validate(scenario, position) {
    const tier1Fails = []
    const tier2Warns = []
    const tier3Suggestions = []
    for (const [name, fn] of Object.entries(this.tier1)) {
      const result = fn(scenario, position || null)
      if (result) tier1Fails.push({ check: name, message: result })
    }
    for (const [name, fn] of Object.entries(this.tier2)) {
      const result = fn(scenario, position || null)
      if (result) tier2Warns.push({ check: name, message: result })
    }
    for (const [name, fn] of Object.entries(this.tier3)) {
      const result = fn(scenario, position || null)
      if (result) tier3Suggestions.push({ check: name, message: result })
    }
    return {
      pass: tier1Fails.length === 0,
      tier1Fails,
      tier2Warns,
      tier3Suggestions,
    }
  },
}

// ============================================================================
// LIVING DOCUMENT SYSTEM — Version tracking, changelog, annual update protocol
// ============================================================================
const BRAIN_VERSION = "2.4.0"
const BRAIN_VERSION_DATE = "2026-02-27"
const KNOWLEDGE_CHANGELOG = [
  { version:"2.4.0", date:"2026-02-27", changes:[
    "Added QUALITY_FIREWALL (10 automated checks across 3 tiers)",
    "Added CONSISTENCY_RULES (10 cross-position contradiction checks)",
    "Added LIVING_DOCUMENT protocol with version tracking and changelog",
    "Added 6 rules edge-case scenarios (rl20-rl25): batting out of order, runner's lane, catcher's interference, time play vs force, pitch clock, fan interference",
    "Added 12 outfield expansion scenarios (cf15-18, lf15-18, rf15-18): bat-angle reading, wall play, do-or-die throws, communication",
    "Added 16 variable mastery cluster scenarios (4 clusters): relay read, steal decision, bunt call, infield depth",
  ]},
  { version:"2.3.0", date:"2026-02-01", changes:[
    "Phase 2 Module 1-3 complete: knowledge maps, BRAIN constant, position principles",
    "460\u2192539 handcrafted scenarios",
    "7 knowledge maps integrated into AI prompt system",
    "RE24, count leverage, steal break-even data added to BRAIN",
  ]},
  { version:"2.0.0", date:"2025-12-01", changes:[
    "Initial Phase 2 launch: SCENARIO_BIBLE framework, BRAIN_KNOWLEDGE_SYSTEM",
    "394 base scenarios across 15 categories",
    "AI scenario generation via xAI Grok",
  ]},
]
const ANNUAL_UPDATE_CHECKLIST = {
  description: "Run every January before the new MLB season",
  sources: {
    rules: "mlb.com/official-rules — check for rule changes effective new season",
    re24: "fangraphs.com/guts.aspx (RE24 table) — update BRAIN.stats.RE24 if values shift >0.03",
    statcast: "baseballsavant.mlb.com — check for new metrics relevant to strategy",
    coaching: "ABCA annual convention proceedings, USA Baseball coaching manual updates",
    pitchClock: "MLB operations — any pitch clock timing changes affect steal-window scenarios",
  },
  checks: [
    "1. MLB Rule Changes: compare new rulebook to Section 8 of SCENARIO_BIBLE. Update affected scenarios.",
    "2. RE24 Refresh: pull latest FanGraphs RE24 matrix. If any cell changes >0.03, update BRAIN.stats.RE24.",
    "3. Count Data: verify BRAIN.stats.countData BA/OBP/SLG against latest league splits.",
    "4. Steal Break-Even: recalculate from new RE24 values. Update BRAIN.stats.stealBreakEven.",
    "5. TTO Effect: check if pitcher TTO penalties have shifted with rule changes.",
    "6. Famous Scenarios: check if any historical scenarios received new analysis or corrections.",
    "7. Pitch Clock: if timing changed, update pitch-clock-strategy scenarios and steal-window math.",
    "8. Shift Rules: verify any positioning rule changes are reflected in infield-positioning scenarios.",
    "9. Run CONSISTENCY_RULES.auditAll(SCENARIOS) — fix any new contradictions.",
    "10. Run QUALITY_FIREWALL on all scenarios — address any new tier-1 failures.",
    "11. Update BRAIN_VERSION and KNOWLEDGE_CHANGELOG with all changes.",
    "12. Update scenario counts in SCENARIO_BIBLE and CLAUDE.md.",
  ],
  deprecation: {
    process: "When a rule change makes a scenario incorrect: (1) tag scenario with deprecated:true and deprecatedReason, (2) create replacement scenario with new correct answer, (3) log in KNOWLEDGE_CHANGELOG, (4) old scenario stops appearing but stays in code for history.",
  },
  communityFeedback: {
    intake: "Coach/player reports an error via feedback form or email",
    triage: "Distinguish opinion ('I disagree') from factual error ('this contradicts MLB rule X.XX')",
    resolution: "Flag \u2192 verify against knowledge hierarchy (Tier 1-4) \u2192 update if Tier 1 or 2 source supports \u2192 log in KNOWLEDGE_CHANGELOG",
  },
}

// ============================================================================
// Level 2.2: SCENARIO GRADER — Benchmark system (grades any scenario)
// ============================================================================
function gradeScenario(scenario, position, targetConcept = null) {
  let score = 100
  const deductions = []

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: STRUCTURAL CHECKS (same as before but stricter)
  // ═══════════════════════════════════════════════════════════════

  // 1a. Must have all required fields
  const required = ["title","description","options","best","explanations","rates","concept","situation"]
  required.forEach(f => {
    if (!scenario[f]) { score -= 15; deductions.push(`missing_field_${f}`) }
  })
  if (score <= 40) return { score: Math.max(0, score), deductions, pass: false }

  // 1b. Options array must have exactly 4 items
  if ((scenario.options || []).length !== 4) { score -= 30; deductions.push("options_not_4") }
  if ((scenario.explanations || []).length !== 4) { score -= 20; deductions.push("explanations_not_4") }
  if ((scenario.rates || []).length !== 4) { score -= 20; deductions.push("rates_not_4") }

  // 1c. Best index valid
  if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) {
    score -= 30; deductions.push("invalid_best_index")
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: EXPLANATION QUALITY (stricter than before)
  // ═══════════════════════════════════════════════════════════════

  const expls = scenario.explanations || []
  expls.forEach((e, i) => {
    if (!e || e.length < 40) { score -= 8; deductions.push(`explanation_${i}_too_short`) }
    const sentences = (e.match(/[.!?]+/g) || []).length
    if (sentences < 2) { score -= 5; deductions.push(`explanation_${i}_few_sentences`) }
    // Check for generic explanations (no situation reference)
    if (e && !/\d/.test(e) && !/inning|out|runner|score|count|lead|trail|tied|timing|momentum|speed|lead|jump|read|pitcher|catcher|delivery|pickoff/i.test(e)) {
      score -= 3; deductions.push(`explanation_${i}_too_generic`)
    }
  })

  // 2b. Best explanation must reference at least 2 situation elements
  if (scenario.best !== undefined && expls[scenario.best]) {
    const bestExplLower = (expls[scenario.best] || '').toLowerCase()
    const sitRefs = [
      /\bout(s)?\b/.test(bestExplLower),
      /inning|frame/.test(bestExplLower),
      /score|lead|trail|tie|ahead|behind/.test(bestExplLower),
      /runner|base|first|second|third|home/.test(bestExplLower),
      /count|strike|ball|0-|1-|2-|3-/.test(bestExplLower),
    ].filter(Boolean).length
    if (sitRefs < 2) {
      score -= 8; deductions.push('best_explanation_lacks_situation_refs')
    }
  }

  // 2c. Best explanation must argue FOR the best option (not against another option)
  if (scenario.best !== undefined && expls[scenario.best]) {
    const bestExpl = expls[scenario.best].toLowerCase()
    const bestOpt = (scenario.options?.[scenario.best] || "").toLowerCase()
    // Check if the explanation mentions any other option more than the best option
    const otherOpts = (scenario.options || []).filter((_, i) => i !== scenario.best).map(o => o.toLowerCase().split(/\s+/).slice(0, 3).join(" "))
    const mentionsOther = otherOpts.some(other => bestExpl.includes(other) && !bestExpl.includes(bestOpt.split(/\s+/).slice(0, 3).join(" ")))
    if (mentionsOther) { score -= 15; deductions.push("best_explanation_argues_for_wrong_option") }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: RATE-BEST ALIGNMENT (stricter)
  // ═══════════════════════════════════════════════════════════════

  if (scenario.rates && typeof scenario.best === "number") {
    const maxRate = Math.max(...scenario.rates)
    if (scenario.rates[scenario.best] !== maxRate) {
      score -= 20; deductions.push("rate_best_misalignment")
    }
    // Best rate should be >= 70
    if (scenario.rates[scenario.best] < 70) {
      score -= 10; deductions.push("best_rate_too_low")
    }
    // Rate spread: should span at least 30 points
    const range = Math.max(...scenario.rates) - Math.min(...scenario.rates)
    if (range < 30) { score -= 10; deductions.push("rates_too_narrow") }
    // Worst rate should be <= 40
    if (Math.min(...scenario.rates) > 40) {
      score -= 5; deductions.push("worst_rate_too_high")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: OPTION QUALITY
  // ═══════════════════════════════════════════════════════════════

  const opts = (scenario.options || []).map(o => (o || "").toLowerCase().replace(/[^a-z\s]/g, ""))

  // 4a. No near-duplicates (word overlap)
  for (let i = 0; i < opts.length; i++) {
    for (let j = i + 1; j < opts.length; j++) {
      const words1 = new Set(opts[i].split(/\s+/).filter(w => w.length > 3))
      const words2 = new Set(opts[j].split(/\s+/).filter(w => w.length > 3))
      const shared = [...words1].filter(w => words2.has(w)).length
      const overlap = shared / Math.max(Math.min(words1.size, words2.size), 1)
      if (overlap > 0.6) { score -= 12; deductions.push(`options_${i}_${j}_too_similar`) }
    }
  }

  // 4a2. No semantic duplicates (actions that are subsets/prerequisites of each other)
  const rawOpts = (scenario.options || []).map(o => (o || "").toLowerCase())
  for (const group of SEMANTIC_OVERLAPS) {
    const matching = rawOpts.map((o, i) => group.some(phrase => o.includes(phrase)) ? i : -1).filter(i => i >= 0)
    if (matching.length >= 2) { score -= 15; deductions.push(`semantic_overlap_${matching.join("_")}`) }
  }

  // 4b. No vague options
  const vaguePatterns = /^(make the (right|smart|best) (play|decision|call))|^(do (the|something) (smart|right))|^(handle it (correctly|properly))/i
  ;(scenario.options || []).forEach((o, i) => {
    if (vaguePatterns.test(o)) { score -= 10; deductions.push(`option_${i}_too_vague`) }
    if (o && o.length < 10) { score -= 5; deductions.push(`option_${i}_too_short`) }
  })

  // 4c. Options should not combine two actions
  ;(scenario.options || []).forEach((o, i) => {
    if (o && /\b(but also|and also|while also|then also)\b/i.test(o)) {
      score -= 8; deductions.push(`option_${i}_combines_actions`)
    }
  })

  // 4d. All options same decision moment (check for time-mixing)
  const preActionWords = /\b(before the pitch|in the windup|on deck|warming up)\b/i
  const postActionWords = /\b(after the (hit|catch|throw|play)|once the ball|as the ball)\b/i
  const hasPre = (scenario.options || []).some(o => preActionWords.test(o))
  const hasPost = (scenario.options || []).some(o => postActionWords.test(o))
  if (hasPre && hasPost) { score -= 15; deductions.push("options_mix_decision_moments") }

  // 4e. All options start with the same verb → lack of strategic diversity
  const optVerbs = (scenario.options || []).map(o => (o || '').split(' ')[0].toLowerCase())
  if (optVerbs.length === 4 && new Set(optVerbs).size === 1) {
    score -= 15; deductions.push('all_options_same_verb')
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5: SITUATION CONSISTENCY
  // ═══════════════════════════════════════════════════════════════

  if (scenario.situation) {
    const s = scenario.situation
    if (s.outs !== undefined && (s.outs < 0 || s.outs > 2)) { score -= 25; deductions.push("invalid_outs") }
    if (s.count && s.count !== "-" && !/^[0-3]-[0-2]$/.test(s.count)) { score -= 20; deductions.push("invalid_count") }
    // Check if runners array is valid
    if (s.runners && !Array.isArray(s.runners)) { score -= 15; deductions.push("runners_not_array") }
    if (s.runners && s.runners.some(r => ![1,2,3].includes(r))) { score -= 15; deductions.push("invalid_runner_base") }
    // Check score format
    if (s.score && (!Array.isArray(s.score) || s.score.length !== 2)) { score -= 15; deductions.push("invalid_score_format") }
  }

  // 5b. Description must match situation (position-aware score check)
  if (scenario.description && scenario.situation) {
    const desc = scenario.description.toLowerCase()
    const s = scenario.situation
    if (s.score && s.score.length === 2) {
      const [home, away] = s.score
      const isBot = s.inning && /^bot/i.test(s.inning)
      const isTop = s.inning && /^top/i.test(s.inning)
      // Determine the player's team based on position type and inning half
      // Offensive positions (batter, baserunner): bat in their half
      // Defensive positions (pitcher, catcher, fielders): field when opponent bats
      const isOffensive = ["batter","baserunner"].includes(position)
      const isDefensive = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position)
      // Player's team score — depends on who's batting
      let playerScore, opponentScore
      if (isBot && isOffensive) { playerScore = home; opponentScore = away } // home batting
      else if (isBot && isDefensive) { playerScore = away; opponentScore = home } // away fielding
      else if (isTop && isOffensive) { playerScore = away; opponentScore = home } // away batting
      else if (isTop && isDefensive) { playerScore = home; opponentScore = away } // home fielding
      else { playerScore = home; opponentScore = away } // fallback (manager, etc.)

      if (playerScore !== undefined) {
        if (desc.includes("trailing") && playerScore > opponentScore) {
          score -= 15; deductions.push("score_direction_mismatch_trailing_but_leading")
        }
        if (desc.includes("leading") && playerScore < opponentScore) {
          score -= 15; deductions.push("score_direction_mismatch_leading_but_trailing")
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6: POSITION ROLE BOUNDARIES (expanded)
  // ═══════════════════════════════════════════════════════════════

  const FIELDER_POS = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
  const optsText = (scenario.options || []).join(" ").toLowerCase()
  const descText = (scenario.description || "").toLowerCase()

  // Fielders should not be calling pitches or making lineup decisions
  if (FIELDER_POS.includes(position)) {
    if (/\bcall(ing)?\s+(a|the)?\s*(fastball|curve|slider|changeup|pitch)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: fielder calling pitches")
    }
    if (/\bintentional\s*walk/i.test(optsText) || /\bIBB\b/.test(optsText)) {
      score -= 20; deductions.push("role_violation: fielder calling IBB")
    }
  }

  // Batters should not be making defensive decisions
  if (position === "batter") {
    if (/\b(throw to|field the|tag the runner|turn the double play)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: batter making defensive play")
    }
  }

  // Baserunners should not be batting or fielding
  if (position === "baserunner") {
    if (/\b(swing|bunt|hit|throw to first|field)\b/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: baserunner batting or fielding")
    }
  }

  // Pitcher should never be the cutoff man
  if (position === "pitcher") {
    if (/\b(act as|be the|become the)\s*cutoff/i.test(optsText)) {
      score -= 25; deductions.push("role_violation: pitcher as cutoff")
    }
  }

  // Catcher should not leave home plate to be cutoff
  if (position === "catcher") {
    if (/\b(run to|go to|move to)\s*(second|third|the outfield)/i.test(optsText)) {
      score -= 20; deductions.push("role_violation: catcher leaving home")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7: CONCEPT QUALITY
  // ═══════════════════════════════════════════════════════════════

  if (!scenario.concept || scenario.concept.length < 15) {
    score -= 15; deductions.push("weak_concept")
  }
  // Concept should explain WHY, not just what
  if (scenario.concept && !/because|so that|in order to|to prevent|to maximize|to minimize|which means|allowing|lets you|gives you|means|ensures|prevents|avoids|risks/i.test(scenario.concept)) {
    score -= 5; deductions.push("concept_missing_why")
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8: DESCRIPTION QUALITY
  // ═══════════════════════════════════════════════════════════════

  if (!scenario.description || scenario.description.length < 80) {
    score -= 10; deductions.push("description_too_short")
  }
  // Last sentence should set up decision moment
  if (scenario.description) {
    const lastSentence = scenario.description.split(/[.!?]\s+/).filter(Boolean).pop() || ""
    if (!/what should|what do you|how should|your move|you need to|the decision|what.*play|next move|your call|what.*call/i.test(lastSentence)) {
      score -= 5; deductions.push("description_missing_decision_prompt")
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9: JARGON CHECK (no stats jargon in descriptions/options)
  // ═══════════════════════════════════════════════════════════════
  const jargonPattern = /\b(RE24|OBP|wOBA|xBA|BABIP|FIP|WAR|wRC\+|ISO|WHIP|ERA\+)\b/
  if (jargonPattern.test(scenario.description || "")) {
    score -= 10; deductions.push("jargon_in_description")
  }
  if ((scenario.options || []).some(o => jargonPattern.test(o))) {
    score -= 10; deductions.push("jargon_in_options")
  }

  // SECTION 10: CONCEPT TARGET MATCH
  if (targetConcept && scenario.conceptTag) {
    if (scenario.conceptTag === targetConcept) {
      score += 3; deductions.push('concept_target_match_+3')
    } else {
      score -= 3; deductions.push('concept_drift_from_target')
    }
    console.log("[BSM Grade] Concept target:", targetConcept, "got:", scenario.conceptTag, scenario.conceptTag === targetConcept ? "(match +3)" : "(drift -3)")
  }

  return { score: Math.max(0, Math.min(100, score)), deductions, pass: score >= 67 }
}

// ============================================================================
// CONSISTENCY_RULES — Cross-Position Contradiction Detector
// 10 rules that verify multi-position scenarios agree on shared plays.
// Used by QUALITY_FIREWALL and for manual audits.
// ============================================================================
const CONSISTENCY_RULES = {
  rules: [
    // Rule 1: Cutoff on LF throw home = 3B (only fires if a WRONG position is named as cutoff)
    { id:"CR1", name:"LF\u21923B cutoff to home",
      test(text) { return /left\s*field.*cutoff.*home/i.test(text) && /(1B|first\s*base|SS|shortstop|pitcher)\s*(is|as)\s*(the\s*)?cutoff/i.test(text) ? "LF throw home cutoff must be 3B" : null }},
    // Rule 2: Cutoff on CF/RF throw home = 1B (only fires if a WRONG position is named as cutoff)
    { id:"CR2", name:"CF/RF\u21921B cutoff to home",
      test(text) { return /(center|right)\s*field.*cutoff.*home/i.test(text) && /(3B|third\s*base|SS|shortstop|pitcher)\s*(is|as)\s*(the\s*)?cutoff/i.test(text) ? "CF/RF throw home cutoff must be 1B" : null }},
    // Rule 3: Double-cut left side relay = SS lead, 2B trail
    { id:"CR3", name:"Left-side double relay = SS lead",
      test(text) { return /double\s*cut.*left/i.test(text) && /2B\s*(lead|primary)\s*relay/i.test(text) ? "Left-side double cut: SS is lead relay, not 2B" : null }},
    // Rule 4: Double-cut right side relay = 2B lead, SS trail
    { id:"CR4", name:"Right-side double relay = 2B lead",
      test(text) { return /double\s*cut.*right/i.test(text) && /SS\s*(lead|primary)\s*relay/i.test(text) ? "Right-side double cut: 2B is lead relay, not SS" : null }},
    // Rule 5: Pitcher NEVER cuts — pitcher backs up target base
    { id:"CR5", name:"Pitcher backs up, never cuts",
      test(text) { return /pitcher.*(is|as|becomes)\s*(the\s*)?(cutoff|relay|cut\s*off)/i.test(text) ? "Pitcher is NEVER the cutoff or relay man — pitcher backs up the target base" : null }},
    // Rule 6: Catcher stays home, never goes out as cutoff
    { id:"CR6", name:"Catcher stays home",
      test(text) { return /catcher.*(goes|runs|moves)\s*(out|to).*cutoff/i.test(text) ? "Catcher NEVER goes out as cutoff — stays at home plate" : null }},
    // Rule 7: Fly ball priority — outfielder over infielder, center over corners
    { id:"CR7", name:"OF priority over IF on fly balls",
      test(text) { return /infielder.*priority.*over.*outfielder/i.test(text) ? "Outfielders have priority over infielders on fly balls — reversed" : null }},
    // Rule 8: Bunt defense — SS never covers 1B on bunts
    { id:"CR8", name:"SS never covers 1B on bunt",
      test(text) { return /shortstop\s*(covers?|at)\s*(1st|first\s*base).*bunt/i.test(text) || /SS\s*(covers?|at)\s*(1st|first).*bunt/i.test(text) ? "SS never covers 1B on bunt plays — 2B covers 1B" : null }},
    // Rule 9: Steal break-even ~72% (any scenario claiming <60% or >85% is wrong)
    { id:"CR9", name:"Steal break-even ~72%",
      test(text) {
        const m = text.match(/steal.*break\s*even.*?(\d+)\s*%/i) || text.match(/(\d+)\s*%.*break\s*even.*steal/i)
        if (m) { const pct = parseInt(m[1]); if (pct < 60 || pct > 85) return "Steal break-even rate should be ~72%, got " + pct + "%" }
        return null
      }},
    // Rule 10: Force play at occupied bases — only fires when text explicitly says "tag at 2nd" on a ground ball with runner on 1st
    { id:"CR10", name:"Force play consistency",
      test(text) { return /runner\s*on\s*(1st|first).*ground(er|ball|out)/i.test(text) && /tag\s*(the\s*runner\s*)?at\s*(2nd|second)/i.test(text) ? "Runner on 1st creates FORCE at 2nd on ground ball, not a tag play" : null }},
    // Rule 11: DP depth only makes sense with <2 outs and force at 2nd
    { id:"CR11", name:"DP depth only with <2 outs",
      test(text, scenario) {
        if (!scenario) return null
        const outs = scenario.situation?.outs
        if (typeof outs !== "number") return null
        return outs === 2 && /\b(double\s*play|DP)\s*depth/i.test(text) ? "DP depth with 2 outs: double play is impossible with 2 outs" : null
      }},
    // Rule 12: Pitcher covers 1st on groundball to right side / 1B charges bunt
    { id:"CR12", name:"Pitcher covers 1st on right-side play",
      test(text) { return /1B\s*(charges?|fields?|comes?\s*in)/i.test(text) && !/pitcher\s*(covers?|goes?\s*to|takes?)\s*(1st|first)/i.test(text) && /bunt|ground\s*ball\s*(to|toward)\s*(the\s*)?(right|first\s*base)/i.test(text) ? "When 1B charges/fields, pitcher should cover 1st base" : null }},
    // Rule 13: Tag-up requires the catch to happen first — runner must wait
    { id:"CR13", name:"Tag-up: runner waits for catch",
      test(text) { return /tag\s*up.*before\s*the\s*catch|leave.*before.*caught|go\s*before.*catch/i.test(text) ? "Tag-up: runner must wait on the base until the ball is caught, then advance" : null }},
    // Rule 14: Infield fly rule only with <2 outs AND runners on 1st+2nd or bases loaded
    { id:"CR14", name:"Infield fly conditions",
      test(text, scenario) {
        if (!scenario) return null
        const runners = scenario.situation?.runners || []
        const outs = scenario.situation?.outs
        if (/infield\s*fly/i.test(text)) {
          if (typeof outs === "number" && outs >= 2) return "Infield fly rule only applies with less than 2 outs"
          if (runners.length > 0 && !(runners.includes(1) && runners.includes(2))) return "Infield fly requires runners on 1st AND 2nd (or bases loaded)"
        }
        return null
      }},
    // Rule 15: Wild pitch/passed ball — pitcher covers home plate
    { id:"CR15", name:"Pitcher covers home on WP/PB",
      test(text) { return /wild\s*pitch|passed\s*ball/i.test(text) && /catcher.*covers?\s*home/i.test(text) ? "On wild pitch/passed ball, PITCHER covers home — catcher retrieves the ball" : null }},
  ],
  // Run all consistency rules against scenario's actionable text (NOT explanations)
  // Explanations teach rules and legitimately mention wrong behavior — checking them causes false positives
  check(scenario) {
    const actionText = [
      scenario.description || "",
      ...(scenario.options || []),
      scenario.concept || ""
    ].join(" ")
    const violations = []
    for (const rule of this.rules) {
      const result = rule.test(actionText, scenario)
      if (result) violations.push({ ruleId: rule.id, name: rule.name, message: result })
    }
    return violations
  },
  // Audit all handcrafted scenarios and return any violations
  auditAll(scenarios) {
    const results = []
    for (const [position, scenarioList] of Object.entries(scenarios)) {
      for (const s of scenarioList) {
        const violations = this.check(s)
        if (violations.length > 0) {
          results.push({ position, id: s.id, title: s.title, violations })
        }
      }
    }
    return results
  }
}

// ============================================================================
// Level 3.1-3.2: Knowledge Base for the Agent Pipeline
// ============================================================================
const KNOWLEDGE_BASE = {
  version: "1.0.0",

  // Index handcrafted scenarios by concept for retrieval
  getScenariosByConceptAndPosition(position, concept, limit = 5) {
    const pool = SCENARIOS[position] || []
    if (!concept) return pool.slice(0, limit)
    const exact = pool.filter(s => s.concept && s.concept.toLowerCase().includes(concept.toLowerCase()))
    if (exact.length >= limit) return exact.slice(0, limit)
    return [...exact, ...pool.filter(s => !exact.includes(s))].slice(0, limit)
  },

  // Get relevant knowledge maps for a position
  getKnowledgeMapsForPosition(position) {
    const mapNames = MAP_RELEVANCE[position] || []
    const maps = {}
    mapNames.forEach(name => { if (KNOWLEDGE_MAPS[name]) maps[name] = KNOWLEDGE_MAPS[name] })
    return maps
  },

  // Get Brain data relevant to a situation (concept-filtered to reduce prompt noise)
  getBrainDataForSituation(position, situation, targetConcept) {
    return formatBrainForAI(position, situation || {}, targetConcept || null)
  },

  // Get position principles (all tiers)
  getPrinciplesForPosition(position) {
    return {
      condensed: AI_POS_PRINCIPLES[position] || POS_PRINCIPLES[position] || "",
      detailed: BIBLE_PRINCIPLES[position] || "",
      full: POS_PRINCIPLES[position] || ""
    }
  },

  // Get concepts for a position with prerequisite info
  getConceptsForPosition(position) {
    const domains = POS_CONCEPT_DOMAINS[position]
    if (!domains) return Object.keys(BRAIN.concepts)
    return Object.entries(BRAIN.concepts)
      .filter(([, c]) => !c.domain || domains.includes(c.domain))
      .map(([tag, c]) => ({ tag, ...c }))
  },

  // Get quality patterns (what to avoid)
  getAvoidPatterns(position) {
    const patterns = []
    // From consistency rules
    CONSISTENCY_RULES.rules.forEach(rule => {
      if (!rule.positions || rule.positions.includes(position)) {
        patterns.push(rule.description || rule.id)
      }
    })
    return patterns
  }
}

// Sprint 4.3: A/B testing framework for AI prompts
const AB_TESTS = {
  // Each test: { id, variants: [{id, weight, config}], startDate, endDate }
  ai_temperature: {
    id: "ai_temperature_v1",
    variants: [
      { id: "control", weight: 50, config: { temperature: 0.4 } },
      { id: "creative", weight: 50, config: { temperature: 0.6 } }
    ]
  },
  ai_system_prompt: {
    id: "ai_system_prompt_v1",
    variants: [
      { id: "control", weight: 50, config: { systemSuffix: "" } },
      { id: "encouraging", weight: 50, config: { systemSuffix: " Make explanations encouraging and highlight what the player can learn from mistakes." } }
    ]
  },
  // Level 2.5: A/B tests for Bible injection, Brain data, and few-shot count
  bible_injection: {
    id: "bible_injection_v1",
    variants: [
      { id: "control", weight: 50, config: { useBible: false } },
      { id: "bible_on", weight: 50, config: { useBible: true } }
    ]
  },
  brain_data_level: {
    id: "brain_data_level_v1",
    variants: [
      { id: "control", weight: 50, config: { brainLevel: "minimal" } },
      { id: "full_brain", weight: 50, config: { brainLevel: "full" } }
    ]
  },
  few_shot_count: {
    id: "few_shot_count_v1",
    variants: [
      { id: "control", weight: 50, config: { fewShotCount: 1 } },
      { id: "multi_shot", weight: 50, config: { fewShotCount: 3 } }
    ]
  },
  // Level 3.7: Agent pipeline A/B test
  agent_pipeline: {
    id: "agent_pipeline_v3",
    variants: [
      { id: "agent", weight: 85, config: { useAgent: true } },
      { id: "control", weight: 15, config: { useAgent: false } }
    ]
  },
  // Phase E: Coach persona A/B test
  coach_persona: {
    id: "coach_persona_v1",
    variants: [
      { id: "control", weight: 50, config: { usePersona: false } },
      { id: "persona_on", weight: 50, config: { usePersona: true } }
    ]
  },
  // Phase E: Session planner A/B test
  session_planner: {
    id: "session_planner_v1",
    variants: [
      { id: "control", weight: 30, config: { useSessionPlan: false } },
      { id: "planned", weight: 70, config: { useSessionPlan: true } }
    ]
  },
  // Phase E: 3-layer explanation depth A/B test
  explanation_depth: {
    id: "explanation_depth_v1",
    variants: [
      { id: "control", weight: 50, config: { useExplDepth: false } },
      { id: "layered", weight: 50, config: { useExplDepth: true } }
    ]
  }
}

// ── Population Calibration Cache (Pillar 6B) ──
let _calibrationCache = { data: null, fetchedAt: 0 }
async function getCalibrationData() {
  const ONE_HOUR = 60 * 60 * 1000
  if (_calibrationCache.data && (Date.now() - _calibrationCache.fetchedAt) < ONE_HOUR) {
    return _calibrationCache.data
  }
  try {
    const res = await fetch(`${WORKER_BASE}/analytics/difficulty-calibration`)
    if (res.ok) {
      const json = await res.json()
      _calibrationCache = { data: json.calibrations || [], fetchedAt: Date.now() }
      return _calibrationCache.data
    }
  } catch (e) {
    console.warn("[BSM] Calibration fetch failed:", e.message)
  }
  return _calibrationCache.data || []
}

// ── Baseball IQ (Pillar 7C) ──
function computeBaseballIQ(stats) {
  const mastery = stats?.masteryData?.concepts || {}
  const allConcepts = Object.keys(BRAIN.concepts || {})
  const totalConcepts = Math.max(allConcepts.length, 1)

  // Breadth: % of concepts mastered (0-1)
  const masteredEntries = Object.entries(mastery).filter(([, c]) => c.state === 'mastered')
  const breadth = masteredEntries.length / totalConcepts

  // Depth: % of mastered concepts that are diff:3 (advanced)
  const advancedMastered = masteredEntries.filter(([tag]) => {
    const concept = BRAIN.concepts[tag]
    return concept && concept.diff >= 3
  }).length
  const depth = masteredEntries.length > 0 ? advancedMastered / masteredEntries.length : 0

  // Consistency: average correctStreak across mastered concepts (normalized 0-1)
  const streaks = masteredEntries.map(([, c]) => c.correctStreak || 0)
  const consistency = streaks.length > 0
    ? Math.min(1, (streaks.reduce((a, b) => a + b, 0) / streaks.length) / 5)
    : 0.3

  // Cross-position: unique positions with >60% accuracy
  const ps = stats?.ps || {}
  const positionsStrong = Object.entries(ps)
    .filter(([, v]) => v.p >= 5 && (v.c / v.p) > 0.6).length
  const crossPosition = Math.min(positionsStrong / 8, 1.0)

  // Experience: games played (diminishing returns)
  const experience = Math.min(1, (stats?.gp || 0) / 200)

  // Weighted composite
  const raw = breadth * 0.30 + depth * 0.25 + consistency * 0.20
            + crossPosition * 0.15 + experience * 0.10

  return Math.round(50 + (raw * 110)) // Range: 50-160
}
function getIQColor(iq) {
  if (iq >= 140) return "#a855f7"
  if (iq >= 120) return "#eab308"
  if (iq >= 100) return "#22c55e"
  if (iq >= 80) return "#3b82f6"
  return "#6b7280"
}

// ── Learning Path Helpers (Pillar 3A) ──
function getCurrentPath(mastery, position) {
  const concepts = mastery?.concepts || {}
  let bestPath = null, bestProgress = -1
  for (const [name, path] of Object.entries(LEARNING_PATHS)) {
    if (!path.positions.includes(position)) continue
    const masteredInPath = path.sequence.filter(tag => concepts[tag]?.state === 'mastered').length
    if (masteredInPath >= path.sequence.length) continue // fully complete
    if (masteredInPath > bestProgress) {
      bestProgress = masteredInPath
      bestPath = { name, ...path, progress: masteredInPath }
    }
  }
  return bestPath
}
function getNextInPath(path, mastery, count) {
  const concepts = mastery?.concepts || {}
  const items = []
  let foundFirst = false
  for (let i = 0; i < path.sequence.length && items.length < count; i++) {
    const tag = path.sequence[i]
    if (concepts[tag]?.state === 'mastered') continue
    if (!foundFirst) foundFirst = true
    const isAssessment = path.assessAt?.includes(i + 1)
    items.push({ tag, type: isAssessment ? "assessment" : "progression", index: i })
  }
  return items
}

// ============================================================================
// Level 3.2: Session Planner — Plans an 8-scenario teaching sequence
// ============================================================================
function planSession(stats, position) {
  const masteryData = stats.masteryData || { concepts: {} }
  const ageGroup = stats.ageGroup || "11-12"
  const gate = CONCEPT_GATES[ageGroup]
  const available = KNOWLEDGE_BASE.getConceptsForPosition(position)
  const mastered = new Set(Object.entries(masteryData.concepts || {}).filter(([,d]) => d.state === 'mastered').map(([t]) => t))

  // Helper: filter concepts by age gate
  const isAllowed = (tag) => {
    if (!gate) return true
    if (gate.forbidden?.includes(tag)) return false
    if (gate.allowed && !gate.allowed.includes(tag)) return false
    return true
  }

  const plan = []

  // 1. Remediation: degraded concepts (1-2 slots)
  const dueReview = getDueForReview(masteryData)
  const degraded = dueReview.filter(c => c.state === 'degraded' && isAllowed(c.tag))
  degraded.slice(0, 2).forEach(c => plan.push({ type: "reinforce", concept: c.tag }))

  // 2. Prerequisite gap (1 slot)
  const recentWrong = stats.recentWrong || []
  const lastWrongTag = recentWrong.length > 0 ? recentWrong[recentWrong.length - 1] : null
  const prereqGap = lastWrongTag ? getPrereqGap(lastWrongTag, masteryData) : null
  if (prereqGap && isAllowed(prereqGap.gap) && plan.length < 3) {
    plan.push({ type: "prerequisite", concept: prereqGap.gap })
  }

  // 3. Learning progression: follow learning path if available (3-4 slots)
  const unseen = available.filter(c => !mastered.has(c.tag) && !(masteryData.concepts?.[c.tag]) && isAllowed(c.tag))
  const learning = dueReview.filter(c => c.state === 'learning' && isAllowed(c.tag))
  const usedTags = new Set(plan.map(p => p.concept))
  let added = 0

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

  // Fall back to general concept selection if path didn't fill enough slots
  if (added < 3) {
    const progression = [...learning, ...unseen.map(c => ({ tag: c.tag, state: 'unseen' }))]
    for (const c of progression) {
      if (added >= 4 || plan.length >= 7) break
      if (usedTags.has(c.tag)) continue
      plan.push({ type: c.state === 'learning' ? "review" : "introduce", concept: c.tag })
      usedTags.add(c.tag)
      added++
    }
  }

  // 4. Challenge: hardest unmastered concept (1 slot)
  const hardUnseen = unseen.filter(c => (BRAIN.concepts[c.tag]?.diff || 1) >= 2 && !usedTags.has(c.tag))
  if (hardUnseen.length > 0 && plan.length < 8) {
    const pick = hardUnseen[Math.floor(Math.random() * hardUnseen.length)]
    plan.push({ type: "challenge", concept: pick.tag })
    usedTags.add(pick.tag)
  }

  // 5. Engagement: famous play or cross-position (1 slot)
  if (plan.length < 8) {
    const specialPositions = ["famous", "rules", "counts"]
    const engagement = specialPositions[Math.floor(Math.random() * specialPositions.length)]
    plan.push({ type: "engagement", concept: null, note: engagement })
  }

  console.log("[BSM Session] Planned", plan.length, "scenarios for", position + ":", plan.map(p => p.type + ":" + (p.concept || p.note)).join(", "))
  return plan
}

// Optimal game situations for teaching specific concepts
const CONCEPT_SITUATIONS = {
  "force-vs-tag": { runners: [1, 2], outs: 1 },
  "steal-breakeven": { runners: [1], outs: 0 },
  "bunt-re24": { runners: [2], outs: 0 },
  "relay-double-cut": { runners: [2], outs: 0 },
  "infield-fly": { runners: [1, 2], outs: 0 },
  "double-play-turn": { runners: [1], outs: 0 },
  "tag-up": { runners: [3], outs: 0 },
  "hit-and-run": { runners: [1], outs: 0, count: "1-1" },
  "squeeze-play": { runners: [3], outs: 1 },
  "cutoff-roles": { runners: [2], outs: 1 },
  "backup-duties": { runners: [1], outs: 0 },
  "pickoff-mechanics": { runners: [1], outs: 0 },
  "pitch-count-mgmt": { runners: [], outs: 0 },
  "two-strike-approach": { runners: [], outs: 1, count: "1-2" },
  "count-leverage": { runners: [1], outs: 1, count: "3-1" },
  "lead-distance": { runners: [1], outs: 0 },
  "secondary-lead": { runners: [1, 2], outs: 1 },
  "first-third": { runners: [1, 3], outs: 1 },
  "wild-pitch-coverage": { runners: [3], outs: 1 },
  "bunt-defense": { runners: [1], outs: 0 },
  "situational-hitting": { runners: [2, 3], outs: 1 },
  "dp-positioning": { runners: [1], outs: 0 },
  "fly-ball-priority": { runners: [3], outs: 0 },
  "first-pitch-strike": { runners: [], outs: 0, count: "0-0" },
  "of-communication": { runners: [2], outs: 1 },
  "rundown-mechanics": { runners: [1, 2], outs: 0 },
  "scoring-probability": { runners: [2, 3], outs: 1 },
  "ibb-strategy": { runners: [2], outs: 1 },
  "obstruction-interference": { runners: [1], outs: 1 },
}

// Position-specific concept weight multipliers: bread-and-butter concepts get 3x, secondary get 2-2.5x
const CONCEPT_FUNDAMENTAL_WEIGHTS = {
  pitcher: {
    'first-pitch-strike': 3, 'count-leverage': 2.5, 'pitch-sequencing': 2,
    'pickoff-mechanics': 2, 'wild-pitch-coverage': 2, 'backup-duties': 1.5,
    'pitch-count-mgmt': 1.5, 'pitch-clock-strategy': 1
  },
  catcher: {
    'catcher-framing': 3, 'count-leverage': 2.5, 'wild-pitch-coverage': 3,
    'first-third': 2, 'dropped-third-strike': 2, 'cutoff-roles': 1.5,
    'pickoff-mechanics': 1.5, 'steal-breakeven': 1.5
  },
  firstBase: {
    'cutoff-roles': 3, 'force-vs-tag': 2.5, 'bunt-defense': 2.5,
    'double-play-turn': 2, 'backup-duties': 2, 'dp-positioning': 1.5
  },
  secondBase: {
    'double-play-turn': 3, 'dp-positioning': 2.5, 'cutoff-roles': 2.5,
    'fly-ball-priority': 2, 'bunt-defense': 2, 'relay-double-cut': 2,
    'rundown-mechanics': 1.5
  },
  shortstop: {
    'cutoff-roles': 3, 'relay-double-cut': 3, 'double-play-turn': 3,
    'fly-ball-priority': 2.5, 'bunt-defense': 2, 'force-vs-tag': 2,
    'dp-positioning': 1.5
  },
  thirdBase: {
    'bunt-defense': 3, 'cutoff-roles': 2.5, 'line-guarding': 2,
    'fly-ball-priority': 2, 'force-vs-tag': 2, 'dp-positioning': 1.5,
    'relay-double-cut': 1.5
  },
  leftField: {
    'fly-ball-priority': 3, 'backup-duties': 2.5, 'cutoff-roles': 2.5,
    'of-communication': 2, 'relay-double-cut': 2, 'tag-up': 1.5
  },
  centerField: {
    'fly-ball-priority': 3, 'of-communication': 3, 'cutoff-roles': 2.5,
    'backup-duties': 2, 'relay-double-cut': 1.5
  },
  rightField: {
    'backup-duties': 3, 'cutoff-roles': 3, 'fly-ball-priority': 2.5,
    'of-communication': 2, 'relay-double-cut': 2, 'tag-up': 1.5
  },
  batter: {
    'two-strike-approach': 3, 'count-leverage': 3, 'situational-hitting': 2.5,
    'first-pitch-strike': 2, 'hit-and-run': 1.5, 'bunt-re24': 1
  },
  baserunner: {
    'tag-up': 3, 'force-vs-tag': 3, 'secondary-lead': 2.5,
    'steal-breakeven': 2, 'scoring-probability': 2, 'lead-distance': 2,
    'rundown-mechanics': 1.5
  },
  manager: {
    'dp-positioning': 2.5, 'first-third': 2.5, 'platoon-advantage': 2,
    'times-through-order': 2, 'ibb-strategy': 1.5, 'line-guarding': 1.5,
    'bunt-re24': 1.5
  },
  famous: {},
  rules: {},
  counts: {
    'count-leverage': 3, 'two-strike-approach': 2.5, 'first-pitch-strike': 2.5,
    'pitch-sequencing': 2
  }
}

// Coaching closers: position-specific lines appended to short AI explanations instead of boilerplate
const COACHING_CLOSERS = {
  pitcher: [
    "Every pitch is a chess move — think about what the batter expects.",
    "Your job on the mound is to control the tempo and keep batters guessing.",
    "Trust your stuff and let your defense work behind you.",
    "Stay ahead in the count and you control the at-bat.",
    "The best pitchers make the batter put the ball where the defense is.",
    "Don't try to be perfect — just hit your spots and compete."
  ],
  catcher: [
    "You're the quarterback of the defense — every decision starts with you.",
    "Think one play ahead: where's the throw going if the runner breaks?",
    "Stay low, stay ready, and trust your arm.",
    "Good catchers control the running game before the steal attempt.",
    "Frame it, block it, throw it — that's the job every pitch.",
    "Talk to your pitcher. Keep him confident and focused."
  ],
  firstBase: [
    "First base is about footwork and focus — one play at a time.",
    "Stretch saves outs. A good pick saves runs.",
    "When you hold a runner, you're changing the whole game.",
    "Know where the throw is going before the ball is hit.",
    "Good first basemen make tough throws look easy."
  ],
  secondBase: [
    "The middle of the diamond is where games are won.",
    "Quick feet and a quick release — that's the double play.",
    "Know the runner's speed before the pitch. It changes everything.",
    "Cover your area and trust your partner to cover his.",
    "Positioning is half the play. Be in the right spot before the pitch."
  ],
  shortstop: [
    "Shortstop is the captain of the infield. Own every ground ball.",
    "Line up your relay and let your arm do the work.",
    "On a double play, catch it clean first — speed comes from your hands, not rushing.",
    "Know the situation before every pitch. Where's your throw going?",
    "The best shortstops make the routine play every single time."
  ],
  thirdBase: [
    "Third base is all about reactions — be ready before the pitch.",
    "On a bunt, crash hard and trust your arm.",
    "The hot corner demands quick decisions — read the ball off the bat.",
    "Know when to charge and when to stay back. Situation tells you.",
    "A strong throw from deep third saves a lot of hits."
  ],
  leftField: [
    "Hit the cutoff man. Every time. No exceptions.",
    "Back up third on every play you can get to.",
    "Read the ball off the bat — your first step decides everything.",
    "Line drives in the gap test your routes. Practice them.",
    "A good left fielder keeps doubles from becoming triples."
  ],
  centerField: [
    "You're the boss of the outfield. Call for everything you can get to.",
    "Back up every throw — be the last line of defense.",
    "Your first step on fly balls is the most important step in the game.",
    "Communication is half the job. Talk to your corners.",
    "A good center fielder covers for everyone and complains about nothing."
  ],
  rightField: [
    "Right field has the longest throw in the game — hit your cutoff.",
    "Your throw to third base can change the whole inning.",
    "Read the ball off the bat and take a good angle.",
    "Back up first on every infield throw you can get to.",
    "A strong, accurate arm in right field is a weapon."
  ],
  batter: [
    "The best hitters think before the pitch, not during it.",
    "Know what you're looking for before you step in the box.",
    "A good at-bat isn't always a hit — it's making the pitcher work.",
    "With two strikes, your job changes. Protect the plate.",
    "Situation tells you what kind of swing to take. Listen to it.",
    "The pitcher's job is to get you out. Your job is to not help him."
  ],
  baserunner: [
    "Smart baserunning wins more games than fast baserunning.",
    "Read the situation before you commit — you can't undo a bad jump.",
    "The best baserunners make their decisions before the pitch.",
    "Know the outfielder's arm before you test it.",
    "Never make the first or third out at third base.",
    "Your coach is your eyes. Trust the signs."
  ],
  manager: [
    "Good managers put their players in positions to succeed.",
    "Every decision has a tradeoff. The best choice isn't always obvious.",
    "Think two innings ahead. What does this move set up?",
    "Trust your preparation. The numbers help, but the game tells you more.",
    "Matchups matter. Put the right player in the right spot at the right time."
  ],
  famous: [
    "The greats made good decisions look easy — but they all started by learning the basics.",
    "Study the legends and you'll see: fundamentals never go out of style."
  ],
  rules: [
    "Knowing the rules gives you an edge. Use them.",
    "The best players know the rulebook as well as they know their swing."
  ],
  counts: [
    "The count changes everything. Know your advantage.",
    "Every count has a story. Learn to read it.",
    "Ahead or behind — the count tells you what to do next."
  ]
}

// Option archetypes: structural hints for AI option generation (25 top position+concept combos)
const OPTION_ARCHETYPES = {
  'shortstop:cutoff-roles': {
    moment: 'Extra-base hit to left side, runner advancing',
    correct: 'Sprint to relay position between OF and home',
    kid_mistake: 'Run to cover 2B instead of being the relay',
    sounds_smart: 'Back up another fielder',
    clearly_wrong: 'Stay near position and wait'
  },
  'shortstop:double-play-turn': {
    moment: 'Ground ball to left side, runner on first',
    correct: 'Field cleanly, make quick transfer, throw to first on the turn',
    kid_mistake: 'Rush the throw without securing the ball first',
    sounds_smart: 'Hold the ball and take the sure out at first',
    clearly_wrong: 'Try to tag the runner instead of using the force'
  },
  'shortstop:relay-double-cut': {
    moment: 'Ball hit to deep outfield gap, runners moving',
    correct: 'Line up as relay between OF and target base',
    kid_mistake: 'Go to the nearest base to cover',
    sounds_smart: 'Call off the other middle infielder to take the relay',
    clearly_wrong: 'Run toward the outfielder to help'
  },
  'catcher:catcher-framing': {
    moment: 'Ahead in count, runner on base',
    correct: 'Call pitch based on hitter weakness + count advantage',
    kid_mistake: 'Just call fastball because we\'re ahead',
    sounds_smart: 'Pitch out to check the runner',
    clearly_wrong: 'Throw whatever the pitcher wants regardless of situation'
  },
  'catcher:steal-breakeven': {
    moment: 'Runner on first showing steal signs',
    correct: 'Call pitchout or fastball up, quick release to second',
    kid_mistake: 'Wait to see if runner actually goes',
    sounds_smart: 'Signal for pickoff instead of preparing the throw-through',
    clearly_wrong: 'Ignore the runner and focus only on the batter'
  },
  'catcher:first-third': {
    moment: 'Runners on 1st and 3rd, runner on 1st breaks for 2nd',
    correct: 'Look runner back at 3rd, throw through to 2B',
    kid_mistake: 'Throw directly to 2B without checking 3rd runner',
    sounds_smart: 'Pump fake and hold the ball',
    clearly_wrong: 'Throw to 3rd base'
  },
  'pitcher:first-pitch-strike': {
    moment: 'New batter stepping in, no runners',
    correct: 'Attack the zone with a strike to get ahead',
    kid_mistake: 'Nibble the corner trying to be too perfect',
    sounds_smart: 'Start with off-speed to surprise the hitter',
    clearly_wrong: 'Throw as hard as possible regardless of location'
  },
  'pitcher:count-leverage': {
    moment: 'Ahead in count with runners on',
    correct: 'Expand the zone — make the hitter chase',
    kid_mistake: 'Groove a fastball to avoid a walk',
    sounds_smart: 'Waste a pitch way outside',
    clearly_wrong: 'Just throw strikes down the middle'
  },
  'pitcher:pickoff-mechanics': {
    moment: 'Runner with a big lead, pitcher in stretch',
    correct: 'Quick look, use pickoff move to keep runner close',
    kid_mistake: 'Step off the rubber every time (wastes tempo)',
    sounds_smart: 'Quick-pitch the batter to catch the runner leaning',
    clearly_wrong: 'Ignore the runner and just pitch'
  },
  'batter:two-strike-approach': {
    moment: 'Two strikes, runner in scoring position',
    correct: 'Shorten up, protect the plate, focus on contact',
    kid_mistake: 'Still swing for the fences with 2 strikes',
    sounds_smart: 'Take a pitch to see what the pitcher throws',
    clearly_wrong: 'Try to bunt for a hit with 2 strikes'
  },
  'batter:count-leverage': {
    moment: 'Hitter\'s count (2-0 or 3-1), runner on base',
    correct: 'Sit on your pitch — look for something to drive',
    kid_mistake: 'Swing at anything because it might be a strike',
    sounds_smart: 'Take the pitch and wait for an even better count',
    clearly_wrong: 'Try to bunt for a sacrifice'
  },
  'batter:situational-hitting': {
    moment: 'Runner on 3rd, less than 2 outs, need 1 run',
    correct: 'Focus on getting the ball in play to the right side or in the air',
    kid_mistake: 'Try to hit a home run to score the runner easily',
    sounds_smart: 'Bunt the runner home (wrong with less than 2 outs in most situations)',
    clearly_wrong: 'Wait for a walk to load the bases'
  },
  'baserunner:tag-up': {
    moment: 'Runner on 3rd, fly ball to medium-deep outfield',
    correct: 'Tag up on the catch, read the throw, score',
    kid_mistake: 'Start running on contact instead of tagging',
    sounds_smart: 'Go halfway and see what happens',
    clearly_wrong: 'Stay at third no matter what'
  },
  'baserunner:force-vs-tag': {
    moment: 'Runner on 2nd, ground ball to short',
    correct: 'Know whether it\'s a force or tag situation and react accordingly',
    kid_mistake: 'Run to the next base regardless of where the ball is hit',
    sounds_smart: 'Stay at the base to avoid being doubled off',
    clearly_wrong: 'Run back to the previous base'
  },
  'baserunner:secondary-lead': {
    moment: 'Runner on first, pitch is being delivered',
    correct: 'Take secondary lead as pitch crosses plate, read the result',
    kid_mistake: 'Stand on the base until the ball is hit',
    sounds_smart: 'Take a huge primary lead instead of a controlled secondary',
    clearly_wrong: 'Start running to second on the pitch'
  },
  'baserunner:steal-breakeven': {
    moment: 'Runner on 1st, close game, catcher has strong arm',
    correct: 'Check the breakeven math — need 70%+ success rate to attempt',
    kid_mistake: 'I\'m fast so I should steal',
    sounds_smart: 'Wait for a passed ball or wild pitch instead',
    clearly_wrong: 'Steal on the first pitch no matter what'
  },
  'firstBase:cutoff-roles': {
    moment: 'Runner on 1st, pitcher in stretch',
    correct: 'Hold runner close, give target, react to batted ball after pitch',
    kid_mistake: 'Play behind the runner (too far from bag)',
    sounds_smart: 'Crowd the runner to intimidate them',
    clearly_wrong: 'Move to fielding position before the pitch'
  },
  'firstBase:bunt-defense': {
    moment: 'Bunt situation, runner on 1st or 1st and 2nd',
    correct: 'Charge on the bunt, field, and make the right throw based on situation',
    kid_mistake: 'Stay back at the bag instead of charging',
    sounds_smart: 'Always throw to 2nd for the lead runner',
    clearly_wrong: 'Wait for the ball to come to you'
  },
  'secondBase:double-play-turn': {
    moment: 'Ground ball to the right side, runner on first',
    correct: 'Get to the bag, receive throw, make quick turn to first',
    kid_mistake: 'Stand on the base and wait for the ball to come',
    sounds_smart: 'Cheat toward second early before the pitch',
    clearly_wrong: 'Go to first base to try to beat the runner'
  },
  'thirdBase:bunt-defense': {
    moment: 'Bunt situation, runner on 1st or 2nd',
    correct: 'Crash hard, bare-hand if needed, throw to the right base',
    kid_mistake: 'Wait back at third in case the runner advances',
    sounds_smart: 'Only charge on a bunt toward the third-base line',
    clearly_wrong: 'Stay back and let the pitcher and catcher handle it'
  },
  'centerField:fly-ball-priority': {
    moment: 'Fly ball between CF and corner outfielder',
    correct: 'Call for it — center fielder has priority over corners',
    kid_mistake: 'Defer to the corner outfielder who called first',
    sounds_smart: 'Both go for it and figure it out at the last second',
    clearly_wrong: 'Assume the other fielder will get it'
  },
  'centerField:backup-duties': {
    moment: 'Ball hit to right side of infield',
    correct: 'Sprint in to back up the throw to first base',
    kid_mistake: 'Stay in center field position',
    sounds_smart: 'Back up second base instead',
    clearly_wrong: 'Watch the play and react only if there\'s an error'
  },
  'leftField:cutoff-roles': {
    moment: 'Base hit to left, runner rounding second',
    correct: 'Hit the cutoff man chest-high on the correct line',
    kid_mistake: 'Throw all the way to third or home (skipping cutoff)',
    sounds_smart: 'Hold the ball to keep the trailing runner at first',
    clearly_wrong: 'Lob it in casually'
  },
  'rightField:cutoff-roles': {
    moment: 'Single to right, runner on 2nd heading home',
    correct: 'Hit the cutoff man on the line to home plate',
    kid_mistake: 'Try to throw all the way home from right field',
    sounds_smart: 'Throw to third to prevent the batter from advancing',
    clearly_wrong: 'Hold the ball and run it in'
  },
  'manager:times-through-order': {
    moment: 'Starter tiring in 6th, pitch count rising, lead narrowing',
    correct: 'Monitor pitch count + effectiveness, have bullpen ready, make change at right time',
    kid_mistake: 'Leave the starter in because he started the game',
    sounds_smart: 'Pull him immediately at first sign of trouble',
    clearly_wrong: 'Wait until the starter gives up the lead'
  },
  // --- Cutoff/relay for all positions ---
  'secondBase:cutoff-roles': {
    moment: 'Single to right-center, runner rounding second toward third',
    correct: 'Move to relay position between CF/RF and third base',
    kid_mistake: 'Stay near second base and cover the bag',
    sounds_smart: 'Let shortstop take the relay since he has a stronger arm',
    clearly_wrong: 'Run toward the outfielder to help field the ball'
  },
  'thirdBase:cutoff-roles': {
    moment: 'Extra-base hit to left, runner coming from first toward home',
    correct: 'Position near third to receive cutoff throw, redirect to home if needed',
    kid_mistake: 'Stay on the bag waiting for a tag play',
    sounds_smart: 'Cut the ball off and hold it regardless of the runner',
    clearly_wrong: 'Run out toward left field to back up'
  },
  'pitcher:cutoff-roles': {
    moment: 'Ball hit to right field gap, runner scoring from second',
    correct: 'Sprint to back up home plate in case of overthrow',
    kid_mistake: 'Stand on the mound and watch the play develop',
    sounds_smart: 'Run to be the cutoff man between outfield and home',
    clearly_wrong: 'Cover first base'
  },
  'catcher:cutoff-roles': {
    moment: 'Double to left-center, relay throw coming to home plate',
    correct: 'Set up in front of the plate, give the cutoff man a clear target, call for cut or let it through',
    kid_mistake: 'Stand behind the plate instead of positioning up the line',
    sounds_smart: 'Move up the third-base line to cut the distance on the throw',
    clearly_wrong: 'Leave the plate to back up third base'
  },
  'centerField:cutoff-roles': {
    moment: 'Base hit to center, runner on first trying to score',
    correct: 'Hit the cutoff man chest-high on the line to home plate',
    kid_mistake: 'Throw directly to home trying to gun down the runner',
    sounds_smart: 'Hold the ball to prevent the batter from taking second',
    clearly_wrong: 'Throw to second base to keep the batter at first'
  },
  'manager:cutoff-roles': {
    moment: 'Opponent hits a gap double with runner on first, close game',
    correct: 'Have your team execute the relay — cutoff man in line, pitcher backing up home',
    kid_mistake: 'Yell for the outfielder to throw home no matter what',
    sounds_smart: 'Concede the run and hold the batter at second',
    clearly_wrong: 'Let the players figure it out on their own'
  },
  // --- Bunt defense for all positions ---
  'pitcher:bunt-defense': {
    moment: 'Sacrifice bunt situation, runner on first, less than 2 outs',
    correct: 'Field your area, check the lead runner, throw to the right base based on bunt speed',
    kid_mistake: 'Always throw to first for the easy out',
    sounds_smart: 'Let the corner infielders handle every bunt',
    clearly_wrong: 'Stay on the mound and cover the pitching area only'
  },
  'catcher:bunt-defense': {
    moment: 'Runner on second, bunt in front of the plate',
    correct: 'Pounce on the ball, check the runner at third, make the smart throw',
    kid_mistake: 'Always throw to first because it\'s the easiest play',
    sounds_smart: 'Yell for the pitcher to field it even if you\'re closer',
    clearly_wrong: 'Stay at the plate and let the pitcher handle everything'
  },
  'secondBase:bunt-defense': {
    moment: 'Sacrifice bunt, runner on first, second baseman covering',
    correct: 'Break toward first base to cover the bag on the throw',
    kid_mistake: 'Charge toward the bunt like a corner infielder',
    sounds_smart: 'Stay at normal depth and cover second base',
    clearly_wrong: 'Stand and watch to see where the ball goes first'
  },
  'shortstop:bunt-defense': {
    moment: 'Bunt with runner on second, shortstop covering',
    correct: 'Break to cover third base as the third baseman charges',
    kid_mistake: 'Charge the bunt from shortstop position',
    sounds_smart: 'Stay at shortstop depth to cover a hard bunt past the charging fielders',
    clearly_wrong: 'Cover second base'
  },
  'manager:bunt-defense': {
    moment: 'Opponent bunting with runners on first and second, nobody out',
    correct: 'Call the right bunt defense — wheel play or rotation based on the situation',
    kid_mistake: 'Have everyone stay in normal positions',
    sounds_smart: 'Crash all corner infielders regardless of runner speed',
    clearly_wrong: 'Ignore the bunt threat and play straight up'
  },
  // --- Pitcher-specific concepts ---
  'pitcher:pitch-calling': {
    moment: 'Full count, runner on third, two outs, tie game',
    correct: 'Go with your best pitch — need a strike or quality chase pitch',
    kid_mistake: 'Aim for the corner and walk the batter',
    sounds_smart: 'Throw a changeup because the hitter expects fastball',
    clearly_wrong: 'Just throw it down the middle to avoid walking in a run'
  },
  'pitcher:pitch-count-awareness': {
    moment: 'Pitcher at 85 pitches in the 6th, getting through lineup third time',
    correct: 'Work efficiently — get ahead early to keep pitch count manageable',
    kid_mistake: 'Keep throwing max effort because the game is close',
    sounds_smart: 'Start nibbling corners to get weak contact',
    clearly_wrong: 'Ignore pitch count and try to finish the game yourself'
  },
  'pitcher:holding-runners': {
    moment: 'Fast runner on first, one out, left-handed pitcher',
    correct: 'Vary hold times in the set, use slide step, make runner respect the pickoff',
    kid_mistake: 'Throw to first every time from the stretch',
    sounds_smart: 'Quick-pitch the batter to eliminate the running game',
    clearly_wrong: 'Pitch from the windup to throw harder'
  },
  'pitcher:pitching-from-stretch': {
    moment: 'Runners on base, pitcher working from the stretch',
    correct: 'Come set, check runners, deliver with consistent mechanics from the stretch',
    kid_mistake: 'Rush the delivery to keep runners from stealing',
    sounds_smart: 'Use a slide step on every pitch',
    clearly_wrong: 'Pitch from the windup anyway for better velocity'
  },
  // --- Catcher-specific concepts ---
  'catcher:blocking': {
    moment: 'Runner on third, 1-2 count, breaking ball in the dirt',
    correct: 'Drop to knees, smother the ball in front of you, keep the runner at third',
    kid_mistake: 'Try to catch it cleanly instead of blocking',
    sounds_smart: 'Backhand stab at the ball to try to frame it as a strike',
    clearly_wrong: 'Turn your head and flinch away from the pitch'
  },
  'catcher:throw-to-base': {
    moment: 'Runner stealing second on a fastball, right-handed batter',
    correct: 'Receive, quick transfer, throw to the shortstop side of second base',
    kid_mistake: 'Stand up fully before throwing, losing precious time',
    sounds_smart: 'Throw behind the runner to first base to catch him off guard',
    clearly_wrong: 'Lob the ball to second because the batter is in the way'
  },
  'catcher:pitchout': {
    moment: 'Runners on first and third, count is 1-1, runner showing steal signs',
    correct: 'Call pitchout — catch the ball standing, quick throw to second while checking third',
    kid_mistake: 'Just receive the pitch normally and hope to throw him out',
    sounds_smart: 'Call pickoff to first instead to keep the runner close',
    clearly_wrong: 'Ignore the runner and focus only on framing the next pitch'
  },
  'catcher:pitch-calling': {
    moment: 'Power hitter up, 0-1 count, nobody on, pitcher has a good slider',
    correct: 'Set up off-speed down and away after starting with a fastball — change the eye level',
    kid_mistake: 'Keep calling fastballs because the pitcher throws hard',
    sounds_smart: 'Go back-door slider on the first pitch off-speed',
    clearly_wrong: 'Let the pitcher throw whatever he wants'
  },
  // --- Batter-specific concepts ---
  'batter:hit-and-run': {
    moment: 'Runner on first, 1-1 count, contact hitter at the plate',
    correct: 'Protect the runner — swing at anything close to put the ball in play',
    kid_mistake: 'Take the pitch if it\'s a ball, even though the runner is going',
    sounds_smart: 'Try to hit behind the runner to the right side every time',
    clearly_wrong: 'Swing as hard as possible for extra bases'
  },
  'batter:sacrifice-bunt': {
    moment: 'Runner on second, nobody out, close game, need to advance the runner',
    correct: 'Square early, bunt toward first-base side, accept the out to move the runner to third',
    kid_mistake: 'Pull back and swing because the pitch looks hittable',
    sounds_smart: 'Push bunt for a hit instead of sacrificing',
    clearly_wrong: 'Bunt the ball hard back to the pitcher'
  },
  'batter:first-pitch-strike': {
    moment: 'First pitch of the at-bat, fastball over the plate',
    correct: 'Be aggressive on a hittable first pitch — best pitch you might see all at-bat',
    kid_mistake: 'Always take the first pitch no matter what',
    sounds_smart: 'Take it to see what the pitcher has today',
    clearly_wrong: 'Swing at it even if it\'s clearly outside the zone'
  },
  'batter:hitters-count': {
    moment: '3-1 count, runner on second, two outs',
    correct: 'Look for your pitch in a hittable zone — you have the advantage',
    kid_mistake: 'Swing at everything because you don\'t want to strike out',
    sounds_smart: 'Take the pitch and try to work a walk',
    clearly_wrong: 'Bunt to advance the runner'
  },
  // --- Baserunner-specific concepts ---
  'baserunner:steal-window': {
    moment: 'Runner on first, pitcher slow to the plate, catcher has average arm',
    correct: 'Time the pitcher\'s delivery — go on first move when read confirms slow time to plate',
    kid_mistake: 'Just take off running when you feel like it',
    sounds_smart: 'Wait for a breaking ball in the dirt to run',
    clearly_wrong: 'Steal on a pitchout'
  },
  'baserunner:lead-distance': {
    moment: 'Runner on first, right-handed pitcher, one out',
    correct: 'Take an aggressive but safe primary lead — 3 steps, crossover back on pickoff',
    kid_mistake: 'Take a tiny lead and stand flat-footed',
    sounds_smart: 'Take the biggest lead possible to get a better jump',
    clearly_wrong: 'Lead off in foul territory to avoid being hit by a batted ball'
  },
  'baserunner:first-to-third': {
    moment: 'Runner on first, single to right field, two outs',
    correct: 'Read the ball off the bat, round second hard, look for the coach\'s signal to advance to third',
    kid_mistake: 'Stop at second base because that\'s the next base',
    sounds_smart: 'Always go to third on a single to right',
    clearly_wrong: 'Wait at first to make sure the ball drops before running'
  },
  'baserunner:tag-up-rules': {
    moment: 'Runner on second, fly ball to medium left field, one out',
    correct: 'Go back and tag, advance to third after the catch if the throw goes home',
    kid_mistake: 'Go halfway between second and third',
    sounds_smart: 'Tag up and try to score from second on every fly ball',
    clearly_wrong: 'Run to third as soon as the ball is hit in the air'
  },
  'baserunner:pickoff-mechanics': {
    moment: 'Runner on first, left-handed pitcher, close game',
    correct: 'Watch the pitcher\'s front foot — if it goes toward home, take your secondary; if it comes to first, get back',
    kid_mistake: 'Watch the pitcher\'s head instead of the front foot',
    sounds_smart: 'Take a shorter lead against lefties so you never get picked off',
    clearly_wrong: 'Turn and watch the catcher instead of the pitcher'
  },
  // --- Manager-specific concepts ---
  'manager:pitching-change': {
    moment: 'Starter gave up back-to-back singles, pitch count at 95, 7th inning of a 2-run lead',
    correct: 'Go to the bullpen — fresh arm to protect the lead with matchup advantage',
    kid_mistake: 'Leave him in because he\'s your best pitcher',
    sounds_smart: 'Pull him only after he gives up another hit',
    clearly_wrong: 'Wait until the tying run scores to make a change'
  },
  'manager:intentional-walk': {
    moment: 'Runner on second, two outs, their best hitter up, first base open',
    correct: 'Walk the dangerous hitter to set up a force at any base and face a weaker batter',
    kid_mistake: 'Never walk anyone — make them earn it',
    sounds_smart: 'Pitch carefully to the hitter instead of an intentional walk',
    clearly_wrong: 'Walk the batter to load the bases with their cleanup hitter on deck'
  },
  'manager:defensive-positioning': {
    moment: 'Late innings, one-run lead, runner on third, less than two outs',
    correct: 'Bring the infield in to cut off the run at the plate',
    kid_mistake: 'Play at normal depth because that\'s where we always play',
    sounds_smart: 'Play halfway — compromise between cutting the run and turning a double play',
    clearly_wrong: 'Play deep for the double play and concede the run'
  },
  'manager:pinch-hitter': {
    moment: 'Trailing by one in the 7th, pitcher\'s spot due up, runners on base',
    correct: 'Send up your best available pinch hitter to maximize this scoring chance',
    kid_mistake: 'Let the pitcher hit because he\'s pitching well',
    sounds_smart: 'Save the pinch hitter for a later, more critical at-bat',
    clearly_wrong: 'Have the pitcher bunt even though you\'re trailing'
  },
  'manager:steal-sign': {
    moment: 'Runner on first, fast runner, pitcher slow to plate, one out',
    correct: 'Put the steal sign on — the matchup favors your runner against this battery',
    kid_mistake: 'Steal every time a fast runner is on base regardless of situation',
    sounds_smart: 'Wait for a 2-strike count so the catcher has to hold the ball',
    clearly_wrong: 'Never steal because it\'s too risky'
  },
  'manager:bunt-defense': {
    moment: 'Opponent has runner on second, nobody out, weak hitter up, expecting bunt',
    correct: 'Call the bunt rotation — 3B and 1B crash, SS covers 3B, 2B covers 1B',
    kid_mistake: 'Just tell the corner infielders to charge without a plan',
    sounds_smart: 'Have all four infielders play in to field the bunt',
    clearly_wrong: 'Play normal defense and react when you see the bunt'
  },
  // --- Infield positions for double-play ---
  'firstBase:double-play-turn': {
    moment: 'Ground ball to first, runner on first, less than two outs',
    correct: 'Field the ball, throw to second for the force, get back to the bag for the return throw',
    kid_mistake: 'Just step on first and hold the ball for one out',
    sounds_smart: 'Throw to second and run to cover the pitcher\'s area',
    clearly_wrong: 'Try to tag the runner going to second yourself'
  },
  'thirdBase:double-play-turn': {
    moment: 'Hard grounder to third, bases loaded, one out',
    correct: 'Step on third for the force, fire to first for the double play',
    kid_mistake: 'Throw home for the force because the run matters most',
    sounds_smart: 'Throw to second to start a 5-4-3 around-the-horn double play',
    clearly_wrong: 'Tag the runner coming from second and then throw to first'
  },
  // --- Outfield backup duties ---
  'leftField:backup-duties': {
    moment: 'Ground ball to shortstop, runner on first',
    correct: 'Sprint in to back up any throw to third base',
    kid_mistake: 'Stay in left field position and watch the play',
    sounds_smart: 'Back up second base on the throw from shortstop',
    clearly_wrong: 'Run toward the infield to help field the ball'
  },
  'rightField:backup-duties': {
    moment: 'Bunt play, throw going to first base',
    correct: 'Sprint in to back up the throw to first base',
    kid_mistake: 'Stay in right field position and watch',
    sounds_smart: 'Back up second base in case of an overthrow at first',
    clearly_wrong: 'Run toward home plate to back up the catcher'
  },
  // --- Outfield communication/priority ---
  'leftField:fly-ball-priority': {
    moment: 'Fly ball in the left-center gap, you and center fielder converging',
    correct: 'Defer to center fielder if they call it — CF has priority over corners',
    kid_mistake: 'Both keep running for the ball without communicating',
    sounds_smart: 'Call it loudly since you got there first',
    clearly_wrong: 'Peel off without anyone calling the ball'
  },
  'rightField:fly-ball-priority': {
    moment: 'High fly ball in right-center, both RF and CF converging',
    correct: 'Listen for CF\'s call — center fielder has priority, yield if they call it',
    kid_mistake: 'Keep running hard even after CF calls you off',
    sounds_smart: 'Always take it since it\'s on your side of the field',
    clearly_wrong: 'Stop running and assume CF will get it without a call'
  },
  // --- Additional key concepts ---
  'shortstop:force-vs-tag': {
    moment: 'Runner on second, ground ball to short, no force at third',
    correct: 'Recognize the tag play — field and throw to first for the sure out, or tag the runner if in the baseline',
    kid_mistake: 'Throw to third expecting a force out',
    sounds_smart: 'Run the ball to third to tag the base',
    clearly_wrong: 'Throw home even though no one is heading there'
  },
  'firstBase:holding-runners': {
    moment: 'Runner on first, pitcher in stretch, close game',
    correct: 'Hold the runner on the bag, give the pitcher a good target for pickoffs',
    kid_mistake: 'Play behind the runner in normal fielding position',
    sounds_smart: 'Stand directly on the bag so the runner can\'t get a lead',
    clearly_wrong: 'Move toward second base to be ready for a ground ball'
  },
  'secondBase:steal-breakeven': {
    moment: 'Runner on first attempting a steal, throw coming from catcher',
    correct: 'Cover the bag, straddle it, receive the throw and apply a quick tag',
    kid_mistake: 'Stand behind the base and wait for the ball',
    sounds_smart: 'Position on the outfield side of the bag regardless of the throw',
    clearly_wrong: 'Charge toward home to cut off the throw'
  },
  'thirdBase:tag-up-rules': {
    moment: 'Runner on third tagging up, fly ball caught in medium outfield',
    correct: 'Straddle the bag and watch the runner\'s foot — make sure they tag before advancing',
    kid_mistake: 'Watch the outfielder catch the ball instead of watching the runner\'s foot',
    sounds_smart: 'Stand behind the bag blocking the runner from leaving early',
    clearly_wrong: 'Leave the bag to go receive the relay throw'
  },
  'pitcher:balk-rule': {
    moment: 'Runners on base, pitcher starting from the set position',
    correct: 'Come to a complete stop in the set, don\'t flinch or make deceptive moves',
    kid_mistake: 'Rock or sway in the set position without realizing it\'s a balk',
    sounds_smart: 'Skip the set position and quick-pitch to catch runners off guard',
    clearly_wrong: 'Fake a throw to first without stepping off the rubber'
  },
  'catcher:wild-pitch-passed-ball': {
    moment: 'Runner on third, pitch bounces in the dirt past the catcher',
    correct: 'Find the ball immediately, get to it, turn and throw or check the runner',
    kid_mistake: 'Chase the ball with your back to the runner',
    sounds_smart: 'Let the pitcher cover home while you retrieve the ball',
    clearly_wrong: 'Stay at the plate and hope the ball stays nearby'
  },
  'manager:mound-visit': {
    moment: 'Pitcher struggling, walks the leadoff batter, looks shaky',
    correct: 'Make a mound visit to settle the pitcher, review the plan, buy bullpen time',
    kid_mistake: 'Immediately pull the pitcher after one walk',
    sounds_smart: 'Save the mound visit for a more critical situation later',
    clearly_wrong: 'Yell instructions from the dugout instead of going out'
  },
  'baserunner:squeeze-play': {
    moment: 'Runner on third, one out, suicide squeeze is on',
    correct: 'Break for home as the pitcher starts the delivery — commit fully regardless of pitch location',
    kid_mistake: 'Wait to see if the batter makes contact before running',
    sounds_smart: 'Read the pitch first and only go if it\'s a good bunt',
    clearly_wrong: 'Start running before the pitcher comes set'
  }
}

// Concept priority weights: higher = more likely to be selected
function getConceptWeight(tag, conceptData, playerMasteryData, position) {
  let weight = 10 * (CONCEPT_FUNDAMENTAL_WEIGHTS[position]?.[tag] || 1) // base weight scaled by position fundamentals

  const mastery = playerMasteryData.concepts?.[tag]
  const concept = conceptData || BRAIN.concepts[tag]
  if (!concept) return weight

  // Prerequisites met bonus: concepts whose prereqs are all mastered get priority
  const prereqs = concept.prereqs || []
  const allPrereqsMastered = prereqs.every(p => playerMasteryData.concepts?.[p]?.state === 'mastered')
  if (prereqs.length > 0 && allPrereqsMastered) weight += 20
  if (prereqs.length > 0 && !allPrereqsMastered) weight -= 30 // deprioritize if prereqs not met

  // Foundational concepts get boosted (concepts with no prereqs that many others depend on)
  if (prereqs.length === 0) weight += 10

  // Recently wrong: high priority to reinforce
  if (mastery?.state === 'degraded') weight += 25
  if (mastery?.state === 'learning') weight += 15

  // Never-seen concepts that are age-appropriate: moderate priority
  if (!mastery) weight += 5

  // Difficulty alignment: prefer concepts matching player's current level
  if (concept.difficulty) {
    const posStats = playerMasteryData.posStats?.[position] || {}
    const posAcc = posStats.p > 0 ? Math.round((posStats.c / posStats.p) * 100) : 50
    const playerDiff = posAcc > 75 ? 3 : posAcc > 50 ? 2 : 1
    if (concept.difficulty === playerDiff) weight += 10
    if (Math.abs(concept.difficulty - playerDiff) > 1) weight -= 15
  }

  return Math.max(1, weight) // never zero
}

function weightedRandomSelect(items, weightFn) {
  const weights = items.map(weightFn)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1] // fallback
}

// ============================================================================
// Level 3.3: Planner Agent — Decides what to teach and selects context
// ============================================================================
function planScenario(position, stats, conceptsLearned = [], recentWrong = [], targetConcept = null, aiHistory = []) {
  const playerMasteryData = stats.masteryData || { concepts: {} }
  const posStats = stats.ps?.[position] || { p: 0, c: 0 }
  const posAcc = posStats.p > 0 ? Math.round((posStats.c / posStats.p) * 100) : 50

  // 1. Determine teaching goal
  let teachingGoal = "introduce"
  let selectedConcept = targetConcept

  // Build position-relevant concept set to filter all paths
  const positionConcepts = new Set(KNOWLEDGE_BASE.getConceptsForPosition(position).map(c => c.tag))

  // Check for prereq gaps (only if the gap concept is relevant to this position)
  const lastWrongTag = recentWrong.length > 0 ? recentWrong[recentWrong.length - 1] : null
  const prereqGap = lastWrongTag ? getPrereqGap(lastWrongTag, playerMasteryData) : null
  if (prereqGap && positionConcepts.has(prereqGap.gap)) {
    teachingGoal = "prerequisite"
    selectedConcept = prereqGap.gap
  }

  // Check for degraded/learning concepts — filtered to this position only
  const dueReview = getDueForReview(playerMasteryData)
  const degraded = dueReview.filter(c => c.state === 'degraded' && positionConcepts.has(c.tag))
  const learning = dueReview.filter(c => c.state === 'learning' && positionConcepts.has(c.tag))
  console.log("[BSM Agent] Plan: filtered " + dueReview.length + " due concepts to " + degraded.length + " degraded + " + learning.length + " learning for " + position)

  if (!selectedConcept && degraded.length > 0) {
    teachingGoal = "reinforce"
    selectedConcept = weightedRandomSelect(degraded, d => getConceptWeight(d.tag, null, playerMasteryData, position)).tag
  } else if (!selectedConcept && learning.length > 0) {
    teachingGoal = "review"
    selectedConcept = weightedRandomSelect(learning, l => getConceptWeight(l.tag, null, playerMasteryData, position)).tag
  } else if (!selectedConcept) {
    // Introduce something new
    const available = KNOWLEDGE_BASE.getConceptsForPosition(position)
    const mastered = new Set(Object.entries(playerMasteryData.concepts || {}).filter(([,d]) => d.state === 'mastered').map(([t]) => t))
    const unseen = available.filter(c => !mastered.has(c.tag) && !(playerMasteryData.concepts?.[c.tag]))
    if (unseen.length > 0) {
      selectedConcept = weightedRandomSelect(unseen, u => getConceptWeight(u.tag, null, playerMasteryData, position)).tag
      teachingGoal = "introduce"
    }
  }

  // 1b. Age gate: if selected concept is forbidden for this age group, swap it
  const ageGroup = stats.ageGroup || "11-12"
  const gate = CONCEPT_GATES[ageGroup]
  if (gate && selectedConcept) {
    const isForbidden = gate.forbidden?.includes(selectedConcept)
    const hasAllowed = gate.allowed && !gate.allowed.includes(selectedConcept)
    if (isForbidden || hasAllowed) {
      // Pick a different concept that's allowed
      const available = KNOWLEDGE_BASE.getConceptsForPosition(position)
      const allowed = available.filter(c => {
        if (gate.forbidden?.includes(c.tag)) return false
        if (gate.allowed && !gate.allowed.includes(c.tag)) return false
        return true
      })
      if (allowed.length > 0) {
        selectedConcept = weightedRandomSelect(allowed, a => getConceptWeight(a.tag, null, playerMasteryData, position)).tag
        if (teachingGoal === "prerequisite") teachingGoal = "introduce"
      }
    }
  }

  // 2. Select difficulty
  const difficulty = posAcc > 75 ? 3 : posAcc > 50 ? 2 : 1

  // 3. Select reference scenarios
  const exampleScenarios = KNOWLEDGE_BASE.getScenariosByConceptAndPosition(position, selectedConcept, 3)

  // 4. Select relevant knowledge map (concept-specific, not all maps)
  const relevantMapKey = CONCEPT_MAP_MATCH[selectedConcept]
  const knowledgeMaps = relevantMapKey && KNOWLEDGE_MAPS[relevantMapKey] ? { [relevantMapKey]: KNOWLEDGE_MAPS[relevantMapKey] } : {}

  // 5. Get Brain data (concept-filtered to reduce prompt noise)
  const brainData = KNOWLEDGE_BASE.getBrainDataForSituation(position, {}, selectedConcept)

  // 6. Get avoid patterns from deduplication
  const recentAI = aiHistory.filter(h => h.position === position).slice(-10)
  const avoidTitles = recentAI.map(h => h.title)
  const avoidPatterns = KNOWLEDGE_BASE.getAvoidPatterns(position)

  // 7. Build player context string
  const playerContext = [
    `Level ${getLvl(stats.pts).n}, ${posStats.p} games at ${posAcc}% accuracy`,
    degraded.length > 0 ? `Degraded concepts: ${degraded.map(c=>c.tag).join(", ")}` : null,
    learning.length > 0 ? `Learning: ${learning.slice(0,3).map(c=>c.tag).join(", ")}` : null,
    recentWrong.length > 0 ? `Recent wrong: ${recentWrong.slice(-3).join("; ")}` : null,
  ].filter(Boolean).join(". ")

  return {
    teachingGoal,
    targetConcept: selectedConcept,
    difficulty,
    knowledgeMaps: Object.keys(knowledgeMaps),
    brainData,
    exampleScenarios: exampleScenarios.map(s => ({
      title: s.title, diff: s.diff, concept: s.concept,
      description: s.description,
      situation: s.situation,
      options: s.options, best: s.best,
      explanations: s.explanations,
      rates: s.rates, anim: s.anim || "strike"
    })),
    avoidPatterns,
    avoidTitles,
    playerContext,
    position,
    principles: KNOWLEDGE_BASE.getPrinciplesForPosition(position),
    ageGate: gate || null,
    ageGroup,
    situationHint: selectedConcept ? (CONCEPT_SITUATIONS[selectedConcept] || null) : null,
    coachVoice: getCoachVoice(stats)
  }
}

// ============================================================================
// Level 3.4: Generator Agent — Builds focused prompt from Planner's output
// ============================================================================
function buildAgentPrompt(plan, previousScenario = null) {
  const { position, difficulty, teachingGoal, targetConcept, playerContext, principles, brainData, exampleScenarios, avoidPatterns, avoidTitles, flaggedAvoidText, ageGate, ageGroup, situationHint, coachVoice, promptPatch } = plan

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: IDENTITY & CONSTRAINTS (non-negotiable rules)
  // ═══════════════════════════════════════════════════════════════
  const tier1 = `POSITION: ${position}
DIFFICULTY: ${difficulty} (${difficulty === 1 ? "Rookie — ages 6-10, basic concepts, simple language" : difficulty === 2 ? "Pro — ages 11-14, intermediate strategy, proper baseball terms" : "All-Star — ages 15-18, advanced analytics-informed decisions"})
TEACHING GOAL: ${teachingGoal} the concept "${targetConcept}"
${teachingGoal === "introduce" ? "This player has NEVER seen this concept. Build the scenario so the correct answer is intuitive if they think carefully. Make the wrong options represent common beginner mistakes." : ""}
${teachingGoal === "reinforce" ? "This player learned this concept but is forgetting it. Create a scenario where they must APPLY it in a new situation they haven't seen before." : ""}
${teachingGoal === "review" ? "This player is still learning this concept. Create a slightly harder variation to deepen understanding." : ""}
${teachingGoal === "prerequisite" ? "This player is missing a foundation concept. Teach the prerequisite before advancing." : ""}

POSITION RULES (NEVER violate these):
${principles || "Follow standard baseball rules for this position."}

${ageGate ? `AGE RESTRICTIONS (${ageGroup}): ${ageGate.forbidden ? "Do NOT use these concepts: " + ageGate.forbidden.join(", ") : ""} ${ageGate.allowed ? "Only use these concepts: " + ageGate.allowed.join(", ") : ""}` : ""}`

  // ═══════════════════════════════════════════════════════════════
  // TIER 1.5: CRITICAL QUALITY RULES (closes gap with standard pipeline)
  // ═══════════════════════════════════════════════════════════════
  const isOffensive = ["batter","baserunner"].includes(position)
  const isDefensive = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position)

  const scoreRules = `
SCORE RULES (READ FIRST — score errors are the #1 quality issue):
- score=[HOME, AWAY]. Home team bats in "Bot" half, away team bats in "Top" half.
- ${isOffensive ? "This is an OFFENSIVE position. If the inning is 'Bot X', the player is on the HOME team (score[0]). If 'Top X', the player is on the AWAY team (score[1])." : isDefensive ? "This is a DEFENSIVE position. If the inning is 'Bot X', the player is on the AWAY team (score[1]). If 'Top X', the player is on the HOME team (score[0])." : "Manager can be either team. Pick one and be consistent."}
- If you say "trailing 4-3" the player's team score MUST be 3, opponent MUST be 4.
- If you say "up by 2" the player's team score MUST be exactly 2 more than the opponent.
- "Tying run" = the run that ties the game. "Go-ahead run" = the run that takes the lead. Do NOT confuse these.
- Double-check: read your description, find every score reference, and verify it matches the score array.`

  const descriptionStyle = `
DESCRIPTION STYLE: Write descriptions as if explaining a game situation to a young baseball player. Use simple, everyday language. Do NOT include statistics, RE24 values, batting averages, or advanced analytics in the description or options. Save numbers for explanations only.`

  const posActionText = POS_ACTIONS_MAP[position] || POS_ACTIONS_MAP.manager

  const FIELDER_POS_LIST = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
  const isFielder = FIELDER_POS_LIST.includes(position)
  const analyticsRules = isFielder
    ? "ANALYTICS: Bunting with 0 outs usually lowers run expectancy. Sac bunt only justified with weak hitter, late game, need 1 run. IBBs, pitching changes, and defensive shifts are MANAGER decisions — do NOT create fielder scenarios about these topics."
    : position === "baserunner"
    ? "ANALYTICS: Steals need ~72% success to break even. Bunting usually lowers RE24. IBBs under 2023+ rules give the runner no decision (automatic advance) — NEVER create baserunner scenarios about IBBs."
    : position === "batter"
    ? "ANALYTICS: Bunting with 0 outs usually lowers RE24. Sac bunt only justified with weak hitter, late game, need 1 run. Two-strike approach = protect the plate. IBBs and pitching changes are not batter decisions."
    : "ANALYTICS: Intentional walks almost always wrong per The Book (Tango). NEVER make IBB the best answer unless runners on 2nd+3rd with 1 out. Never put go-ahead/winning run on base via IBB. IBB REQUIRES 1B open."

  const positionBoundaries = `
POSITION-ACTION BOUNDARIES: ${posActionText}
NEVER give this position options that belong to another position. Fielders do NOT call IBBs, shift the defense, call for pitchouts, or make pitching changes. Baserunners CANNOT "yell at pitcher", "call a play", "signal the batter".
${analyticsRules}`

  const auditInstruction = `
AUDIT CHECKLIST (verify before responding):
- All 4 options are actions THIS position performs at the SAME decision point
- rates[best] is the HIGHEST rate value
- score=[HOME,AWAY] matches the description text
- Every explanation references the SPECIFIC game situation
- Best answer index (0-3) should vary — do NOT always make the best answer index 0 or 1`

  const yellowOptionRule = `
CRITICAL OPTION RULE: At least ONE wrong option must be "acceptable but not optimal" (rate 45-65).
This is the YELLOW option — something a decent player might do that isn't terrible but isn't the best play.
DO NOT make all 3 wrong options obviously terrible. Real baseball decisions involve choosing between
two reasonable options, not picking the one sane choice among three absurd ones.`

  const explanationRules = `
EXPLANATION RULES:
- Wrong answer explanations must say what SPECIFICALLY goes wrong (e.g., "the runner advances to third" NOT "this could lead to problems")
- Best answer explanation must name the POSITIVE OUTCOME (e.g., "you cut down the lead runner" NOT "this maintains defensive pressure")
- BANNED PHRASES (never use): "this decision has real consequences", "maintaining defensive pressure", "this could lead to", "this approach fails by", "this action allows you to", "in this situation", "real consequences for the game", "based on the current situation"
- Write like a COACH talking to a player after the play: "Here's why that works..." or "The problem with that is..."
- Every explanation must be 1-3 sentences. No more. Short and specific beats long and vague.
- CRITICAL: Each explanation must specifically argue for or against THAT option. The best answer explanation must clearly state why THIS choice is optimal, not why another option is wrong. Anchor every explanation to the action described in its option text.`

  const voiceExamples = `
EXPLANATION VOICE (follow GOOD, never write like BAD):
GOOD: "You throw to the cutoff man because he's lined up with home — if you try to throw all the way home from deep center, the ball bounces and the trail runner takes third. Trust the relay."
BAD: "Throwing to the cutoff man is the correct decision as it maintains proper relay alignment and prevents defensive breakdowns that could allow additional baserunner advancement."

GOOD: "With two strikes, you choke up and protect the plate. Swinging for the fence here means you're probably striking out, and the runner on third is counting on you to put it in play."
BAD: "In a two-strike situation with runners in scoring position, adopting a shortened swing approach maximizes contact probability while maintaining situational awareness of baserunner positioning."

GOOD: "The problem with throwing to second here is the runner on third scores easily. You just traded an out for a run. Bad deal."
BAD: "This approach fails by prioritizing the secondary baserunner while neglecting the immediate scoring threat, resulting in a suboptimal defensive outcome."`

  const qualityRules = scoreRules + descriptionStyle + positionBoundaries + auditInstruction + yellowOptionRule + explanationRules + voiceExamples

  // Option archetype injection
  const archetypeKey = `${position}:${targetConcept || ''}`
  const archetype = OPTION_ARCHETYPES[archetypeKey]
  const archetypeSection = archetype ? `
OPTION BLUEPRINT (use as structural guide, NOT literal text):
Typical moment: ${archetype.moment}
Option A (correct fundamental): ${archetype.correct}
Option B (common kid mistake): ${archetype.kid_mistake}
Option C (sounds smart but wrong here): ${archetype.sounds_smart}
Option D (clearly wrong): ${archetype.clearly_wrong}
Generate specific game language — do NOT copy these hints word-for-word.
` : ''

  // ═══════════════════════════════════════════════════════════════
  // WRONG OPTION DESIGN (structural guide for mistake types)
  // ═══════════════════════════════════════════════════════════════
  const wrongOptionDesign = `
WRONG OPTION DESIGN:
Each wrong option should represent a DIFFERENT type of mistake:
1. BEGINNER MISTAKE — What someone who doesn't know the concept would try. This is the most common error coaches see in young players. Rate: 15-30.
2. EXPERIENCED PLAYER'S MISTAKE — Sounds smart but is wrong in THIS specific situation. This is where real learning happens — the player has to think about WHY it's wrong even though it sounds reasonable. Rate: 45-60.
3. PANIC REACTION — What happens when a player freezes, rushes, or doesn't think before acting. Rate: 10-25.

The EXPERIENCED PLAYER'S MISTAKE (option 2) is the most important. It's what separates a good scenario from a mediocre one. If you can't think of a plausible-sounding wrong answer, the scenario concept probably isn't rich enough.
`

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: BASEBALL KNOWLEDGE (data to inform the correct answer)
  // ═══════════════════════════════════════════════════════════════
  const tier2Parts = []
  if (brainData) tier2Parts.push(brainData)
  if (situationHint) tier2Parts.push(`SUGGESTED GAME SITUATION for "${targetConcept}": ${JSON.stringify(situationHint)}`)
  const tier2 = tier2Parts.length > 0 ? `\nBASEBALL REFERENCE DATA:\n${tier2Parts.join("\n")}` : ""

  const topicsText = AI_SCENARIO_TOPICS[position] || ""
  const topicsSection = topicsText ? `\nSCENARIO TOPIC IDEAS:\n${topicsText}` : ""

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: QUALITY EXAMPLES (show what good looks like)
  // ═══════════════════════════════════════════════════════════════
  const exampleText = exampleScenarios && exampleScenarios.length > 0
    ? exampleScenarios.map((s, i) => `EXAMPLE ${i + 1}:\n${JSON.stringify(s)}`).join("\n\n")
    : ""
  const tier3 = exampleText ? `\nSTUDY THESE EXAMPLES — match this quality level:\n${exampleText}` : ""

  // Also include the targeted few-shot example (matches standard pipeline)
  const fewShotExample = getAIFewShot(position, targetConcept, difficulty)
  const fewShotSection = fewShotExample ? `\nHIGH-QUALITY EXAMPLE (match this quality level):\n${fewShotExample}` : ""

  // ═══════════════════════════════════════════════════════════════
  // ANTI-REPETITION
  // ═══════════════════════════════════════════════════════════════
  const avoidSection = []
  if (avoidTitles?.length > 0) avoidSection.push(`Do NOT reuse these titles: ${avoidTitles.join(", ")}`)
  if (avoidPatterns?.length > 0) avoidSection.push(`Avoid these overused patterns: ${avoidPatterns.join("; ")}`)
  if (flaggedAvoidText) avoidSection.push(flaggedAvoidText)
  if (previousScenario) avoidSection.push(`The PREVIOUS scenario was about "${previousScenario.title}" (${previousScenario.concept}). Create something COMPLETELY DIFFERENT — different situation, different concept application, different game state.`)
  const avoidText = avoidSection.length > 0 ? `\nAVOID REPETITION:\n${avoidSection.join("\n")}` : ""

  // ═══════════════════════════════════════════════════════════════
  // PLAYER CONTEXT
  // ═══════════════════════════════════════════════════════════════
  const contextSection = playerContext ? `\nPLAYER CONTEXT: ${playerContext}` : ""

  // ═══════════════════════════════════════════════════════════════
  // COACH VOICE
  // ═══════════════════════════════════════════════════════════════
  const voiceSection = coachVoice?.voice ? `\nCOACH VOICE: Write explanations in this tone: "${coachVoice.voice}"` : ""

  // ═══════════════════════════════════════════════════════════════
  // PROMPT PATCH (dynamic overrides)
  // ═══════════════════════════════════════════════════════════════
  const patchSection = promptPatch ? `\nADDITIONAL INSTRUCTIONS:\n${promptPatch}` : ""

  // Dynamic error reinforcement from error history (matches standard pipeline)
  let errorReinforcement = ""
  try {
    const errStore = JSON.parse(localStorage.getItem("bsm_ai_errors") || "{}")
    const roleViolations = errStore[position + ":role-violation"] || 0
    const parseErrors = errStore[position + ":parse"] || 0
    const qualityErrors = errStore[position + ":quality-firewall"] || 0
    if (roleViolations >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios for this position had role violations. Double-check EVERY option is an action this specific position performs."
    if (parseErrors >= 2) errorReinforcement += "\nCRITICAL: Previous responses had JSON errors. Respond with ONLY valid JSON — no markdown, no text before or after."
    if (qualityErrors >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios failed quality checks. Ensure explanations are detailed (3+ sentences), all options are distinct, and success rates are realistic."
  } catch {}

  // Randomize template values to prevent patterns (matches standard pipeline)
  const tv = getRandomTemplateValues()

  return `${tier1}${qualityRules}${archetypeSection}${tier3}${fewShotSection}${wrongOptionDesign}${topicsSection}${tier2}${avoidText}${contextSection}${voiceSection}${patchSection}${errorReinforcement}

NOW: Generate ONE scenario as a JSON object with this EXACT structure:
{
  "title": "Short memorable title (3-6 words)",
  "diff": ${difficulty},
  "description": "3-5 sentence game situation. Last sentence sets up the decision moment.",
  "situation": {"inning": "${tv.inning}", "outs": ${tv.outs}, "count": "${tv.count}", "runners": ${tv.runners}, "score": [HOME, AWAY]},
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "best": ${tv.best},
  "explanations": ["Why A is best/wrong", "Why B is best/wrong", "Why C is best/wrong", "Why D is best/wrong"],
  "explDepth": [{"simple":"1 sentence kid version","why":"2-3 sentence strategic reasoning","data":"RE24/stat reference or n/a"},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."}],
  "rates": ${tv.rates},
  "concept": "One sentence: the baseball concept this teaches and WHY it matters.",
  "anim": "one of: steal, score, hit, throwHome, doubleplay, strike, strikeout, groundout, flyout, catch, advance, walk, bunt, safe, freeze"
}
explDepth: array of 4 objects (one per option). "simple"=1 sentence a 6-year-old understands. "why"=2-3 sentences of strategic reasoning. "data"=1 sentence referencing a real stat — write "n/a" if no stat applies.
count format: "B-S" (0-3 balls, 0-2 strikes) or "-". runners: [] empty, [1]=1st, [2]=2nd, [1,2]=1st+2nd, [1,2,3]=loaded. rates: optimal 75-90, decent 45-65, poor 10-40.`
}

// ============================================================================
// Level 3.5: Grader Agent — Validates generated scenario against quality checklist
// ============================================================================
function gradeAgentScenario(scenario, plan) {
  const grade = gradeScenario(scenario, plan.position, plan.targetConcept)

  // Additional agent-specific checks
  const agentDeductions = []

  // Check if concept matches plan
  if (plan.targetConcept && scenario.concept) {
    const conceptLower = scenario.concept.toLowerCase()
    const targetLower = plan.targetConcept.toLowerCase()
    if (!conceptLower.includes(targetLower) && !targetLower.includes(conceptLower)) {
      // Relaxed match — check for keyword overlap
      const targetWords = targetLower.split(/[\s-]+/).filter(w => w.length > 3)
      const conceptWords = conceptLower.split(/[\s-]+/).filter(w => w.length > 3)
      const overlap = targetWords.filter(w => conceptWords.some(cw => cw.includes(w) || w.includes(cw))).length
      if (overlap === 0) {
        grade.score -= 10
        agentDeductions.push("concept_mismatch: plan targeted '" + plan.targetConcept + "' but got '" + scenario.concept + "'")
      }
    }
  }

  // Check difficulty matches plan
  if (scenario.diff !== plan.difficulty) {
    grade.score -= 5
    agentDeductions.push("difficulty_mismatch: plan=" + plan.difficulty + " got=" + scenario.diff)
  }

  // Check for avoided titles
  if (plan.avoidTitles && plan.avoidTitles.length > 0) {
    const titleLower = (scenario.title || "").toLowerCase()
    const dup = plan.avoidTitles.find(t => t.toLowerCase() === titleLower)
    if (dup) {
      grade.score -= 25
      agentDeductions.push("title_duplicate: " + dup)
    }
  }

  // Pedagogical checks — does this scenario actually TEACH?
  const bestExpl = scenario.explanations?.[scenario.best] || ""
  if (bestExpl.length < 80) {
    grade.score -= 10
    agentDeductions.push("best_explanation_too_brief_for_teaching")
  }
  if (!/because|since|this means|the reason|so that|which is why/i.test(bestExpl)) {
    grade.score -= 5
    agentDeductions.push("missing_causal_reasoning_in_best_explanation")
  }
  const brainWarning = QUALITY_FIREWALL.tier1.brainContradiction(scenario)
  if (brainWarning) {
    grade.score -= 15
    agentDeductions.push("brain_contradiction: " + brainWarning)
  }

  // All wrong options too obviously wrong (all < 30)
  const wrongRates = scenario.rates?.filter((_, i) => i !== scenario.best) || []
  if (wrongRates.every(r => r < 30)) {
    grade.score -= 10
    agentDeductions.push('all_wrong_too_obvious')
  }
  // No yellow option (45-65 range among wrong answers)
  if (!wrongRates.some(r => r >= 45 && r <= 65)) {
    grade.score -= 5
    agentDeductions.push('no_yellow_option')
  }

  grade.agentDeductions = agentDeductions
  grade.score = Math.max(0, grade.score)
  // Pass threshold: 65 after normalization (auto-fixes already applied before grading).
  // Raised from 55→65: quality floor improvement. Standard pipeline threshold is now 70.
  grade.pass = grade.score >= 65
  return grade
}

// ============================================================================
// Level 3.6: Cross-Player Learning Loop
// ============================================================================
function buildLearningContribution(stats, position, scenarioId, concept, isCorrect, isAI, difficulty) {
  return {
    scenario_id: scenarioId,
    position,
    concept: concept || "",
    difficulty: difficulty || 1,
    is_correct: isCorrect,
    is_ai: isAI,
    session_hash: (stats.sessionHash || "anon").slice(0, 32),
    age_group: stats.ageGroup || "11-12",
    level: getLvl(stats.pts).n,
    timestamp: Date.now()
  }
}

// Batch send learning contributions to server
let _learningBatch = []
function queueLearningContribution(contribution) {
  _learningBatch.push(contribution)
  if (_learningBatch.length >= 10) flushLearningBatch()
}
async function flushLearningBatch() {
  if (_learningBatch.length === 0) return
  const batch = _learningBatch.splice(0, 50)
  try {
    await fetch(WORKER_BASE + "/analytics/population-difficulty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch })
    })
  } catch (e) {
    console.warn("[BSM] Learning batch send failed:", e.message)
    // Re-queue failed items (up to limit)
    if (_learningBatch.length < 100) _learningBatch.push(...batch)
  }
}

// ============================================================================
// Phase 0: Multi-Agent Pipeline (Claude Opus + Vectorize RAG)
// ============================================================================
async function generateWithMultiAgent(position, stats, signal, targetConcept = null) {
  const t0 = Date.now()
  console.group("[BSM Multi-Agent Pipeline]")
  try {
    // Build player context from stats
    const ps = stats?.ps?.[position]
    const accuracy = ps && ps.p > 0 ? Math.round(ps.c / ps.p * 100) : null
    const recentWrong = (stats?.recentWrong || []).slice(0, 5)
    const masteryData = stats?.masteryData || { concepts: {} }

    let playerContext = ""
    if (accuracy !== null) playerContext += `Position accuracy: ${accuracy}% over ${ps.p} plays. `
    if (recentWrong.length > 0) playerContext += `Recent wrong concepts: ${recentWrong.join(', ')}. `

    // Add mastery info for this position's concepts
    const posConcepts = KNOWLEDGE_BASE.getConceptsForPosition(position)
    const masteredConcepts = posConcepts.filter(c => masteryData.concepts?.[c.tag]?.state === 'mastered').map(c => c.name)
    const learningConcepts = posConcepts.filter(c => masteryData.concepts?.[c.tag]?.state === 'learning').map(c => c.name)
    if (masteredConcepts.length) playerContext += `Mastered: ${masteredConcepts.slice(0, 5).join(', ')}. `
    if (learningConcepts.length) playerContext += `Still learning: ${learningConcepts.slice(0, 5).join(', ')}. `
    if (!playerContext) playerContext = "New player, no history."

    // Send position rules from client (RAG will also retrieve server-side)
    const principles = KNOWLEDGE_BASE.getPrinciplesForPosition(position)

    // 70B flag: route through fine-tuned model when enabled
    const use70B = stats?.useLLM70B === true
    const endpoint = use70B ? LLM_70B_URL : WORKER_BASE + "/v1/multi-agent"
    if (use70B) console.log("[BSM] Using fine-tuned 70B model")

    const res = await Promise.race([
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          playerContext,
          positionRules: principles.condensed || principles.full || "",
          targetConcept: targetConcept || null,
          maxRetries: 1
        }),
        signal
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Multi-agent timeout")), 90000))
    ])

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: "Unknown" } }))
      console.warn("[BSM Multi-Agent] HTTP error:", res.status, err.error?.message)
      return null
    }

    const data = await res.json()
    console.log(`[BSM Multi-Agent] Success in ${data.pipeline.totalElapsed}ms:`,
      `"${data.scenario.title}"`,
      `critique=${data.critique.score}/10 (pass=${data.critique.pass})`,
      `stages=${data.pipeline.stages.length}`,
      `tokens=${data.pipeline.totalInputTokens + data.pipeline.totalOutputTokens}`,
      `RAG hits=${data.pipeline.ragHits || 0}`)

    // Count format enforcement — default neutral count if missing
    if (data.scenario.situation && (!data.scenario.situation.count || data.scenario.situation.count === "-")) {
      data.scenario.situation.count = "1-1"  // default neutral count
    }
    // Score-inning perspective check
    if (data.scenario.situation) {
      const inn = data.scenario.situation.inning || ""
      const desc = (data.scenario.description || "").toLowerCase()
      const [hm, aw] = data.scenario.situation.score || [0, 0]
      if (inn.startsWith("Bot") && hm > aw && /losing|behind|trailing/i.test(desc)) {
        console.warn("[BSM] AI scenario has score-inning mismatch: Bot inning, home leading, but desc says losing")
      }
    }
    // Rate auto-validation — ensure best index matches highest rate
    if (data.scenario.rates && typeof data.scenario.best === "number") {
      const maxRate = Math.max(...data.scenario.rates)
      if (data.scenario.rates[data.scenario.best] !== maxRate) {
        const oldBest = data.scenario.best
        data.scenario.best = data.scenario.rates.indexOf(maxRate)
        console.warn("[BSM] Auto-fixed AI scenario best:", oldBest, "\u2192", data.scenario.best)
      }
    }

    // Run client-side quality firewall too (belt and suspenders)
    const fwResult = QUALITY_FIREWALL.validate(data.scenario, position)
    if (!fwResult.pass) {
      console.warn("[BSM Multi-Agent] Client firewall rejected:", fwResult.tier1Fails)
      return null
    }

    // Run ROLE_VIOLATIONS check (the server critic may not have position-specific regexes)
    if (ROLE_VIOLATIONS[position]) {
      const allText = [data.scenario.description, ...(data.scenario.options || []), ...(data.scenario.explanations || [])].join(" ")
      const bestText = [(data.scenario.options || [])[data.scenario.best] || "", (data.scenario.explanations || [])[data.scenario.best] || ""].join(" ")
      for (const pattern of ROLE_VIOLATIONS[position]) {
        if (pattern.test(bestText)) {
          console.warn("[BSM Multi-Agent] Role violation in best answer for", position)
          return null
        }
      }
    }

    // Run CONSISTENCY_RULES check
    const crViolations = CONSISTENCY_RULES.check(data.scenario)
    if (crViolations.length > 0) {
      console.warn("[BSM Multi-Agent] Consistency violations:", crViolations.map(v => v.message).join("; "))
      return null
    }

    // Shuffle answers client-side
    shuffleAnswers(data.scenario)

    return { scenario: data.scenario, agentGrade: data.critique, plan: data.scenario.agentPlan }
  } catch (e) {
    console.warn("[BSM Multi-Agent] Error:", e.message)
    return null
  } finally {
    console.groupEnd()
  }
}

// ============================================================================
// Level 3.7: Agent Pipeline with Shadow Mode
// ============================================================================
async function generateWithAgentPipeline(position, stats, conceptsLearned, recentWrong, signal, targetConcept, aiHistory, flaggedAvoidText = "", previousScenario = null, timeoutMs = 55000) {
  // Stage 1: Plan
  const plan = planScenario(position, stats, conceptsLearned, recentWrong, targetConcept, aiHistory)
  if (flaggedAvoidText) plan.flaggedAvoidText = flaggedAvoidText

  // Stage 1.5: Non-blocking calibration patch (Pillar 6B)
  try {
    const calData = _calibrationCache.data || []
    const match = calData.find(c => c.concept === plan.targetConcept && c.position === position)
    if (match) {
      plan.promptPatch = match.adjustment === "too_hard"
        ? `NOTE: This concept ("${match.concept}") has a population correct rate of ${match.correctRate}%. Players find it very difficult. Make the correct answer more obvious than usual. The best explanation should be especially clear with a concrete example.`
        : `NOTE: This concept ("${match.concept}") has a ${match.correctRate}% correct rate. Increase the nuance — add a tempting distractor option that requires deeper understanding to distinguish from the correct answer.`
      console.log("[BSM Agent] Calibration patch applied:", match.adjustment, match.concept, match.correctRate + "%")
    }
  } catch (e) { /* non-blocking */ }

  console.log("[BSM Agent] Plan:", plan.teachingGoal, "concept:", plan.targetConcept, "diff:", plan.difficulty, plan.situationHint ? "situationHint:" + JSON.stringify(plan.situationHint) : "")

  // Stage 2: Generate (using agent prompt)
  const agentPrompt = buildAgentPrompt(plan, previousScenario)

  // Use the existing AI infrastructure but with the agent's focused prompt
  const lvl = getLvl(stats.pts)
  const posStats = stats.ps?.[position] || { p: 0, c: 0 }

  try {
    const abConfigs = getActiveABConfigs(stats.sessionHash || "")
    const tempConfig = abConfigs.ai_temperature || {}
    const aiTemp = tempConfig.temperature || 0.4

    const fetchOpts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-4",
        max_tokens: 1800,
        temperature: aiTemp,
        messages: [
          { role: "system", content: "You are the world's most experienced baseball coach, teaching kids 6-18 via Baseball Strategy Master.\n\nOUTPUT: Respond with ONLY valid JSON. No markdown, no code fences, no text outside JSON.\n\nGOLDEN RULE: Every scenario teaches ONE baseball concept that drives the situation, options, correct answer, and explanations.\n\nEXPLANATION RULES:\n- 2-4 sentences each. BEST: action → WHY correct in THIS situation → positive result. WRONG: action → WHY it fails → concrete consequences.\n- Player perspective (\"you\", \"your team\"). No jargon (RE24/OBP/wOBA) in descriptions/options — stats in explDepth.data only.\n- EVERY explanation must reference the specific game situation.\n- ALWAYS use second person ('you') when addressing the player. Never say 'What should the pitcher do?' — say 'What should you do?'\n\nOPTION RULES:\n- All 4 at the SAME decision moment. Each specific and concrete. Strategically distinct. Include one common kid mistake. No near-duplicates.\n- CRITICAL: Each option must be a DISTINCT physical action. If one action is a prerequisite of another (e.g., 'step off the rubber' is part of 'throw over to first'), they are NOT distinct — pick one or the other. Similarly: 'take the pitch' vs 'don't swing', 'sacrifice bunt' vs 'lay down a bunt', 'go to the bullpen' vs 'make a pitching change' are the same action.\n\nCRITICAL — 2ND PERSON PERSPECTIVE: The player IS the position. The description MUST use 'you' and 'your'. Write 'You\\'re the pitcher on the mound...' NOT 'The pitcher is on the mound...' Write 'What should you do?' NOT 'What should the pitcher do?' This is non-negotiable — every description must read as if the player is living the moment.\n\nPOSITION BOUNDARIES: Only actions this position actually performs. score=[HOME,AWAY]. Home bats in Bot half. outs: 0-2. count: \"B-S\" or \"-\". runners must match description." },
          { role: "user", content: agentPrompt }
        ]
      })
    }
    if (signal) fetchOpts.signal = signal

    const response = await Promise.race([
      fetch(AI_PROXY_URL, fetchOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), Math.max(10000, timeoutMs)))
    ])

    if (!response.ok) throw new Error(`API ${response.status}`)
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ""
    if (!text) throw new Error("Empty response")

    const sanitized = sanitizeAIResponse(text)
    const scenario = JSON.parse(sanitized)

    // Strip [BEST] prefix if AI copied it from examples
    if (scenario.options) scenario.options = scenario.options.map(o => o.replace(/^\[BEST\]\s*/i, ''))
    // Fix 3rd-person perspective → 2nd-person ("you")
    fixPerspective(scenario)

    // ══════════════════════════════════════════════════════════════
    // NORMALIZE FIRST, THEN GRADE (fixes: grading raw scenario bug)
    // Auto-fix structural issues BEFORE grading so the grader doesn't
    // penalize things we'd auto-correct anyway (-20 rate alignment,
    // -15 runners, -25 outs were causing false failures)
    // ══════════════════════════════════════════════════════════════
    if (!scenario.situation) scenario.situation = {}
    if (!Array.isArray(scenario.situation.runners)) scenario.situation.runners = []
    scenario.situation.runners = [...new Set(scenario.situation.runners.filter(r => [1,2,3].includes(Number(r))).map(Number))]
    if (!Array.isArray(scenario.situation.score)) scenario.situation.score = [0, 0]
    scenario.situation.outs = Math.max(0, Math.min(2, Number(scenario.situation.outs) || 0))
    if (!scenario.situation.inning) scenario.situation.inning = "Mid"
    if (!scenario.situation.count || (scenario.situation.count !== "-" && !/^[0-3]-[0-2]$/.test(scenario.situation.count))) scenario.situation.count = "-"
    // Count format enforcement — default neutral count if still placeholder
    if (scenario.situation && (!scenario.situation.count || scenario.situation.count === "-")) {
      scenario.situation.count = "1-1"  // default neutral count
    }
    // Score-inning perspective check
    if (scenario.situation) {
      const inn = scenario.situation.inning || ""
      const desc = (scenario.description || "").toLowerCase()
      const [aw, hm] = scenario.situation.score || [0, 0]
      if (inn.startsWith("Bot") && hm > aw && /losing|behind|trailing/i.test(desc)) {
        console.warn("[BSM] AI scenario has score-inning mismatch: Bot inning, home leading, but desc says losing")
      }
    }
    if (!ANIMS.includes(scenario.anim)) scenario.anim = "strike"
    if (![1,2,3].includes(scenario.diff)) scenario.diff = plan.difficulty
    // Auto-fix rates alignment
    if (scenario.rates && scenario.rates.length === 4 && typeof scenario.best === "number") {
      const maxRate = Math.max(...scenario.rates)
      if (scenario.rates[scenario.best] !== maxRate) {
        console.log("[BSM Agent] Auto-fixed rate/best alignment:", scenario.best, "->", scenario.rates.indexOf(maxRate))
        scenario.best = scenario.rates.indexOf(maxRate)
      }
      // Ensure best rate >= 70
      if (scenario.rates[scenario.best] < 70) {
        scenario.rates[scenario.best] = Math.max(75, scenario.rates[scenario.best])
      }
      // Ensure rate spread >= 30
      const rateRange = Math.max(...scenario.rates) - Math.min(...scenario.rates)
      if (rateRange < 30) {
        const minIdx = scenario.rates.indexOf(Math.min(...scenario.rates))
        scenario.rates[minIdx] = Math.max(10, scenario.rates[scenario.best] - 50)
      }
      // Ensure worst rate <= 40 (but don't touch yellow options 45-65)
      scenario.rates = scenario.rates.map((r, i) => {
        if (i === scenario.best) return r
        if (r >= 45 && r <= 65) return r  // preserve yellow options
        return r > 40 ? Math.min(40, r) : r
      })
      // Ensure at least one yellow option (45-65 range) among wrong answers
      const yellowExists = scenario.rates.some((r, i) => i !== scenario.best && r >= 45 && r <= 65)
      if (!yellowExists) {
        const wrongIdxs = scenario.rates.map((r, i) => ({r, i})).filter(x => x.i !== scenario.best).sort((a,b) => b.r - a.r)
        if (wrongIdxs.length > 0) {
          scenario.rates[wrongIdxs[0].i] = 50 + Math.floor(Math.random() * 10) // 50-59
        }
      }
    }

    // Auto-fix: Replace short explanations with coaching closers instead of boilerplate
    if (scenario.explanations && scenario.explanations.length === 4) {
      scenario.explanations = scenario.explanations.map((expl, i) => {
        if (!expl) return "This choice affects how the play unfolds."
        const sentences = (expl.match(/[.!?]+/g) || []).length
        if (expl.length < 40 || sentences < 2) {
          const closers = COACHING_CLOSERS[plan.position] || COACHING_CLOSERS.batter
          const closer = closers[Math.floor(Math.random() * closers.length)]
          const cleanExpl = expl.endsWith('.') || expl.endsWith('!') || expl.endsWith('?') ? expl : expl + '.'
          return `${cleanExpl} ${closer}`
        }
        return expl
      })
    }

    // Stage 3: Grade (now grading the NORMALIZED scenario)
    const grade = gradeAgentScenario(scenario, plan)
    console.log("[BSM Agent] Grade:", grade.score, "pass:", grade.pass,
      "deductions:", grade.deductions.length,
      grade.deductions.length > 0 ? "| " + grade.deductions.join(" | ") : "",
      (grade.agentDeductions || []).length > 0 ? "| AGENT: " + grade.agentDeductions.join(" | ") : "")

    if (!grade.pass) {
      console.warn("[BSM Agent] Scenario failed grading (" + grade.score + "/100), falling back to standard pipeline")
      return null // Caller falls back to standard generateAIScenario
    }

    // Set metadata
    scenario.id = `agent_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
    scenario.isAI = true
    scenario.cat = "ai-generated"
    scenario.scenarioSource = "agent"
    scenario.agentGrade = grade.score
    scenario.agentPlan = { goal: plan.teachingGoal, concept: plan.targetConcept, difficulty: plan.difficulty }

    // Shuffle answer positions so best isn't always index 0
    shuffleAnswers(scenario)

    // Track title for module-level dedup
    _recentAITitles.push({ title: (scenario.title || "").toLowerCase(), position })
    if (_recentAITitles.length > 20) _recentAITitles.shift()

    // Log prompt version for agent pipeline (non-blocking)
    try {
      const _pvSysLen = JSON.parse(fetchOpts.body).messages?.[0]?.content?.length || 0
      const _pvHash = btoa(agentPrompt.slice(0, 200)).slice(0, 40)
      fetch(WORKER_BASE + "/analytics/prompt-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id, position, promptHash: _pvHash,
          systemMessageLength: _pvSysLen, userMessageLength: agentPrompt.length,
          injectedPatches: flaggedAvoidText.includes("QUALITY PATCHES") ? 1 : 0,
          injectedCalibration: plan.promptPatch ? 1 : 0,
          injectedErrorPatterns: flaggedAvoidText.includes("ERROR PATTERN") ? 1 : 0,
          injectedAuditInsights: flaggedAvoidText.includes("WEAK SPOTS") ? 1 : 0,
          generationGrade: grade.score || 0,
          pipeline: "agent", temperature: aiTemp
        })
      }).catch(() => {})
    } catch {}

    return { scenario, agentGrade: grade, plan }
  } catch (err) {
    console.warn("[BSM Agent] Pipeline failed:", err.message)
    return null
  }
}

function getABGroup(testId, sessionHash) {
  // Deterministic assignment based on session hash + test ID
  const str = (sessionHash || analyticsSessionHash) + ":" + testId
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 100
}

function getABVariant(testName, sessionHash) {
  const test = AB_TESTS[testName]
  if (!test) return { id: "control", config: {} }
  const bucket = getABGroup(test.id, sessionHash)
  let cumulative = 0
  for (const variant of test.variants) {
    cumulative += variant.weight
    if (bucket < cumulative) return variant
  }
  return test.variants[0]
}

function getActiveABConfigs(sessionHash) {
  const configs = {}
  for (const [name] of Object.entries(AB_TESTS)) {
    const variant = getABVariant(name, sessionHash)
    configs[name] = { variant: variant.id, ...variant.config }
  }
  return configs
}

async function generateAIScenario(position, stats, conceptsLearned = [], recentWrong = [], signal = null, targetConcept = null, aiHistory = [], previousScenario = null, budgetMs = 75000, skipAgent = false) {
  // Setup phase — network calls not counted in AI budget
  let flaggedAvoidText = ""
  let promptPatchText = ""
  let realGameFeelText = ""
  let auditInsightText = ""
  try {
    const [patternRes, patchRes, auditRes] = await Promise.all([
      Promise.race([
        fetch(`${WORKER_BASE}/feedback-patterns?position=${encodeURIComponent(position)}&since=30`),
        new Promise((_, rej) => setTimeout(() => rej(new Error("pattern-timeout")), 3000))
      ]).catch(() => null),
      Promise.race([
        fetch(`${WORKER_BASE}/prompt-patches?position=${encodeURIComponent(position)}&limit=3`),
        new Promise((_, rej) => setTimeout(() => rej(new Error("patch-timeout")), 2000))
      ]).catch(() => null),
      Promise.race([
        fetch(`${WORKER_BASE}/analytics/audit-insights?position=${encodeURIComponent(position)}&days=30`),
        new Promise((_, rej) => setTimeout(() => rej(new Error("audit-timeout")), 2000))
      ]).catch(() => null),
    ])
    // Semantic avoidance from feedback patterns
    if (patternRes?.ok) {
      const patternData = await patternRes.json()
      const patterns = patternData.patterns || []
      if (patterns.length > 0) {
        const CATEGORY_LABELS = { wrong_answer: "WRONG ANSWER", unrealistic: "UNREALISTIC", wrong_position: "WRONG POSITION", confusing_text: "CONFUSING", too_easy_hard: "DIFFICULTY" }
        // Sanitize user-generated text to prevent prompt injection
        const sanitizeFeedback = (text) => (text || "").replace(/[^a-zA-Z0-9\s.,!?'-]/g, "").slice(0, 80)
        flaggedAvoidText = "\nAVOID THESE PATTERNS — players flagged these issues in AI scenarios:\n" +
          patterns.slice(0, 3).map(p => {
            const label = CATEGORY_LABELS[p.flag_category] || p.flag_category
            const titles = p.sample_titles ? ` Titles: ${sanitizeFeedback(p.sample_titles)}` : ""
            const comments = p.sample_comments ? ` Players said: ${sanitizeFeedback(p.sample_comments)}` : ""
            return `- ${label} (${p.count} flags, ${p.position || position}):${titles}${comments}`
          }).join("\n") +
          "\nDo NOT repeat these mistake patterns."
        console.log("[BSM] Injected", patterns.length, "semantic avoidance patterns for", position)
      }
    }
    // Dynamic prompt patches from accumulated data
    if (patchRes?.ok) {
      const patchData = await patchRes.json()
      const patches = patchData.patches || []
      if (patches.length > 0) {
        promptPatchText = "\nDYNAMIC QUALITY PATCHES (auto-generated from player data):\n" +
          patches.map(p => `- ${p.patch_text}`).join("\n")
        console.log("[BSM] Injected", patches.length, "prompt patches for", position)
      }
    }
    // Audit insights — weak spots from self-audit scores
    if (auditRes?.ok) {
      const auditData = await auditRes.json()
      const weakSpots = auditData.weakSpots || []
      if (weakSpots.length > 0) {
        const dimLabels = { avg_realistic: "realism", avg_options: "option quality", avg_coach: "coach accuracy", avg_tone: "tone" }
        auditInsightText = "\nAI QUALITY WEAK SPOTS (from self-audit — these scored poorly, improve them):\n" +
          weakSpots.slice(0, 3).map(w => {
            const worstDim = ["avg_realistic","avg_options","avg_coach","avg_tone"]
              .filter(d => w[d] != null)
              .sort((a, b) => (w[a] || 5) - (w[b] || 5))[0]
            const dimNote = worstDim ? ` Weakest dimension: ${dimLabels[worstDim]} (${w[worstDim]}/5).` : ""
            const feedback = w.feedback_samples ? ` Fix suggestions: ${w.feedback_samples.slice(0, 120)}` : ""
            return `- ${w.position}: avg audit ${w.avg_score}/5 over ${w.audit_count} scenarios.${dimNote}${feedback}`
          }).join("\n") +
          "\nFocus on improving these specific quality dimensions."
        console.log("[BSM] Injected", weakSpots.length, "audit weak spots for", position)
      }
    }
  } catch (err) {
    console.warn("[BSM] Feedback/patch/audit fetch failed (non-blocking):", err.message)
  }

  // Phase C: Real game feel context injection
  try {
    const posSituations = REAL_GAME_SITUATIONS[position] || REAL_GAME_SITUATIONS[
      ["famous","rules","counts"].includes(position) ? "manager" : "manager"
    ] || []
    if (posSituations.length > 0) {
      // Pick 2-3 random situations
      const shuffled = [...posSituations].sort(() => Math.random() - 0.5)
      const picks = shuffled.slice(0, Math.min(3, shuffled.length))
      realGameFeelText = "\nREAL GAME FEEL — these describe how this position actually works in real games:\n" +
        picks.map(s => `- Setup: "${s.setup}" → Real: ${s.real_decision}. Common AI mistake: ${s.common_mistake}`).join("\n")
    }
    // Decision windows — enforce same-moment options
    const dwKey = ["firstBase","secondBase","shortstop","thirdBase"].includes(position) ? "infielder" :
      ["leftField","centerField","rightField"].includes(position) ? "outfielder" : position
    const windows = DECISION_WINDOWS[dwKey]
    if (windows) {
      realGameFeelText += "\nDECISION TIMING — all 4 options MUST occur in the SAME moment:\n" +
        Object.entries(windows).map(([k, v]) => `- ${k}: ${v}`).join("\n") +
        "\nPick ONE window. Do NOT mix pre-pitch actions with after-contact actions."
    }
    // Coaching voice guidance
    if (COACHING_VOICE.tone_guidance.length > 0) {
      const voicePicks = [...COACHING_VOICE.tone_guidance].sort(() => Math.random() - 0.5).slice(0, 3)
      realGameFeelText += "\nCOACHING VOICE — explanations should sound like a coach, not a textbook:\n" +
        voicePicks.map(v => `- "${v}"`).join("\n")
    }
  } catch (e) {
    console.warn("[BSM] Real game feel injection failed:", e.message)
  }

  // Budget starts HERE — only counts actual AI generation time (setup network calls excluded)
  const _aiFlowStart = Date.now()

  // Phase 0: Multi-Agent Pipeline (Claude Opus + RAG) — primary path
  let multiAgentTimedOut = false
  if (!skipAgent) {
    console.log("[BSM] Attempting multi-agent pipeline (Claude Opus)")
    const maStart = Date.now()
    const maResult = await generateWithMultiAgent(position, stats, signal, targetConcept)
    if (maResult?.scenario) {
      // Set qualityGrade from critique score (10-point → 100-point scale) so pool submission works
      const critiqueScore = maResult.agentGrade?.score || maResult.agentGrade?.overallScore || 0
      maResult.scenario.qualityGrade = Math.round(critiqueScore * 10)
      maResult.scenario.scenarioSource = "multi-agent"
      console.log("[BSM] Multi-agent pipeline succeeded, qualityGrade:", maResult.scenario.qualityGrade)
      // Submit to server pool — multi-agent scenarios are highest quality and should seed the community pool
      if (maResult.scenario.qualityGrade >= 75) {
        submitToServerPool(maResult.scenario, position, critiqueScore, 0, maResult.scenario.qualityGrade)
      }
      return maResult
    }
    // Check if player aborted (clicked Skip or navigated away)
    if (signal?.aborted) {
      console.log("[BSM] Generation aborted by user after multi-agent")
      return { scenario: null, error: "aborted" }
    }
    // Track if multi-agent timed out (took >50s) — signals infrastructure stress
    multiAgentTimedOut = (Date.now() - maStart) > 50000
    if (multiAgentTimedOut) {
      console.warn("[BSM] Multi-agent timed out after", Math.round((Date.now() - maStart)/1000) + "s — infrastructure may be stressed, skipping xAI agent pipeline")
    } else {
      console.warn("[BSM] Multi-agent pipeline failed (not timeout), falling through to xAI pipeline")
    }
  }

  // Calibration injection for standard pipeline (matching agent pipeline behavior)
  let calibrationText = ""
  try {
    const calData = _calibrationCache.data || await getCalibrationData()
    if (calData && calData.length > 0) {
      const relevantCal = calData.filter(c => c.position === position || !c.position)
      const conceptMatch = targetConcept ? relevantCal.find(c => c.concept === targetConcept) : null
      const positionMatches = relevantCal.filter(c => c.position === position).slice(0, 3)
      if (conceptMatch) {
        calibrationText = conceptMatch.adjustment === "too_hard"
          ? `\nCALIBRATION: "${conceptMatch.concept}" has ${conceptMatch.correctRate}% accuracy across all players. This is very hard — make the correct answer more learnable. Use a clearer scenario and more instructive explanation.`
          : `\nCALIBRATION: "${conceptMatch.concept}" has ${conceptMatch.correctRate}% accuracy. This is too easy — add nuance. Include a tempting distractor that requires deeper understanding.`
      } else if (positionMatches.length > 0) {
        calibrationText = "\nPOSITION CALIBRATION DATA:\n" +
          positionMatches.map(c => `- "${c.concept}": ${c.correctRate}% accuracy (${c.adjustment})`).join("\n")
      }
    }
  } catch (e) { /* non-blocking */ }

  // Abort check before xAI pipelines
  if (signal?.aborted) return { scenario: null, error: "aborted" }

  // xAI health check — skip both xAI pipelines if recently down (applies to prefetch too)
  if (isXaiDown()) {
    console.warn("[BSM] xAI marked down — skipping agent + standard pipelines, falling to handcrafted")
    return { scenario: null, error: "xai-down" }
  }

  // Level 3.7: Agent pipeline A/B test — shadow mode
  try {
    const abConfigs = getActiveABConfigs(stats.sessionHash || "")
    const agentConfig = abConfigs.agent_pipeline || {}
    const agentBudget = budgetMs - (Date.now() - _aiFlowStart) - 2000
    const agentTimeout = Math.min(55000, agentBudget)
    // Skip agent pipeline if multi-agent timed out (infrastructure is likely stressed)
    if (multiAgentTimedOut && !skipAgent) {
      console.warn("[BSM] Skipping agent pipeline — multi-agent timed out, going straight to standard")
    } else if (!skipAgent && agentConfig.useAgent && agentBudget < 40000) {
      console.warn("[BSM] Agent pipeline skipped — budget cascade: only", Math.round(agentBudget / 1000) + "s remaining (need 40s)")
    }
    if (!multiAgentTimedOut && !skipAgent && agentConfig.useAgent && agentBudget >= 40000) {
      console.log("[BSM] Trying agent pipeline (A/B variant: agent, budget:", Math.round(agentBudget / 1000) + "s, timeout:", Math.round(agentTimeout / 1000) + "s)")
      const agentResult = await generateWithAgentPipeline(position, stats, conceptsLearned, recentWrong, signal, targetConcept, aiHistory, flaggedAvoidText + realGameFeelText + promptPatchText + auditInsightText, previousScenario, agentTimeout)
      if (agentResult && agentResult.scenario) {
        const _agScore = agentResult.agentGrade?.score || 0
        console.log(`[BSM Quality] position=${position} concept=${agentResult.scenario.conceptTag || agentResult.scenario.concept || 'unknown'} source=agent grade=${_agScore} pass=${_agScore >= 65} cacheHit=false elapsed=${Date.now() - _aiFlowStart}ms`)
        return { scenario: agentResult.scenario, abVariants: { pipeline: "agent", grade: _agScore } }
      }
      console.log("[BSM] Agent pipeline returned null, falling back to standard")
    } else if (skipAgent) {
      console.log("[BSM] Pre-fetch using standard pipeline only (skipAgent)")
    } else if (agentConfig.useAgent) {
      console.log("[BSM] Skipping agent pipeline — insufficient budget:", Math.round(agentBudget / 1000) + "s")
    }
  } catch (agentErr) {
    console.warn("[BSM] Agent pipeline error, falling back:", agentErr.message)
  }

  // Abort check before standard pipeline
  if (signal?.aborted) return { scenario: null, error: "aborted" }

  // Budget gate: skip standard pipeline if agent ate most of the budget
  const remainingBudget = budgetMs - (Date.now() - _aiFlowStart)
  if (remainingBudget < 30000) {
    const _errType = signal?.aborted ? "aborted" : "timeout"
    console.log("[BSM] Insufficient budget for standard pipeline after agent: " + Math.round(remainingBudget / 1000) + "s remaining (need 30s), skipping to fallback" + (signal?.aborted ? " (signal aborted)" : ""))
    return { scenario: null, error: _errType }
  }

  const lvl = getLvl(stats.pts);
  const posStats = stats.ps[position] || { p: 0, c: 0 };
  const posAcc = posStats.p > 0 ? Math.round((posStats.c / posStats.p) * 100) : 50;

  // Build personalization context
  const weakAreas = [];
  if (posAcc < 50) weakAreas.push("player struggles at this position — make it slightly easier to build confidence");
  if (posAcc > 80 && posStats.p > 5) weakAreas.push("player is strong here — increase difficulty and complexity");
  if (recentWrong.length > 0) weakAreas.push(`player recently got these concepts wrong: ${recentWrong.slice(-3).join("; ")}. Create a scenario that revisits one of these concepts from a different angle.`);
  if (targetConcept) weakAreas.push(`PRIORITY: The player previously missed a scenario about "${targetConcept}". Create a COMPLETELY DIFFERENT game situation that teaches this same concept from a new angle — different inning, different score, different runners, different context. Do NOT reuse the same setup.`);
  // AI history deduplication (Sprint 1.5)
  const recentAI = aiHistory.filter(h => h.position === position).slice(-10)
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
    // Manager topic rotation — force diversity across manager's broad action space
    if (position === "manager") {
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
      ]
      // Pick topic with fewest recent AI plays
      const recentTopicCounts = {}
      MANAGER_TOPIC_ROTATION.forEach(t => { recentTopicCounts[t] = 0 })
      recentAI.forEach(h => {
        const title = (h.title || "").toLowerCase()
        MANAGER_TOPIC_ROTATION.forEach(t => {
          const topicWords = t.split(/[^a-z]+/i).filter(w => w.length > 3)
          if (topicWords.some(w => title.includes(w.toLowerCase()))) recentTopicCounts[t]++
        })
      })
      const leastUsedTopic = MANAGER_TOPIC_ROTATION.reduce((best, t) => (recentTopicCounts[t] || 0) < (recentTopicCounts[best] || 0) ? t : best)
      weakAreas.push(`MANDATORY TOPIC: Create a scenario about ${leastUsedTopic}. This topic has been underrepresented in recent scenarios.`)
    }
  }

  const diffTarget = posAcc > 75 ? 3 : posAcc > 50 ? 2 : 1;

  // Level 2.5: Extract A/B configs for conditional injection
  const abConfigs = getActiveABConfigs(stats.sessionHash || "")
  const bibleConfig = abConfigs.bible_injection || {}
  const brainConfig = abConfigs.brain_data_level || {}
  const fewShotConfig = abConfigs.few_shot_count || {}

  // MASTERY CONTEXT INJECTION
  const playerMasteryData = stats.masteryData || { concepts: {} };
  const sessionHistory = playerMasteryData.sessionHistory || [];
  const lastWrongTag = recentWrong.length > 0 ? recentWrong[recentWrong.length - 1] : null;
  const _dueReview = getDueForReview(playerMasteryData);
  const _errorPatterns = detectErrorPatterns(playerMasteryData, sessionHistory);
  const _prereqGap = lastWrongTag ? getPrereqGap(lastWrongTag, playerMasteryData) : null;
  const _masteredTags = Object.entries(playerMasteryData.concepts || {}).filter(([,d]) => d.state === 'mastered').map(([t]) => t);
  const _degraded = _dueReview.filter(c => c.state === 'degraded');
  const _learning = _dueReview.filter(c => c.state === 'learning');
  let masteryPrompt = '';
  if (_prereqGap) masteryPrompt += `\nPREREQ GAP: Player failed "${_prereqGap.failedTag}" — prereq "${_prereqGap.gap}" not mastered. PRIORITY: teach "${_prereqGap.gap}" first.`;
  if (_degraded.length > 0) masteryPrompt += `\nDEGRADED CONCEPTS (highest priority — player lost mastery): ${_degraded.map(c=>c.tag).join(', ')}. Test one of these.`;
  if (_learning.length > 0) masteryPrompt += `\nLEARNING CONCEPTS (due for review): ${_learning.slice(0,3).map(c=>c.tag).join(', ')}.`;
  if (_masteredTags.length > 0) masteryPrompt += `\nMASTERED (avoid over-testing): ${_masteredTags.join(', ')}.`;
  if (_errorPatterns.length > 0) {
    const patternDetails = _errorPatterns.slice(0, 3).map(p => {
      let instruction = `DETECTED PATTERN: "${p.label}" — ${p.aiInstruction}`
      if (p.type === 'always_picks') {
        instruction += ` The player always picks "${p.alwaysPick}" for ${p.concept} scenarios. Create a scenario where "${p.alwaysPick}" is clearly the WRONG choice and explain why the correct alternative is better in this specific situation.`
      } else if (p.type === 'never_picks') {
        instruction += ` The player never considers "${p.neverPick}" for ${p.concept}. Create a scenario where "${p.neverPick}" IS the correct choice.`
      } else if (p.type === 'concept_blind') {
        instruction += ` The player consistently fails "${p.concept}" scenarios. Scaffold the difficulty — create a clear, approachable version of this concept with an especially helpful explanation.`
      }
      return instruction
    }).join("\n")
    masteryPrompt += `\n\nERROR PATTERN REMEDIATION (highest priority):\n${patternDetails}`
  }

  // Dynamic prompt reinforcement from error history
  let errorReinforcement = "";
  try {
    const errStore = JSON.parse(localStorage.getItem("bsm_ai_errors") || "{}");
    const roleViolations = errStore[position + ":role-violation"] || 0;
    const parseErrors = errStore[position + ":parse"] || 0;
    const qualityErrors = errStore[position + ":quality-firewall"] || 0;
    if (roleViolations >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios for this position had role violations. Double-check EVERY option is an action this specific position performs — not another position's job.";
    if (parseErrors >= 2) errorReinforcement += "\nCRITICAL: Previous responses had JSON errors. Respond with ONLY valid JSON — no markdown, no text before or after.";
    if (qualityErrors >= 2) errorReinforcement += "\nCRITICAL: Previous scenarios failed quality checks. Ensure explanations are detailed (3+ sentences), all options are distinct, and success rates are realistic.";
  } catch {}

  // Sprint 5: Condensed AI prompt for speed + Sprint 6: Scoped context for quality
  const aiMapText = getAIMap(position, targetConcept)
  const teachCtx = getTeachingContext(position, conceptsLearned, stats.ageGroup||"11-12")
  const masteredStr = conceptsLearned.length > 0 ? " Mastered: " + conceptsLearned.slice(-8).join(", ") + "." : ""
  const topicsText = AI_SCENARIO_TOPICS[position] || ""
  // Conditional analytics rules — full IBB text only for manager/pitcher/catcher
  const FIELDER_POS_LIST = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"]
  const isFielder = FIELDER_POS_LIST.includes(position)
  const analyticsRules = isFielder
    ? "ANALYTICS: Bunting with 0 outs usually lowers run expectancy. Sac bunt only justified with weak hitter, late game, need 1 run. IBBs, pitching changes, and defensive shifts are MANAGER decisions — do NOT create fielder scenarios about these topics. The scenario TITLE and DESCRIPTION must be about something THIS fielder actually does on the field."
    : position === "baserunner"
    ? "ANALYTICS: Steals need ~72% success to break even. Bunting usually lowers RE24. IBBs under 2023+ rules give the runner no decision (automatic advance) — NEVER create baserunner scenarios about IBBs. Always align with modern sabermetric consensus."
    : position === "batter"
    ? "ANALYTICS: Bunting with 0 outs usually lowers RE24. Sac bunt only justified with weak hitter, late game, need 1 run. Two-strike approach = protect the plate. IBBs and pitching changes are not batter decisions. Always align with sabermetric consensus."
    : "ANALYTICS: Intentional walks almost always wrong per The Book (Tango). NEVER make IBB the best answer unless runners on 2nd+3rd with 1 out (force at home + DP). Never put go-ahead/winning run on base via IBB. IBB REQUIRES 1B open. Under 2023+ rules IBB is a dugout signal, no pitches. Bunting with 0 outs usually bad. Sac bunt only justified with weak hitter, late game, need 1 run. TTO: batters hit +30 pts 3rd time through. Always align with modern sabermetric consensus."
  // Age-adaptive prompt injection (Pillar 4B)
  const ageGroup = stats.ageGroup || "11-12"
  const ageGate = CONCEPT_GATES[ageGroup]
  const ageAdaptiveText = ageGate?.adjustments ? `\nPLAYER AGE GROUP: ${ageGroup}\nSTRATEGIC ADJUSTMENTS FOR THIS AGE:\n${Object.entries(ageGate.adjustments).map(([k,v]) => `- ${k}: ${v}`).join("\n")}${ageGate.forbidden?.length > 0 ? `\nFORBIDDEN CONCEPTS (do NOT use): ${ageGate.forbidden.join(", ")}` : ""}` : ""

  const isOffensive = ["batter","baserunner"].includes(position);
  const isDefensive = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position);
  const tv2 = getRandomTemplateValues()
  // Standard pipeline archetype injection (matches agent pipeline's OPTION BLUEPRINT)
  const _stdArchKey = `${position}:${targetConcept || ''}`
  const _stdArchetype = OPTION_ARCHETYPES?.[_stdArchKey]
  if (_stdArchetype) console.log("[BSM] Standard pipeline using archetype for", _stdArchKey)
  const _stdArchBlock = _stdArchetype ? `
OPTION BLUEPRINT (structural guide, NOT literal text — create your own scenario but follow this option structure):
Moment: ${_stdArchetype.moment}
Option A (correct fundamental): ${_stdArchetype.correct}
Option B (common kid mistake): ${_stdArchetype.kid_mistake}
Option C (sounds smart but wrong here): ${_stdArchetype.sounds_smart}
Option D (clearly wrong): ${_stdArchetype.clearly_wrong}
Generate specific game language — do NOT copy these hints word-for-word.
` : ''
  const prompt = `Create a baseball strategy scenario for position: ${position}.
THE QUESTION MUST ASK: "What should the ${position.replace(/([A-Z])/g,' $1').trim().toLowerCase()} do?" All 4 options must be physical actions or decisions that ONLY this position makes.

SCORE RULES (READ FIRST — score errors are the #1 quality issue):
- score=[HOME, AWAY]. Home team bats in "Bot" half, away team bats in "Top" half.
- ${isOffensive ? "This is an OFFENSIVE position. If the inning is 'Bot X', the player is on the HOME team (score[0]). If 'Top X', the player is on the AWAY team (score[1])." : isDefensive ? "This is a DEFENSIVE position. If the inning is 'Bot X', the player is on the AWAY team (score[1]). If 'Top X', the player is on the HOME team (score[0])." : "Manager can be either team. Pick one and be consistent."}
- If you say "trailing 4-3" the player's team score MUST be 3, opponent MUST be 4.
- If you say "up by 2" the player's team score MUST be exactly 2 more than the opponent.
- "Tying run" = the run that ties the game. "Go-ahead run" = the run that takes the lead. Do NOT confuse these.
- Double-check: read your description, find every score reference, and verify it matches the score array.

DESCRIPTION STYLE: Write descriptions as if explaining a game situation to a young baseball player. Use simple, everyday language. Do NOT include statistics, RE24 values, batting averages, or advanced analytics in the description or options. Save numbers for explanations only, and only for older players.

${topicsText}

PLAYER: Level ${lvl.n}, ${posStats.p} games at ${posAcc}% accuracy, difficulty ${diffTarget}/3.${masteredStr}${ageAdaptiveText}
${weakAreas.length > 0 ? weakAreas.join(" ") : ""}${masteryPrompt}${teachCtx}${calibrationText}

POSITION RULES: ${AI_POS_PRINCIPLES[position] || POS_PRINCIPLES[position] || "Use general baseball knowledge."}

${bibleConfig.useBible !== false ? "DETAILED PRINCIPLES: " + (BIBLE_PRINCIPLES[position] || "") : ""}

${aiMapText}

${brainConfig.brainLevel !== "minimal" ? (formatBrainForAI(position, {count: null, inning: "", score: []}, targetConcept) || "").slice(0, 500) : ""}

AUDIT: All 4 options must be actions THIS position performs at the SAME decision point. The scenario TITLE must describe something this position does (not another position's job). Best answer=coaching consensus backed by modern analytics. rates[best] MUST be highest. score=[HOME,AWAY].${errorReinforcement}
POSITION-ACTION BOUNDARIES: ${POS_ACTIONS_MAP[position] || POS_ACTIONS_MAP.manager}
NEVER give this position options that belong to another position. Fielders do NOT call IBBs, shift the defense, call for pitchouts, or make pitching changes. Baserunner CANNOT "yell at pitcher", "call a play", "signal the batter". If a game event removes all meaningful decisions from a position, do NOT create a scenario about that event.
${position === "baserunner" ? `
BASERUNNER OPTION STRUCTURE: Every option must be a physical running/positioning action the baserunner takes:
- Lead distance: "Take an aggressive 15-foot lead" / "Shorten your lead to 8 feet"
- Steal/hold: "Break for [base] on the pitcher's first move" / "Hold at [base]"
- Tag-up: "Tag up and sprint to [next base] after the catch" / "Hold at [base] after the catch"
- Read the ball: "Freeze on the line drive, then advance if it drops" / "Break immediately on contact"
- Secondary lead: "Get your secondary lead and read the ball off the bat"
NEVER include: yelling, signaling, calling plays, or any action where the baserunner communicates to others.
You MUST specify which base the runner is on in the description. Options must be consistent with that base.
IMPORTANT: Your response must be ONLY valid JSON starting with { and ending with }. No markdown fences, no explanation text.` : ""}${position === "manager" ? `
MANAGER OPTION STRUCTURE: Every option must be a concrete managerial decision:
- Pitching: "Pull the starter and bring in [reliever type]" / "Leave the starter in for one more batter"
- Defense: "Play the infield in to cut off the run" / "Play at normal depth"
- Signs: "Give the steal sign" / "Call for a sacrifice bunt" / "Put on the hit-and-run"
- Personnel: "Send up a pinch hitter" / "Make a defensive substitution"
NEVER include: vague options like "make a smart move", "trust your instincts", or "see what happens".
Each option must be a DIFFERENT type of decision when possible (don't make all 4 about pitching changes).
IMPORTANT: Your response must be ONLY valid JSON starting with { and ending with }. No markdown fences, no explanation text.` : ""}
${analyticsRules}
${flaggedAvoidText}${realGameFeelText}${promptPatchText}${auditInsightText}
${_stdArchBlock}
EXAMPLE of a high-quality scenario (match this quality level):
${getAIFewShot(position, targetConcept, diffTarget)}

Respond with ONLY valid JSON:
{"title":"Short Title","diff":${diffTarget},"description":"2-3 sentence scenario","situation":{"inning":"${tv2.inning}","outs":${tv2.outs},"count":"${tv2.count}","runners":${tv2.runners},"score":${tv2.score}},"options":["A","B","C","D"],"best":${tv2.best},"explanations":["Why A","Why B","Why C","Why D"],"explDepth":[{"simple":"1 sentence kid version","why":"2-3 sentence strategic reasoning","data":"RE24/stat reference"},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."},{"simple":"...","why":"...","data":"..."}],"rates":${tv2.rates},"concept":"One-sentence lesson","anim":"strike|strikeout|hit|groundout|flyout|steal|score|advance|catch|throwHome|doubleplay|bunt|walk|safe|freeze"}
explDepth: array of 4 objects (one per option). "simple"=1 sentence a 6-year-old understands. "why"=2-3 sentences of strategic reasoning. "data"=1 sentence referencing a real stat — write "n/a" if no stat applies.
count format: "B-S" (0-3 balls, 0-2 strikes) or "-". runners: [] empty, [1]=1st, [2]=2nd, [1,2]=1st+2nd, [1,2,3]=loaded. rates: optimal 75-90, decent 45-65, poor 10-40.`;

  try {
    // Sprint 4.3: Apply A/B test configs to AI generation
    const abConfigs = getActiveABConfigs(stats.sessionHash || "")
    const tempConfig = abConfigs.ai_temperature || {}
    const promptConfig = abConfigs.ai_system_prompt || {}
    const aiTemp = tempConfig.temperature || 0.4
    const systemSuffix = promptConfig.systemSuffix || ""
    const personaConfig = abConfigs.coach_persona || {}
    const abVariants = { temp: tempConfig.variant || "control", prompt: promptConfig.variant || "control", persona: personaConfig.variant || "control" }
    const coachSystem = personaConfig.usePersona !== false ? (getCoachVoice(stats)?.system || "You are an expert baseball coach") : "You are an expert baseball coach"

    const fetchOpts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-4",
        max_tokens: 1800,
        temperature: aiTemp,
        messages: [
          { role: "system", content: coachSystem + ` You create training scenarios for Baseball Strategy Master, a strategy-teaching app for kids 6-18.

ROLE: You are the smartest, most experienced baseball coach in the world. You have coached at every level from tee-ball to MLB. You know the fundamentals cold. You teach concepts the way a patient coach explains them on the field — concrete, specific, grounded in real baseball.

OUTPUT: Respond with ONLY a valid JSON object. No markdown, no code fences, no text outside the JSON.

GOLDEN RULE: Every scenario teaches ONE baseball concept. The concept drives everything — the situation setup, the 4 options, the correct answer, and every explanation. If an option does not relate to the concept being taught, replace it with one that does.

EXPLANATION RULES (most important — players learn from explanations):
- Each explanation: 2-4 sentences.
- BEST answer explanation: Name the action → state WHY it is correct in THIS specific game situation (reference score, inning, outs, runners, count) → state the POSITIVE RESULT.
- WRONG answer explanations: Name the action → state WHY it fails in THIS situation with concrete consequences → teach what makes it wrong.
- Write from the player's perspective: "you", "your team", "your runner" — never "the offense" or "the batting team." ALWAYS use second person. Never "What should the pitcher do?" — say "What should you do?"
- NEVER use jargon like RE24, OBP, wOBA, xBA in descriptions or options. Stats go in explDepth.data only.
- EVERY explanation must reference the SPECIFIC game situation. No generic explanations ever.
- CRITICAL: Each explanation must specifically argue for or against THAT option. The best answer explanation must clearly state why THIS choice is optimal, not why another option is wrong. Anchor every explanation to the action described in its option text.

OPTION RULES:
- All 4 options happen at the SAME decision moment. Never mix "before the pitch" with "after the ball is hit."
- Each option is a SPECIFIC, CONCRETE action (not "make the right play" or "do something smart").
- Options must be STRATEGICALLY DISTINCT — not 4 variations of the same action (e.g., not 4 different pitches for a pitcher scenario, not 4 different throws for a fielder scenario).
- At least one option should be a common MISTAKE that a young player would actually make — this is how kids learn.
- No near-duplicates. If two options describe essentially the same action with different wording, replace one.
- CRITICAL: Each option must be a DISTINCT physical action. If one action is a prerequisite of another (e.g., "step off the rubber" is part of "throw over to first"), they are NOT distinct — pick one or the other. Similarly: "take the pitch" vs "don't swing", "sacrifice bunt" vs "lay down a bunt", "go to the bullpen" vs "make a pitching change" are the same action.

SITUATION RULES:
- outs: 0, 1, or 2 (never 3).
- count: valid format "B-S" where balls 0-3, strikes 0-2. Use "-" only if count is irrelevant.
- runners: array of occupied bases [1], [1,3], [1,2,3], or [] for empty. Must match the description exactly.
- score: [HOME, AWAY]. Home team bats in "Bot" half. If description says "trailing 4-3" and it is Bot inning, score must be [3,4] not [4,3].
- The LAST sentence of the description MUST set up the exact decision moment. All 4 options are what the player does RIGHT NOW.

VARY EVERYTHING: Different count, runner configuration, inning (1-9), and score each time. The best answer should NOT always be option index 0 or 1 — distribute across 0-3.

CRITICAL — 2ND PERSON PERSPECTIVE: The player IS the position. The description MUST use "you" and "your" throughout. Write "You're the pitcher on the mound..." NOT "The pitcher is on the mound..." Write "What should you do?" NOT "What should the pitcher do?" This is non-negotiable — every description must read as if the player is living the moment.

POSITION BOUNDARIES: The scenario MUST only include actions that the selected position actually performs on the field. A center fielder does not call pitches. A batter does not position the defense. A pitcher does not decide the batting order.

COMMON MISTAKES TO AVOID:
- Best explanation argues for the wrong option.
- Score math is wrong (e.g., "one-run game" when the difference is 2 runs).
- Combining two actions in one option ("Wave off CF but also back up the throw").
- Options that no real player would ever consider.
- Description says one thing but situation object says another.` + systemSuffix },
          { role: "user", content: prompt }
        ]
      })
    };
    if (signal) fetchOpts.signal = signal;

    const _aiT0 = Date.now()
    const stdBudget = budgetMs - (Date.now() - _aiFlowStart) - 2000
    if (stdBudget < 25000) {
      console.warn("[BSM] Skipping standard pipeline — insufficient budget:", Math.round(stdBudget / 1000) + "s")
      return { error: signal?.aborted ? "aborted" : "timeout" }
    }
    const stdTimeout = Math.min(85000, stdBudget) // cap to remaining budget; worker timeout is 90s
    const stdUrl = stats?.useLLM70B ? LLM_70B_URL : AI_PROXY_URL
    console.log("[BSM] Standard pipeline budget:", Math.round(stdBudget / 1000) + "s, timeout:", Math.round(stdTimeout / 1000) + "s", stats?.useLLM70B ? "(70B)" : "(xAI)")
    const response = await Promise.race([
      fetch(stdUrl, fetchOpts),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), stdTimeout))
    ]);
    const _aiFetchMs = Date.now() - _aiT0

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[BSM] AI API error:", response.status, "(" + _aiFetchMs + "ms)", errBody.slice(0, 300));
      reportError("ai_api", `HTTP ${response.status}`, { position, body: errBody.slice(0, 200), ms: _aiFetchMs });
      // Parse structured error from worker for smarter retry decisions
      let errType = "api";
      try { const errJson = JSON.parse(errBody); if (errJson?.error?.type === "auth_error") errType = "auth"; } catch {}
      throw new Error(`API ${response.status}${errType === "auth" ? " auth" : ""}`);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason || "unknown";
    console.log("[BSM] AI response received in " + _aiFetchMs + "ms, length:", text.length, "finish:", finishReason);
    if (text.length > 0) console.log("[BSM] AI raw (first 300):", text.slice(0, 300));
    if (!text) throw new Error("API returned empty content");
    if (finishReason === "length") {
      console.warn("[BSM] AI response truncated (hit max_tokens)");
      throw new Error("Parse: truncated response");
    }

    // Sanitize AI response before parsing
    const sanitized = sanitizeAIResponse(text);
    let scenario;
    try { scenario = JSON.parse(sanitized); }
    catch (parseErr) {
      console.error("[BSM] JSON parse failed:", parseErr.message, "sanitized (first 300):", sanitized.slice(0, 300));
      throw new Error("Parse: " + (finishReason === "length" ? "truncated response" : "invalid JSON"));
    }

    // Strip [BEST] prefix if AI copied it from examples
    if (scenario.options) scenario.options = scenario.options.map(o => o.replace(/^\[BEST\]\s*/i, ''))
    // Fix 3rd-person perspective → 2nd-person ("you")
    fixPerspective(scenario)

    // Validate structure
    const missing = [];
    if (!scenario.title) missing.push("title");
    if (!scenario.options || scenario.options.length !== 4) missing.push("options");
    if (!scenario.explanations || scenario.explanations.length !== 4) missing.push("explanations");
    if (typeof scenario.best !== "number" || scenario.best < 0 || scenario.best > 3) missing.push("best");
    if (!scenario.concept) missing.push("concept");
    if (!scenario.rates || scenario.rates.length !== 4) missing.push("rates");
    if (scenario.options && scenario.options.length === 4 && scenario.options.some(o => typeof o !== "string" || o.length < 3)) missing.push("options(type)");
    if (scenario.explanations && scenario.explanations.length === 4 && scenario.explanations.some(e => typeof e !== "string" || e.length < 10)) missing.push("explanations(type)");
    if (missing.length > 0) {
      console.error("[BSM] Invalid structure, missing:", missing.join(", "));
      throw new Error("Parse: missing " + missing.join(", "));
    }

    // Auto-fix rates[best] alignment instead of rejecting (Fix 2C)
    const maxRate = Math.max(...scenario.rates);
    if (scenario.rates[scenario.best] !== maxRate) {
      const oldBest = scenario.best
      scenario.best = scenario.rates.indexOf(maxRate)
      console.warn("[BSM] AI auto-fixed rate-best: best " + oldBest + " (" + scenario.rates[oldBest] + "%) -> " + scenario.best + " (" + maxRate + "%)")
    }
    // Ensure anim is valid
    if (!ANIMS.includes(scenario.anim)) scenario.anim = "strike";
    // Ensure diff is valid
    if (![1,2,3].includes(scenario.diff)) scenario.diff = diffTarget;
    // Normalize situation
    if (!scenario.situation) scenario.situation = {};
    if (!Array.isArray(scenario.situation.runners)) scenario.situation.runners = [];
    scenario.situation.runners = [...new Set(scenario.situation.runners.filter(r => [1,2,3].includes(Number(r))).map(Number))];
    // Normalize score — handle {home:X,away:Y} or missing
    const sc_score = scenario.situation.score;
    if (!Array.isArray(sc_score)) {
      if (sc_score && typeof sc_score === "object") {
        scenario.situation.score = [sc_score.home||0, sc_score.away||0];
      } else {
        scenario.situation.score = [0, 0];
      }
    }
    scenario.situation.outs = Math.max(0, Math.min(2, Number(scenario.situation.outs) || 0));
    if (!scenario.situation.inning) scenario.situation.inning = "Mid";
    if (!scenario.situation.count) scenario.situation.count = "-";
    if (scenario.situation.count !== "-" && !/^[0-3]-[0-2]$/.test(scenario.situation.count)) {
      console.warn("[BSM] AI invalid count format:", scenario.situation.count, "→ defaulting to '-'");
      scenario.situation.count = "-";
    }
    // Count format enforcement — default neutral count if still placeholder
    if (scenario.situation && (!scenario.situation.count || scenario.situation.count === "-")) {
      scenario.situation.count = "1-1";  // default neutral count
    }
    // Score-inning perspective check
    if (scenario.situation) {
      const inn = scenario.situation.inning || "";
      const desc = (scenario.description || "").toLowerCase();
      const [aw, hm] = scenario.situation.score || [0, 0];
      if (inn.startsWith("Bot") && hm > aw && /losing|behind|trailing/i.test(desc)) {
        console.warn("[BSM] AI scenario has score-inning mismatch: Bot inning, home leading, but desc says losing");
      }
    }

    // SCORE-DESCRIPTION CONSISTENCY CHECK (Fix 2)
    const descLower = (scenario.description || "").toLowerCase();
    const [_homeScore, _awayScore] = scenario.situation.score || [0, 0];
    const _innHalf = (scenario.situation.inning || "").toLowerCase();
    const _isPlayerHome = (isOffensive && _innHalf.startsWith("bot")) || (isDefensive && _innHalf.startsWith("top"));
    const _playerScore = _isPlayerHome ? _homeScore : _awayScore;
    const _oppScore = _isPlayerHome ? _awayScore : _homeScore;
    if ((descLower.includes("trailing") || descLower.includes("behind") || descLower.includes("down by")) && _playerScore > _oppScore) {
      console.warn("[BSM] AI score mismatch: description says trailing but player leads " + _playerScore + "-" + _oppScore);
      scenario.situation.score = [_awayScore, _homeScore];
      console.warn("[BSM] Auto-fixed score to", scenario.situation.score);
    }
    if ((descLower.includes("leading") || /up by \d/.test(descLower) || /up \d+-\d+/.test(descLower)) && _playerScore < _oppScore) {
      console.warn("[BSM] AI score mismatch: description says leading but player trails " + _playerScore + "-" + _oppScore);
      scenario.situation.score = [_awayScore, _homeScore];
      console.warn("[BSM] Auto-fixed score to", scenario.situation.score);
    }

    // Role violation check (ROLE_VIOLATIONS is now module-level for cross-pipeline access)
    const violations = ROLE_VIOLATIONS[position] || [];
    const allText = [scenario.description, ...scenario.options, ...scenario.explanations].join(" ");
    const matched = violations.find(rx => rx.test(allText));
    if (matched) {
      console.warn("[BSM] AI scenario rejected: role violation for", position, "pattern:", matched.toString());
      throw new Error("Role violation: " + matched.toString().slice(0, 80));
    }

    // Category-specific semantic validation for famous, rules, counts
    if (position === "famous") {
      // Famous scenarios must reference a real player name or historical event
      const famousText = (scenario.title || "") + " " + (scenario.description || "");
      const hasPlayerName = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(famousText);
      const hasHistorical = /\b(world\s*series|pennant|all[- ]star|perfect\s*game|no[- ]hitter|record|historic|legendary|famous|classic|memorable|championship|playoff|postseason|hall\s*of\s*fame)\b/i.test(famousText);
      if (!hasPlayerName && !hasHistorical) {
        console.warn("[BSM] AI scenario rejected: famous scenario lacks player name or historical reference");
        throw new Error("Role violation: famous scenario must reference a real player or historical event");
      }
    }
    if (position === "rules") {
      // Rules scenarios: at least 1 option or explanation must contain rule-related language
      const RULE_WORDS = /\b(rule|legal|illegal|allowed|violation|called|ruled|umpire|interference|obstruction|balk|infraction|penalty|ejected|appeal|protest|overturned|review|official|regulation|strike\s*zone|dead\s*ball|ground\s*rule|infield\s*fly)\b/i;
      const ruleOptCount = scenario.options.filter(o => RULE_WORDS.test(o)).length;
      const ruleExpCount = scenario.explanations.filter(e => RULE_WORDS.test(e)).length;
      if (ruleOptCount === 0 && ruleExpCount === 0) {
        console.warn("[BSM] AI scenario rejected: rules scenario has no rule-related language in options or explanations");
        throw new Error("Role violation: rules scenario must test rule knowledge, not physical plays");
      }
    }
    if (position === "counts") {
      // Counts scenarios must mention a specific count (e.g., "0-2", "3-1", "full count")
      const countsText = (scenario.title || "") + " " + (scenario.description || "");
      const hasCount = /\b[0-3]-[0-2]\b/.test(countsText) || /\bfull\s*count\b/i.test(countsText) || /\b(0|1|2|3)\s*(and|&)\s*(0|1|2)\b/.test(countsText) || /\b(two|three)\s*(and|&)\s*(one|two|oh|zero)\b/i.test(countsText);
      if (!hasCount) {
        console.warn("[BSM] AI scenario rejected: counts scenario missing specific count in situation");
        throw new Error("Role violation: counts scenario must specify a pitch count (e.g., 0-2, 3-1, full count)");
      }
    }

    // Cross-position action check: fielders/baserunners should not have manager/catcher/pitcher options
    const FIELDER_POS = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"];
    if (FIELDER_POS.includes(position) || position === "baserunner" || position === "batter") {
      const optsText = scenario.options.join(" ");
      const MGR_ACTIONS = [
        [/\bintentional\s*walk/i, "intentional walk (manager decision)"],
        [/\bIBB\b/i, "IBB (manager decision)"],
        [/\bshift\s*the\s*defense/i, "shift the defense (manager decision)"],
        [/\bpitch(ing)?\s*change/i, "pitching change (manager decision)"],
        [/\bbring\s*in\s*(a\s*)?(new\s*)?(relief|closer|pitcher)/i, "pitching change (manager decision)"],
        [/\bcall\s*(for\s*)?(a\s*)?pitchout/i, "call pitchout (catcher decision)"],
        [/\bpitch\s*to\s*(the|this)\s*(dangerous|cleanup|batter|hitter)\s*(normally|carefully)/i, "pitch to batter (pitcher/manager decision)"],
        [/\bwalk\s*(him|the\s*batter|this\s*(guy|hitter))\s*(intentionally|on\s*purpose)/i, "intentional walk (manager decision)"],
      ];
      const mgrMatch = MGR_ACTIONS.find(([rx]) => rx.test(optsText));
      if (mgrMatch) {
        console.warn("[BSM] AI scenario rejected: cross-position violation for", position, "—", mgrMatch[1]);
        throw new Error("Role violation: " + position + " given " + mgrMatch[1]);
      }
    }

    // PREMISE VALIDATOR — check title+description for position-inappropriate concepts
    const PREMISE_VIOLATIONS = {
      // Fielders should not have scenarios ABOUT these manager/pitcher/catcher topics
      fielder: [
        [/\bIBB\b/i, "IBB is a manager decision"],
        [/\bintentional\s*walk/i, "intentional walk is a manager decision"],
        [/\bpitch(ing)?\s*(change|substitut)/i, "pitching change is a manager decision"],
        [/\bpinch\s*hit/i, "pinch hitting is a manager decision"],
        [/\bmound\s*visit/i, "mound visit is a manager/catcher decision"],
        [/\bcall(ing)?\s*(pitch|sign|game)/i, "calling pitches is a catcher decision"],
        [/\bpitch\s*select/i, "pitch selection is a pitcher/catcher decision"],
        [/\bsignal\s*(the|a)\s*(steal|bunt|hit)/i, "signals are manager decisions"],
      ],
      // Baserunner/batter should not have scenarios about defensive positioning
      offensive: [
        [/\bcutoff\s*(man|position|alignment)/i, "cutoff alignment is a fielder decision"],
        [/\brelay\s*(man|position)/i, "relay is a fielder decision"],
        [/\bshift\s*(the)?\s*defense/i, "defensive shifts are manager decisions"],
      ],
      // Defensive positions should not have scenarios about batting/baserunning decisions
      defensive: [
        [/\b(leading|batting)\s*off\b.*\binning\b/i, "leading off an inning is a batter decision"],
        [/\byou.{0,20}(swing|look for a|take the (first )?pitch|protect the plate|work the count)/i, "batting actions are batter decisions"],
        [/\byou.{0,20}(steal|take a lead|get a jump|tag up and (go|score)|break for home)/i, "baserunning actions are baserunner decisions"],
        [/\b(at[- ]bat|plate appearance|facing.*pitcher|hitter.s count)\b/i, "at-bat scenarios are batter decisions"],
      ],
    };
    const titleDesc = (scenario.title || "") + " " + (scenario.description || "");
    const FIELDER_CHECK = ["firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"];
    if (FIELDER_CHECK.includes(position)) {
      const premMatch = PREMISE_VIOLATIONS.fielder.find(([rx]) => rx.test(titleDesc));
      if (premMatch) {
        console.warn("[BSM] AI scenario rejected: premise violation for", position, "—", premMatch[1]);
        throw new Error("Premise violation: " + position + " scenario about " + premMatch[1]);
      }
    }
    if (position === "baserunner" || position === "batter") {
      const premMatch = PREMISE_VIOLATIONS.offensive.find(([rx]) => rx.test(titleDesc));
      if (premMatch) {
        console.warn("[BSM] AI scenario rejected: premise violation for", position, "—", premMatch[1]);
        throw new Error("Premise violation: " + position + " scenario about " + premMatch[1]);
      }
    }
    // Defensive positions (pitcher, catcher, fielders) should not receive batting/baserunning scenarios
    const DEFENSIVE_CHECK = ["pitcher","catcher",...FIELDER_CHECK];
    if (DEFENSIVE_CHECK.includes(position)) {
      const premMatch = PREMISE_VIOLATIONS.defensive.find(([rx]) => rx.test(titleDesc));
      if (premMatch) {
        console.warn("[BSM] AI scenario rejected: premise violation for", position, "—", premMatch[1]);
        throw new Error("Premise violation: " + position + " scenario about " + premMatch[1]);
      }
    }

    // PREMISE COHERENCE (Fix 3) — reject physically impossible scenarios
    const IMPOSSIBLE_PREMISES = [
      [/tagged.*(?:but|and).*(?:slipped|got away|escaped|safe)/i, "Can't tag a runner and have them escape"],
      [/caught.*(?:but|and).*(?:dropped|missed|safe)/i, "Contradictory: caught but dropped"],
      [/call(?:s|ed)?\s*time.*(?:during|while|in the middle of).*(?:play|rundown|throw|tag)/i, "Cannot call time during a live play"],
      [/(?:3|three)\s*outs?.*(?:still|continue|keep)\s*(?:batting|hitting|running)/i, "Three outs ends the half-inning"],
      [/(?:strike(?:out)?|struck out).*(?:reaches|safe|on base)/i, "Strikeout means out (unless dropped third strike specified)"],
    ];
    const _premText = scenario.description + " " + scenario.options.join(" ");
    const _impossibleMatch = IMPOSSIBLE_PREMISES.find(([rx]) => rx.test(_premText));
    if (_impossibleMatch) {
      console.warn("[BSM] AI scenario rejected: impossible premise —", _impossibleMatch[1]);
      throw new Error("Quality firewall: impossible premise — " + _impossibleMatch[1]);
    }

    // OPTION QUALITY (Fix 4) — detect absurd, compound, or contradictory options
    const ABSURD_OPTIONS = [
      [/call\s*time.*(?:rundown|live|play)/i, "Cannot call time during live play"],
      [/run\s*(?:hard\s*)?halfway.*(?:stop|look|pause)/i, "Running halfway creates a rundown"],
      [/yell\s*at\s*(?:the\s*)?(?:pitcher|catcher|umpire)/i, "Yelling is not a strategic option"],
      [/do\s*nothing/i, "Do nothing is not a strategic decision"],
      [/(?:give|throw)\s*up/i, "Giving up is not a strategic option"],
    ];
    for (let _oi = 0; _oi < scenario.options.length; _oi++) {
      const _opt = scenario.options[_oi];
      if (/\bbut\s+(stay|hold|wait|don't|keep)\b/i.test(_opt) || /\band\s+then\s+(stop|hold|wait|freeze)\b/i.test(_opt)) {
        console.warn("[BSM] AI option " + _oi + " may be compound:", _opt);
      }
      const _absurdMatch = ABSURD_OPTIONS.find(([rx]) => rx.test(_opt));
      if (_absurdMatch) {
        console.warn("[BSM] AI option " + _oi + " is absurd:", _absurdMatch[1]);
        throw new Error("Quality firewall: absurd option " + _oi + " — " + _absurdMatch[1]);
      }
    }
    // Terminology fix for baserunner scenarios
    if (position === "baserunner") {
      const _allOptText = scenario.options.join(" ");
      if (/secondary\s*lead.*steal/i.test(_allOptText) || /steal.*secondary\s*lead/i.test(_allOptText)) {
        console.warn("[BSM] Auto-fixing terminology: 'secondary lead' -> 'aggressive lead'");
        scenario.options = scenario.options.map(o => o.replace(/secondary\s*lead/gi, "aggressive lead"));
      }
    }

    // QUALITY_FIREWALL — run all automated checks
    const fwResult = QUALITY_FIREWALL.validate(scenario, position)
    if (!fwResult.pass) {
      const failMsg = fwResult.tier1Fails.map(f => f.message).join("; ")
      console.warn("[BSM] AI scenario rejected by QUALITY_FIREWALL:", failMsg)
      throw new Error("Quality firewall: " + failMsg.slice(0, 120))
    }
    if (fwResult.tier2Warns.length > 0) {
      fwResult.tier2Warns.forEach(w => console.warn("[BSM] Quality warning:", w.check, "-", w.message))
    }
    if (fwResult.tier3Suggestions.length > 0) {
      fwResult.tier3Suggestions.forEach(s => console.info("[BSM] Quality suggestion:", s.check, "-", s.message))
    }

    // CONSISTENCY_RULES — cross-position contradiction check
    const crViolations = CONSISTENCY_RULES.check(scenario)
    if (crViolations.length > 0) {
      const crMsg = crViolations.map(v => v.message).join("; ")
      console.warn("[BSM] AI scenario rejected by CONSISTENCY_RULES:", crMsg)
      throw new Error("Consistency violation: " + crMsg.slice(0, 120))
    }

    // EXPLANATION COHERENCE CHECK (Fix 1) — best explanation must argue for the best option
    const _bestExpl = (scenario.explanations[scenario.best] || "").toLowerCase();
    const _optActions = scenario.options.map(opt => {
      const words = opt.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
      return words.filter(w => w.length > 3);
    });
    const _bestOverlap = _optActions[scenario.best].filter(w => _bestExpl.includes(w)).length;
    for (let _i = 0; _i < 4; _i++) {
      if (_i === scenario.best) continue;
      const _otherOverlap = _optActions[_i].filter(w => _bestExpl.includes(w)).length;
      if (_otherOverlap > _bestOverlap + 2 && _otherOverlap >= 3) {
        console.warn("[BSM] AI explanation coherence fail: best=" + scenario.best + " but explanation matches option " + _i + " better (" + _otherOverlap + " vs " + _bestOverlap + " action words)");
        throw new Error("Quality firewall: best explanation argues for option " + _i + " instead of option " + scenario.best);
      }
    }

    // EXPLANATION QUALITY SCORING (Fix 9) — score each explanation, reject if avg < 5/10
    let _eqTotal = 0;
    const _eqIssues = [];
    for (let _ei = 0; _ei < 4; _ei++) {
      let _eqScore = 10;
      const _eqExpl = (scenario.explanations[_ei] || "");
      const _eqOpt = (scenario.options[_ei] || "");
      const _eqSentences = _eqExpl.split(/[.!?]+/).filter(s => s.trim().length > 10);
      if (_eqSentences.length < 2) { _eqScore -= 3; _eqIssues.push("Opt " + _ei + ": too short (" + _eqSentences.length + " sentences)"); }
      const _sitWords = ["inning", "out", "score", "runner", "count", "base", "lead", "trailing", "tied"];
      if (!_sitWords.some(w => _eqExpl.toLowerCase().includes(w))) { _eqScore -= 2; _eqIssues.push("Opt " + _ei + ": no situation ref"); }
      const _genPhrases = ["good choice", "bad idea", "smart play", "not ideal", "better option", "this is wrong", "this is right"];
      if (_genPhrases.some(gp => _eqExpl.toLowerCase().includes(gp))) { _eqScore -= 2; _eqIssues.push("Opt " + _ei + ": generic language"); }
      const _eqOptWords = _eqOpt.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      if (_eqOptWords.filter(w => _eqExpl.toLowerCase().includes(w)).length < 1) { _eqScore -= 2; _eqIssues.push("Opt " + _ei + ": no action ref"); }
      _eqTotal += Math.max(0, _eqScore);
    }
    const _eqAvg = _eqTotal / 4;
    if (_eqAvg < 5) {
      console.warn("[BSM] AI explanation quality too low:", _eqAvg.toFixed(1) + "/10", _eqIssues.join("; "));
      throw new Error("Quality firewall: low explanation quality (" + _eqAvg.toFixed(1) + "/10) — " + _eqIssues.slice(0, 3).join("; "));
    }
    console.log("[BSM] AI explanation quality score:", _eqAvg.toFixed(1) + "/10");

    // Sprint 2.5: Deduplication — reject if too similar to existing scenarios or AI history
    const aiTitle = (scenario.title || "").toLowerCase()
    const aiDesc = (scenario.description || "").toLowerCase()
    const allHandcrafted = (SCENARIOS[position] || [])
    const titleMatch = allHandcrafted.find(s => {
      const t = (s.title || "").toLowerCase()
      return t === aiTitle || (t.length > 10 && aiTitle.includes(t)) || (aiTitle.length > 10 && t.includes(aiTitle))
    })
    if (titleMatch) {
      console.warn("[BSM] AI scenario rejected: title duplicate with", titleMatch.id)
      throw new Error("Duplicate: title matches " + titleMatch.id)
    }
    // Check against recent AI history for this position (exact or near-exact titles only)
    const recentAI = aiHistory.filter(h => h.position === position).slice(-10)
    const aiTitleDup = recentAI.find(h => {
      const t = (h.title || "").toLowerCase()
      if (t === aiTitle) return true
      // Only flag substring match if titles are nearly the same length (within 30%)
      const lenRatio = Math.min(t.length, aiTitle.length) / Math.max(t.length, aiTitle.length)
      return lenRatio > 0.7 && t.length > 10 && (aiTitle.includes(t) || t.includes(aiTitle))
    })
    if (aiTitleDup) {
      console.warn("[BSM] AI scenario rejected: duplicate of recent AI scenario", aiTitleDup.id)
      throw new Error("Duplicate: matches recent AI " + aiTitleDup.id)
    }
    // Module-level dedup — catches exact repeats from stale aiHistory in prefetch/cache
    const moduleTitleDup = _recentAITitles.find(t => t.position === position && t.title === aiTitle)
    if (moduleTitleDup) {
      console.warn("[BSM] AI scenario rejected: exact duplicate of recent generation", moduleTitleDup.title)
      throw new Error("Duplicate: matches recent generation")
    }
    // Topic staleness detection — reject if 3+ recent scenarios share >50% keywords
    if (recentAI.length >= 3) {
      const stopWords = new Set(["the","a","an","in","on","at","to","and","or","of","for","with","is","it","by","as","from","this","that","be","are","was","not","but","do","has","had","he","she","his","her","you","your","we","our","they","their","my","its","no","if","up","out"])
      const getKeywords = (title) => (title || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
      const newKw = getKeywords(scenario.title)
      if (newKw.length >= 3) {
        const recentKws = recentAI.slice(-5).map(h => getKeywords(h.title))
        const overlapCount = recentKws.filter(rKw => {
          const shared = newKw.filter(w => rKw.includes(w)).length
          return shared / Math.min(newKw.length, Math.max(rKw.length, 1)) > 0.5
        }).length
        // Manager titles are more abstract — require higher overlap threshold to avoid false positives
        const stalenessThreshold = position === "manager" ? 4 : 3
        if (overlapCount >= stalenessThreshold) {
          console.warn("[BSM] AI scenario rejected: topic staleness — title keywords overlap with", overlapCount, "recent scenarios")
          throw new Error("Duplicate: topic staleness (" + overlapCount + " keyword overlaps)")
        }
      }
    }

    scenario.id = `ai_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    scenario.isAI = true;
    scenario.cat = "ai-generated";
    scenario.scenarioSource = "ai";

    // Level 2.2: Grade scenario quality and optionally report to server
    try {
      const grade = gradeScenario(scenario, position, targetConcept);
      scenario.qualityGrade = grade.score;
      console.log(`[BSM Grade] ${position}: score=${grade.score}/100, pass=${grade.pass}, deductions=[${grade.deductions.join(', ')}]`)
      console.log(`[BSM Quality] position=${position} concept=${scenario.conceptTag || scenario.concept || 'unknown'} source=standard grade=${grade.score} pass=${grade.pass} cacheHit=false elapsed=${Date.now() - _aiFlowStart}ms`)
      if (grade.score > 0) {
        fetch(WORKER_BASE + "/analytics/scenario-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenario_id: scenario.id, position, score: grade.score, pass: grade.pass, deductions: grade.deductions, source: "standard" })
        }).catch(() => {});
      }
      // Upload to community pool — dynamic threshold: lower bar for underserved positions
      const poolStats = getLocalPoolStats(position)
      const serverCount = _serverPoolCounts?.[position] || 0
      const combinedCount = (poolStats?.count || 0) + serverCount
      const clientPoolThreshold = combinedCount < 5 ? 65 : 75
      console.log(`[BSM Pool Gate] ${position}: grade=${grade.score}, threshold=${clientPoolThreshold}, poolCount=${combinedCount}`)
      if (grade.score >= clientPoolThreshold) {
        submitToServerPool(scenario, position, grade.score / 10, scenario.auditScore || 0, grade.score)
      }
    } catch (e) { /* non-critical */ }

    // Phase B1: Self-audit — lightweight second AI call for baseball authenticity (~33% of the time, Pro only)
    if (stats.isPro && Math.random() < 0.33) {
      try {
        const auditPrompt = `You are a former professional baseball player who coached at every level. Rate this ${position} scenario for baseball authenticity.

SCENARIO: "${scenario.title}" — ${scenario.description}
OPTIONS: ${scenario.options.map((o,i) => `${i+1}. ${o}${i === scenario.best ? " [BEST]" : ""}`).join(" | ")}
BEST ANSWER EXPLANATION: ${scenario.explanations[scenario.best]}

Rate 1-5 on each:
1. REALISTIC: Would this exact situation happen in a real game? (1=never, 5=every game)
2. OPTIONS: Are all 4 options things a real ${position.replace(/([A-Z])/g,' $1').trim().toLowerCase()} would actually consider? (1=absurd, 5=all realistic)
3. COACH: Is the best answer what you'd teach? (1=wrong, 5=exactly right)
4. TONE: Does the explanation sound like a coach talking to a kid? (1=textbook, 5=natural)

Respond with ONLY JSON: {"score":3,"realistic":3,"options":3,"coach":3,"tone":3,"fix":"one sentence suggestion or empty string"}`;

        const auditRes = await Promise.race([
          fetch(AI_PROXY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "grok-4",
              max_tokens: 200,
              temperature: 0.2,
              messages: [
                { role: "system", content: "You are a baseball authenticity auditor. Respond with ONLY valid JSON." },
                { role: "user", content: auditPrompt }
              ]
            })
          }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("audit-timeout")), 5000))
        ]);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          const auditText = auditData.choices?.[0]?.message?.content || "";
          const auditResult = JSON.parse(sanitizeAIResponse(auditText));
          const auditScore = auditResult.score || Math.round((auditResult.realistic + auditResult.options + auditResult.coach + auditResult.tone) / 4);
          console.log("[BSM] AI audit score:", auditScore, "/5 for", scenario.title);
          scenario.auditScore = auditScore;
          // Log to server
          fetch(WORKER_BASE + "/analytics/ai-audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scenario_id: scenario.id, position, score: auditScore, realistic: auditResult.realistic, options_quality: auditResult.options, coach_accuracy: auditResult.coach, tone: auditResult.tone, fix_suggestion: auditResult.fix || "" })
          }).catch(() => {});
          // Score < 3 = reject and retry
          if (auditScore < 3) {
            console.warn("[BSM] AI scenario rejected by audit (score " + auditScore + "):", auditResult.fix);
            throw new Error("Audit rejection: score " + auditScore + " — " + (auditResult.fix || "low authenticity"));
          }
        }
      } catch (auditErr) {
        if (auditErr.message.startsWith("Audit rejection")) throw auditErr;
        console.warn("[BSM] Self-audit failed (non-blocking):", auditErr.message);
      }
    }

    // Shuffle answer positions so best isn't always index 0
    shuffleAnswers(scenario)

    // Track title for module-level dedup (survives across React renders)
    _recentAITitles.push({ title: (scenario.title || "").toLowerCase(), position })
    if (_recentAITitles.length > 20) _recentAITitles.shift()

    // Log prompt version for optimization analysis (non-blocking)
    try {
      const _pvSysLen = JSON.parse(fetchOpts.body).messages?.[0]?.content?.length || 0
      const _pvHash = btoa(prompt.slice(0, 200)).slice(0, 40)
      fetch(WORKER_BASE + "/analytics/prompt-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: scenario.id, position, promptHash: _pvHash,
          systemMessageLength: _pvSysLen, userMessageLength: prompt.length,
          injectedPatches: promptPatchText ? 1 : 0,
          injectedCalibration: calibrationText ? 1 : 0,
          injectedErrorPatterns: _errorPatterns.length > 0 ? 1 : 0,
          injectedAuditInsights: auditInsightText ? 1 : 0,
          generationGrade: scenario.qualityGrade || 0,
          pipeline: "standard", temperature: aiTemp
        })
      }).catch(() => {})
    } catch {}

    return { scenario, abVariants };
  } catch (err) {
    const msg = err.message || "";
    const errType = err.name === "AbortError" ? "aborted"
      : msg === "Timeout" ? "timeout"
      : msg.includes("auth") ? "auth"
      : msg.startsWith("API") ? "api"
      : msg.startsWith("Role violation") ? "role-violation"
      : msg.startsWith("Premise violation") ? "quality-firewall"
      : msg.startsWith("Quality firewall") ? "quality-firewall"
      : msg.startsWith("Consistency violation") ? "consistency-violation"
      : msg.startsWith("Rate-best") ? "rate-mismatch"
      : "parse";
    const detail = msg.startsWith("Parse:") ? msg.slice(7) : msg;
    // Aborts from navigation are expected — log quietly, skip error reporting
    if (errType === "aborted") {
      console.log("[BSM] AI generation aborted (navigation/cancel)");
      return { scenario: null, error: "aborted" };
    }
    console.error("[BSM] AI generation failed:", errType, detail);
    // Detect xAI connect failures and mark as down to skip future xAI calls
    // Narrow to connect-specific errors only — avoid false positives from D1/other failures
    if (/connect.*timeout|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|socket hang up/i.test(msg)) {
      markXaiDown()
    }
    // Sprint 4.4: Report AI errors for monitoring
    reportError("ai_" + errType, detail || errType, { position });
    // Track AI error types per position in localStorage for learning
    try {
      const errStore = JSON.parse(localStorage.getItem("bsm_ai_errors") || "{}");
      const errKey = position + ":" + errType;
      errStore[errKey] = (errStore[errKey] || 0) + 1;
      errStore._lastUpdated = Date.now();
      localStorage.setItem("bsm_ai_errors", JSON.stringify(errStore));
    } catch {}
    return { scenario: null, error: errType, detail };
  }
}

// Shuffle answer positions so best isn't always index 0 (Fisher-Yates)
function shuffleAnswers(scenario) {
  const indices = [0, 1, 2, 3]
  for (let i = 3; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const origBest = scenario.best
  scenario.options = indices.map(i => scenario.options[i])
  scenario.explanations = indices.map(i => scenario.explanations[i])
  scenario.rates = indices.map(i => scenario.rates[i])
  scenario.best = indices.indexOf(origBest)
  return scenario
}

// Fix 3rd-person perspective ("What should the catcher do?") → 2nd-person ("What should you do?")
function fixPerspective(scenario) {
  const P = "pitcher|catcher|first baseman|second baseman|shortstop|third baseman|left fielder|center fielder|right fielder|batter|baserunner|base runner|manager|hitter|fielder|outfielder|infielder|designated hitter|relief pitcher|closer"
  // Build all patterns once
  const pats = [
    [new RegExp(`What should the (${P}) do\\??`, "gi"), "What should you do?"],
    [new RegExp(`[Tt]he (${P}) should`, "g"), "You should"],
    [new RegExp(`the (${P}) needs to`, "gi"), "you need to"],
    [new RegExp(`the (${P}) decides to`, "gi"), "you decide to"],
    [new RegExp(`the (${P}) must`, "gi"), "you must"],
    [new RegExp(`the (${P}) has to`, "gi"), "you have to"],
    [new RegExp(`the (${P}) wants to`, "gi"), "you want to"],
    [new RegExp(`the (${P}) calls for`, "gi"), "you call for"],
    [new RegExp(`the (${P}) is `, "gi"), "you are "],
    [new RegExp(`the (${P}) was `, "gi"), "you were "],
    [new RegExp(`the (${P}) will `, "gi"), "you will "],
    [new RegExp(`the (${P}) would `, "gi"), "you would "],
    [new RegExp(`the (${P}) can `, "gi"), "you can "],
    [new RegExp(`the (${P}) could `, "gi"), "you could "],
    [new RegExp(`the (${P}) throws`, "gi"), "you throw"],
    [new RegExp(`the (${P}) sees`, "gi"), "you see"],
    [new RegExp(`the (${P}) gets`, "gi"), "you get"],
    [new RegExp(`the (${P}) goes`, "gi"), "you go"],
    [new RegExp(`the (${P}) reads`, "gi"), "you read"],
    [new RegExp(`the (${P}) doesn['']t`, "gi"), "you don't"],
  ]
  const fix = (s) => {
    if (!s) return s
    for (const [re, rep] of pats) { re.lastIndex = 0; s = s.replace(re, rep) }
    return s
  }
  if (scenario.description) scenario.description = fix(scenario.description)
  if (scenario.title) scenario.title = fix(scenario.title)
  // Also fix explanations and options
  if (Array.isArray(scenario.explanations)) scenario.explanations = scenario.explanations.map(e => fix(e))
  if (Array.isArray(scenario.options)) scenario.options = scenario.options.map(o => fix(o))
  return scenario
}

// Randomize JSON template values so AI doesn't copy hardcoded examples
function getRandomTemplateValues() {
  const counts = ["0-0","1-0","0-1","1-1","2-1","0-2","3-1","2-2","3-2","-"]
  const runnerStates = [[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
  const innings = ["Top 3","Bot 4","Top 6","Bot 7","Top 2","Bot 9","Top 5","Bot 8"]
  const bestIdx = Math.floor(Math.random() * 4)
  const rates = [0,0,0,0]
  rates[bestIdx] = 75 + Math.floor(Math.random() * 15)
  for (let i = 0; i < 4; i++) if (i !== bestIdx) rates[i] = 15 + Math.floor(Math.random() * 40)
  return {
    count: counts[Math.floor(Math.random() * counts.length)],
    runners: JSON.stringify(runnerStates[Math.floor(Math.random() * runnerStates.length)]),
    inning: innings[Math.floor(Math.random() * innings.length)],
    score: `[${Math.floor(Math.random()*6)},${Math.floor(Math.random()*6)}]`,
    outs: Math.floor(Math.random() * 3),
    best: bestIdx,
    rates: JSON.stringify(rates)
  }
}

// Module-level recent title tracking (survives across React renders, unlike aiHistory)
const _recentAITitles = []

// Pool stats helpers for dynamic quality thresholds
let _serverPoolCounts = {}
const _serverPoolCheckedThisSession = new Set()
const _emptyPoolPositions = new Set() // positions with 0 local + 0 server pool entries
try {
  fetch(WORKER_BASE + "/scenario-pool/stats")
    .then(r => r.json()).then(d => { _serverPoolCounts = d.counts || {} }).catch(() => {})
} catch {}
function getLocalPoolStats(position) {
  try {
    const pool = JSON.parse(localStorage.getItem('bsm_local_pool') || '{}')
    return { count: (pool[position] || []).length }
  } catch { return { count: 0 } }
}

// ═══════════════════════════════════════════════════════════════
// generateAISituation — creates multi-position situation sets via AI
// ═══════════════════════════════════════════════════════════════
const AI_SIT_GAME_STATES = [
  {label:"Bases Loaded Jam",runners:[1,2,3],outs:1,count:"1-2",posPool:["pitcher","catcher","baserunner","firstBase","shortstop","batter","manager"],anim:"doubleplay"},
  {label:"Steal Attempt",runners:[1],outs:0,count:"1-1",posPool:["pitcher","catcher","shortstop","secondBase","baserunner"],anim:"steal"},
  {label:"Sacrifice Bunt",runners:[1],outs:0,count:"0-0",posPool:["pitcher","thirdBase","firstBase","batter","secondBase"],anim:"bunt"},
  {label:"Extra-Base Hit to Gap",runners:[1],outs:1,count:"0-0",posPool:["centerField","leftField","shortstop","secondBase","baserunner"],anim:"hit"},
  {label:"Runner on Third, Less Than Two Outs",runners:[3],outs:1,count:"1-0",posPool:["pitcher","catcher","thirdBase","batter","baserunner","manager"],anim:"score"},
  {label:"Double Play Situation",runners:[1],outs:0,count:"0-1",posPool:["pitcher","catcher","shortstop","secondBase","firstBase"],anim:"doubleplay"},
  {label:"First-and-Third Steal",runners:[1,3],outs:0,count:"1-0",posPool:["catcher","pitcher","shortstop","secondBase","baserunner","manager"],anim:"steal"},
  {label:"Fly Ball to the Wall",runners:[2],outs:1,count:"0-0",posPool:["rightField","centerField","leftField","baserunner","firstBase"],anim:"flyout"},
  {label:"Wild Pitch / Passed Ball",runners:[2,3],outs:1,count:"2-2",posPool:["pitcher","catcher","thirdBase","baserunner","firstBase"],anim:"score"},
  {label:"Rundown Between Bases",runners:[1,3],outs:1,count:"0-0",posPool:["pitcher","firstBase","secondBase","shortstop","baserunner","thirdBase"],anim:"safe"},
  {label:"Batter's Count Decision",runners:[1,2],outs:1,count:"3-1",posPool:["batter","baserunner","pitcher","catcher","manager"],anim:"hit"},
  {label:"Late-Inning Hold",runners:[1,2],outs:2,count:"2-2",posPool:["pitcher","catcher","shortstop","centerField","manager"],anim:"strikeout"},
];

async function generateAISituation(stats, signal = null) {
  const ageGroup = stats.ageGroup || "11-12";
  const ageNum = parseInt(ageGroup) || 11;
  const diffTarget = ageNum >= 13 ? 3 : ageNum >= 9 ? 2 : 1;
  const ps = stats.ps || {};
  const cm = (stats.masteryData?.concepts) || {};

  // 1. Identify 3-4 positions based on player weaknesses
  const weakPositions = [];
  const strongPositions = [];
  Object.entries(ps).forEach(([p, v]) => {
    if (v.p >= 5 && (v.c / v.p) < 0.5) weakPositions.push(p);
    else if (v.p >= 5 && (v.c / v.p) >= 0.7) strongPositions.push(p);
  });
  // Add degraded concept positions
  const degradedPos = new Set();
  Object.entries(cm).filter(([, v]) => v.state === "degraded").forEach(([tag]) => {
    const concept = BRAIN.concepts[tag];
    if (concept?.domain) {
      const domainPos = { pitching: "pitcher", defense: "shortstop", hitting: "batter", baserunning: "baserunner", strategy: "manager" };
      if (domainPos[concept.domain]) degradedPos.add(domainPos[concept.domain]);
    }
  });

  // 2. Select a coherent game state that matches player needs
  const shuffledStates = [...AI_SIT_GAME_STATES].sort(() => Math.random() - 0.5);
  let chosenState = shuffledStates[0];
  // Prefer states whose posPool overlaps with weak/degraded positions
  for (const state of shuffledStates) {
    const overlapCount = state.posPool.filter(p => weakPositions.includes(p) || degradedPos.has(p)).length;
    if (overlapCount >= 2) { chosenState = state; break; }
  }

  // 3. Pick 3-4 positions from the state's pool — prioritize weak/degraded
  const posPool = [...chosenState.posPool];
  const numPos = Math.min(posPool.length, Math.random() < 0.5 ? 3 : 4);
  const selectedPos = [];
  // First add weak/degraded positions that are in the pool
  for (const p of posPool) {
    if (selectedPos.length >= numPos) break;
    if ((weakPositions.includes(p) || degradedPos.has(p)) && !selectedPos.includes(p)) selectedPos.push(p);
  }
  // Fill remaining slots randomly from pool (no duplicates)
  const remaining = posPool.filter(p => !selectedPos.includes(p)).sort(() => Math.random() - 0.5);
  for (const p of remaining) {
    if (selectedPos.length >= numPos) break;
    selectedPos.push(p);
  }

  // 4. Build game context
  const innings = ["Top 3", "Bot 4", "Top 6", "Bot 7", "Top 2", "Bot 9", "Top 5", "Bot 8"];
  const inning = innings[Math.floor(Math.random() * innings.length)];
  const score = [Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)];
  const situation = { inning, outs: chosenState.outs, count: chosenState.count, runners: chosenState.runners, score };

  // 5. Gather position-specific context for each position
  const posContexts = selectedPos.map(pos => {
    const principle = AI_POS_PRINCIPLES[pos] || POS_PRINCIPLES[pos] || "";
    const mapText = getAIMap(pos);
    return `POSITION: ${pos}\nRULES: ${principle}\n${mapText}`;
  }).join("\n\n");

  // Decision windows and coaching voice
  let decisionText = "";
  const dwKeys = new Set(selectedPos.map(p =>
    ["firstBase", "secondBase", "shortstop", "thirdBase"].includes(p) ? "infielder" :
    ["leftField", "centerField", "rightField"].includes(p) ? "outfielder" : p
  ));
  for (const key of dwKeys) {
    const w = DECISION_WINDOWS[key];
    if (w) decisionText += `\n${key.toUpperCase()} TIMING: ${Object.entries(w).map(([k, v]) => `${k}: ${v}`).join(". ")}`;
  }

  let coachVoice = "";
  if (COACHING_VOICE.tone_guidance.length > 0) {
    const picks = [...COACHING_VOICE.tone_guidance].sort(() => Math.random() - 0.5).slice(0, 3);
    coachVoice = "\nCOACHING VOICE — explanations should sound like a coach, not a textbook:\n" + picks.map(v => `- "${v}"`).join("\n");
  }

  // Real game situations for context
  let realGameFeel = "";
  try {
    const allSits = selectedPos.flatMap(pos => {
      const key = ["famous","rules","counts"].includes(pos) ? "manager" : pos;
      return (REAL_GAME_SITUATIONS[pos] || REAL_GAME_SITUATIONS[key] || []).slice(0, 2);
    });
    if (allSits.length > 0) {
      const picks = allSits.sort(() => Math.random() - 0.5).slice(0, 3);
      realGameFeel = "\nREAL GAME FEEL:\n" + picks.map(s => `- "${s.setup}" → Real: ${s.real_decision}. Mistake: ${s.common_mistake}`).join("\n");
    }
  } catch {}

  // Mastery context
  const degraded = Object.entries(cm).filter(([, v]) => v.state === "degraded").map(([t]) => t);
  const learning = Object.entries(cm).filter(([, v]) => v.state === "learning").map(([t]) => t);
  let masteryHint = "";
  if (degraded.length > 0) masteryHint += `\nDEGRADED CONCEPTS (test these): ${degraded.slice(0, 3).join(", ")}.`;
  if (learning.length > 0) masteryHint += `\nLEARNING CONCEPTS (reinforce): ${learning.slice(0, 3).join(", ")}.`;

  // Age gate
  const ageGate = CONCEPT_GATES[ageGroup];
  const ageText = ageGate?.adjustments ? `\nAGE GROUP: ${ageGroup}\n${Object.entries(ageGate.adjustments).map(([k, v]) => `- ${k}: ${v}`).join("\n")}${ageGate.forbidden?.length > 0 ? `\nFORBIDDEN: ${ageGate.forbidden.join(", ")}` : ""}` : "";

  // Template values for JSON example
  const bestIdx = Math.floor(Math.random() * 4);
  const exRates = [0, 0, 0, 0];
  exRates[bestIdx] = 75 + Math.floor(Math.random() * 15);
  for (let i = 0; i < 4; i++) if (i !== bestIdx) exRates[i] = 15 + Math.floor(Math.random() * 40);

  // Handcrafted example for few-shot
  const exampleSet = SITUATION_SETS.find(s => s.diff === diffTarget) || SITUATION_SETS[0];
  const fewShot = exampleSet ? JSON.stringify({
    title: exampleSet.title, emoji: exampleSet.emoji, color: exampleSet.color, diff: exampleSet.diff,
    situation: exampleSet.situation, desc: exampleSet.desc,
    debrief: (exampleSet.debrief || "").slice(0, 300),
    teamworkTakeaway: exampleSet.teamworkTakeaway || "",
    questions: exampleSet.questions.slice(0, 2).map(q => ({
      pos: q.pos, id: q.id, conceptTag: q.conceptTag, title: q.title, diff: q.diff,
      options: q.options, best: q.best, explanations: q.explanations.map(e => e.slice(0, 150) + "..."),
      rates: q.rates, concept: q.concept, anim: q.anim
    }))
  }) : "";

  // 6. Build the prompt
  const userPrompt = `Create a multi-position SITUATION SET for Baseball Strategy Master.

GAME STATE: ${inning}, ${chosenState.outs} out${chosenState.outs !== 1 ? "s" : ""}, count ${chosenState.count}, runners: ${JSON.stringify(chosenState.runners)}, score: ${JSON.stringify(score)}
SITUATION THEME: ${chosenState.label}
POSITIONS TO INCLUDE: ${selectedPos.join(", ")} (generate one question per position)
DIFFICULTY: ${diffTarget}/3
PLAYER: Level ${getLvl(stats.pts).n}, age group ${ageGroup}${ageText}${masteryHint}

SCORE RULES:
- score=[HOME, AWAY]. Home bats in "Bot" half, away in "Top".
- Double-check: description references must match the score array.

POSITION-SPECIFIC CONTEXT:
${posContexts}

DECISION TIMING — ALL options for each position must occur at the SAME moment in the play:${decisionText}
${coachVoice}${realGameFeel}

CRITICAL RULES:
1. All ${selectedPos.length} questions describe decisions at the SAME MOMENT of the same play.
2. Each position can ONLY do actions appropriate to their role.
3. Each question has exactly 4 options, 1 best answer, 4 explanations (2-4 sentences each), 4 rates.
4. The debrief narrative must mention ALL ${selectedPos.length} positions and how their decisions connect.
5. teamworkTakeaway: one sentence about the teamwork lesson.
6. Each question needs a conceptTag from: pitch-sequencing, steal-window, bunt-defense, dp-positioning, relay-double-cut, baserunning-rates, force-vs-tag, fly-ball-priority, cutoff-relay, situational-hitting, bunt-re24, pickoff-mechanics, secondary-lead, squeeze-recognition.
7. Explanations must reference specific game situation (score, inning, outs, runners).
8. rates[best] MUST be highest for each question (75-90 optimal, 15-40 poor).
9. VARY the best answer index across questions (don't always use 0).
10. anim per question: one of ${ANIMS.join("|")}.

EXAMPLE of a situation set:
${fewShot}

Respond with ONLY valid JSON:
{"title":"Short Title","emoji":"🔥","color":"#ef4444","diff":${diffTarget},"situation":{"inning":"${inning}","outs":${chosenState.outs},"count":"${chosenState.count}","runners":${JSON.stringify(chosenState.runners)},"score":${JSON.stringify(score)}},"desc":"2-3 sentence description","debrief":"Narrative of how the play unfolded connecting all positions","teamworkTakeaway":"One sentence teamwork lesson","questions":[{"pos":"${selectedPos[0]}","conceptTag":"tag","title":"Short title","diff":${diffTarget},"options":["A","B","C","D"],"best":${bestIdx},"explanations":["Why A","Why B","Why C","Why D"],"rates":${JSON.stringify(exRates)},"concept":"One sentence lesson","anim":"strike"},...]}`

  const systemPrompt = `You are the smartest, most experienced baseball coach in the world. You create MULTI-POSITION situation sets for Baseball Strategy Master, a strategy-teaching app for kids 6-18.

OUTPUT: Respond with ONLY a valid JSON object. No markdown, no code fences, no text outside the JSON.

Each situation set presents ONE game moment from multiple positions' perspectives. Every position faces a realistic decision at the same time. The debrief explains how all decisions connect — that's what makes baseball a team sport.

EXPLANATION RULES:
- Each explanation: 2-4 sentences. Write from "you" perspective.
- BEST answer: name action → why correct in THIS situation → positive result.
- WRONG answer: name action → concrete consequences → what makes it wrong.
- Reference specific game state (score, inning, outs, runners).
- No jargon (RE24, OBP, wOBA) in options. Stats only in explanations for older players.

OPTION RULES:
- All 4 options for each position happen at the SAME decision moment.
- Each option is a SPECIFIC, CONCRETE action.
- At least one option should be a common MISTAKE a young player would make.
- No near-duplicates within a question's options.

POSITION BOUNDARIES: Each position can ONLY do actions that position actually performs. Pitcher ≠ cutoff/relay. Fielders ≠ IBB/pitching changes. Baserunner ≠ calling plays.`;

  const _t0 = Date.now();
  try {
    const fetchOpts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "grok-4",
        max_tokens: 4000,
        temperature: 0.4,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    };
    if (signal) fetchOpts.signal = signal;
    console.log("[BSM] AI Situation fetch starting, positions:", selectedPos.join(","), "model: grok-4");
    const response = await Promise.race([
      fetch(AI_PROXY_URL, fetchOpts),
      new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), 45000))
    ]);
    const _ms = Date.now() - _t0;

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error("[BSM] AI Situation API error:", response.status, "(" + _ms + "ms)", errBody.slice(0, 200));
      throw new Error(`API ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason || "unknown";
    console.log("[BSM] AI Situation response in " + _ms + "ms, length:", text.length, "finish:", finishReason);
    if (!text) throw new Error("Empty response");
    if (finishReason === "length") throw new Error("Truncated response");

    const sanitized = sanitizeAIResponse(text);
    let sitSet;
    try { sitSet = JSON.parse(sanitized); }
    catch (e) { console.error("[BSM] AI Situation JSON parse failed:", e.message); throw new Error("Parse: invalid JSON"); }

    // ─── VALIDATION ─── Layer 1: Structure
    const missing = [];
    if (!sitSet.title || typeof sitSet.title !== "string") missing.push("title");
    if (!sitSet.desc || typeof sitSet.desc !== "string") missing.push("desc");
    if (!sitSet.situation || typeof sitSet.situation !== "object") missing.push("situation");
    if (!sitSet.debrief || typeof sitSet.debrief !== "string") missing.push("debrief");
    if (!Array.isArray(sitSet.questions) || sitSet.questions.length < 3) missing.push("questions(min 3)");
    if (missing.length > 0) throw new Error("Structure: missing " + missing.join(", "));

    // Normalize situation
    if (!Array.isArray(sitSet.situation.runners)) sitSet.situation.runners = chosenState.runners;
    if (!Array.isArray(sitSet.situation.score)) sitSet.situation.score = score;
    sitSet.situation.outs = Math.max(0, Math.min(2, Number(sitSet.situation.outs) || chosenState.outs));
    if (!sitSet.situation.inning) sitSet.situation.inning = inning;
    if (!sitSet.situation.count) sitSet.situation.count = chosenState.count;

    // Normalize top-level fields
    if (!sitSet.emoji || typeof sitSet.emoji !== "string") sitSet.emoji = "🤖";
    if (!sitSet.color || typeof sitSet.color !== "string") sitSet.color = "#8b5cf6";
    if (![1, 2, 3].includes(sitSet.diff)) sitSet.diff = diffTarget;
    if (!sitSet.teamworkTakeaway) sitSet.teamworkTakeaway = "Every position's decision connects to every other position's decision.";

    // ─── VALIDATION ─── Layer 2: Per-question validation
    const validQuestions = [];
    for (let qi = 0; qi < sitSet.questions.length; qi++) {
      const q = sitSet.questions[qi];
      const qMissing = [];
      if (!q.pos || typeof q.pos !== "string") qMissing.push("pos");
      if (!q.options || q.options.length !== 4) qMissing.push("options");
      if (!q.explanations || q.explanations.length !== 4) qMissing.push("explanations");
      if (typeof q.best !== "number" || q.best < 0 || q.best > 3) qMissing.push("best");
      if (!q.rates || q.rates.length !== 4) qMissing.push("rates");
      if (!q.concept) qMissing.push("concept");
      if (qMissing.length > 0) {
        console.warn("[BSM] AI Sit Q" + qi + " invalid:", qMissing.join(", "));
        continue; // skip invalid questions
      }
      // Auto-fix rates[best] alignment
      const maxRate = Math.max(...q.rates);
      if (q.rates[q.best] !== maxRate) {
        q.best = q.rates.indexOf(maxRate);
      }
      // Ensure valid anim
      if (!ANIMS.includes(q.anim)) q.anim = chosenState.anim || "freeze";
      // Ensure difficulty
      if (![1, 2, 3].includes(q.diff)) q.diff = diffTarget;
      // Generate unique ID
      q.id = `ai_sit_${Date.now()}_${qi}_${Math.random().toString(36).slice(2, 6)}`;
      // Default title
      if (!q.title) q.title = `${(POS_META[q.pos]?.label || q.pos)}: Make the Play`;
      // Default conceptTag
      if (!q.conceptTag) q.conceptTag = "situational-hitting";
      // Strip [BEST] prefix
      if (q.options) q.options = q.options.map(o => o.replace(/^\[BEST\]\s*/i, ""));

      // Run QUALITY_FIREWALL on individual question
      try {
        const fwResult = QUALITY_FIREWALL.validate(q, q.pos);
        if (!fwResult.pass) {
          console.warn("[BSM] AI Sit Q" + qi + " firewall fail:", fwResult.tier1Fails.map(f => f.message).join("; "));
          continue; // skip this question
        }
      } catch {}

      // Role violation check per question
      const ROLE_VIOLATIONS_MAP = {
        pitcher: [/pitcher.*cutoff/i, /pitcher.*relay\s*man/i, /pitcher.*covers?\s*(second|2nd|third|3rd)\b/i],
        catcher: [/catcher.*cutoff/i, /catcher.*goes?\s*out.*cutoff/i],
        shortstop: [/SS\s*covers?\s*(1st|first)\b.*bunt/i],
        secondBase: [/2B\s*covers?\s*(3rd|third)\b.*bunt/i],
        batter: [/you\s+(field|throw\s+to\s+(first|second|third)|cover\s+(first|second|third|home)|pitch|deliver)/i],
        baserunner: [/you\s+(field|catch\s+the\s+(ball|throw)|pitch|bat|swing|throw\s+to)/i],
        manager: [/you\s+(throw|catch|field|tag|dive|slide|pitch|bat|swing|bunt|run\s+to)/i],
      };
      const posViolations = ROLE_VIOLATIONS_MAP[q.pos] || [];
      const qAllText = [q.title || "", ...(q.options || []), ...(q.explanations || [])].join(" ");
      if (posViolations.some(rx => rx.test(qAllText))) {
        console.warn("[BSM] AI Sit Q" + qi + " role violation for", q.pos);
        continue;
      }

      // Shuffle answers
      shuffleAnswers(q);
      validQuestions.push(q);
    }

    if (validQuestions.length < 3) {
      throw new Error("Quality: only " + validQuestions.length + " valid questions (need 3+)");
    }

    // ─── VALIDATION ─── Layer 10: Cross-position temporal consistency
    // All questions should reference the same game moment
    const posSet = new Set(validQuestions.map(q => q.pos));
    if (posSet.size < validQuestions.length) {
      // Deduplicate positions — keep first occurrence
      const seen = new Set();
      const deduped = [];
      for (const q of validQuestions) {
        if (!seen.has(q.pos)) { seen.add(q.pos); deduped.push(q); }
      }
      validQuestions.length = 0;
      validQuestions.push(...deduped);
    }

    // ─── VALIDATION ─── Layer 13: Debrief mentions all positions
    const debriefLower = (sitSet.debrief || "").toLowerCase();
    const mentionedCount = validQuestions.filter(q => {
      const posName = (POS_META[q.pos]?.label || q.pos).toLowerCase();
      return debriefLower.includes(posName) || debriefLower.includes(q.pos.toLowerCase());
    }).length;
    if (mentionedCount < Math.ceil(validQuestions.length * 0.5)) {
      console.warn("[BSM] AI Sit debrief only mentions " + mentionedCount + "/" + validQuestions.length + " positions");
      // Auto-fix: append missing positions to debrief
      const missing = validQuestions.filter(q => {
        const posName = (POS_META[q.pos]?.label || q.pos).toLowerCase();
        return !debriefLower.includes(posName) && !debriefLower.includes(q.pos.toLowerCase());
      });
      if (missing.length > 0) {
        sitSet.debrief += " Meanwhile, the " + missing.map(q => POS_META[q.pos]?.label || q.pos).join(" and ") + " executed their assignments.";
      }
    }

    // Build final situation set
    const finalSet = {
      id: `ai_sit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: sitSet.title,
      emoji: sitSet.emoji,
      color: sitSet.color,
      diff: sitSet.diff,
      situation: sitSet.situation,
      desc: sitSet.desc,
      debrief: sitSet.debrief,
      teamworkTakeaway: sitSet.teamworkTakeaway,
      questions: validQuestions,
      isAI: true,
    };

    console.log("[BSM] AI Situation generated:", finalSet.title, "(" + validQuestions.length + " questions)");
    return finalSet;
  } catch (err) {
    const msg = err.message || "";
    const elapsed = Date.now() - _t0;
    if (err.name === "AbortError") {
      console.warn("[BSM] AI Situation aborted after " + elapsed + "ms (likely timeout)");
    } else {
      console.error("[BSM] AI Situation generation failed after " + elapsed + "ms:", msg);
    }
    reportError("ai_situation", msg, { positions: selectedPos.join(","), elapsed });
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Community Scenario Pool — 3-tier retrieval system
// Tier 1: localStorage pool (unused pre-cached scenarios)
// Tier 2: Server pool (community-contributed quality scenarios)
// Tier 3: Fresh AI generation (fallback)
// ═══════════════════════════════════════════════════════════════
// Session-level tracker for served scenario IDs — bypasses React state batching
const _servedScenarioIds = new Set()
const _servedScenarioTitles = new Set()
// Seed served titles from persisted aiHistory so pool scenarios
// aren't re-served across sessions (title-based cross-session dedup)
try {
  const stored = JSON.parse(localStorage.getItem("bsm_v5") || "{}")
  const hist = stored.aiHistory || []
  hist.forEach(h => {
    if (h.title) _servedScenarioTitles.add(h.title)
    if (h.id) _servedScenarioIds.add(h.id)
  })
  if (_servedScenarioTitles.size > 0) {
    console.log("[BSM] Seeded", _servedScenarioTitles.size, "served titles from aiHistory for cross-session dedup")
  }
} catch (e) { /* localStorage not available */ }

const LOCAL_POOL_KEY = "bsm_scenario_pool"
const LOCAL_POOL_MAX = 75 // max scenarios stored locally (≥5 per position)

function getLocalPool() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_POOL_KEY) || "[]")
  } catch { return [] }
}

// Circuit breaker for AI calls — per-position, persists across refreshes (15 min TTL)
const CB_TTL = 15 * 60 * 1000 // 15 minutes
function getCircuitBreaker(position) {
  try {
    const key = position ? "bsm_cb_" + position : "bsm_circuit_breaker"
    const raw = JSON.parse(localStorage.getItem(key) || '{"responseTimes":[],"failures":0,"openUntil":0,"savedAt":0}')
    // Expire stale circuit breakers (15 min TTL)
    if (raw.savedAt && Date.now() - raw.savedAt > CB_TTL) {
      localStorage.removeItem(key)
      return { responseTimes: [], failures: 0, openUntil: 0 }
    }
    return raw
  } catch { return { responseTimes: [], failures: 0, openUntil: 0 } }
}
function updateCircuitBreaker(cb, position) {
  try {
    const key = position ? "bsm_cb_" + position : "bsm_circuit_breaker"
    cb.savedAt = Date.now()
    localStorage.setItem(key, JSON.stringify(cb))
  } catch {}
}
function clearAllCircuitBreakers() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith("bsm_cb_") || k === "bsm_circuit_breaker")) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
    if (keys.length > 0) console.log("[BSM] Cleared", keys.length, "circuit breaker(s) on app load")
  } catch {}
}

function saveToLocalPool(scenario, position) {
  try {
    if (!scenario?.title || !scenario?.options) {
      console.warn("[BSM DEBUG] saveToLocalPool called with invalid scenario for", position, "— got:", typeof scenario, scenario ? Object.keys(scenario).join(",") : "null")
      return
    }
    const pool = getLocalPool()
    // Dedup by title + position
    if (pool.some(p => p.scenario.title === scenario.title && p.position === position)) return
    pool.push({
      scenario,
      position,
      difficulty: scenario.diff || 2,
      conceptTag: scenario.conceptTag || "",
      quality: scenario.qualityGrade || 0,
      savedAt: Date.now()
    })
    // Trim to max, removing oldest first
    while (pool.length > LOCAL_POOL_MAX) pool.shift()
    localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(pool))
    console.log("[BSM DEBUG] saveToLocalPool:", position, "title:", scenario.title, "diff:", scenario.diff, "pool size after save:", pool.length)
  } catch (e) {
    console.warn("[BSM DEBUG] saveToLocalPool FAILED:", e.message)
  }
}

function consumeFromLocalPool(position, difficulty, excludeIds = []) {
  try {
    const pool = getLocalPool()
    const forPos = pool.filter(p => p.position === position)
    const forDiff = forPos.filter(p => p.difficulty <= difficulty)
    const matchIdx = pool.findIndex(p =>
      p.position === position &&
      p.difficulty <= difficulty &&
      !excludeIds.includes(p.scenario.id)
    )
    console.log("[BSM DEBUG] consumeFromLocalPool:", position, "| raw pool:", pool.length, "| for position:", forPos.length, "| diff <="+difficulty+":", forDiff.length, "| match after exclude:", matchIdx >= 0 ? "YES" : "NO")
    if (matchIdx === -1) return null
    const match = pool.splice(matchIdx, 1)[0]
    localStorage.setItem(LOCAL_POOL_KEY, JSON.stringify(pool))
    console.log("[BSM Pool] Consumed from local pool:", match.scenario.title)
    return match.scenario
  } catch { return null }
}

async function fetchFromServerPool(position, difficulty, conceptTag, excludeIds = [], excludeTitles = []) {
  try {
    const params = new URLSearchParams({ position, difficulty: String(difficulty) })
    if (conceptTag) params.set("concept", conceptTag)
    if (excludeIds.length > 0) {
      params.set("exclude", excludeIds.slice(0, 100).join(","))
    }
    if (excludeTitles.length > 0) {
      params.set("exclude_titles", excludeTitles.slice(0, 50).join("|"))
    }
    const response = await Promise.race([
      fetch(WORKER_BASE + "/scenario-pool/fetch?" + params.toString()),
      new Promise((_, rej) => setTimeout(() => rej(new Error("pool-timeout")), 5000))
    ])
    if (!response.ok) return null
    const data = await response.json()
    if (data.scenarios && data.scenarios.length > 0) {
      console.log("[BSM Pool] Fetched from server pool:", data.scenarios.length, "scenarios. Pool size:", data.pool_size)
      return data.scenarios[0] // return best match
    }
    return null
  } catch (e) {
    console.warn("[BSM Pool] Server fetch failed:", e.message)
    return null
  }
}

const UNDERSERVED_POSITIONS = ['secondBase','shortstop','thirdBase','firstBase','rightField','manager','rules','famous','counts']
function submitToServerPool(scenario, position, qualityScore, auditScore, generationGrade) {
  // Non-blocking — fire and forget (worker enforces dynamic quality gate per position pool size)
  const poolGate = UNDERSERVED_POSITIONS.includes(position) ? 6.5 : 7.5
  if ((qualityScore || 0) < poolGate) {
    console.log("[BSM Pool] Skipped — quality too low:", qualityScore, "gate:", poolGate, "for", position)
    return
  }
  console.log("[BSM Pool] Submitting to server pool:", position, "score:", qualityScore, "grade:", generationGrade, "title:", scenario.title)
  const poolCtrl = new AbortController()
  const poolTimeout = setTimeout(() => poolCtrl.abort(), 10000)
  fetch(WORKER_BASE + "/scenario-pool/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenario,
      position,
      quality_score: qualityScore,
      audit_score: auditScore || 0,
      source: "ai",
      generation_grade: generationGrade || null
    }),
    signal: poolCtrl.signal
  }).then(r => {
    clearTimeout(poolTimeout)
    if (r.ok) r.json().then(data => {
      if (data.status === "added") console.log("[BSM Pool] Added to server pool:", scenario.title, "score:", qualityScore)
      else if (data.status === "duplicate_updated") console.log("[BSM Pool] Updated existing:", scenario.title)
      else console.log("[BSM Pool] Rejected:", JSON.stringify(data))
    })
    else r.json().then(j => console.warn("[BSM Pool] Server rejected:", j.error, "min:", j.min, "got:", j.got)).catch(() => console.warn("[BSM Pool] Server error:", r.status))
  }).catch(err => {
    clearTimeout(poolTimeout)
    console.warn("[BSM Pool] Submission failed:", err.message)
  })
}

function reportPoolFeedback(poolId, correct, flagged = false) {
  if (!poolId || !poolId.startsWith("pool_")) return // only for pool scenarios
  fetch(WORKER_BASE + "/scenario-pool/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pool_id: poolId, correct, flagged })
  }).catch(() => {})
}

// Sprint 5: AI pre-generation cache — unified into aiCacheRef (passed from App)
const _prefetchControllers = {} // per-position AbortControllers
function _updateFetchingCompat(cacheRef) {
  if (!cacheRef?.current) return
  cacheRef.current.fetching = Object.values(cacheRef.current.fetchingPositions || {}).some(Boolean)
}
async function prefetchAIScenario(position, stats, conceptsLearned, recentWrong, aiHistory, lastScenario = null, targetConcept = null, cacheRef = null) {
  if (!cacheRef?.current) return
  if (!cacheRef.current.fetchingPositions) cacheRef.current.fetchingPositions = {}
  if (cacheRef.current.fetchingPositions[position]) return
  // Global concurrency limit: max 2 concurrent xAI calls
  const activeFetches = Object.values(cacheRef.current.fetchingPositions).filter(Boolean).length
  if (activeFetches >= 2) return
  // Save existing cache for different position to local pool before overwriting
  const existingPositions = Object.keys(cacheRef.current.scenarios || {})
  for (const pos of existingPositions) {
    if (pos !== position && cacheRef.current.scenarios[pos]?.scenario) {
      saveToLocalPool(cacheRef.current.scenarios[pos].scenario.scenario, pos)
      cacheRef.current.scenarios[pos] = null
    }
  }
  if (cacheRef.current.scenarios[position]?.scenario) return // already cached for this position
  cacheRef.current.fetchingPositions[position] = true
  _updateFetchingCompat(cacheRef)
  _prefetchControllers[position] = new AbortController()
  const promise = generateAIScenario(position, stats, conceptsLearned, recentWrong, _prefetchControllers[position].signal, targetConcept, aiHistory, lastScenario, 100000, true)
  // Store in-flight promise so doAI can await it instead of launching a duplicate call
  if (!cacheRef.current.inFlightPromise) cacheRef.current.inFlightPromise = {}
  cacheRef.current.inFlightPromise[position] = promise
  promise.finally(() => {
    if (cacheRef.current.inFlightPromise?.[position] === promise) {
      delete cacheRef.current.inFlightPromise[position]
    }
  })
  try {
    console.log("[BSM] Pre-fetch", position, "using independent budget: 100s, targeting concept:", targetConcept || "any")
    const result = await promise
    if (result.scenario) {
      cacheRef.current.scenarios[position] = { scenario: result, timestamp: Date.now() }
      console.log("[BSM] AI scenario pre-cached for", position + ":", result.scenario.title)
    }
  } catch (e) {
    if (e.name === 'AbortError' || _prefetchControllers[position]?.signal?.aborted) {
      console.log("[BSM] Pre-fetch cancelled for", position)
    } else {
      console.warn("[BSM] Pre-fetch failed for", position + ":", e.message)
    }
  } finally {
    cacheRef.current.fetchingPositions[position] = false
    _updateFetchingCompat(cacheRef)
    delete _prefetchControllers[position]
  }
}
// Background pool filler — sequential queue, max 1 xAI call at a time
const _bgQueue = [] // [{position, stats, count}]
let _bgRunning = false
async function fillLocalPool(position, stats, count = 1) {
  // Deduplicate: skip if this position is already queued or running
  if (_bgQueue.some(q => q.position === position)) return
  _bgQueue.push({ position, stats, count })
  _drainBgQueue()
}
async function _drainBgQueue() {
  if (_bgRunning || _bgQueue.length === 0) return
  _bgRunning = true
  while (_bgQueue.length > 0) {
    const { position, stats, count } = _bgQueue.shift()
    for (let i = 0; i < count; i++) {
      try {
        const ctrl = new AbortController()
        const result = await generateAIScenario(position, stats, stats.cl || [], stats.recentWrong || [], ctrl.signal, null, stats.aiHistory || [], null, 100000, true)
        if (result?.scenario) {
          saveToLocalPool(result.scenario, position)
          console.log("[BSM Pool Fill]", position, "(" + (i+1) + "/" + count + "):", result.scenario.title)
        }
      } catch (e) {
        console.warn("[BSM Pool Fill] Failed for", position + ":", e.message)
        break
      }
      // Delay between sequential fills so xAI isn't overwhelmed
      if (i < count - 1 || _bgQueue.length > 0) await new Promise(r => setTimeout(r, 5000))
    }
  }
  _bgRunning = false
}

function consumeCachedAI(position, cacheRef = null) {
  if (!cacheRef?.current) return null
  const cached = cacheRef.current.scenarios?.[position]
  if (cached?.scenario) {
    // Discard if older than 5 minutes
    if (cached.timestamp && (Date.now() - cached.timestamp) > 300000) {
      cacheRef.current.scenarios[position] = null
      console.log("[BSM] Discarded stale pre-cached scenario for", position, "(age:", Math.round((Date.now() - cached.timestamp) / 1000) + "s)")
      return null
    }
    const entry = cached.scenario
    cacheRef.current.scenarios[position] = null
    console.log("[BSM] Consuming pre-cached scenario for " + position + ": " + (entry.scenario?.title || "unknown"))
    return entry
  }
  console.log("[BSM] No pre-cached scenario available for", position)
  return null
}
function cancelPrefetch() {
  for (const [pos, ctrl] of Object.entries(_prefetchControllers)) {
    if (ctrl) ctrl.abort()
    delete _prefetchControllers[pos]
  }
}
function cancelPrefetchExcept(position, cacheRef) {
  for (const [pos, ctrl] of Object.entries(_prefetchControllers)) {
    if (pos !== position && ctrl) {
      ctrl.abort()
      delete _prefetchControllers[pos]
      if (cacheRef?.current?.fetchingPositions) {
        cacheRef.current.fetchingPositions[pos] = false
      }
      console.log("[BSM] Cancelled stale prefetch for", pos, "— player picked", position)
    }
  }
  _updateFetchingCompat(cacheRef)
}

