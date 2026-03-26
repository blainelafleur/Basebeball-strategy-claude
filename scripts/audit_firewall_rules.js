// Auto-generated QUALITY_FIREWALL additions from audit
// Generated: 2026-03-17T21:28:21.820Z
// Based on audit of 608 scenarios (291 passed, 313 failed)

const AUDIT_DISCOVERED_RULES = [
  {
    name: "rateAlignment",
    description: "Ensures the option marked as 'best' has the highest rate value",
    tier: 1,
    appliesTo: ["all"],
    check: function checkRateAlignment(scenario) { const bestRate = scenario.rates[scenario.best]; const maxRate = Math.max(...scenario.rates); return bestRate === maxRate ? null : `Best answer (index ${scenario.best}) has rate ${bestRate} but highest rate is ${maxRate}`; }
  },
  {
    name: "naturalLanguageFlow",
    description: "Prevents formulaic transitions like 'This is because' in explanations",
    tier: 2,
    appliesTo: ["all"],
    check: function checkNaturalFlow(scenario) { const patterns = [/^This is because/i, /\.\s*This is because/i, /^That's because/i, /^Since this approach/i]; const violations = []; scenario.explanations.forEach((exp, i) => { patterns.forEach(pattern => { if (pattern.test(exp)) violations.push(`Explanation ${i} uses formulaic transition`); }); }); return violations.length > 0 ? violations.join('; ') : null; }
  },
  {
    name: "completeExplanations",
    description: "Ensures all explanations are complete sentences with proper grammar",
    tier: 2,
    appliesTo: ["all"],
    check: function checkCompleteSentences(scenario) { const issues = []; scenario.explanations.forEach((exp, i) => { if (!exp.match(/^[A-Z].*[.!?]$/)) issues.push(`Explanation ${i} is not a complete sentence`); if (exp.match(/\s{2,}/)) issues.push(`Explanation ${i} has formatting issues`); if (exp.length < 20) issues.push(`Explanation ${i} is too short`); }); return issues.length > 0 ? issues.join('; ') : null; }
  },
  {
    name: "scoreContextValidation",
    description: "Validates that Top/Bottom innings align with team perspectives",
    tier: 1,
    appliesTo: ["all"],
    check: function checkScoreContext(scenario) { if (!scenario.inning) return null; const [home, away] = scenario.score || [0, 0]; const isTop = scenario.inning.includes('Top'); const perspective = scenario.situation.toLowerCase(); if (isTop && perspective.includes('your team') && perspective.includes('lead') && home > away) { return 'Top inning means away team bats, but score suggests home team perspective'; } return null; }
  },
  {
    name: "positionActionRealism",
    description: "Validates that actions are realistic for the given position",
    tier: 3,
    appliesTo: ["all"],
    check: function checkPositionRealism(scenario) { const positionActions = { pitcher: ['throw', 'pitch', 'field', 'cover', 'back up'], catcher: ['call', 'block', 'throw', 'tag', 'signal'], shortstop: ['field', 'throw', 'cover', 'relay', 'tag'] }; const validActions = positionActions[scenario.position] || []; const issues = []; scenario.options.forEach((opt, i) => { const optLower = opt.toLowerCase(); if (!validActions.some(action => optLower.includes(action))) { issues.push(`Option ${i} may be unrealistic for ${scenario.position}`); } }); return issues.length > 0 ? issues[0] : null; }
  },
  {
    name: "genericPhraseDetection",
    description: "Prevents generic teaching phrases that don't explain principles",
    tier: 2,
    appliesTo: ["all"],
    check: function checkGenericPhrases(scenario) { const genericPhrases = [/doesn't match the situation/i, /this approach doesn't match/i, /since this approach/i, /gives you the best chance/i]; const violations = []; scenario.explanations.forEach((exp, i) => { genericPhrases.forEach(phrase => { if (phrase.test(exp)) violations.push(`Explanation ${i} uses generic phrase`); }); }); return violations.length > 0 ? violations.join('; ') : null; }
  },
  {
    name: "conceptTagAlignment",
    description: "Ensures conceptTag matches the primary teaching point",
    tier: 3,
    appliesTo: ["all"],
    check: function checkConceptAlignment(scenario) { const conceptKeywords = { 'force-vs-tag': ['force', 'tag', 'out'], 'cutoff-plays': ['cutoff', 'relay', 'throw'], 'pitch-selection': ['pitch', 'fastball', 'curve', 'change'] }; const keywords = conceptKeywords[scenario.conceptTag] || []; const text = (scenario.title + ' ' + scenario.situation).toLowerCase(); if (keywords.length && !keywords.some(kw => text.includes(kw))) { return `ConceptTag '${scenario.conceptTag}' may not match scenario content`; } return null; }
  },
  {
    name: "ageAppropriateContent",
    description: "Validates content complexity matches age range for difficulty level",
    tier: 2,
    appliesTo: ["all"],
    check: function checkAgeAppropriate(scenario) { const complexTerms = ['whiff rate', 'leverage index', 'platoon advantage', 'WHIP', 'OPS']; const ageRanges = {1: [6,8], 2: [9,11], 3: [12,14]}; const [minAge, maxAge] = ageRanges[scenario.diff] || [6,14]; const text = (scenario.situation + ' ' + scenario.explanations.join(' ')).toLowerCase(); if (scenario.diff === 1 && complexTerms.some(term => text.includes(term.toLowerCase()))) { return 'Content too complex for difficulty 1 (ages 6-8)'; } return null; }
  },
  {
    name: "forcePlayAccuracy",
    description: "Validates force play understanding in relevant scenarios",
    tier: 1,
    appliesTo: ["pitcher","firstBase","secondBase","shortstop","thirdBase"],
    check: function checkForcePlayLogic(scenario) { const text = scenario.situation.toLowerCase(); if (text.includes('force') || text.includes('bases loaded')) { const hasRunner1st = text.includes('runner on first') || text.includes('runners on first'); const basesLoaded = text.includes('bases loaded'); if (basesLoaded && scenario.explanations.some(e => e.includes('removes all force'))) { return 'Force play logic error: retiring batter only removes force at first base'; } } return null; }
  },
  {
    name: "rateDistributionLogic",
    description: "Ensures rates follow logical baseball probabilities",
    tier: 3,
    appliesTo: ["all"],
    check: function checkRateLogic(scenario) { const rates = scenario.rates; const bestRate = Math.max(...rates); const worstRate = Math.min(...rates); if (bestRate > 95) return 'Best rate too high (>95) - unrealistic'; if (worstRate < 5) return 'Worst rate too low (<5) - unrealistic'; if (rates.filter(r => r >= 40 && r <= 65).length === 0 && scenario.diff < 3) { return 'Missing tempting wrong answer (40-65 range)'; } return null; }
  },
];

module.exports = { AUDIT_DISCOVERED_RULES };