import { Scenario } from './store';

export const scenarios: Record<string, Scenario> = {
  pitcher: {
    id: 'demo_pitcher_001',
    title: 'Crucial 3-2 Count',
    description:
      "Bottom 9th, bases loaded, 2 outs. The game is tied 4-4. You're facing the cleanup hitter who has been hot all game. What's your pitch strategy?",
    situation: {
      inning: '9th',
      score: '4-4',
      count: '3-2',
      runners: 'Bases Loaded',
    },
    options: [
      'Challenge with a fastball down the middle',
      'Throw a slider low and away',
      'Go with a changeup to keep them off balance',
      'Brush them back with an inside fastball',
    ],
    bestChoice: 'Throw a slider low and away',
    explanations: {
      'Challenge with a fastball down the middle':
        'Too risky! With bases loaded, a mistake pitch could end the game. This gives the batter the best chance to make solid contact.',
      'Throw a slider low and away':
        'Perfect choice! In a pressure situation, location beats velocity. A well-placed slider forces the batter to chase a difficult pitch.',
      'Go with a changeup to keep them off balance':
        'Good thinking on changing speeds, but with a 3-2 count, you need precision over deception.',
      'Brush them back with an inside fastball':
        'Dangerous strategy! This could easily result in a walk, giving the other team the winning run.',
    },
    successRates: {
      'Challenge with a fastball down the middle': 25,
      'Throw a slider low and away': 85,
      'Go with a changeup to keep them off balance': 60,
      'Brush them back with an inside fastball': 15,
    },
  },
  batter: {
    id: 'demo_batter_001',
    title: 'RBI Opportunity',
    description:
      "Runner on 3rd base with 1 out. Your team is down 2-1 in the 7th inning. The pitcher has been throwing mostly fastballs. What's your approach?",
    situation: {
      inning: '7th',
      score: '1-2',
      count: '1-1',
      runners: 'Runner on 3rd',
    },
    options: [
      'Swing for the fences to take the lead',
      'Focus on making contact to drive in the run',
      'Take the next pitch to work the count',
      'Look for a sacrifice fly opportunity',
    ],
    bestChoice: 'Focus on making contact to drive in the run',
    explanations: {
      'Swing for the fences to take the lead':
        'Too aggressive! With a runner in scoring position, your job is to drive them in, not necessarily hit a homer.',
      'Focus on making contact to drive in the run':
        'Excellent situational hitting! With a runner on 3rd and only 1 out, contact hitting gives you the best chance to tie the game.',
      'Take the next pitch to work the count':
        "Not ideal here. You're in a good hitter's count (1-1) and need to be aggressive with a runner in scoring position.",
      'Look for a sacrifice fly opportunity':
        'Good backup plan, but you should try to get a hit first since you only have 1 out.',
    },
    successRates: {
      'Swing for the fences to take the lead': 35,
      'Focus on making contact to drive in the run': 80,
      'Take the next pitch to work the count': 45,
      'Look for a sacrifice fly opportunity': 65,
    },
  },
  fielder: {
    id: 'demo_fielder_001',
    title: 'Double Play Chance',
    description:
      'Runner on 1st base, 0 outs. A ground ball is hit directly to you at 2nd base. The runner is fast and getting a good jump. What do you do?',
    situation: {
      inning: '5th',
      score: '3-2',
      count: '-',
      runners: 'Runner on 1st',
    },
    options: [
      'Quickly flip to 2nd base for the force out',
      'Take your time and throw to 1st base for the sure out',
      'Attempt the double play: 2nd to 1st',
      'Hold the ball and look the runner back',
    ],
    bestChoice: 'Attempt the double play: 2nd to 1st',
    explanations: {
      'Quickly flip to 2nd base for the force out':
        'Good instinct but incomplete! You should try for the double play to get two outs.',
      'Take your time and throw to 1st base for the sure out':
        'Too conservative! With a ground ball right at you, this is a perfect double play opportunity.',
      'Attempt the double play: 2nd to 1st':
        'Perfect execution! This is exactly what double plays are for - turning one out into two and getting out of trouble.',
      'Hold the ball and look the runner back':
        "Wrong choice! The runner is already committed, and you're wasting a great fielding opportunity.",
    },
    successRates: {
      'Quickly flip to 2nd base for the force out': 70,
      'Take your time and throw to 1st base for the sure out': 50,
      'Attempt the double play: 2nd to 1st': 85,
      'Hold the ball and look the runner back': 25,
    },
  },
  baserunner: {
    id: 'demo_baserunner_001',
    title: 'Steal Opportunity',
    description:
      "You're on 1st base with a 2-1 count. The pitcher is slow to the plate and the catcher has a weak arm. Your team needs baserunners. Do you steal?",
    situation: {
      inning: '6th',
      score: '2-3',
      count: '2-1',
      runners: 'You on 1st',
    },
    options: [
      'Steal on the next pitch',
      'Wait for a better count like 3-1',
      'Stay put and let the batter work',
      "Get a bigger lead but don't steal yet",
    ],
    bestChoice: 'Steal on the next pitch',
    explanations: {
      'Steal on the next pitch':
        "Great read! With a 2-1 count, the pitcher will likely throw a strike, and you've identified the perfect opportunity with a slow pitcher and weak-armed catcher.",
      'Wait for a better count like 3-1':
        'Good thinking about favorable counts, but you might not get another opportunity this good. Strike while the iron is hot!',
      'Stay put and let the batter work':
        "Too passive! You've identified clear advantages - use them to help your team.",
      "Get a bigger lead but don't steal yet":
        "Indecisive! You've already analyzed the situation - commit to the steal.",
    },
    successRates: {
      'Steal on the next pitch': 80,
      'Wait for a better count like 3-1': 65,
      'Stay put and let the batter work': 40,
      "Get a bigger lead but don't steal yet": 55,
    },
  },
};
