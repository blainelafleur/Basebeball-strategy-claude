// Auto-generated QUALITY_FIREWALL additions from audit
// Generated: 2026-03-17T16:18:22.165Z
// Based on audit of 605 scenarios (535 passed, 69 failed)

const AUDIT_DISCOVERED_RULES = [
  {
    name: "conceptTagValidation",
    description: "Ensures scenario content directly teaches the concept specified in conceptTag",
    tier: 1,
    appliesTo: ["all"],
    check: function validateConceptTag(scenario) {
  const conceptMap = {
    'pitch-sequencing': ['sequence', 'setup', 'pattern'],
    'pitch-count-mgmt': ['count', 'efficiency', 'pitches'],
    'ibb-strategy': ['intentional', 'walk', 'IBB'],
    'cutoff-roles': ['cutoff', 'relay', 'cut'],
    'force-vs-tag': ['force', 'tag', 'out'],
    'double-play-turn': ['double', 'turn', 'two']
  };
  const keywords = conceptMap[scenario.conceptTag] || [];
  const content = scenario.description + ' ' + scenario.concept;
  return keywords.some(kw => content.toLowerCase().includes(kw));
}
  },
  {
    name: "scorePerspectiveCheck",
    description: "Validates score display matches inning perspective (Top=away bats, Bot=home bats)",
    tier: 1,
    appliesTo: ["all"],
    check: function validateScorePerspective(scenario) {
  const { inning, score } = scenario.situation;
  if (!inning || !score) return true;
  const isTop = inning.toLowerCase().includes('top');
  const [homeScore, awayScore] = score;
  if (isTop && awayScore > homeScore) {
    return scenario.description.includes('trailing') || scenario.description.includes('behind');
  }
  if (!isTop && homeScore < awayScore) {
    return scenario.description.includes('trailing') || scenario.description.includes('down');
  }
  return true;
}
  },
  {
    name: "bestAnswerRateAlignment",
    description: "Ensures the option marked as 'best' has the highest rate value",
    tier: 1,
    appliesTo: ["all"],
    check: function validateBestAnswerRate(scenario) {
  const bestIndex = scenario.best;
  const bestRate = scenario.rates[bestIndex];
  return scenario.rates.every((rate, idx) => idx === bestIndex || rate <= bestRate);
}
  },
  {
    name: "forcePlayAccuracy",
    description: "Validates force play mechanics - stepping on base removes subsequent forces",
    tier: 1,
    appliesTo: ["pitcher","catcher","firstBase","secondBase","thirdBase","shortstop"],
    check: function validateForcePlay(scenario) {
  const forcePlayRegex = /step.{0,20}first.{0,20}throw.{0,20}home|force.{0,20}home.{0,20}after.{0,20}first/i;
  if (forcePlayRegex.test(scenario.description + scenario.concept)) {
    return !scenario.options.some(opt => opt.includes('force at home') || opt.includes('step on home'));
  }
  return true;
}
  },
  {
    name: "ageAppropriatePitchTypes",
    description: "Prevents advanced pitch types (slider, curveball) in diff:1 scenarios",
    tier: 2,
    appliesTo: ["pitcher"],
    check: function validateAgePitchTypes(scenario) {
  if (scenario.diff !== 1) return true;
  const advancedPitches = /slider|curveball|cutter|splitter/i;
  return !advancedPitches.test(scenario.description + scenario.options.join(' '));
}
  },
  {
    name: "positionRoleCompliance",
    description: "Ensures scenarios match the responsibilities of their position",
    tier: 2,
    appliesTo: ["all"],
    check: function validatePositionRole(scenario) {
  const positionKeywords = {
    'manager': ['lineup', 'bullpen', 'pinch', 'strategy', 'decision'],
    'pitcher': ['pitch', 'throw', 'mound', 'delivery'],
    'catcher': ['frame', 'block', 'throw', 'signal', 'mask'],
    'baserunner': ['run', 'steal', 'slide', 'lead', 'tag']
  };
  if (!positionKeywords[scenario.position]) return true;
  const keywords = positionKeywords[scenario.position];
  const content = scenario.description + ' ' + scenario.options.join(' ');
  return keywords.some(kw => content.toLowerCase().includes(kw));
}
  },
  {
    name: "rateDistributionLogic",
    description: "Validates rate distribution follows logical probability patterns",
    tier: 3,
    appliesTo: ["all"],
    check: function validateRateDistribution(scenario) {
  const rates = scenario.rates;
  const bestRate = Math.max(...rates);
  const worstRate = Math.min(...rates);
  return bestRate >= 65 && bestRate <= 90 && worstRate >= 5 && worstRate <= 35;
}
  },
  {
    name: "explanationDistinctness",
    description: "Ensures each explanation teaches a different principle",
    tier: 3,
    appliesTo: ["all"],
    check: function validateExplanationVariety(scenario) {
  const explanations = scenario.explanations;
  const uniquePhrases = new Set();
  explanations.forEach(exp => {
    const key = exp.toLowerCase().replace(/[^a-z ]/g, '').split(' ').slice(0, 5).join(' ');
    uniquePhrases.add(key);
  });
  return uniquePhrases.size >= explanations.length * 0.8;
}
  },
];

module.exports = { AUDIT_DISCOVERED_RULES };