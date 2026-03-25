const BRAIN = { stats: {
  // RE24 source: FanGraphs run expectancy matrix, 2015-2024 MLB averages.
  // Stable across pitch clock era — 2023 run environment (4.45 R/G) within normal variance.
  // Values verified 2024. Do not round further — 2 decimal places is correct precision.
  // Run Expectancy Matrix: RE24[runnersKey][outs] = expected runs from this state onward
  // Keys: "---"=empty, "1--"=1st, "-2-"=2nd, "--3"=3rd, "12-"=1st+2nd, "1-3"=1st+3rd, "-23"=2nd+3rd, "123"=loaded
  RE24: {
    "---":[0.54,0.29,0.11], "1--":[0.94,0.56,0.24], "-2-":[1.17,0.71,0.33],
    "--3":[1.43,0.98,0.37], "12-":[1.56,0.96,0.46], "1-3":[1.83,1.21,0.52],
    "-23":[2.05,1.44,0.60], "123":[2.29,1.59,0.77],
  },
  // Count leverage: countData[count] = batting metrics and label
  countData: {
    "0-0":{ba:.340,obp:.340,slg:.555,label:"First Pitch",edge:"neutral"},
    "1-0":{ba:.345,obp:.345,slg:.550,label:"Hitter's Advantage",edge:"hitter"},
    "2-0":{ba:.400,obp:.400,slg:.665,label:"Best Hitter's Count",edge:"hitter"},
    "3-0":{ba:.375,obp:.900,slg:.590,label:"Free Pass Territory",edge:"hitter"},
    "3-1":{ba:.370,obp:.500,slg:.615,label:"Premium Hitter's Count",edge:"hitter"},
    "0-1":{ba:.300,obp:.300,slg:.460,label:"Pitcher Got Ahead",edge:"pitcher"},
    "0-2":{ba:.167,obp:.170,slg:.240,label:"Pitcher Dominant",edge:"pitcher"},
    "1-1":{ba:.310,obp:.310,slg:.480,label:"Even Battle",edge:"neutral"},
    "1-2":{ba:.180,obp:.190,slg:.270,label:"Pitcher's Count",edge:"pitcher"},
    "2-1":{ba:.340,obp:.340,slg:.540,label:"Hitter Leaning",edge:"hitter"},
    "2-2":{ba:.205,obp:.210,slg:.310,label:"Toss-Up",edge:"neutral"},
    "3-2":{ba:.230,obp:.350,slg:.380,label:"Full Count",edge:"neutral"},
  },
  stealBreakEven: {0:0.72, 1:0.72, 2:0.67},  // by outs
  buntDelta: {"1--_0":-0.23, "-2-_0":-0.19, "12-_0":-0.08},  // RE24 cost of sac bunt
  ttoEffect: [0, 15, 30],  // BA points penalty by times-through-order (1st, 2nd, 3rd)
  // Source: The Book (Tango/Lichtman/Dolphin), verified FanGraphs TTO splits 2019-2023.
  // Modern note: surviving 3rd-TTO starters are above-average — true effect may exceed 30 pts
  // for average starters. Use as floor. Full expansion in matchupMatrix.tto.
  matchupMatrix: {
    platoon: {
      sameHand: { ba: .248, wOBA: .302, slug: .388 },     // pitcher advantage
      oppositeHand: { ba: .266, wOBA: .328, slug: .432 },  // hitter advantage
      edge: 18,  // BA points for opposite-hand batter
      switchHitter: { ba: .257, wOBA: .315, slug: .410 },
    },
    ttoCompound: {
      // TTO effect STACKS with platoon: 3rd TTO opposite-hand = +48 pts above baseline
      "1st_same": { ba: .248 }, "2nd_same": { ba: .263 }, "3rd_same": { ba: .278 },
      "1st_opp":  { ba: .266 }, "2nd_opp":  { ba: .281 }, "3rd_opp":  { ba: .296 },
    },
    leverageIndex: {
      average: 1.0,
      "tie_7": 1.3, "tie_8": 1.5, "tie_9": 1.7, "tie_extra": 2.0,
      "up1_7": 1.1, "up1_8": 1.3, "up1_9": 1.5,
      "down1_7": 1.2, "down1_8": 1.4, "down1_9": 1.6,
      "up2_late": 0.8, "down2_late": 1.0,
      "up3plus_late": 0.4, "down3plus_late": 0.5,
    },
    pitchCountMatrix: {
      // wOBA by pitch-count bucket × TTO (fatigue compounds familiarity)
      "0-25":  { tto1: .300, tto2: .310, tto3: .325 },
      "26-50": { tto1: .302, tto2: .315, tto3: .332 },
      "51-75": { tto1: .308, tto2: .322, tto3: .342 },
      "76-90": { tto1: .318, tto2: .335, tto3: .358 },
      "91-100":{ tto1: .332, tto2: .352, tto3: .380 },
      "100+":  { tto1: .348, tto2: .372, tto3: .405 },
    },
  },
  parkAndEnvironment: {
    parkFactors: {
      hittersParks:  { examples: ["Coors Field (~120)", "Great American Ballpark (~108)", "Fenway Park (~106)"], threshold: 105 },
      pitchersParks: { examples: ["Petco Park (~95)", "Oracle Park (~96)", "Tropicana Field (~97)"], threshold: 95 },
      neutral:       { range: [96, 104] },
      hitterspark: { stealValueAdjust: -0.02, buntCostAdjust: +0.03, ibbRiskAdjust: +0.04 },
      pitcherspark: { stealValueAdjust: +0.02, buntCostAdjust: -0.02, ibbRiskAdjust: -0.02 },
    },
    wind: {
      negligible: 5, moderate: 10, significant: 15, strong: 20,
      depthAdjust: { out_10mph: +7, out_15mph: +10, out_20mph: +15, in_10mph: -7, in_15mph: -10, in_20mph: -12 },
      pitcherAdjust: {
        windOut: "Work down in the zone. Ground balls and low contact. Avoid elevated pitches.",
        windIn: "Can work up in the zone. Fly balls become warning track outs.",
        windCross: "Breaking ball movement affected. Watch the flags.",
      },
    },
    surface: {
      grass: { grounderSpeedFactor: 1.0, infieldDepthAdjust: 0 },
      turf:  { grounderSpeedFactor: 1.175, infieldDepthAdjust: 1.5, outfieldDepthAdjust: 2.5 },
    },
    temperature: {
      carryAdjust: { below50F: -0.06, t50to65F: -0.02, t65to80F: 0.00, t80to90F: +0.02, above90F: +0.04 },
      altitude: {
        coors:    { carryBonus: +0.10, breakingBallPenalty: -0.15, description: "~10% more carry, breaking balls lose ~15% movement" },
        standard: { carryBonus: 0, breakingBallPenalty: 0 },
      },
      humidityEffect: false,
    },
  },
  levelAdjustments: {
    levels: {
      tball:       { label:"T-Ball / Coach Pitch",      ageRange:[5,8],   stealBreakEven:null, leadsAllowed:false, maxDifficulty:1, vocabularyTier:1 },
      youthPitch:  { label:"Kid Pitch / Machine Pitch", ageRange:[8,11],  stealBreakEven:0.50, leadsAllowed:false, maxDifficulty:2, vocabularyTier:2,
                     stealNote:"In most youth leagues, runners cannot lead off. Steals occur on passed balls and wild pitches only.",
                     conceptsAllowed:["force-vs-tag","fly-ball-priority","backup-duties","tag-up","wild-pitch-coverage","cutoff-roles","secondary-lead","infield-fly","dropped-third-strike","of-communication"] },
      travelMiddle:{ label:"Travel Ball / Middle School",ageRange:[11,14], stealBreakEven:0.60, leadsAllowed:true,  maxDifficulty:3, vocabularyTier:3,
                     buntNote:"At this level, sacrifice bunts can be RE-positive because you fielders are less reliable at charging and throwing — unlike MLB where bunts almost always cost RE." },
      highSchool:  { label:"High School (NFHS)",         ageRange:[14,18], stealBreakEven:0.65, leadsAllowed:true,  maxDifficulty:3, vocabularyTier:4,
                     buntNote:"High school bunt RE is slightly better than MLB — fielding is less reliable. Still costs RE in most situations but the margin is smaller." },
      mlb:         { label:"MLB / Advanced",             ageRange:[16,99], stealBreakEven:0.72, leadsAllowed:true,  maxDifficulty:3, vocabularyTier:5 },
    },
    vocabularyTiers: {
      1: { label:"Plain English",    avoidTerms:["RE24","wOBA","leverage","platoon","FIP","OPS","Statcast","run expectancy"] },
      2: { label:"Simple Stats",     avoidTerms:["RE24","wOBA","leverage index","FIP","Statcast","OPS"] },
      3: { label:"Intro Analytics",  avoidTerms:["wOBA","FIP","Statcast","xFIP","spin rate"] },
      4: { label:"Full Stats",       avoidTerms:["wOBA","FIP","xFIP","spin rate","arm angle"] },
      5: { label:"Full Analytics",   avoidTerms:[] },
    },
    conceptLevelMap: {
      "force-vs-tag":"tball","fly-ball-priority":"tball","backup-duties":"tball",
      "tag-up":"youthPitch","cutoff-roles":"youthPitch","secondary-lead":"youthPitch",
      "steal-breakeven":"travelMiddle","bunt-re24":"travelMiddle","count-leverage":"travelMiddle","pickoff-mechanics":"travelMiddle",
      "platoon-advantage":"highSchool","times-through-order":"highSchool","pitch-sequencing":"highSchool","win-probability":"highSchool",
      "leverage-index":"mlb","pitch-tunneling":"mlb","woba-by-count":"mlb",
    },
  },
  platoonEdge: 18,          // ~18 BA points for opposite-hand matchup
  // Source: FanGraphs splits leaderboards 2019-2023. OPS pts advantage, opposite-hand batter.
  // Range: 15-22 pts by year. 18 is the stable midpoint.
  // Full breakdown by handedness and count in matchupMatrix.platoon.
  popTime: {elite:1.85, average:2.0, slow:2.15},
  timeToPlate: {quick:1.2, average:1.35, slow:1.55},
  // Source: Baseball Savant pitch tempo data 2023-2024 post-pitch-clock.
  // Pre-2023: 1.40s average, 1.60s slow. Pitch clock compressed by ~0.15-0.20s.
  // Consistent with stealWindow.deliveryTime values.
  pickoffSuccess: {blindThrow:0.08, readThrow:0.28, daylightPlay:0.35},
  // Source: ABCA coaching consensus estimates — not Statcast-measured.
  // POST-PITCH-CLOCK (2023+): 2 free disengagements per PA. 3rd = balk unless runner picked off.
  // Blind throws now costlier — pitchers conserve disengagements for read-based attempts.
  // Treat blindThrow rate as theoretical max; real post-clock usage is lower.
  pitchClockViolations: {
    pitcherRate: 0.004,      // 2023 full season (Baseball Reference)
    batterRate: 0.002,       // 2023 full season
    pitcherRate2024: 0.002,  // 2024 — dropped ~50% as players adapted
    batterRate2024: 0.001,   // 2024
    trend: "Violation rates declining yearly — strategic value is now in rhythm disruption, not clock exploitation.",
  },
  // Baserunning advancement rates (FanGraphs/Statcast 2021-2024 MLB avg)
  baserunningRates: {
    first_to_third_on_single: 0.28, first_to_third_elite: 0.45, first_to_third_slow: 0.15,
    second_to_home_on_single: 0.62, second_to_home_shallow: 0.30, second_to_home_deep: 0.85,
    first_to_home_on_double: 0.52,
    tag_score_from_third: 0.88, tag_score_shallow: 0.45,
    tag_advance_second_to_third: 0.55,
    run_on_contact_two_outs: 1.00,
  },
  // Count K%/BB%/foul% per-pitch from each count (Baseball Reference 2021-2024)
  countRates: {
    "0-0":{k:0.04,bb:0.00,fouls:0.14},"1-0":{k:0.05,bb:0.00,fouls:0.15},
    "2-0":{k:0.06,bb:0.00,fouls:0.14},"3-0":{k:0.02,bb:0.48,fouls:0.06},
    "3-1":{k:0.05,bb:0.29,fouls:0.12},"0-1":{k:0.11,bb:0.00,fouls:0.18},
    "0-2":{k:0.27,bb:0.00,fouls:0.22},"1-1":{k:0.10,bb:0.00,fouls:0.18},
    "1-2":{k:0.26,bb:0.00,fouls:0.22},"2-1":{k:0.09,bb:0.00,fouls:0.16},
    "2-2":{k:0.20,bb:0.00,fouls:0.22},"3-2":{k:0.16,bb:0.15,fouls:0.23},
  },
  // Steal window math (Statcast 2023-2024 post-pitch-clock)
  stealWindow: {
    deliveryTime: {quick:1.20, average:1.35, slow:1.55, lefty_quick:1.25, lefty_slow:1.50},
    popTime: {elite:1.85, average:2.00, slow:2.15},
    runnerTime: {elite:3.30, average:3.55, slow:3.80},
    stealViability: {easy:3.40, marginal:3.25, tough:3.10},
    pitchClockEffect: -0.20,
  },
  // Pitch count fatigue thresholds (FanGraphs, ABCA, pro coaching consensus)
  pitchCountThresholds: {
    velocityDrop: {"0-50":0,"51-75":0.5,"76-90":1.2,"91-100":2.1,"100+":3.0},
    eraIncrease: {"0-75":0,"76-90":0.50,"91-100":1.20,"100+":2.10},
    softLimit:90, hardLimit:110, youthLimit:75,
    youthByAge: {"7-8":50,"9-10":75,"11-12":85,"13-14":95,"15-16":95,"17-18":105},
  },
  // Scoring probability: P(this specific runner scores) by base/outs (Tango "The Book")
  scoringProb: {
    first:  {0:0.40, 1:0.27, 2:0.13},
    second: {0:0.62, 1:0.42, 2:0.23},
    third:  {0:0.85, 1:0.67, 2:0.28},
  },
  // First-pitch strike run value (FanGraphs RE24 pitch value research)
  firstPitchValue: {
    strikeValue:-0.048, ballCost:0.051,
    eliteRate:0.68, averageRate:0.59, poorRate:0.50,
    firstPitchSwingBA:0.340, firstPitchTakeBA:0.315,
    afterFirstStrikeK:0.24, afterFirstStrikeBB:0.05,
  },
  catcherFramingValue: {
    // Source: Baseball Savant Statcast framing metrics 2019-2023
    eliteFramer: +15,    // runs above average per season
    averageFramer: 0,
    poorFramer: -12,     // runs below average per season
    perPitchValue: 0.125, // ~0.125 runs per called strike stolen
    highValueCounts: ["0-0","1-0","2-0","3-1","3-2"],
    lowValueCounts:  ["0-2","1-2"],
    teachingPoint: "Pitch framing is the single most valuable catcher defensive skill — elite framers worth more per season than throwing out baserunners.",
    positionNote: "Framing is about glove stillness after receiving — any pull away from the zone kills the frame.",
  },
  leagueTrends: {
    // Source: Baseball Reference league stats 2014-2024
    strikeoutRate: {
      2014: 0.199, 2018: 0.224, 2022: 0.220, 2023: 0.228, 2024: 0.226,
      trend: "K rate roughly doubled from 1980 (12%) to 2023 (22.8%). 'Protect the zone' in two-strike counts is more critical than ever.",
    },
    walkRate: {
      2014: 0.077, 2018: 0.083, 2022: 0.083, 2023: 0.078, 2024: 0.077,
      trend: "Walk rate dropped slightly post-pitch-clock — batters have less time to work deep counts on 3-0 and 3-1.",
    },
    babip: {
      league: 0.298,  // extremely stable 2015-2024
      byContactType: {
        lineDrive: 0.685,   // Source: FanGraphs contact type splits 2019-2023
        groundBall: 0.235,
        flyBall:    0.130,  // excludes home runs
        popup:      0.020,
      },
      teachingPoint: "Line drives fall for hits 68.5% of the time. Popups are outs 98% of the time. Contact type determines outcome more than exit velocity alone at the youth level.",
    },
    hitByPitch: {
      leagueRate: 0.011,  // ~1.1% of plate appearances — Baseball Reference 2019-2023
      strategicNote: "HBP = same RE24 value as a walk. Pitchers working inside (sinker/cutter) generate 2-3x more HBPs. Relevant for catcher game-planning near the hip.",
    },
    countWalkRates: {
      // Source: Baseball Reference count splits 2021-2024 — walk% by count
      "0-0": 0.00, "1-0": 0.09, "2-0": 0.18, "3-0": 0.48,
      "0-1": 0.04, "1-1": 0.08, "2-1": 0.14, "3-1": 0.29,
      "0-2": 0.02, "1-2": 0.03, "2-2": 0.07, "3-2": 0.15,
    },
  },
  infieldInRunImpact: {
    // Source: Statcast OAA + run value analysis 2021-2024, The Book
    runsPreventedPerGame: +0.30,   // runs saved by cutting off grounder with R3
    runsCostPerGame:      -0.50,   // runs lost to hits through drawn-in infield
    netCostPerGame:       -0.20,   // net: costs ~0.2 runs/game on average
    scoringProbDelta: {
      normal_0out:    0.85,  // 85% score from 3rd with 0 outs, normal depth
      infieldIn_0out: 0.72,  // 72% score from 3rd with 0 outs, infield in
      // Infield in reduces R3 scoring probability but the net run cost is still negative
    },
    justifiedWhen: "R3, <2 outs, late game, tie or 1-run deficit only",
    neverJustified: "Up by 2+ runs, early innings, 2 outs (force play exists regardless)",
  },
  // Pitch type effectiveness data (Baseball Savant Statcast 2021-2024)
  // rv100: Run value per 100 pitches (negative = better for pitcher)
  // woba: wOBA against (lower = harder to hit)
  pitchTypeData: {
    types: {
      fourSeam: {name:"Four-Seam Fastball",rv100:0.2,woba:0.335,usage:0.34,velo:94.0,
        bestCounts:["0-2","1-2","0-1"],worstCounts:["2-0","3-1","2-1"],
        description:"The foundational pitch. Sets up everything else. High velocity, low break."},
      sinker: {name:"Sinker / Two-Seam Fastball",rv100:0.0,woba:0.320,usage:0.19,velo:93.0,
        bestCounts:["0-0","1-0","2-0"],worstCounts:["0-2","1-2"],
        description:"Ground ball pitch. Use when you need a double play. Tunnels with changeup."},
      cutter: {name:"Cutter",rv100:-0.9,woba:0.305,usage:0.10,velo:90.0,
        bestCounts:["0-2","1-2","0-1"],worstCounts:["3-2","3-1"],
        description:"Late-breaking fastball. Jams same-side hitters. Best 'put-away' fastball."},
      changeup: {name:"Changeup",rv100:-1.2,woba:0.295,usage:0.11,velo:85.0,
        bestCounts:["0-2","1-2","2-2"],worstCounts:["2-0","3-1"],
        description:"Best put-away pitch. Same arm action as fastball, 8-10 mph slower. Freezes hitters.",
        tunnelsWith:"fourSeam"},
      slider: {name:"Slider",rv100:-1.4,woba:0.285,usage:0.17,velo:87.0,
        bestCounts:["0-2","1-2","0-1"],worstCounts:["3-2","3-0"],
        description:"The best strikeout pitch in baseball. Breaks late and sharply. Chased out of zone."},
      curveball: {name:"Curveball",rv100:-0.6,woba:0.305,usage:0.12,velo:79.0,
        bestCounts:["0-2","1-2","2-2"],worstCounts:["3-1","3-2"],
        description:"Big 12-to-6 break. Best after fastballs — maximum speed change. Freezes hitters low.",
        tunnelsWith:"fourSeam"},
      sweeper: {name:"Sweeper (Wide Slider)",rv100:-1.6,woba:0.280,usage:0.09,velo:83.0,
        bestCounts:["0-2","1-2"],worstCounts:["3-2","3-0"],
        description:"Wide horizontal break — sweeps out of zone. Highest K rate in pitch clock era."},
      splitter: {name:"Splitter / Split-Finger",rv100:-1.1,woba:0.275,usage:0.03,velo:85.0,
        bestCounts:["0-2","1-2","2-2"],worstCounts:["3-2"],
        description:"Drops out of the zone at the last second. Chased by hitters expecting a fastball."},
    },
    sequencing: {
      afterFastball: {best:"changeup",second:"slider",avoid:"curveball"},
      afterOffspeed: {best:"fourSeam",second:"cutter",avoid:"changeup"},
      twoStrikePutaway: ["sweeper","slider","changeup","splitter","cutter"],
      firstPitch: ["fourSeam","sinker","cutter"],
      hittersCount: ["cutter","sinker","fourSeam"],
    },
    velocityBands: {
      elite_fb:{min:97,label:"Elite — hitters have almost no time to react"},
      above_avg:{min:93,label:"Above average — still very hard to catch up to"},
      average:{min:90,label:"Average — movement and location must compensate"},
      below_avg:{min:86,label:"Below average — deception and sequence are critical"},
      soft:{min:0,label:"Soft — must tunnel perfectly to survive"},
    },
    eyeLevelPrinciple: {
      rule:"Change the eye level. After a pitch up in the zone, go down. After low, go up.",
      data:"Batters hit .085 worse on the pitch AFTER a pitch that was 6+ inches different in vertical location.",
      examples:["High four-seam → low changeup or curveball","Low sinker → high four-seam or cutter","Middle slider → high fastball to set up next slider"],
    },
  },
  // Win Probability framework (FanGraphs WPA / "The Book" Tango-Lichtman-Dolphin)
  winProbability: {
    concept: {
      definition:"Win Probability (WP) = chance the batting team wins from this exact game state.",
      vsRE24:"RE24 measures expected runs this inning. WP measures expected wins this game. They diverge most in the 7th-9th innings of close games.",
      keyInsight:"Playing for 1 run (bunt, sac fly, IBB) COSTS run expectancy but can INCREASE win probability when you need exactly 1 run late in a close game.",
    },
    byInningScore: {
      1:{"-3":0.33,"-2":0.39,"-1":0.44,"0":0.50,"+1":0.56,"+2":0.61,"+3":0.67},
      3:{"-3":0.27,"-2":0.33,"-1":0.41,"0":0.50,"+1":0.59,"+2":0.67,"+3":0.73},
      6:{"-3":0.16,"-2":0.24,"-1":0.37,"0":0.50,"+1":0.63,"+2":0.76,"+3":0.84},
      7:{"-3":0.11,"-2":0.18,"-1":0.32,"0":0.50,"+1":0.68,"+2":0.82,"+3":0.89},
      8:{"-3":0.07,"-2":0.13,"-1":0.27,"0":0.50,"+1":0.73,"+2":0.87,"+3":0.93},
      9:{"-3":0.04,"-2":0.08,"-1":0.21,"0":0.50,"+1":0.79,"+2":0.92,"+3":0.96},
    },
    leverageIndex: {
      byInning:{1:0.8,3:0.9,5:1.0,6:1.1,7:1.3,8:1.5,9:1.7,"10+":2.0},
      closedMultiplier:1.5,leadMultiplier:1.2,bigDeficit:0.4,
    },
    reDivergence: {
      buntJustified:{description:"Bunt MAY increase WP when trailing by 1, inning 7+, runner on 2nd, weak hitter.",conditions:["trailing by 1 run","inning 7 or later","runner on 2nd or 1st+2nd","weak hitter batting"],wpGain:"+0.02 to +0.04 WP",note:"Even here, only when batter has <.220 BA and reliever is excellent."},
      ibbJustified:{description:"IBB may increase WP when setting up force play with dominant skill gap to next hitter.",conditions:["first base open","next hitter weaker by 80+ OPS points","late inning close game"],wpGain:"+0.01 to +0.03 WP in best case"},
      playForOneRun:{description:"Playing for 1 run is WP-positive when tied or down 1 in innings 7-9.",earlyGame:"Innings 1-5: play for big innings (RE24 maximization). Down 1 run = 44% WP.",lateGame:"Innings 7-9: play for 1 run. Down 1 run = 32% WP in 7th."},
    },
    clutch: {doesItExist:false,explanation:"Year-to-year clutch correlation is near zero (r ≈ 0.08). Players regress to normal stats over large samples.",teachingPoint:"The situation creates pressure, not special ability. Best clutch approach = same approach as always.",highLeverageHits:0.003},
  },
  // Defensive positioning tradeoffs (Statcast OAA 2021-2024, FanGraphs, ABCA)
  defensivePositioning: {
    infieldDepth: {
      normalDepth:{description:"Standard positioning — balanced range and arm strength.",groundBallConversionRate:0.74,doublePlayRate:0.41},
      dpDepth:{description:"3-4 steps toward 2B and toward home. Reduces range ~15% but speeds pivot.",groundBallConversionRate:0.70,doublePlayRate:0.49,rangeReduction:0.15,bestWith:"Runner on 1st, less than 2 outs, not a big power hitter up"},
      infieldIn:{description:"All infielders on the outfield-grass side of the baselines.",groundBallConversionRate:0.58,runsSavedPerGame:0.3,runsCostPerGame:0.8,netCostPerGame:-0.5,situationalCost:-0.12,bestWith:"Runner on 3rd, less than 2 outs, game-tying/winning run, <3 innings left",neverWith:"2 outs (can't throw home anyway), big inning situation (inning 1-5)"},
    },
    lineGuarding:{description:"3B and 1B play within 5 feet of their respective lines.",extraBasesPreventedPerGame:0.4,holeCreated:{description:"Creates a larger 5-6 hole and 4-5 hole",singleRateIncrease:0.08,netRunEffect:-0.05},bestWith:"Leading by 1-2 runs, innings 7-9, protecting against XBH",neverWith:"Early in game, large lead, or behind — range matters more"},
    outfieldDepth: {
      normal:{description:"Standard depth — balanced gap coverage and arm strength.",gapcoverageRate:0.76},
      shallowIn:{description:"Playing 10-15 feet shallower than normal.",gapcoverageRate:0.68,shortFlyConversion:0.85,armStrengthImpact:-0.3,bestWith:"Runner on 3rd, <2 outs — cut off the run. Inning 7-9, 1-run game."},
      deep:{description:"Playing 10-15 feet deeper than normal.",gapcoverageRate:0.84,shortFlyConversion:0.62,bestWith:"No runners, extra-base threat up (power hitter), large lead"},
      fourOutfielders:{description:"One infielder moves to OF for a four-outfielder alignment.",gapcoverageRate:0.92,infieldHoleRate:0.35,bestWith:"Extreme pull/gap hitter, protecting multi-run lead in final innings"},
    },
    historicalShift:{note:"Traditional shift (3 IF right of 2B for pull LHH) was banned in 2023.",shiftRunValuePer100PA:-1.3,postBanEffect:"Pull hitters gained ~+.015 BA and ~+.008 wOBA after shift ban (2023 data)",teachingValue:"Shows WHY positioning matters — shift cost pull hitters 10+ points of BA"},
    outfieldArm:{eliteArm:{extraBasesPrevented:12,runnersAdvancedPrevented:8},averageArm:{extraBasesPrevented:0,runnersAdvancedPrevented:0},weakArm:{extraBasesPrevented:-10,runnersAdvancedPrevented:-6},rfArmPremium:"RF arm prevents ~3x as many extra bases as LF arm (more throws to 3B/home)"},
  },
},
concepts: {
  "force-vs-tag":       {name:"Force vs Tag Plays",       domain:"rules",       prereqs:[],                       ageMin:6,  diff:1},
  "fly-ball-priority":  {name:"Fly Ball Priority",         domain:"defense",     prereqs:[],                       ageMin:6,  diff:1},
  "backup-duties":      {name:"Backup Responsibilities",   domain:"defense",     prereqs:[],                       ageMin:8,  diff:1},
  "rundown-mechanics":  {name:"Rundown Procedure",         domain:"defense",     prereqs:[],                       ageMin:8,  diff:1},
  "tag-up":             {name:"Tagging Up on Fly Balls",   domain:"baserunning", prereqs:["fly-ball-priority"],     ageMin:8,  diff:1},
  "first-pitch-strike": {name:"First-Pitch Strikes",       domain:"pitching",    prereqs:[],                       ageMin:6,  diff:1},
  "cutoff-roles":       {name:"Who Is the Cutoff Man",     domain:"defense",     prereqs:["force-vs-tag"],          ageMin:9,  diff:2},
  "count-leverage":     {name:"Count Leverage",            domain:"pitching",    prereqs:["first-pitch-strike"],    ageMin:9,  diff:2},
  "double-play-turn":   {name:"Turning the Double Play",   domain:"defense",     prereqs:["force-vs-tag"],          ageMin:9,  diff:2},
  "two-strike-approach":{name:"Two-Strike Approach",       domain:"hitting",     prereqs:["count-leverage"],        ageMin:9,  diff:2},
  "bunt-defense":       {name:"Bunt Defense Assignments",  domain:"defense",     prereqs:["cutoff-roles"],          ageMin:10, diff:2},
  "steal-breakeven":    {name:"Steal Break-Even Rate",     domain:"baserunning", prereqs:[],                       ageMin:11, diff:2},
  "dp-positioning":     {name:"DP Depth vs Normal",        domain:"defense",     prereqs:["double-play-turn"],      ageMin:11, diff:2},
  "situational-hitting":{name:"Situational Hitting",       domain:"hitting",     prereqs:["count-leverage"],        ageMin:11, diff:2},
  "hit-and-run":        {name:"Hit-and-Run Play",          domain:"strategy",    prereqs:["steal-breakeven"],       ageMin:11, diff:2},
  "first-third":        {name:"First-and-Third Defense",   domain:"defense",     prereqs:["cutoff-roles"],          ageMin:11, diff:3},
  "relay-double-cut":   {name:"Double Cut Relays",         domain:"defense",     prereqs:["cutoff-roles"],          ageMin:11, diff:3},
  "pitch-sequencing":   {name:"Pitch Sequencing",          domain:"pitching",    prereqs:["count-leverage"],        ageMin:11, diff:3},
  "bunt-re24":          {name:"Sacrifice Bunt RE24",       domain:"strategy",    prereqs:["steal-breakeven"],       ageMin:11, diff:3},
  "infield-fly":        {name:"Infield Fly Rule",          domain:"rules",       prereqs:["force-vs-tag"],          ageMin:9,  diff:2},
  "pickoff-mechanics":  {name:"Pickoff Moves & Holding Runners",domain:"pitching",prereqs:["secondary-lead"],         ageMin:10, diff:2},
  "pitch-clock-strategy":{name:"Pitch Clock Strategy",     domain:"pitching",    prereqs:["count-leverage"],        ageMin:11, diff:2},
  "wild-pitch-coverage":{name:"Wild Pitch / Passed Ball Coverage",domain:"defense",prereqs:["backup-duties"],       ageMin:8,  diff:1},
  "squeeze-play":       {name:"Squeeze Bunt Strategy",     domain:"strategy",    prereqs:["situational-hitting","bunt-defense"],ageMin:11, diff:2},
  "times-through-order":{name:"Times Through the Order Effect",domain:"pitching",prereqs:["platoon-advantage"],     ageMin:11, diff:3},
  "of-communication":   {name:"Outfield Communication & Positioning",domain:"defense",prereqs:["fly-ball-priority","backup-duties"],ageMin:9,diff:2},
  "scoring-probability": {name:"Scoring Probability by Base/Out",domain:"baserunning",prereqs:["tag-up"],ageMin:11,diff:2},
  "pitch-count-mgmt":    {name:"Pitch Count & Pitcher Fatigue",domain:"pitching",prereqs:["count-leverage"],ageMin:11,diff:2},
  "steal-window":        {name:"The Steal Window",domain:"baserunning",prereqs:["steal-breakeven"],ageMin:11,diff:3},
  "first-pitch-value":   {name:"First-Pitch Strike Value",domain:"pitching",prereqs:["first-pitch-strike","count-leverage"],ageMin:11,diff:2},
  "baserunning-rates":   {name:"Baserunning Advancement Rates",domain:"baserunning",prereqs:["tag-up","steal-breakeven"],ageMin:11,diff:2},
  "pitch-type-value":    {name:"Pitch Type Run Values",domain:"pitching",prereqs:["pitch-sequencing"],ageMin:13,diff:3},
  "eye-level-change":    {name:"Eye Level & Pitch Tunneling",domain:"pitching",prereqs:["pitch-sequencing"],ageMin:13,diff:3},
  "win-probability":     {name:"Win Probability vs RE24",domain:"strategy",prereqs:["bunt-re24","steal-breakeven"],ageMin:13,diff:3},
  "leverage-index":      {name:"Leverage Index & Reliever Usage",domain:"strategy",prereqs:["win-probability","times-through-order"],ageMin:13,diff:3},
  "infield-positioning": {name:"Infield Depth Tradeoffs",domain:"defense",prereqs:["dp-positioning"],ageMin:11,diff:2},
  "of-depth-arm-value":  {name:"Outfield Depth & Arm Value",domain:"defense",prereqs:["backup-duties"],ageMin:11,diff:2},
  "secondary-lead":      {name:"Secondary Lead & Jump Timing",domain:"baserunning",prereqs:["tag-up"],ageMin:9,diff:2},
  "catcher-framing":     {name:"Pitch Framing & Presentation",domain:"defense",prereqs:["count-leverage"],ageMin:10,diff:2},
  "squeeze-recognition": {name:"Reading the Squeeze as Batter/Runner",domain:"hitting",prereqs:["squeeze-play"],ageMin:11,diff:3},
  "platoon-advantage":   {name:"Platoon Matchups (L/R)",domain:"strategy",prereqs:["count-leverage"],ageMin:11,diff:2},
  "dropped-third-strike":{name:"Dropped Third Strike Rule",domain:"rules",prereqs:["force-vs-tag"],ageMin:9,diff:2},
  "obstruction-interference":{name:"Obstruction vs. Interference",domain:"rules",prereqs:["force-vs-tag"],ageMin:10,diff:2},
  "balk-rule":           {name:"Balk Rule & Illegal Pitching Motions",domain:"rules",prereqs:["pickoff-mechanics"],ageMin:11,diff:3},
  "line-guarding":       {name:"Guarding the Line (Late-Game Positioning)",domain:"defense",prereqs:["dp-positioning","fly-ball-priority"],ageMin:11,diff:2},
  "ibb-strategy":        {name:"Intentional Walk Strategy (RE24)",domain:"strategy",prereqs:["win-probability"],ageMin:11,diff:3},
  // Mental Game (new domain)
  "composure-pressure":  {name:"Composure Under Pressure",domain:"mental",prereqs:[],ageMin:8,diff:1},
  "pre-pitch-routine":   {name:"Pre-Pitch Routine & Focus",domain:"mental",prereqs:[],ageMin:8,diff:1},
  "learning-from-failure":{name:"Learning From Mistakes",domain:"mental",prereqs:["composure-pressure"],ageMin:10,diff:2},
  // Hitting depth
  "approach-adjustment": {name:"Mid-At-Bat Approach Adjustment",domain:"hitting",prereqs:["count-leverage","two-strike-approach"],ageMin:11,diff:2},
  "pitch-recognition":   {name:"Early Pitch Recognition",domain:"hitting",prereqs:["two-strike-approach"],ageMin:11,diff:2},
  "hot-zone-awareness":  {name:"Hot Zone & Weakness Awareness",domain:"hitting",prereqs:["approach-adjustment","pitch-recognition"],ageMin:13,diff:3},
  // Communication & team play
  "team-communication":  {name:"Team Communication & Verbal Signals",domain:"defense",prereqs:["fly-ball-priority"],ageMin:9,diff:1},
  "sign-systems":        {name:"Coach Signs & Indicator Systems",domain:"strategy",prereqs:["hit-and-run"],ageMin:11,diff:2},
  "catcher-leadership":  {name:"Catcher Game Management & Leadership",domain:"defense",prereqs:["catcher-framing","count-leverage"],ageMin:12,diff:2},
  // Pitcher mastery
  "pitch-mix-strategy":  {name:"Pitch Mix Optimization by Matchup",domain:"pitching",prereqs:["pitch-sequencing","pitch-type-value"],ageMin:13,diff:3},
  "pitcher-fatigue-reads":{name:"Recognizing Pitcher Fatigue Signs",domain:"pitching",prereqs:["pitch-count-mgmt"],ageMin:12,diff:2},
  "hitter-tendency-reads":{name:"Reading Hitter Tendencies & Stance",domain:"pitching",prereqs:["pitch-sequencing"],ageMin:13,diff:3},
  // Game management
  "lineup-construction":  {name:"Lineup Construction & Batting Order",domain:"strategy",prereqs:["platoon-advantage"],ageMin:12,diff:2},
  "bullpen-management":   {name:"Bullpen Management & Reliever Selection",domain:"strategy",prereqs:["leverage-index","times-through-order"],ageMin:13,diff:3},
  "in-game-adjustments":  {name:"In-Game Strategic Adjustments",domain:"strategy",prereqs:["win-probability"],ageMin:12,diff:2},
  // Baserunning depth
  "two-out-aggression":   {name:"Two-Out Baserunning Aggression",domain:"baserunning",prereqs:["scoring-probability"],ageMin:10,diff:2},
  "gap-awareness":        {name:"Reading Fielder Gaps for Advancement",domain:"baserunning",prereqs:["secondary-lead"],ageMin:11,diff:2},
  "slide-technique":      {name:"Sliding Techniques & Decision",domain:"baserunning",prereqs:["tag-up"],ageMin:9,diff:1},
  // Backup awareness (user-requested)
  "backup-awareness":     {name:"Every Player Has a Backup Job",domain:"defense",prereqs:["backup-duties"],ageMin:8,diff:1},
  // Wall play & defensive subs (filling concept holes)
  "of-wall-play":         {name:"Outfield Wall Play & Carom Reads",domain:"defense",prereqs:["of-depth-arm-value"],ageMin:11,diff:2},
  "defensive-substitution":{name:"Late-Inning Defensive Substitutions",domain:"strategy",prereqs:["leverage-index"],ageMin:12,diff:2},
},
coaching: {
  situational: {
    "high-re24":"With {re24} runs expected here, every decision counts!",
    "low-re24":"Only {re24} expected runs — need to make this opportunity count.",
    "hitters-count":"{count} is a {label} — hitters bat {ba} here!",
    "pitchers-count":"Down {count}, hitters only bat {ba}. Expand the zone!",
    "full-count":"Full count — hitters bat .230 but walk rate jumps. Be ready!",
    "steal-risky":"Need {breakeven}% success to break even on a steal here.",
    "bunt-bad-re24":"Bunting costs {delta} expected runs here — look for something better.",
    "bunt-ok":"With a weak hitter needing exactly 1 run, a bunt can make sense here.",
    "high-leverage":"This is a championship moment. One play changes everything!",
    "fatigue-warning":"Third time through — batters hit {penalty} points better now.",
    "bases-loaded":"Bases loaded! {re24} expected runs — every pitch is magnified.",
    "risp":"Runner in scoring position with {outs} out — situational hitting time!",
    "lead-protect":"Protecting a lead means pitching smart, not hard.",
    "comeback":"Down in the count — battle and make the pitcher work.",
    "two-outs":"Two outs changes everything — run on contact!",
    "empty-bases":"Nobody on — focus on getting on base any way you can.",
    "first-inning":"Top of the game — set the tone with smart play!",
    "late-close":"Late and close — every decision is amplified!",
    "dp-situation":"Double play situation — ground ball is the pitcher's best friend.",
    "nobody-out":"Nobody out — don't give away outs! Make them earn it.",
    "tto-warning":"Third time through the order — batters hit {penalty} points better now. Time to think about the bullpen.",
    "tto-platoon":"Wrong-side matchup AND third time through — that's a massive BA jump. The pen needs to be ready.",
    "pitch-clock-leverage":"With the pitch clock, every second of your 20 counts. Make the hitter sweat on 0-2.",
    "squeeze-alert":"Runner on third, less than 2 outs — squeeze play is in the toolbox. Is the defense ready?",
    "wp-pb-alert":"Ball in the dirt with a runner on third — catcher goes to the ball, pitcher sprints home. No hesitation.",
    "scoring-chance":"Runner on {base}, {outs} out — {prob}% chance of scoring. Make contact count!",
    "pitch-count":"Approaching {count} pitches — velocity and command both start to fade here.",
    "two-strike-danger":"{count} count: pitcher has a {kRate}% strikeout chance. Fight for your life at the plate!",
    "steal-window":"Delivery + pop time = {window}s. The steal window is {verdict}.",
    "tag-up-math":"Tag from 3rd — {prob}% of MLB runners score on a catchable fly ball. Leave on the catch!",
    "advance-rate":"MLB runners score from 2nd on a single {rate}% of the time. Go on a base hit!",
    "first-pitch-value":"First-pitch strikes save ~0.05 runs per batter. At 68%, elite pitchers own this.",
    "three-oh-take":"3-0: 48% chance of a walk on the next pitch. Take the pitch unless you get the green light.",
    "two-out-steal":"Two outs changes the steal math — only {breakeven}% break-even vs. 72% normally. Worth the risk!",
    "platoon-matchup":"Platoon advantage is worth about 18 BA points. The right matchup on the field makes all the difference.",
    "squeeze-moment":"Squeeze play: runner COMMITS on the pitch. Batter MUST make contact. One hesitation and it's a disaster.",
    "framing-window":"Borderline pitch on {count} — this is exactly where framing wins or loses the at-bat.",
    "dropped-k-moment":"Ball in the dirt on strike three! React fast — the batter may be able to run!",
    "pickoff-window":"Runner with a big lead and slow delivery — pickoff or quick pitch? Every tenth of a second matters.",
    "line-guard-moment":"One-run lead, late innings — protect the line. A double ends the game faster than a single.",
  }
}};

// ── Brain API — Pure utility functions ──
function runnersKey(runners) {
  if (!runners || runners.length === 0) return "---";
  const r = new Set(runners);
  return (r.has(1)?"1":"-")+(r.has(2)?"2":"-")+(r.has(3)?"3":"-");
}
function getRunExpectancy(runners, outs) {
  if (outs < 0 || outs > 2) return 0;
  const key = runnersKey(runners);
  return BRAIN.stats.RE24[key]?.[outs] ?? 0;
}
function getPressure(situation) {
  if (!situation) return 0;
  const {runners=[], outs=0, inning="", score=[0,0]} = situation;
  const re24 = getRunExpectancy(runners, outs);
  // RE24 component: 0-40 points (bases loaded 0 out = 40)
  const re24Score = Math.min(40, Math.round((re24 / 2.29) * 40));
  // Inning leverage: late innings are higher pressure (0-30)
  const innNum = parseInt((inning||"").replace(/\D/g,"")) || 1;
  const inningScore = innNum >= 9 ? 30 : innNum >= 7 ? 20 : innNum >= 5 ? 10 : 0;
  // Score closeness: tie or 1-run game = high pressure (0-30)
  const diff = Math.abs((score[0]||0) - (score[1]||0));
  const closeScore = diff === 0 ? 30 : diff === 1 ? 25 : diff === 2 ? 15 : diff <= 4 ? 5 : 0;
  return Math.min(100, re24Score + inningScore + closeScore);
}
function getCountIntel(count) {
  if (!count || count === "-") return null;
  return BRAIN.stats.countData[count] || null;
}
function evaluateBunt(runners, outs) {
  const key = runnersKey(runners) + "_" + outs;
  const delta = BRAIN.stats.buntDelta[key];
  if (delta === undefined) return {delta: null, worthIt: false, explanation: "No bunt data for this situation."};
  return {delta, worthIt: delta > -0.10, explanation: delta <= -0.10
    ? `Bunting costs ${Math.abs(delta).toFixed(2)} expected runs here — usually not worth it.`
    : `Small RE24 cost of ${Math.abs(delta).toFixed(2)} — can be worth it late with a weak hitter needing 1 run.`
  };
}
function evaluateSteal(outs, successRate) {
  const breakeven = BRAIN.stats.stealBreakEven[outs] || 0.72;
  return {breakeven: Math.round(breakeven * 100), worthIt: successRate >= breakeven,
    explanation: successRate >= breakeven
      ? `${Math.round(successRate*100)}% success beats the ${Math.round(breakeven*100)}% break-even — green light!`
      : `${Math.round(successRate*100)}% success is below the ${Math.round(breakeven*100)}% break-even — too risky.`
  };
}
function getMatchupData(pitcherHand, batterHand, tto, pitchCount) {
  const mm = BRAIN.stats.matchupMatrix;
  const isSame = pitcherHand === batterHand;
  const platoon = isSame ? mm.platoon.sameHand : mm.platoon.oppositeHand;
  const ttoNum = Math.min(tto || 1, 3);
  const ttoKey = `${["1st","2nd","3rd"][ttoNum-1]}_${isSame ? "same" : "opp"}`;
  const compound = mm.ttoCompound[ttoKey] || mm.ttoCompound["1st_same"];
  const pc = pitchCount || 0;
  const pcBucket = pc <= 25 ? "0-25" : pc <= 50 ? "26-50" : pc <= 75 ? "51-75" : pc <= 90 ? "76-90" : pc <= 100 ? "91-100" : "100+";
  const fatigue = mm.pitchCountMatrix[pcBucket];
  return {
    platoonEdge: isSame ? "same-hand (pitcher advantage)" : "opposite-hand (hitter advantage)",
    baseBA: platoon.ba, adjustedBA: compound.ba,
    ttoPenalty: (ttoNum - 1) * 15,
    fatigueWOBA: fatigue?.[`tto${ttoNum}`] || .310,
    recommendation: compound.ba >= .280
      ? `Consider a pitching change — ${isSame ? "same" : "opposite"}-hand matchup at TTO ${ttoNum} yields .${Math.round(compound.ba * 1000)} BA`
      : `Matchup is manageable — .${Math.round(compound.ba * 1000)} projected BA`
  };
}
function getLevelContext(age) {
  const la = BRAIN.stats.levelAdjustments;
  let level;
  if (age <= 8)       level = la.levels.tball;
  else if (age <= 11) level = la.levels.youthPitch;
  else if (age <= 14) level = la.levels.travelMiddle;
  else if (age <= 18) level = la.levels.highSchool;
  else                level = la.levels.mlb;
  const vocabTier = la.vocabularyTiers[level.vocabularyTier];
  return {
    level,
    vocabTier,
    stealBreakEven: level.stealBreakEven,
    maxDiff: level.maxDifficulty,
    leadsAllowed: level.leadsAllowed,
    buntNote: level.buntNote || null,
    stealNote: level.stealNote || null,
    summary: `Level: ${level.label}. Steal break-even: ${level.stealBreakEven !== null ? Math.round(level.stealBreakEven*100)+'%' : 'N/A'}. Vocab: ${vocabTier.label}. Max difficulty: ${level.maxDifficulty}.`,
    youthQualifier: !level.leadsAllowed ? "Note: In many youth leagues, runners cannot lead off until the pitch crosses home plate." : null,
  };
}
function updateConceptMastery(masteryData, conceptTag, correct, scenarioId) {
  if (!conceptTag) return masteryData;
  const existing = masteryData.concepts?.[conceptTag] || {
    state: "unseen", correctStreak: 0, totalCorrect: 0, totalAttempts: 0,
    lastSeenScenarioIds: [], lastAttemptDate: null, nextReviewDate: null, spacedRepInterval: 1,
  };
  const reqs = MASTERY_SCHEMA.masteryRequirements;
  let next = { ...existing };
  next.totalAttempts++;
  next.lastAttemptDate = new Date().toISOString();
  if (!next.lastSeenScenarioIds.includes(scenarioId))
    next.lastSeenScenarioIds = [...next.lastSeenScenarioIds, scenarioId].slice(-10);
  if (correct) {
    next.totalCorrect++;
    next.correctStreak++;
    const uniqueIds = new Set(next.lastSeenScenarioIds.slice(-reqs.consecutiveCorrect));
    const earnsMastery = next.correctStreak >= reqs.consecutiveCorrect && uniqueIds.size >= reqs.uniqueScenarioIds;
    if (earnsMastery && (existing.state === 'learning' || existing.state === 'introduced'))
      next.state = "mastered";
    else if (existing.state === 'unseen') next.state = "introduced";
    else if (existing.state === 'introduced') next.state = "learning";
    else if (existing.state === 'degraded') { next.state = "learning"; next.correctStreak = 1; }
    if (next.state === "mastered")
      next.spacedRepInterval = Math.min((existing.spacedRepInterval || 1) * MASTERY_SCHEMA.spacedRepetition.intervalMultiplier, MASTERY_SCHEMA.spacedRepetition.maxInterval);
  } else {
    next.correctStreak = 0;
    if (existing.state === 'mastered') { next.state = "degraded"; next.spacedRepInterval = 1; }
    else if (existing.state === 'unseen') next.state = "introduced";
    else if (existing.state === 'introduced') next.state = "learning";
  }
  const nr = new Date(); nr.setDate(nr.getDate() + (next.spacedRepInterval || 1));
  next.nextReviewDate = nr.toISOString();
  return { ...masteryData, concepts: { ...(masteryData.concepts || {}), [conceptTag]: next } };
}
function getDueForReview(masteryData) {
  const now = new Date();
  return Object.entries(masteryData.concepts || {})
    .filter(([, d]) => d.state !== 'unseen' && (!d.nextReviewDate || new Date(d.nextReviewDate) <= now))
    .sort((a, b) => ({ degraded:0, learning:1, introduced:2, mastered:3 }[a[1].state] ?? 9) - ({ degraded:0, learning:1, introduced:2, mastered:3 }[b[1].state] ?? 9))
    .map(([tag, data]) => ({ tag, state: data.state, interval: data.spacedRepInterval }));
}
function getPrereqGap(failedTag, masteryData) {
  const concept = BRAIN.concepts[failedTag];
  if (!concept?.prereqs?.length) return null;
  const unmastered = concept.prereqs.filter(p => {
    const s = masteryData.concepts?.[p]?.state;
    return !s || s === 'unseen' || s === 'introduced' || s === 'degraded';
  });
  if (!unmastered.length) return null;
  return { failedTag, gap: unmastered[0], message: `Player failed "${failedTag}" — prerequisite "${unmastered[0]}" not mastered. Route there first.` };
}
function detectErrorPatterns(masteryData, sessionHistory) {
  const recent = (sessionHistory || masteryData.sessionHistory || []).slice(-20);
  if (recent.length < 5) return [];
  const patterns = [];
  const buntPicks = recent.filter(h => h.choiceText?.toLowerCase().includes('bunt')).length;
  if (buntPicks >= 5 && buntPicks / recent.length > 0.35)
    patterns.push({ key:'always-bunts', type:'always_picks', label:'Always Bunts', concept:'bunt-re24', conceptGap:'bunt-re24', alwaysPick:'bunt', aiInstruction:'Include a scenario where bunting is CLEARLY wrong (costs 0.23 RE). Correct answer is swing away.' });
  const stealOpp = recent.filter(h => h.conceptTag === 'steal-breakeven').length;
  const stealPicks = recent.filter(h => h.choiceText?.toLowerCase().includes('steal')).length;
  if (stealOpp >= 3 && stealPicks === 0)
    patterns.push({ key:'never-steals', type:'never_picks', label:'Never Steals', concept:'steal-breakeven', conceptGap:'steal-breakeven', neverPick:'steal', aiInstruction:'Create obvious steal: fast runner, slow catcher, 3-1 count. Make steal the unambiguously correct answer.' });
  const countScens = recent.filter(h => h.countContext);
  const pcWrong = countScens.filter(h => h.countContext === 'pitcher' && !h.correct).length;
  if (countScens.length >= 4 && pcWrong / countScens.length > 0.5)
    patterns.push({ key:'count-blindness', type:'concept_blind', label:'Count Blindness', concept:'count-leverage', conceptGap:'count-leverage', aiInstruction:'Create scenario where 0-2 count is the central factor. Wrong answer explicitly ignores count.' });
  const posErr = recent.filter(h => !h.correct && (h.errorType === 'role-confusion' || h.conceptTag?.includes('cutoff'))).length;
  if (posErr >= 3)
    patterns.push({ key:'position-confusion', type:'concept_blind', label:'Position Confusion', concept:'cutoff-roles', conceptGap:'cutoff-roles', aiInstruction:'Simple cutoff scenario, one clear correct fielder. All wrong answers use wrong fielder.' });
  const ftErr = recent.filter(h => !h.correct && h.conceptTag === 'force-vs-tag').length;
  if (ftErr >= 2)
    patterns.push({ key:'force-tag-confusion', type:'concept_blind', label:'Force/Tag Confusion', concept:'force-vs-tag', conceptGap:'force-vs-tag', aiInstruction:'Scenario where runner is NOT forced. Tag vs. touch decision. Force-play option is plausible wrong answer.' });
  const prErr = recent.filter(h => !h.correct && h.conceptTag === 'fly-ball-priority').length;
  if (prErr >= 2)
    patterns.push({ key:'priority-inversion', type:'concept_blind', label:'Priority Inversion', concept:'fly-ball-priority', conceptGap:'fly-ball-priority', aiInstruction:'Infielder trying to call off outfielder. Correct answer: outfielder takes the ball. Unambiguous.' });
  const re24Scens = recent.filter(h => ['bunt-re24','steal-breakeven'].includes(h.conceptTag));
  if (re24Scens.length >= 4 && re24Scens.filter(h => !h.correct).length / re24Scens.length > 0.6)
    patterns.push({ key:'re24-resistance', type:'concept_blind', label:'RE24 Resistance', concept:'bunt-re24', conceptGap:'bunt-re24', aiInstruction:'Stark RE24 contrast — bunt costs 0.23 runs. Show the numbers explicitly. Make data impossible to ignore.' });
  const lgScens = recent.filter(h => h.lateClose);
  if (lgScens.length >= 3 && lgScens.filter(h => !h.correct).length / lgScens.length > 0.6)
    patterns.push({ key:'late-game-blindness', type:'concept_blind', label:'Late-Game Blindness', concept:'win-probability', conceptGap:'win-probability', aiInstruction:'Late-game scenario where RE24 and WP diverge. Correct answer uses WP logic, not RE24.' });
  return patterns;
}
// Level 1.4: Track AI vs handcrafted scenario quality separately
function trackSourceQuality(stats, isCorrect, wasAIGenerated) {
  const metrics = wasAIGenerated ? stats.aiMetrics : stats.hcMetrics;
  if (!metrics) return stats;
  const updated = {
    ...metrics,
    total: metrics.total + 1,
    correct: metrics.correct + (isCorrect ? 1 : 0),
    scores: [...(metrics.scores || []).slice(-99), isCorrect ? 1 : 0]
  };
  const key = wasAIGenerated ? "aiMetrics" : "hcMetrics";
  return { ...stats, [key]: updated };
}

function trackScenarioQuality(stats, scenarioId, correct, wasAIGenerated) {
  if (!scenarioId) return stats;
  const prev = stats.qualitySignals?.[scenarioId] || {
    attempts: 0, correct: 0, aiGenerated: !!wasAIGenerated, flagged: false,
    firstSeen: new Date().toISOString(), lastAttempt: null,
  };
  const updated = {
    ...prev,
    attempts: prev.attempts + 1,
    correct: prev.correct + (correct ? 1 : 0),
    lastAttempt: new Date().toISOString(),
  };
  return {
    ...stats,
    qualitySignals: { ...(stats.qualitySignals || {}), [scenarioId]: updated },
  };
}

function detectKnowledgeGaps(stats) {
  const cache = stats.gapDetectionCache;
  const rules = IMPROVEMENT_ENGINE.gapRules;
  if (cache && cache.computedAt) {
    const playsSince = (stats.gp || 0) - (cache.gpAtCompute || 0);
    if (playsSince < rules.cacheRefreshInterval) return cache.gaps;
  }
  const now = Date.now();
  const mastery = stats.masteryData?.concepts || {};
  const gaps = [];
  Object.entries(BRAIN.concepts || {}).forEach(([tag, concept]) => {
    const m = mastery[tag];
    if (!m || m.state === 'unseen') return;
    const accuracy = m.totalAttempts > 0 ? m.totalCorrect / m.totalAttempts : null;
    const daysSinceSeen = m.lastAttemptDate
      ? (now - new Date(m.lastAttemptDate).getTime()) / 86400000
      : null;
    if (m.totalAttempts >= 5 && accuracy !== null && accuracy < rules.stuckThreshold && m.state !== 'mastered') {
      gaps.push({
        tag, conceptName: concept.name || tag, severity: 'stuck',
        accuracy: Math.round(accuracy * 100), attempts: m.totalAttempts,
        aiInstruction: `TARGET CONCEPT: ${tag} — player has ${Math.round(accuracy*100)}% accuracy after ${m.totalAttempts} attempts. Create a scenario that isolates THIS concept with minimal confounds. Prereqs: ${(concept.prereqs||[]).join(', ') || 'none'}.`,
      });
    } else if (m.state === 'degraded') {
      gaps.push({
        tag, conceptName: concept.name || tag, severity: 'degraded',
        accuracy: accuracy !== null ? Math.round(accuracy * 100) : null, attempts: m.totalAttempts,
        aiInstruction: `REINFORCE CONCEPT: ${tag} — player previously mastered this but is slipping. Create a scenario with a clear, unambiguous answer to rebuild confidence.`,
      });
    } else if ((m.state === 'learning' || m.state === 'introduced') && daysSinceSeen !== null && daysSinceSeen > rules.neglectedDays) {
      gaps.push({
        tag, conceptName: concept.name || tag, severity: 'neglected',
        daysSince: Math.round(daysSinceSeen), attempts: m.totalAttempts,
        aiInstruction: `REVISIT CONCEPT: ${tag} — player has not seen this in ${Math.round(daysSinceSeen)} days and is still "${m.state}". Include this concept.`,
      });
    }
  });
  const severityOrder = { stuck: 0, degraded: 1, neglected: 2 };
  gaps.sort((a, b) => {
    const sd = severityOrder[a.severity] - severityOrder[b.severity];
    if (sd !== 0) return sd;
    return (a.accuracy ?? 100) - (b.accuracy ?? 100);
  });
  return gaps.slice(0, 10);
}

function trackExplanationEffectiveness(stats, currentConceptTag, isCorrect) {
  const bridgeTag = stats.lastWrongConceptTag;
  if (!bridgeTag || bridgeTag !== currentConceptTag) return stats;
  const prev = stats.explanationLog?.[bridgeTag] || {
    read: 0, nextCorrect: 0, effectiveness: null, lastUpdated: null,
  };
  const updated = {
    ...prev,
    read: prev.read + 1,
    nextCorrect: prev.nextCorrect + (isCorrect ? 1 : 0),
    lastUpdated: new Date().toISOString(),
  };
  if (updated.read >= IMPROVEMENT_ENGINE.explanationTracking.minSampleSize) {
    updated.effectiveness = updated.nextCorrect / updated.read;
  }
  return {
    ...stats,
    explanationLog: { ...(stats.explanationLog || {}), [bridgeTag]: updated },
    lastWrongConceptTag: null,
  };
}

// Sprint 2.2: AI Quality Scoring System
// Scores AI scenarios 0-100 based on player engagement signals
function scoreAIScenario(aiEntry, stats) {
  if (!aiEntry || !aiEntry.answered) return null
  let score = 50 // baseline
  // Signal 1: Player answered correctly = scenario was well-calibrated
  // Wrong answer can also be good (teaches something) but correct is slightly better signal
  if (aiEntry.correct) score += 10
  // Signal 2: Response time (if tracked) — very fast = too easy, very slow = confusing
  if (aiEntry.answeredAt && aiEntry.generatedAt) {
    const responseMs = aiEntry.answeredAt - aiEntry.generatedAt
    if (responseMs > 5000 && responseMs < 30000) score += 15 // thoughtful engagement
    else if (responseMs > 30000 && responseMs < 60000) score += 5 // slow but engaged
    else if (responseMs < 3000) score -= 10 // too fast, probably random click
  }
  // Signal 3: Player continued playing after this AI scenario
  const aiIdx = (stats.aiHistory || []).findIndex(h => h.id === aiEntry.id)
  if (aiIdx >= 0 && aiIdx < (stats.aiHistory || []).length - 1) score += 15 // kept playing
  // Signal 4: Concept alignment — scenario taught a concept the player needed
  if (aiEntry.conceptTag && stats.masteryData?.concepts?.[aiEntry.conceptTag]) {
    const cState = stats.masteryData.concepts[aiEntry.conceptTag].state
    if (cState === "learning" || cState === "introduced") score += 10 // relevant concept
    else if (cState === "mastered") score -= 5 // redundant
  }
  // Signal 5: Explanation engagement — long reads = engaged, Explain More = high engagement
  if (aiEntry.explanationReadTimeMs) {
    if (aiEntry.explanationReadTimeMs > 8000) score += 15 // deeply engaged with explanation
    else if (aiEntry.explanationReadTimeMs > 4000) score += 8 // moderate read
    else if (aiEntry.explanationReadTimeMs < 1500) score -= 5 // skipped explanation
  }
  if (aiEntry.usedExplainMore) score += 20 // highest engagement signal
  return Math.max(0, Math.min(100, score))
}

function getAIQualityStats(stats) {
  const hist = stats.aiHistory || []
  const answered = hist.filter(h => h.answered)
  if (answered.length === 0) return { total: 0, answered: 0, avgScore: 0, correctRate: 0 }
  const scores = answered.map(h => scoreAIScenario(h, stats)).filter(s => s !== null)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const correctRate = Math.round(answered.filter(h => h.correct).length / answered.length * 100)
  return { total: hist.length, answered: answered.length, avgScore, correctRate }
}

// Sprint 3.5: "What should I practice?" recommendation engine
function getPracticeRecommendations(stats) {
  const cm=(stats.masteryData?.concepts)||{}
  const ps=stats.ps||{}
  const wc=stats.wrongCounts||{}
  const recs=[]
  // Helper: find best position for a concept tag (prefers positions player has played)
  const posForConcept=(tag)=>{
    const matches=[]
    for(const[p,arr]of Object.entries(SCENARIOS)){
      const ct=arr.filter(s=>s.conceptTag===tag)
      if(ct.length>0)matches.push({p,count:ct.length,played:ps[p]?.p||0})
    }
    if(matches.length===0)return null
    // Prefer position with most matching scenarios, break ties by most played
    matches.sort((a,b)=>b.count-a.count||b.played-a.played)
    return matches[0].p
  }

  // 1. Degraded concepts — highest priority (mastery lost)
  Object.entries(cm).filter(([,v])=>v.state==="degraded").forEach(([tag,v])=>{
    const concept=BRAIN.concepts[tag]
    const p=posForConcept(tag)
    if(concept)recs.push({type:"reinforce",priority:95,tag,name:concept.name,domain:concept.domain,
      position:p,reason:"You knew this but haven't practiced recently",emoji:"🔄"})
  })

  // 2. Concepts due for spaced repetition review
  const now=new Date()
  Object.entries(cm).filter(([,v])=>v.state==="mastered"&&v.nextReviewDate&&new Date(v.nextReviewDate)<=now).forEach(([tag,v])=>{
    const concept=BRAIN.concepts[tag]
    const p=posForConcept(tag)
    if(concept)recs.push({type:"review",priority:80,tag,name:concept.name,domain:concept.domain,
      position:p,reason:"Due for review to keep mastery strong",emoji:"📅"})
  })

  // 3. Learning concepts with low accuracy (struggling)
  Object.entries(cm).filter(([,v])=>v.state==="learning"&&v.totalAttempts>=3&&(v.totalCorrect/v.totalAttempts)<0.5).forEach(([tag,v])=>{
    const concept=BRAIN.concepts[tag]
    const acc=Math.round(v.totalCorrect/v.totalAttempts*100)
    const p=posForConcept(tag)
    if(concept)recs.push({type:"practice",priority:75,tag,name:concept.name,domain:concept.domain,
      position:p,reason:`Only ${acc}% accuracy — keep practicing!`,emoji:"💪"})
  })

  // 4. Ready-to-unlock concepts (all prereqs mastered, concept unseen)
  Object.entries(BRAIN.concepts).filter(([tag])=>!cm[tag]||cm[tag].state==="unseen").forEach(([tag,concept])=>{
    if(!concept.prereqs||concept.prereqs.length===0)return // skip root concepts (no prereqs)
    const allPreqsMastered=concept.prereqs.every(p=>cm[p]&&cm[p].state==="mastered")
    const pos=posForConcept(tag)
    if(allPreqsMastered)recs.push({type:"new",priority:65,tag,name:concept.name,domain:concept.domain,
      position:pos,reason:"You've mastered the prerequisites!",emoji:"🆕"})
  })

  // 5. Weakest positions (>5 plays, <50% accuracy)
  Object.entries(ps).filter(([,v])=>v.p>=5&&(v.c/v.p)<0.5).sort((a,b)=>(a[1].c/a[1].p)-(b[1].c/b[1].p)).slice(0,2).forEach(([p,v])=>{
    const meta=POS_META[p]
    if(meta)recs.push({type:"position",priority:60,position:p,name:meta.label,
      reason:`${Math.round(v.c/v.p*100)}% accuracy — room to improve`,emoji:meta.emoji})
  })

  // 6. Unplayed positions (never tried)
  Object.keys(POS_META).filter(p=>!ps[p]||ps[p].p===0).slice(0,2).forEach(p=>{
    const meta=POS_META[p]
    if(meta)recs.push({type:"explore",priority:40,position:p,name:meta.label,
      reason:"Haven't tried this position yet!",emoji:meta.emoji})
  })

  // 7. Situation Room sets with weak positions or due concepts
  const weakPos=new Set()
  Object.entries(ps).filter(([,v])=>v.p>=5&&(v.c/v.p)<0.5).forEach(([p])=>weakPos.add(p))
  const degradedTags=new Set()
  Object.entries(cm).filter(([,v])=>v.state==="degraded").forEach(([tag])=>degradedTags.add(tag))
  if(typeof SITUATION_SETS!=="undefined"){
    SITUATION_SETS.filter(s=>s.diff<=2).forEach(set=>{
      const matchingWeak=set.questions.filter(q=>weakPos.has(q.pos));
      const matchingDegraded=set.questions.filter(q=>q.conceptTag&&degradedTags.has(q.conceptTag));
      if(matchingWeak.length>=2||matchingDegraded.length>=1){
        const posLabels=matchingWeak.length>=2?matchingWeak.slice(0,2).map(q=>POS_META[q.pos]?.label).filter(Boolean).join(" and "):
          matchingDegraded.length>0?matchingDegraded.map(q=>POS_META[q.pos]?.label).filter(Boolean).slice(0,2).join(" and "):"";
        const reason=matchingWeak.length>=2?`Covers ${posLabels} — positions to improve`:
          `Reviews ${matchingDegraded[0]?.conceptTag||"concepts"} you need to refresh`;
        const sm=stats.sitMastery?.[set.id];
        if(!sm||!sm.bestGrade||sm.bestGrade==="D"||sm.bestGrade==="C"){
          recs.push({type:"situation_room",priority:70,name:set.title,
            reason,emoji:"🏟️",sitSetId:set.id})
        }
      }
    })
  }

  return recs.sort((a,b)=>b.priority-a.priority).slice(0,5)
}

function getGapInjection(stats) {
  const gaps = detectKnowledgeGaps(stats);
  if (!gaps || gaps.length === 0) return '';
  const top3 = gaps.slice(0, 3);
  return `\nKNOWLEDGE GAP TARGETING (prioritize these concepts):\n${top3.map(g => `- ${g.aiInstruction}`).join('\n')}`;
}

function classifyAndFeedback(scenario, chosenIdx, playerAge, masteryData) {
  if (chosenIdx === scenario.best) return null;
  const errorKey = ERROR_TAXONOMY.classifyError(scenario, chosenIdx);
  const category = errorKey ? ERROR_TAXONOMY.categories[errorKey] : null;
  const tier = playerAge <= 10 ? 'youth' : playerAge <= 14 ? 'varsity' : 'scout';
  const conceptTag = findConceptTag(scenario.concept);
  const anchorMap = category?.anchors || {};
  const anchorKey = (conceptTag && anchorMap[conceptTag]) ? conceptTag : Object.keys(anchorMap)[0] || null;
  const anchor = anchorKey ? anchorMap[anchorKey] : null;
  const prereqGap = (conceptTag && masteryData) ? getPrereqGap(conceptTag, masteryData) : null;
  const icon = errorKey === 'ruleError' ? '📋' : errorKey === 'dataError' ? '📊' :
               errorKey === 'roleConfusion' ? '🗺️' : errorKey === 'priorityError' ? '⚡' :
               errorKey === 'situationalMiss' ? '🎯' : errorKey === 'countBlindness' ? '🔢' : '💡';
  return {
    errorType: errorKey || 'unclassified',
    errorLabel: category ? (tier === 'youth' ? category.labelYouth : category.label) : 'Review this play',
    conceptGap: prereqGap ? prereqGap.gap : (conceptTag || null),
    anchor,
    feedbackTier: tier,
    remediationRoute: errorKey ? ERROR_TAXONOMY.remediationRoutes[errorKey] : null,
    prereqGap,
    enrichItem: { icon, text: anchor || 'Review the correct play and why it works.' },
  };
}
function isConceptReady(tag, mastered, ageGroup) {
  const concept = BRAIN.concepts[tag];
  if (!concept) return {ready: true, missing: []};
  // Age check
  const ageMin = concept.ageMin || 6;
  const ageNum = ageGroup === "6-8" ? 7 : ageGroup === "9-10" ? 9 : ageGroup === "11-12" ? 11 : ageGroup === "13-15" ? 14 : ageGroup === "16-18" ? 17 : ageGroup === "18+" ? 19 : 14;
  if (ageNum < ageMin) return {ready: false, missing: [`Age ${ageMin}+ required`]};
  // Prerequisite check
  const missing = (concept.prereqs || []).filter(p => !mastered.includes(p));
  return {ready: missing.length === 0, missing};
}
function findConceptTag(conceptText) {
  if (!conceptText) return null;
  const lower = conceptText.toLowerCase();
  // Direct keyword mapping from concept text to BRAIN tag
  const keywords = {
    "force":{tags:["force-vs-tag"],weight:2},"tag play":{tags:["force-vs-tag"],weight:2},
    "fly ball priority":{tags:["fly-ball-priority"],weight:3},"priority":{tags:["fly-ball-priority"],weight:1},
    "backup":{tags:["backup-duties"],weight:2},"back up":{tags:["backup-duties"],weight:2},
    "rundown":{tags:["rundown-mechanics"],weight:2},"tag up":{tags:["tag-up"],weight:3},"tagging up":{tags:["tag-up"],weight:3},
    "first.pitch strike":{tags:["first-pitch-strike"],weight:3},"get ahead":{tags:["first-pitch-strike"],weight:1},
    "cutoff":{tags:["cutoff-roles"],weight:2},"relay":{tags:["relay-double-cut","cutoff-roles"],weight:2},
    "count":{tags:["count-leverage"],weight:1},"leverage":{tags:["count-leverage"],weight:2},
    "double play":{tags:["double-play-turn"],weight:2},"turning two":{tags:["double-play-turn"],weight:3},
    "two.strike":{tags:["two-strike-approach"],weight:3},"0-2":{tags:["two-strike-approach"],weight:1},
    "bunt defense":{tags:["bunt-defense"],weight:3},"bunt assign":{tags:["bunt-defense"],weight:3},
    "steal":{tags:["steal-breakeven"],weight:1},"break.even":{tags:["steal-breakeven"],weight:2},
    "dp depth":{tags:["dp-positioning"],weight:3},"dp position":{tags:["dp-positioning"],weight:3},
    "situational hit":{tags:["situational-hitting"],weight:3},"hit behind":{tags:["situational-hitting"],weight:2},
    "hit.and.run":{tags:["hit-and-run"],weight:3},"hit and run":{tags:["hit-and-run"],weight:3},
    "first.and.third":{tags:["first-third"],weight:3},"1st and 3rd":{tags:["first-third"],weight:3},
    "double cut":{tags:["relay-double-cut"],weight:3},"pitch sequenc":{tags:["pitch-sequencing"],weight:3},
    "sacrifice bunt":{tags:["bunt-re24"],weight:2},"sac bunt":{tags:["bunt-re24"],weight:3},
    "infield fly":{tags:["infield-fly"],weight:3},
    "pickoff":{tags:["pickoff-mechanics"],weight:3},"pick off":{tags:["pickoff-mechanics"],weight:3},"balk":{tags:["pickoff-mechanics"],weight:2},"daylight play":{tags:["pickoff-mechanics"],weight:3},
    "pitch clock":{tags:["pitch-clock-strategy"],weight:3},"clock violat":{tags:["pitch-clock-strategy"],weight:3},"timeout per":{tags:["pitch-clock-strategy"],weight:2},
    "wild pitch":{tags:["wild-pitch-coverage"],weight:3},"passed ball":{tags:["wild-pitch-coverage"],weight:3},"ball in the dirt":{tags:["wild-pitch-coverage"],weight:2},
    "squeeze":{tags:["squeeze-play"],weight:3},"suicide squeeze":{tags:["squeeze-play"],weight:3},"safety squeeze":{tags:["squeeze-play"],weight:3},
    "times through":{tags:["times-through-order"],weight:3},"third time through":{tags:["times-through-order"],weight:3},"tto":{tags:["times-through-order"],weight:2},
    "outfield communic":{tags:["of-communication"],weight:3},"gap ball":{tags:["of-communication"],weight:2},"sun ball":{tags:["of-communication"],weight:2},
    "scoring prob":{tags:["scoring-probability"],weight:3},"chance of scoring":{tags:["scoring-probability"],weight:3},"runner scores":{tags:["scoring-probability"],weight:2},
    "pitch count":{tags:["pitch-count-mgmt"],weight:3},"fatigue":{tags:["pitch-count-mgmt"],weight:2},"arm tired":{tags:["pitch-count-mgmt"],weight:2},
    "steal window":{tags:["steal-window"],weight:3},"pop time":{tags:["steal-window"],weight:2},"delivery time":{tags:["steal-window"],weight:2},
    "first.pitch value":{tags:["first-pitch-value"],weight:3},"get ahead 0-1":{tags:["first-pitch-value"],weight:2},
    "advancement rate":{tags:["baserunning-rates"],weight:3},"first to third":{tags:["baserunning-rates"],weight:3},"second to home":{tags:["baserunning-rates"],weight:3},"extra base":{tags:["baserunning-rates"],weight:2},
    "pitch type":{tags:["pitch-type-value"],weight:3},"run value":{tags:["pitch-type-value"],weight:2},"rv.100":{tags:["pitch-type-value"],weight:3},"pitch effectiveness":{tags:["pitch-type-value"],weight:3},
    "eye level":{tags:["eye-level-change"],weight:3},"tunnel":{tags:["eye-level-change"],weight:3},"vertical location":{tags:["eye-level-change"],weight:2},"pitch height":{tags:["eye-level-change"],weight:2},
    "win probability":{tags:["win-probability"],weight:3},"leverage index":{tags:["win-probability"],weight:3},"play for one run":{tags:["win-probability"],weight:3},"late and close":{tags:["win-probability"],weight:2},"wp vs re24":{tags:["win-probability"],weight:3},
    "infield in":{tags:["infield-positioning"],weight:3},"infield depth":{tags:["infield-positioning"],weight:3},"guard the line":{tags:["infield-positioning"],weight:3},"dp depth":{tags:["infield-positioning","dp-positioning"],weight:2},
    "outfield depth":{tags:["of-depth-arm-value"],weight:3},"arm strength":{tags:["of-depth-arm-value"],weight:2},"shallow":{tags:["of-depth-arm-value"],weight:1},"rf arm":{tags:["of-depth-arm-value"],weight:3},
    "secondary lead":{tags:["secondary-lead"],weight:3},"jump timing":{tags:["secondary-lead"],weight:3},"lead distance":{tags:["secondary-lead"],weight:2},"read the pitcher":{tags:["secondary-lead"],weight:2},"primary lead":{tags:["secondary-lead"],weight:1},
    "framing":{tags:["catcher-framing"],weight:3},"pitch framing":{tags:["catcher-framing"],weight:3},"pitch presentation":{tags:["catcher-framing"],weight:3},"borderline pitch":{tags:["catcher-framing"],weight:3},"steal a strike":{tags:["catcher-framing"],weight:3},"quiet glove":{tags:["catcher-framing"],weight:2},
    "squeeze recognition":{tags:["squeeze-recognition"],weight:3},"fake squeeze":{tags:["squeeze-recognition"],weight:3},"squeeze commit":{tags:["squeeze-recognition"],weight:2},"squeeze abort":{tags:["squeeze-recognition"],weight:2},
    "platoon":{tags:["platoon-advantage"],weight:3},"platoon matchup":{tags:["platoon-advantage"],weight:3},"opposite.handed":{tags:["platoon-advantage"],weight:2},"same.handed":{tags:["platoon-advantage"],weight:2},"switch hitter":{tags:["platoon-advantage"],weight:1},
    "dropped third":{tags:["dropped-third-strike"],weight:3},"uncaught.*strike":{tags:["dropped-third-strike"],weight:3},"run on.*strikeout":{tags:["dropped-third-strike"],weight:2},"batter.runner":{tags:["dropped-third-strike"],weight:2},
    "obstruction":{tags:["obstruction-interference"],weight:3},"interference":{tags:["obstruction-interference"],weight:2},"blocking the base":{tags:["obstruction-interference"],weight:3},"right of way":{tags:["obstruction-interference"],weight:2},"impede":{tags:["obstruction-interference"],weight:2},
    "balk rule":{tags:["balk-rule"],weight:3},"illegal pitch":{tags:["balk-rule"],weight:3},"deceptive motion":{tags:["balk-rule"],weight:3},"come set":{tags:["balk-rule"],weight:2},"fake.*throw":{tags:["balk-rule"],weight:2},
    "line guarding":{tags:["line-guarding"],weight:3},"protect.*line":{tags:["line-guarding"],weight:3},"late.game position":{tags:["line-guarding"],weight:2},"shade toward.*line":{tags:["line-guarding"],weight:2},
    "holding runner":{tags:["pickoff-mechanics"],weight:2},"step off":{tags:["pickoff-mechanics"],weight:2},"vary hold":{tags:["pickoff-mechanics"],weight:2},
    "smother.*ball":{tags:["wild-pitch-coverage"],weight:2},"cover home":{tags:["wild-pitch-coverage"],weight:2},
    "bunt.*home":{tags:["squeeze-play"],weight:2},"squeeze defense":{tags:["squeeze-play"],weight:2},
    "familiarity.*pitcher":{tags:["times-through-order"],weight:2},"opener strateg":{tags:["times-through-order"],weight:1},
    "leverage index":{tags:["leverage-index"],weight:3},"high leverage":{tags:["leverage-index"],weight:2},"best reliever":{tags:["leverage-index"],weight:2},"setup man":{tags:["leverage-index"],weight:1},
"cover.*1st base":{tags:["backup-duties"],weight:3},"cover first base":{tags:["backup-duties"],weight:3},"sprint.*first":{tags:["backup-duties"],weight:2},"pitcher.*cover":{tags:["backup-duties"],weight:2},"back up third":{tags:["backup-duties"],weight:3},"back up second":{tags:["backup-duties"],weight:3},"back up home":{tags:["backup-duties"],weight:3},"backs up third":{tags:["backup-duties"],weight:3},"slide.?step":{tags:["steal-window"],weight:3},"quick.*plate":{tags:["steal-window"],weight:2},"delivery.*1\\.2":{tags:["steal-window"],weight:3},"mixing.*speed":{tags:["pitch-sequencing"],weight:2},"mix.*speed":{tags:["pitch-sequencing"],weight:2},"change.*speed":{tags:["pitch-sequencing"],weight:2},"pitch count":{tags:["pitch-count-mgmt"],weight:2},"arm tired":{tags:["pitch-count-mgmt"],weight:3},"deep.*game":{tags:["pitch-count-mgmt"],weight:2},"third time":{tags:["times-through-order"],weight:2},"hit to right":{tags:["situational-hitting"],weight:3},"move.*runner":{tags:["situational-hitting"],weight:2},"advance.*runner":{tags:["situational-hitting"],weight:2},"sac fly":{tags:["tag-up"],weight:3},"sacrifice fly":{tags:["tag-up"],weight:3},"fly ball.*productive":{tags:["tag-up"],weight:2},"run on contact":{tags:["secondary-lead"],weight:2},"always run.*contact":{tags:["secondary-lead"],weight:2},"force play.*rule":{tags:["force-vs-tag"],weight:3},"must advance":{tags:["force-vs-tag"],weight:3},"forced to advance":{tags:["force-vs-tag"],weight:3},"dp depth":{tags:["dp-positioning"],weight:3},"line guard":{tags:["line-guarding"],weight:3},"drawn in":{tags:["infield-positioning"],weight:2},"opposite hand":{tags:["platoon-advantage"],weight:3},"same hand":{tags:["platoon-advantage"],weight:2},"closer.*high":{tags:["leverage-index"],weight:3},"tying run":{tags:["win-probability"],weight:2},"sun.*glove":{tags:["of-communication"],weight:3},"glove.*sun":{tags:["of-communication"],weight:3},"sun shield":{tags:["of-communication"],weight:3},"carom":{tags:["of-depth-arm-value"],weight:2},"delayed steal":{tags:["secondary-lead"],weight:3},"double steal":{tags:["secondary-lead"],weight:3},"first.?and.?third":{tags:["first-third"],weight:3},
  };
  let best = null, bestWeight = 0;
  for (const [kw, info] of Object.entries(keywords)) {
    const rx = new RegExp(kw, "i");
    if (rx.test(lower) && info.weight > bestWeight) { best = info.tags[0]; bestWeight = info.weight; }
  }
  return best;
}
function getPitchRecommendation(count, lastPitch, outs, runners) {
  const pitches = BRAIN.stats.pitchTypeData;
  const seq = pitches.sequencing;
  const isHittersCount = ['2-0','3-1','2-1','1-0'].includes(count);
  const isTwoStrike = count?.endsWith('-2') || ['0-2','1-2','2-2'].includes(count);
  const isFirstPitch = count === '0-0';
  let recommendation, reasoning;
  if (isFirstPitch) {
    recommendation = seq.firstPitch[0];
    reasoning = "First pitch: establish a strike. Fastball gets ahead and sets up everything.";
  } else if (isTwoStrike && !isHittersCount) {
    recommendation = seq.twoStrikePutaway[0];
    reasoning = "Two-strike count — go to the put-away pitch. Sweeper/slider chased out of zone most often.";
  } else if (isHittersCount) {
    recommendation = seq.hittersCount[0];
    reasoning = "Hitter's count — must throw a strike. Cutter has late movement and stays in zone.";
  } else if (lastPitch) {
    const isLastFastball = ['fourSeam','sinker','cutter'].includes(lastPitch);
    recommendation = isLastFastball ? seq.afterFastball.best : seq.afterOffspeed.best;
    reasoning = isLastFastball
      ? `After a fastball, ${seq.afterFastball.best} is most effective — same arm action, 8-10 mph drop.`
      : "After offspeed, fastball resets the hitter's timing and eye level.";
  } else {
    recommendation = 'fourSeam';
    reasoning = "Default: establish fastball to set up everything else.";
  }
  const pitchData = pitches.types[recommendation];
  return {pitch:recommendation,name:pitchData?.name??recommendation,rv100:pitchData?.rv100,woba:pitchData?.woba,reasoning,eyeLevel:pitches.eyeLevelPrinciple.rule};
}
function getWinContext(inning, scoreDiff, runners, outs) {
  const wp = BRAIN.stats.winProbability;
  const inningNum = typeof inning === 'string' ? parseInt(inning.replace(/\D/g,'')) || 5 : (inning || 5);
  const clampedInning = Math.min(inningNum, 9);
  const diffKey = scoreDiff >= 3 ? '+3' : scoreDiff <= -3 ? '-3' : (scoreDiff > 0 ? '+'+scoreDiff : String(scoreDiff));
  const wpValue = wp.byInningScore[clampedInning]?.[diffKey] ?? 0.50;
  const baseLI = wp.leverageIndex.byInning[clampedInning] ?? 1.0;
  const scoreMult = Math.abs(scoreDiff) <= 1 ? wp.leverageIndex.closedMultiplier : 1.0;
  const li = +(baseLI * scoreMult).toFixed(2);
  const isLateClose = clampedInning >= 7 && Math.abs(scoreDiff) <= 1;
  const isBlowout = Math.abs(scoreDiff) >= 3 && clampedInning >= 7;
  const strategyMode = isBlowout ? 'standard' : isLateClose ? 'win-probability' : clampedInning <= 5 ? 'run-expectancy' : 'transitional';
  return {wp:wpValue,wpPct:Math.round(wpValue*100),li,strategyMode,isLateClose,isHighLeverage:li>=1.4,
    recommendation:strategyMode==='win-probability'?"Late and close: play for 1 run. WP matters more than RE24 here."
      :strategyMode==='run-expectancy'?"Early game: maximize run expectancy. Avoid outs, play for big innings."
      :"Transitional: standard baseball — both run value and win probability matter."};
}
function evaluateDefensiveAlignment(situation, proposedAlignment) {
  const dp = BRAIN.stats.defensivePositioning;
  const {runners=[],outs=0,inning,score} = situation;
  const inningNum = typeof inning === 'string' ? parseInt(inning) || 5 : inning;
  const isLate = inningNum >= 7;
  const hasR3 = runners.includes(3);
  const scoreDiff = score ? score[0]-score[1] : 0;
  const isClose = Math.abs(scoreDiff) <= 1;
  let justified = false, cost, explanation;
  if (proposedAlignment === 'infieldIn') {
    const data = dp.infieldDepth.infieldIn;
    justified = hasR3 && outs < 2 && isLate && isClose;
    cost = data.situationalCost;
    explanation = justified
      ? `Infield in is justified: R3, ${outs} outs, late/close game. Saves ~${data.runsSavedPerGame} runs/game but costs ~${data.runsCostPerGame} in range. Net per PA: ${data.situationalCost}.`
      : "Infield in is NOT justified here: ground ball conversion drops from 74% to 58%. Only use with R3, <2 outs, late/close game.";
  } else if (proposedAlignment === 'guardLines') {
    const data = dp.lineGuarding;
    justified = isLate && isClose && scoreDiff >= 0;
    cost = data.netRunEffect;
    explanation = justified
      ? `Guard the lines: prevents ${data.extraBasesPreventedPerGame} extra-base hits per game. Net: ${data.netRunEffect} per game. Correct in late/close.`
      : "Don't guard lines here — too early or not close enough. Range is more valuable before the 7th.";
  } else if (proposedAlignment === 'dpDepth') {
    justified = runners.includes(1) && outs < 2;
    const data = dp.infieldDepth.dpDepth;
    cost = null;
    explanation = justified
      ? "DP depth increases double-play conversion from 41% to 49% — significant edge. Correct with R1, <2 outs."
      : "DP depth requires a force at 2nd. Not correct here — play normal depth.";
  }
  return {justified,cost,explanation};
}
function enrichFeedback(scenario, choiceIdx, situation, playerAge, masteryData, brainExplored) {
  if (!situation) return [];
  const insights = [];
  // E10: Brain exploration personalization
  const hasBrainExp=(tab)=>brainExplored&&brainExplored[tab]&&(brainExplored[tab].interactions||0)>=3;
  // Error taxonomy — first insight on wrong answers
  if (typeof choiceIdx !== 'undefined' && choiceIdx !== scenario.best) {
    const ef = classifyAndFeedback(scenario, choiceIdx, playerAge || 14, masteryData || {concepts:{}});
    if (ef?.enrichItem) insights.push(ef.enrichItem);
  }
  const {runners=[], outs=0, count, score=[0,0]} = situation;
  const re24 = getRunExpectancy(runners, outs);
  if (re24 > 0.5 && runners.length > 0)
    insights.push({icon:"📊", text:`${hasBrainExp("re24")?"Remember your RE24 Explorer experiments — ":""}With ${runners.length === 3 ? "bases loaded" : runners.length === 2 ? "2 runners on" : "a runner on"}, your team expects ${re24.toFixed(2)} runs from here.`, deepLink:{tab:"re24",state:{runners,outs}}});
  const ci = getCountIntel(count);
  if (ci)
    insights.push({icon:"🔢", text:`${hasBrainExp("counts")?"You've studied this count — ":""}At ${count} (${ci.label}), hitters bat .${Math.round(ci.ba*1000)}.`, deepLink:{tab:"counts",state:{count}}});
  const pressure = getPressure(situation);
  if (pressure >= 50)
    insights.push({icon:"🔥", text:`${hasBrainExp("winprob")?"Your Win Probability work applies here — ":""}Pressure: ${pressure}/100 — ${pressure>=80?"Clutch time!":pressure>=60?"High stakes!":"Heating up!"}`, deepLink:{tab:"winprob",state:{inning:parseInt((situation.inning||"").replace(/\D/g,""))||7,diff:(situation.score?.[0]||0)-(situation.score?.[1]||0)}}});
  // Bunt insight if concept mentions bunt
  if (scenario?.concept && /bunt/i.test(scenario.concept)) {
    const bunt = evaluateBunt(runners, outs);
    if (bunt.delta !== null) insights.push({icon:"📉", text:bunt.explanation, deepLink:{tab:"re24",state:{runners,outs}}});
  }
  // Steal insight if concept mentions steal
  if (scenario?.concept && /steal/i.test(scenario.concept)) {
    const steal = evaluateSteal(outs, 0.72);
    insights.push({icon:"🏃", text:`${hasBrainExp("steal")?"Like you saw in the Steal Calculator — ":""}Need ${steal.breakeven}% success rate to break even on a steal here.`, deepLink:{tab:"steal"}});
  }
  // Scoring probability by base/out
  if (runners.length > 0 && outs !== undefined) {
    const base = runners[runners.length - 1];
    const baseKey = base === 1 ? 'first' : base === 2 ? 'second' : 'third';
    const prob = BRAIN.stats.scoringProb[baseKey]?.[outs];
    if (prob !== undefined)
      insights.push({icon:"🏃", text:`Runner on ${baseKey} with ${outs} out${outs !== 1 ? 's' : ''}: ${Math.round(prob * 100)}% chance of scoring this inning.`, deepLink:{tab:"re24",state:{runners,outs}}});
  }
  // Two-strike K rate
  if (['0-2','1-2'].includes(count)) {
    const kRate = BRAIN.stats.countRates[count]?.k;
    if (kRate) insights.push({icon:"⚠️", text:`${count} count: pitcher has a ${Math.round(kRate * 100)}% strikeout rate on this pitch. Protect the zone!`, deepLink:{tab:"counts",state:{count}}});
  }
  // Pitch count fatigue context
  if (scenario?.concept && /pitch.*chang|fatigue|pitch count/i.test(scenario.concept))
    insights.push({icon:"💪", text:"After 90+ pitches, a starter's ERA equivalent rises by ~1.2. The third time through the order adds another 30 BA points."});
  // Baserunning advance decision
  if (scenario?.anim === 'advance' || scenario?.anim === 'score')
    insights.push({icon:"🏃", text:`MLB runners score from 2nd on a single ${Math.round(BRAIN.stats.baserunningRates.second_to_home_on_single * 100)}% of the time. Reading the ball off the bat is the key.`});
  // Pitch type recommendation for pitcher scenarios with count data
  if (scenario?.concept && /pitch.*(seq|type|select|choice|tunnel)/i.test(scenario.concept))
    insights.push({icon:"📊", text:`${hasBrainExp("pitchlab")?"From your Pitch Lab experiments — ":""}Best put-away pitches by run value: Sweeper (-1.6) → Slider (-1.4) → Changeup (-1.2). Fastball alone (+0.2) needs offspeed to be dangerous.`, deepLink:{tab:"pitchlab"}});
  // Win probability insight for late/close games
  if (situation.inning && situation.score) {
    const wpDiff = (situation.score[0]||0) - (situation.score[1]||0);
    const wpCtx = getWinContext(situation.inning, wpDiff, runners, outs);
    if (wpCtx.isLateClose)
      insights.push({icon:"📈", text:`Win probability: ${wpCtx.wpPct}% with Leverage Index ${wpCtx.li}x. ${wpCtx.recommendation}`, deepLink:{tab:"winprob",state:{inning:parseInt((situation.inning||"").replace(/\D/g,""))||7,diff:(situation.score?.[0]||0)-(situation.score?.[1]||0)}}});
    if (wpCtx.isHighLeverage && wpCtx.li >= 2.0)
      insights.push({icon:"🔥", text:`Maximum leverage (LI ${wpCtx.li}x) — this PA matters ${wpCtx.li}x more than an average plate appearance.`});
  }
  // Defensive positioning insight
  if (scenario?.concept && /infield.*(in|depth|position)/i.test(scenario.concept)) {
    const alignment = /infield.*in/i.test(scenario.concept) ? 'infieldIn' : 'dpDepth';
    const dpEval = evaluateDefensiveAlignment(situation, alignment);
    insights.push({icon:"🧤", text:dpEval.explanation});
  }
  // Catcher framing insight for catcher scenarios
  if (/^c\d/i.test(scenario?.id||'') || /fram/i.test(scenario?.concept||'')) {
    const fv = BRAIN.stats.catcherFramingValue;
    const isHighValue = count && fv.highValueCounts.includes(count);
    if (isHighValue) insights.push({icon:"🧤", text:`${count} is a high-value framing count — each pitch framed here is worth ${fv.perPitchValue} runs. ${fv.positionNote}`, deepLink:{tab:"pitchlab"}});
    else if (fv.teachingPoint) insights.push({icon:"🧤", text:fv.teachingPoint, deepLink:{tab:"pitchlab"}});
  }
  // Steal window math for steal/baserunning scenarios
  if (scenario?.concept && /steal|lead|jump|pickoff/i.test(scenario.concept)) {
    const sw = BRAIN.stats.stealWindow;
    insights.push({icon:"⏱️", text:`Steal math: Pitcher delivery (${sw.deliveryTime.average}s) + catcher pop time (${sw.popTime.average}s) = ${(sw.deliveryTime.average + sw.popTime.average).toFixed(2)}s. Elite runners reach 2B in ${sw.runnerTime.elite}s. The pitch clock shaves ${Math.abs(sw.pitchClockEffect)}s off delivery.`, deepLink:{tab:"steal"}});
  }
  // Pitch count fatigue matrix for pitcher management scenarios
  if (scenario?.concept && /pitch.*count|fatigue|pitch.*chang|starter|bullpen|reliev/i.test(scenario.concept)) {
    const pc = BRAIN.stats.pitchCountThresholds;
    const youth = BRAIN.stats.pitchCountThresholds.youthByAge;
    const ageKey = playerAge <= 8 ? "7-8" : playerAge <= 10 ? "9-10" : playerAge <= 12 ? "11-12" : playerAge <= 14 ? "13-14" : playerAge <= 16 ? "15-16" : "17-18";
    const youthMax = youth[ageKey];
    if (youthMax) insights.push({icon:"💪", text:`${hasBrainExp("pitchcount")?"Remember the Pitch Count Tracker — ":""}At your age group (${ageKey}), the recommended pitch limit is ${youthMax} pitches. After ${pc.softLimit}+ pitches, velocity drops ~${pc.velocityDrop["76-90"]}mph and ERA rises by ${pc.eraIncrease["76-90"]}.`, deepLink:{tab:"pitchcount"}});
  }
  // League trend context for batting/pitcher approach scenarios
  if (scenario?.concept && /two.*strike|protect|strikeout|k.*rate/i.test(scenario.concept)) {
    const lt = BRAIN.stats.leagueTrends;
    insights.push({icon:"📈", text:lt.strikeoutRate.trend});
  }
  // BABIP contact type insight for hitting/fielding scenarios
  if (scenario?.concept && /contact|line.*drive|ground.*ball|fly.*ball|launch|barrel/i.test(scenario.concept)) {
    const babip = BRAIN.stats.leagueTrends.babip;
    insights.push({icon:"📊", text:babip.teachingPoint});
  }
  // Platoon matchup insight for batting/pitching scenarios with handedness
  if (scenario?.concept && /platoon|matchup|hand|left|right|switch/i.test(scenario.concept)) {
    const mm = BRAIN.stats.matchupMatrix.platoon;
    insights.push({icon:"📊", text:`${hasBrainExp("matchup")?"Your Matchup Analyzer work is relevant — ":""}Opposite-hand batters hit ${mm.edge} BA points higher than same-hand (.${Math.round(mm.oppositeHand.ba*1000)} vs .${Math.round(mm.sameHand.ba*1000)}). Switch hitters (.${Math.round(mm.switchHitter.ba*1000)}) split the difference.`, deepLink:{tab:"matchup",minAge:11}});
  }
  // Infield-in tradeoff insight
  if (scenario?.concept && /infield.*in/i.test(scenario.concept)) {
    const ii = BRAIN.stats.infieldInRunImpact;
    insights.push({icon:"🧤", text:`Infield in: saves ~${ii.runsPreventedPerGame.toFixed(1)} runs/game but costs ~${Math.abs(ii.runsCostPerGame).toFixed(1)} runs from hits through. Net: ${ii.netCostPerGame} runs/game. ${ii.justifiedWhen}.`, deepLink:{tab:"defense",minAge:9}});
  }
  return insights.slice(0, 3);
}
function getSmartCoachLine(cat, situation, position, streak, isPro, stats, currentWrongStreak, concept = null) {
  // Coach voice style for line adaptation
  const voiceStyle = stats ? getCoachVoice(stats)?.lineStyle : null
  const ws = currentWrongStreak || 0

  // Streak-aware coaching (Pillar 7B) — hot streak
  if (cat === "success" && streak >= 5) {
    const hotLines = {
      excited: ["You're on FIRE! Five in a row! Let's see if you can handle a tougher one!",
                "WOW! You're crushing it! Time to level up, superstar!"],
      teaching: ["Five straight — you're locked in. Let me challenge you with something harder.",
                 "You're seeing the game clearly. Time to test that at the next level."],
      analytical: ["Five consecutive correct reads. Increasing complexity.",
                   "Strong streak. Moving to a higher-difficulty concept."]
    }
    const lines = hotLines[voiceStyle] || hotLines.teaching
    return lines[Math.floor(Math.random() * lines.length)]
  }

  // Streak-aware coaching — cold streak
  if (ws >= 3 && cat !== "success") {
    const coldLines = {
      excited: ["Hey, even All-Stars strike out sometimes! Let's try something a little easier.",
                "Baseball is about bouncing back. Let's slow down and nail the basics!"],
      teaching: ["Baseball is a game of adjustments. Let's go back to fundamentals for a sec.",
                 "Three tough ones — even Trout goes 0-for-3. Let's rebuild from the basics."],
      analytical: ["Pattern suggests a concept gap. Dropping to prerequisite level for recalibration.",
                   "Adjusting difficulty. Let's solidify the foundation before advancing."]
    }
    const lines = coldLines[voiceStyle] || coldLines.teaching
    return lines[Math.floor(Math.random() * lines.length)]
  }

  // Pro users get situation-aware lines from the brain
  if (isPro && situation) {
    const {runners=[], outs=0, count, score=[0,0], inning=""} = situation;
    const re24 = getRunExpectancy(runners, outs);
    const ci = getCountIntel(count);
    const pressure = getPressure(situation);
    // Streak milestone lines (only at 5+ to avoid overriding educational content)
    if (cat==="success" && streak>=5 && streak%5===0) {
      const maxSt=COACH_LINES.streakLines.length-1;
      const sl=COACH_LINES.streakLines[Math.min(streak,maxSt)];
      if(sl) return sl;
    }
    // 40% chance of a situational brain line for Pro
    if (Math.random() < 0.4) {
      const innNum = parseInt((inning||"").replace(/\D/g,"")) || 1;
      const diff = Math.abs((score[0]||0) - (score[1]||0));
      // Fix 6: Coach line perspective filtering — skip lines that don't match position context
      const _isOffPos = ["batter","baserunner"].includes(position);
      const _isDefPos = ["pitcher","catcher","firstBase","secondBase","shortstop","thirdBase","leftField","centerField","rightField"].includes(position);
      const COACH_PERSPECTIVE = {"dp-situation":"defense","pitchers-count":"defense","fatigue-warning":"defense","first-pitch-value":"defense","framing-window":"defense","wp-pb-alert":"defense","pickoff-window":"defense","lead-protect":"defense","squeeze-alert":"defense","line-guard-moment":"defense","hitters-count":"offense","three-oh-take":"offense","two-strike-danger":"offense","comeback":"offense","risp":"offense","scoring-chance":"offense","steal-risky":"offense","two-out-steal":"offense","steal-window":"offense","tag-up-math":"offense","advance-rate":"offense","squeeze-moment":"offense"};
      const _okPerspective = (k) => { const p=COACH_PERSPECTIVE[k]; return !p || p==="both" || (p==="offense"&&!_isDefPos) || (p==="defense"&&!_isOffPos) || position==="manager"; };
      // Concept-aware key selection: prefer a coach line matching the scenario's concept
      let key = null, vars = {};
      if (concept) {
        const cl = (concept + " " + (situation?.conceptTag || "")).toLowerCase()
        if (/pickoff|throw.over|hold.?runner|big.?lead/.test(cl)) key = "pickoff-window"
        else if (/steal|stolen.?base|steal.?window/.test(cl)) { if (runners.length > 0) { key = "steal-window"; vars = {window:"3.4", verdict:"tight"}; } }
        else if (/squeeze/.test(cl)) key = runners.includes(3) ? "squeeze-moment" : "squeeze-alert"
        else if (/bunt|sacrifice/.test(cl) && !(/squeeze/.test(cl))) key = "bunt-ok"
        else if (/double.?play|dp|turn.?two/.test(cl)) key = "dp-situation"
        else if (/pitch.?count|fatigue|bullpen|tto|times.?through/.test(cl)) key = "fatigue-warning"
        else if (/tag.?up|sac.?fly/.test(cl)) { key = "tag-up-math"; vars = {prob: 85}; }
        else if (/wild.?pitch|passed.?ball|wp|pb/.test(cl)) key = "wp-pb-alert"
        else if (/framing|pitch.?frame/.test(cl)) key = "framing-window"
        else if (/platoon|matchup|handedness/.test(cl)) key = "platoon-matchup"
        else if (/cutoff|relay|backup/.test(cl) && _isDefPos) key = null // no generic line — let situation cascade handle it
        else if (/first.?pitch/.test(cl)) key = "first-pitch-value"
        else if (/hit.?and.?run|hit.?run/.test(cl)) key = null // let situation cascade handle
        // Perspective filter on concept-selected key
        if (key && !_okPerspective(key)) key = null
      }
      // Fall through to situation-based selection only if concept didn't match
      if (!key && runners.length === 3) { key = "bases-loaded"; vars = {re24: re24.toFixed(2)}; }
      else if (!key && pressure >= 75 && innNum >= 7) { key = "high-leverage"; }
      else if (!key && runners.includes(1) && outs < 2 && !runners.includes(3)) { key = "dp-situation"; }
      else if (ci && ci.edge === "hitter" && cat === "success") { key = "hitters-count"; vars = {count, ba: "."+Math.round(ci.ba*1000), label: ci.label}; }
      else if (ci && ci.edge === "pitcher") { key = "pitchers-count"; vars = {count, ba: "."+Math.round(ci.ba*1000)}; }
      else if (count === "3-2") { key = "full-count"; }
      else if (re24 > 1.5) { key = "high-re24"; vars = {re24: re24.toFixed(2)}; }
      else if (runners.includes(3) && outs < 2) {
        const prob = BRAIN.stats.scoringProb?.third?.[outs] || 0.67;
        key = "scoring-chance"; vars = {base:"3rd", outs, prob:Math.round(prob*100)};
      }
      else if (runners.some(r => r >= 2) && outs < 2) { key = "risp"; vars = {outs}; }
      else if (['0-2','1-2'].includes(count)) {
        const kRate = BRAIN.stats.countRates?.[count]?.k || 0.27;
        key = "two-strike-danger"; vars = {count, kRate:Math.round(kRate*100)};
      }
      else if (count === '3-0') { key = "three-oh-take"; }
      else if (innNum >= 8 && diff === 1 && ["thirdBase","firstBase","leftField","rightField","manager"].includes(position)) { key = "line-guard-moment"; }
      else if (innNum >= 7 && diff <= 2) { key = "late-close"; }
      else if (innNum >= 6 && position === "pitcher") { key = "fatigue-warning"; vars = {penalty:30}; }
      // Matchup data — platoon/TTO context for pitcher/batter/manager/catcher
      else if (innNum >= 4 && ["pitcher","batter","manager","catcher"].includes(position) && Math.random() < 0.3) {
        const ttoGuess = innNum <= 3 ? 1 : innNum <= 6 ? 2 : 3;
        const md = getMatchupData("R","L",ttoGuess,innNum*15);
        return voiceStyle === "analytical"
          ? `Data point: ${md.recommendation}. Projected BA: .${Math.round(md.adjustedBA*1000)} (TTO ${ttoGuess}, fatigue wOBA ${md.fatigueWOBA.toFixed(3)}).`
          : voiceStyle === "excited"
          ? `Watch the matchup! ${md.platoonEdge} — ${md.recommendation}!`
          : `Matchup check: ${md.platoonEdge}. ${md.recommendation}.`;
      }
      else if (outs === 2 && runners.length > 0 && position === "baserunner") { key = "two-out-steal"; vars = {breakeven:67}; }
      else if (outs === 2) { key = "two-outs"; }
      else if (outs === 0 && runners.length > 0) { key = "nobody-out"; }
      else if (position === "catcher" && ci && ci.edge === "neutral") { key = "framing-window"; vars = {count: count||"2-2"}; }
      else if (position === "baserunner" && runners.some(r => r <= 2)) { key = "steal-risky"; vars = {breakeven:72}; }
      else if (re24 < 0.30) { key = "low-re24"; vars = {re24: re24.toFixed(2)}; }
      else if (innNum <= 1 && ["pitcher","manager"].includes(position)) { key = "first-pitch-value"; }
      else if (innNum <= 1) { key = "first-inning"; }
      // Fix 6: Skip if perspective doesn't match position
      if (key && !_okPerspective(key)) { key = null; }
      if (key && BRAIN.coaching.situational[key]) {
        let line = BRAIN.coaching.situational[key];
        for (const [k, v] of Object.entries(vars)) line = line.replace(`{${k}}`, v);
        // Adapt line to coach voice
        if (voiceStyle === "excited") line = line.replace(/\.$/, "!").replace(/^/, "Wow — ")
        else if (voiceStyle === "analytical") line = line.replace(/^/, "Data point: ")
        return line;
      }
    }
  }
  // Fall through to original getCoachLine logic
  let baseLine = getCoachLine(cat, position, streak, isPro);
  if (voiceStyle === "excited" && cat === "success") baseLine = baseLine.replace(/\.$/, "!") || baseLine
  return baseLine;
}
function formatBrainStats(position, age, stats) {
  const lines = [];
  // Level context injection
  if (age) {
    const levelCtx = getLevelContext(age);
    lines.push("PLAYER LEVEL CONTEXT: " + levelCtx.summary);
    if (levelCtx.youthQualifier) lines.push("YOUTH RULE NOTE: " + levelCtx.youthQualifier);
    if (levelCtx.buntNote) lines.push("BUNT NOTE FOR THIS LEVEL: " + levelCtx.buntNote);
    if (levelCtx.stealNote) lines.push("STEAL NOTE FOR THIS LEVEL: " + levelCtx.stealNote);
    lines.push("VOCABULARY: Explain at \"" + levelCtx.vocabTier.label + "\" level. Avoid: " + (levelCtx.vocabTier.avoidTerms.join(', ') || 'none') + ".");
    lines.push("STEAL BREAK-EVEN FOR THIS LEVEL: " + (levelCtx.stealBreakEven !== null ? Math.round(levelCtx.stealBreakEven*100)+'%' : 'N/A — not applicable') + ".");
    lines.push("MAX SCENARIO DIFFICULTY: " + levelCtx.maxDiff + "/3.");
  }
  // Everyone gets key RE24 states
  lines.push("RUN EXPECTANCY (RE24): ---/0out=0.54, 1--/0out=0.94, -2-/0out=1.17, 123/0out=2.29, ---/2out=0.11");
  // Everyone gets scoring probability
  lines.push("SCORING PROBABILITY (runner scores from each base): 3rd base: 0 outs=85%, 1 out=67%, 2 outs=28%. 2nd base: 0 outs=62%, 1 out=42%, 2 outs=23%. 1st base: 0 outs=40%, 1 out=27%, 2 outs=13%. KEY: Runner on 3rd with <2 outs is HIGH probability — justifies squeeze, sac fly, infield in. Runner on 2nd with 2 outs is only 23% — need a base HIT, not just contact.");
  // Pitchers/batters/catchers/counts get count data
  if (["pitcher","batter","catcher","counts"].includes(position)) {
    lines.push("COUNT LEVERAGE: 0-0=.340BA, 0-2=.167BA, 2-0=.400BA, 3-1=.370BA, 3-2=.230BA, 1-2=.180BA");
    lines.push("COUNT K/BB RATES: 0-2 count: 27% K rate on next pitch — protect the zone! 3-2 count: 15% walk, 16% K, 23% foul — anything can happen. 3-0 count: 48% walk rate — almost always take. 0-2 and 1-2 have identical K rates (~26-27%) — two-strike approach is same for both.");
  }
  // Baserunners/managers get steal break-even + advancement rates
  if (["baserunner","manager","batter"].includes(position)) {
    lines.push("STEAL BREAK-EVEN: 72% success needed (0-1 out), 67% needed (2 out). Below = hurting the team.");
    lines.push("BASERUNNING ADVANCEMENT RATES (MLB averages): 1st→3rd on OF single: 28% (elite runner: 45%). 2nd→home on OF single: 62% (deep single: 85%). Tag-up and score from 3rd: 88% on standard OF fly ball. STEAL WINDOW (2023+ pitch clock era): Average delivery time: 1.35s (was 1.55s pre-clock — pitch clock SHORTENED the steal window by 0.2s). Steal is comfortable if delivery+pop time >3.40s. Marginal at 3.25s. Very tough below 3.10s.");
  }
  // Pitchers/managers get TTO effect, pickoff, pitch count, and first-pitch value
  if (["pitcher","manager"].includes(position)) {
    lines.push("TIMES THROUGH ORDER: Batters hit +15 BA pts 2nd time, +30 pts 3rd time vs same pitcher. Pull starter before 3rd TTO damage compounds.");
    lines.push("PICKOFF: Read-based throws succeed ~28%. Blind throws succeed ~8%. Daylight plays ~35%. Never throw without a tell.");
    lines.push("PITCH COUNT FATIGUE: 0-75 pitches = near-peak. 76-90 = modest decline. 91-100 = significant decline (+1.2 ERA equivalent). 100+ pitches = high fatigue/injury risk. Velocity drops ~2-3 mph over 100 pitches.");
    lines.push("FIRST-PITCH STRIKE VALUE: Each first-pitch strike saves ~0.048 runs per PA. Elite pitchers throw first-pitch strikes 68% of the time. Average is 59%. After getting ahead 0-1: K rate jumps to 24%, walk rate drops to 5%.");
  }
  // Pitch clock for relevant positions
  if (["pitcher","catcher","batter","baserunner","manager"].includes(position)) {
    lines.push("PITCH CLOCK: 15 sec empty bases, 20 sec with runners. Pitcher violation = ball. Batter violation = strike. 1 batter timeout per PA.");
  }
  // Bunt RE24 for relevant positions
  if (["batter","manager","baserunner"].includes(position)) {
    lines.push("BUNT RE24: Runner 1st/0out costs -0.23 runs. Runner 2nd/0out costs -0.19. Usually bad except: weak hitter, late, need 1 run.");
  }
  // Pitch type data for pitchers/counts/managers
  if (['pitcher','counts','manager'].includes(position)) {
    lines.push("PITCH TYPE RUN VALUES (rv/100, negative = better for pitcher): Sweeper:-1.6 (BEST), Slider:-1.4, Changeup:-1.2, Splitter:-1.1, Cutter:-0.9, Curveball:-0.6, Four-Seam:+0.2, Sinker:0.0");
    lines.push("PITCH SEQUENCING: After fastball→changeup (same arm, 10mph drop) or slider. After offspeed→four-seam (eye-level reset) or cutter. Two-strike put-away: sweeper→slider→changeup→splitter→cutter. First pitch: four-seam or cutter. Hitter's count: stay with fastball variants.");
    lines.push("EYE LEVEL RULE: Batters hit .085 worse when next pitch changes vertical location 6+ inches. High fastball→go low with changeup/curve. Low sinker→bust them up with four-seam.");
  }
  // Win probability for managers/pitchers
  if (['manager','pitcher'].includes(position)) {
    lines.push("WIN PROBABILITY vs RE24: RE24 = expected runs this inning. WP = expected wins this game. They DIVERGE in late/close games. Innings 1-5: play for big innings (RE24). Innings 7-9 tie/1-run: play for 1 run (WP). Tied 9th=50% WP. Down 1 in 8th=27% WP. Down 3+ in 7th+=low leverage.");
    lines.push("LEVERAGE INDEX: Avg PA=1.0 LI. Tie game 9th=~2.5 LI. Down 3 in 7th=~0.4 LI. Inn 7=1.3, Inn 8=1.5, Inn 9=1.7, Extra=2.0+. BUNT WP-JUSTIFIED: trailing by 1, inn 7+, R2, weak hitter (gain ~+0.02-0.04 WP). CLUTCH: year-to-year r≈0.08 — not a real skill. Best approach=same process always.");
  }
  // Matchup matrix for pitchers/managers/catchers
  if (['pitcher','manager','catcher'].includes(position)) {
    lines.push("MATCHUP MATRIX: Same-hand matchup: .248 BA/.302 wOBA (pitcher advantage). Opposite-hand: .266 BA/.328 wOBA (hitter advantage, +18 BA pts). TTO COMPOUNDS PLATOON: 3rd TTO + opposite hand = .296 BA (48 pts above baseline!) — the two effects STACK. This is the #1 reason to pull a starter facing the lineup a 3rd time against opposite-hand hitters.");
    lines.push("PITCH COUNT × TTO FATIGUE: Fresh (0-75 pitches) + 1st TTO: .300 wOBA. Tired (91-100) + 3rd TTO: .380 wOBA — an 80-point wOBA swing! LEVERAGE INDEX CONTEXT: Avg PA = 1.0 LI. Tie game 9th = 1.7 LI. High leverage (>1.5) = use your BEST reliever, not just the next guy in the pen.");
  }
  // Defensive positioning for infielders/managers
  if (['firstBase','secondBase','shortstop','thirdBase','manager'].includes(position)) {
    lines.push("DEFENSIVE POSITIONING: Normal=74% GB conversion, 41% DP rate. DP depth=70% GB, 49% DP (+8%). Use with R1, <2 outs. Infield in=58% GB (-16%), costs ~0.5 runs/game. Only justified R3, <2 outs, late/close. Guard lines: prevents 0.4 XBH/game, creates 8% more singles. Net: -0.05 runs. Correct inn 7-9, leading 1-2.");
  }
  // Outfield depth for OF positions/managers
  if (['leftField','centerField','rightField','manager'].includes(position)) {
    lines.push("OUTFIELD DEPTH: Normal=76% gap coverage. Shallow=68% gap but 85% short flies. Deep=84% gap but 62% short flies. RF arm elite=prevents ~12 extra bases/season vs average. RF arm prevents ~3x as many extra bases as LF arm.");
  }
  // Everyone gets fly ball priority
  lines.push("FLY BALL PRIORITY: OF in > IF back. Center > corners. Ball drifts TOWARD OF, AWAY from IF.");
  lines.push("FORCE PLAY: Removed when runner ahead is put out → remaining plays become TAG plays.");
  if (stats) { const gapText = getGapInjection(stats); if (gapText) lines.push(gapText); }
  return lines.join("\n- ");
}

// Level 1.2: Format Brain analytical data for AI prompt injection
// Concept-to-data relevance: only inject brain data sections relevant to the target concept
const CONCEPT_DATA_RELEVANCE = {
  re24: ['bunt-re24', 'steal-breakeven', 'ibb-strategy', 'scoring-probability', 'win-probability', 'situational-hitting', 'sacrifice-bunt', 'squeeze-play'],
  counts: ['count-leverage', 'two-strike-approach', 'first-pitch-strike', 'pitch-sequencing', 'pitch-calling', 'catcher-framing'],
  steal: ['steal-breakeven', 'secondary-lead', 'lead-distance', 'steal-window', 'pickoff-mechanics'],
  bunt: ['bunt-re24', 'squeeze-play', 'bunt-defense', 'sacrifice-bunt'],
  pitchType: ['pitch-sequencing', 'count-leverage', 'pitch-calling', 'pitch-recognition'],
  tto: ['times-through-order', 'platoon-advantage', 'pitch-count-mgmt', 'bullpen-management'],
  scoringProb: ['scoring-probability', 'situational-hitting', 'tag-up', 'squeeze-play', 'sacrifice-bunt', 'ibb-strategy'],
  winProb: ['win-probability', 'ibb-strategy', 'times-through-order', 'bullpen-management']
}

function formatBrainForAI(position, situation, targetConcept) {
  const parts = []
  // Determine which data sections are relevant to the target concept
  // If no targetConcept, include everything (backward compatibility)
  const includeRE24 = !targetConcept || CONCEPT_DATA_RELEVANCE.re24.includes(targetConcept)
  const includeCounts = !targetConcept || CONCEPT_DATA_RELEVANCE.counts.includes(targetConcept)
  const includeSteal = !targetConcept || CONCEPT_DATA_RELEVANCE.steal.includes(targetConcept)
  const includeBunt = !targetConcept || CONCEPT_DATA_RELEVANCE.bunt.includes(targetConcept)
  const includePitchType = !targetConcept || CONCEPT_DATA_RELEVANCE.pitchType.includes(targetConcept)
  const includeTTO = !targetConcept || CONCEPT_DATA_RELEVANCE.tto.includes(targetConcept)
  const includeScoringProb = !targetConcept || CONCEPT_DATA_RELEVANCE.scoringProb.includes(targetConcept)
  const includeWinProb = !targetConcept || CONCEPT_DATA_RELEVANCE.winProb.includes(targetConcept)

  // RE24 top states
  if (includeRE24) {
    const re = BRAIN.stats.RE24
    if (re) parts.push("RE24 (runs expected): " + ["---","1--","-2-","--3","12-","1-3","-23","123"].map(key => {
      const row = re[key]
      if (!row) return null
      const label = key === "---" ? "empty" : (key[0]==="1"?"R1 ":"")+(key[1]==="2"?"R2 ":"")+(key[2]==="3"?"R3":"")
      return `${label.trim()}: 0out=${row[0]}, 1out=${row[1]}, 2out=${row[2]}`
    }).filter(Boolean).join("; "))
  }
  // Count data if relevant
  if (includeCounts && ["pitcher","catcher","batter","counts"].includes(position) && situation?.count && situation.count !== "-") {
    const cd = BRAIN.stats.countData?.[situation.count]
    if (cd) parts.push(`Count ${situation.count}: BA=${cd.ba}, edge=${cd.edge}, label="${cd.label}"`)
  }
  // Steal data for baserunner/manager/catcher
  if (includeSteal && ["baserunner","manager","catcher","pitcher"].includes(position)) {
    const s = BRAIN.stats.stealBreakEven
    if (s) parts.push(`Steal break-even by outs: 0out=${s[0]*100}%, 1out=${s[1]*100}%, 2out=${s[2]*100}%`)
  }
  // Bunt data for batter/manager
  if (includeBunt && ["batter","manager","pitcher"].includes(position)) {
    const bd = BRAIN.stats.buntDelta
    if (bd) parts.push("Bunt delta (RE change): " + Object.entries(bd).map(([k,v]) => `${k}=${v>0?"+":""}${v}`).join(", "))
  }
  // TTO for manager/pitcher/catcher
  if (includeTTO && ["manager","pitcher","catcher"].includes(position) && BRAIN.stats.ttoEffect) {
    const tto = BRAIN.stats.ttoEffect
    parts.push(`TTO effect (BA penalty): 1st=${tto[0]}pts, 2nd=${tto[1]}pts, 3rd=${tto[2]}pts`)
  }
  // Scoring probability
  if (includeScoringProb && BRAIN.stats.scoringProb) {
    const sp = BRAIN.stats.scoringProb
    parts.push("Scoring prob: " + Object.entries(sp).map(([k,v]) => `${k}: 0out=${v[0]}%, 1out=${v[1]}%, 2out=${v[2]}%`).join("; "))
  }
  // Win probability for manager
  if (includeWinProb && position === "manager" && BRAIN.stats.winProbability?.byInningScore && situation?.inning) {
    const inn = parseInt(situation.inning.replace(/\D/g,"")) || 5
    const diff = (situation.score?.[0]||0) - (situation.score?.[1]||0)
    const diffKey = diff > 3 ? "+3" : diff < -3 ? "-3" : (diff >= 0 ? "+" : "") + diff
    const wp = BRAIN.stats.winProbability.byInningScore?.[inn]?.[diffKey]
    if (wp) parts.push(`Win prob (inn ${inn}, diff ${diffKey}): ${wp}%`)
  }
  // Pitch type data for pitcher/catcher/batter
  if (includePitchType && ["pitcher","catcher","batter","counts"].includes(position) && BRAIN.stats.pitchTypeData?.types) {
    const ptd = BRAIN.stats.pitchTypeData.types
    parts.push("Pitch types: " + Object.entries(ptd).slice(0,5).map(([k,v]) => `${k}: velo=${v.velo||"?"}mph, wOBA=${v.woba||"?"}, rv/100=${v.rv100||"?"}`).join("; "))
  }

  // PRE-CALCULATED CONCLUSIONS — "so what" interpretations the AI must use
  const conclusions = []
  const runners = situation?.runners || []
  const outs = situation?.outs ?? null

  // Situation-specific: RE24 and scoring probability for current state
  if (runners.length > 0 && outs !== null) {
    const rKey = runnersKey(runners)
    const re24 = BRAIN.stats.RE24?.[rKey]?.[outs]
    if (re24 !== undefined) conclusions.push(`Current RE24: ${re24} expected runs (${re24 > 1.2 ? "HIGH — protect the lead runner" : re24 > 0.6 ? "MODERATE — smart risks OK" : "LOW — must manufacture runs"})`)
    const sp = BRAIN.stats.scoringProb
    if (sp) {
      const probs = runners.map(b => {
        const bk = b === 1 ? "first" : b === 2 ? "second" : "third"
        const p = sp[bk]?.[outs]
        return p !== undefined ? `R${b}: ${Math.round(p * 100)}% chance to score` : null
      }).filter(Boolean)
      if (probs.length > 0) conclusions.push(`Scoring chances: ${probs.join(", ")}`)
    }
  }

  // Situation-specific: steal viability
  if ((runners.includes(1) || runners.includes(2)) && outs !== null) {
    const sbe = BRAIN.stats.stealBreakEven?.[outs]
    if (sbe) conclusions.push(`Steal viability: need ${Math.round(sbe * 100)}% success rate to break even with ${outs} out${outs !== 1 ? "s" : ""}`)
  }

  // Situation-specific: bunt value
  if (runners.length > 0 && outs !== null && outs < 2 && ["batter","manager","pitcher"].includes(position)) {
    const rKey = runnersKey(runners)
    const bd = BRAIN.stats.buntDelta?.[`${rKey}_${outs}`]
    if (bd !== undefined) conclusions.push(`Bunt value: ${bd > 0 ? "GAINS" : "COSTS"} ${Math.abs(bd).toFixed(2)} expected runs — ${bd > 0 ? "bunt is justified" : bd > -0.10 ? "close call, situational" : "bunt hurts here"}`)
  }

  // General tactical guidelines (always included — helps AI even pre-situation)
  conclusions.push("TACTICAL RULES: Bunting with R1 only (0 out) costs ~0.23 runs — usually wrong. Steal attempts need 72% success to break even. Runner on 3rd with <2 outs scores 67-85% of the time — don't risk outs to advance them. Bases loaded 0 out = 2.29 expected runs — protect this.")
  conclusions.push("USE THESE CONCLUSIONS to validate your best answer. If the best answer contradicts the math, choose a different best answer.")

  if (conclusions.length > 0) parts.push("CALCULATED ANALYSIS:\n" + conclusions.join("\n"))

  return parts.length > 0 ? "REFERENCE DATA (use to inform correct answer — do NOT put raw numbers in description or options, only in explanations for ages 12+):\n" + parts.join("\n") : ""
}
function getTeachingContext(position, mastered, ageGroup) {
  // Filter concepts by position-relevant domains to prevent cross-position leakage
  const allowedDomains = POS_CONCEPT_DOMAINS[position]
  const unmasteredConcepts = Object.entries(BRAIN.concepts)
    .filter(([tag, c]) => {
      // Domain filter: only suggest concepts relevant to this position
      if (allowedDomains && c.domain && !allowedDomains.includes(c.domain)) return false;
      const {ready} = isConceptReady(tag, mastered || [], ageGroup || "11-12");
      return ready && !(mastered || []).includes(tag);
    })
    .map(([tag, c]) => `${tag} (${c.name})`)
    .slice(0, 5);
  return unmasteredConcepts.length > 0
    ? `\nTEACH ONE OF THESE UNMASTERED CONCEPTS: ${unmasteredConcepts.join(", ")}`
    : "";
}
function filterByReadiness(scenarios, masteredTags, ageGroup) {
  return scenarios.filter(s => {
    const tag = s.conceptTag || findConceptTag(s.concept);
    if (!tag) return true; // No tag = always eligible
    const {ready} = isConceptReady(tag, masteredTags, ageGroup);
    return ready;
  });
}
function getPressureLabel(pressure) {
  if (pressure >= 80) return {text:"CLUTCH TIME", color:"#ef4444"};
  if (pressure >= 55) return {text:"HIGH STAKES", color:"#f97316"};
  if (pressure >= 30) return {text:"HEATING UP", color:"#f59e0b"};
  return {text:"WARMING UP", color:"#22c55e"};
}

function sanitizeAIResponse(content) {
  if (!content || typeof content !== "string") return content;
  let c = content.trim();
  c = c.replace(/^[Aa]ssistant:\s*/g, "");
  c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s > 0 && e > s) c = c.substring(s, e + 1);
  return c.trim();
}

// ============================================================================
// Semantic overlap groups — actions that are subsets/prerequisites of each other
// Used by QUALITY_FIREWALL and gradeScenario to detect non-obvious duplicates
