import { PrismaClient, GameDifficulty, AchievementType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default achievements
  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first scenario',
      type: AchievementType.COMPLETION,
      requirement: { gamesPlayed: 1 },
      points: 10,
      icon: '🎯',
    },
    {
      name: 'Perfect Game',
      description: 'Get 10 decisions correct in a row',
      type: AchievementType.STREAK,
      requirement: { streak: 10 },
      points: 50,
      icon: '🏆',
    },
    {
      name: 'Speed Demon',
      description: 'Average decision time under 3 seconds',
      type: AchievementType.SPEED,
      requirement: { averageTime: 3 },
      points: 25,
      icon: '⚡',
    },
    {
      name: 'Clutch Player',
      description: 'Excel in high-pressure situations',
      type: AchievementType.ACCURACY,
      requirement: { clutchAccuracy: 80 },
      points: 40,
      icon: '💎',
    },
    {
      name: 'Social Butterfly',
      description: 'Add 5 friends',
      type: AchievementType.SOCIAL,
      requirement: { friends: 5 },
      points: 20,
      icon: '👥',
    },
    {
      name: 'Strategy Master',
      description: 'Complete scenarios for all 4 positions',
      type: AchievementType.COMPLETION,
      requirement: { allPositions: true },
      points: 100,
      icon: '🧠',
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }

  // Enhanced scenarios with Phase 2 features
  const scenarios = [
    {
      id: 'pitcher_clutch_001',
      title: 'World Series Pressure',
      description:
        "Bottom 9th, Game 7 of the World Series. Bases loaded, 2 outs, tie game. You're facing the MVP candidate. 50,000 fans on their feet. This is what legends are made of.",
      category: 'pitcher',
      difficulty: GameDifficulty.EXPERT,
      inning: '9th',
      score: '3-3',
      count: '3-2',
      runners: 'Bases Loaded',
      outs: 2,
      weatherConditions: 'Clear, 72°F, Wind: Calm',
      options: [
        'Challenge with your best fastball, location be damned',
        'Paint the corner with a slider - precision over power',
        'Surprise them with a changeup to disrupt timing',
        'High fastball to induce a popup',
      ],
      bestChoice: 'Paint the corner with a slider - precision over power',
      explanations: {
        'Challenge with your best fastball, location be damned':
          'In the biggest moment, location is everything. A mistake fastball ends the World Series. Too risky when precision is paramount.',
        'Paint the corner with a slider - precision over power':
          'PERFECT! Championship moments require championship execution. A well-located slider forces a difficult swing. This is how legends are born.',
        'Surprise them with a changeup to disrupt timing':
          'Creative thinking, but with a 3-2 count against the MVP, you need your best pitch with pinpoint command.',
        'High fastball to induce a popup':
          'Dangerous! High fastballs can easily be pulled foul or turn into home runs. Not the right choice for this count.',
      },
      successRates: {
        'Challenge with your best fastball, location be damned': 30,
        'Paint the corner with a slider - precision over power': 85,
        'Surprise them with a changeup to disrupt timing': 55,
        'High fastball to induce a popup': 25,
      },
      tags: ['world-series', 'pressure', 'clutch', 'bases-loaded'],
      videoUrl: 'https://youtube.com/watch?v=example1',
      mlbExample: "Similar to Madison Bumgarner's 2014 World Series Game 7 performance",
    },
    {
      id: 'batter_walk_off_001',
      title: 'Walk-Off Opportunity',
      description:
        'Bottom 9th, your team down by 1. Runner on 2nd with 1 out. The crowd is deafening. This at-bat could send everyone home happy or heartbroken.',
      category: 'batter',
      difficulty: GameDifficulty.ADVANCED,
      inning: '9th',
      score: '4-5',
      count: '2-1',
      runners: 'Runner on 2nd',
      outs: 1,
      weatherConditions: 'Clear, 75°F, Wind: 5mph out to right',
      options: [
        'Look for your pitch to drive to the gap',
        'Choke up and focus on contact to right field',
        'Take the next pitch to work a better count',
        'Swing aggressively at anything close',
      ],
      bestChoice: 'Look for your pitch to drive to the gap',
      explanations: {
        'Look for your pitch to drive to the gap':
          "EXCELLENT! In a 2-1 hitter's count with a runner in scoring position, you have the advantage. Be selective and drive your pitch.",
        'Choke up and focus on contact to right field':
          "Good situational awareness, but you're in a hitter's count. Don't give up your advantage too easily.",
        'Take the next pitch to work a better count':
          'Too passive! 2-1 is already a good count, and you only have one out to work with.',
        'Swing aggressively at anything close':
          'Reckless! The pitcher needs to throw strikes. Make them earn their way out of this jam.',
      },
      successRates: {
        'Look for your pitch to drive to the gap': 80,
        'Choke up and focus on contact to right field': 65,
        'Take the next pitch to work a better count': 45,
        'Swing aggressively at anything close': 35,
      },
      tags: ['walk-off', 'clutch', 'scoring-position', 'pressure'],
      videoUrl: 'https://youtube.com/watch?v=example2',
      mlbExample: "Kirk Gibson's famous 1988 World Series walk-off home run",
    },
    {
      id: 'fielder_diving_001',
      title: 'Championship Defense',
      description:
        "Game 5 of the ALCS. Sharp grounder up the middle with the go-ahead run on third, 2 outs, 8th inning. You dive and make the stop, but you're on your knees 40 feet from first base.",
      category: 'fielder',
      difficulty: GameDifficulty.EXPERT,
      inning: '8th',
      score: '2-2',
      count: '-',
      runners: 'Runner on 3rd',
      outs: 2,
      weatherConditions: 'Partly cloudy, 68°F, Wind: 8mph L to R',
      options: [
        'Fire to first from your knees - you have the arm',
        'Get to your feet quickly and make a strong throw',
        'Flip to second base to cut down the lead runner',
        'Hold the ball and prevent the runner from advancing',
      ],
      bestChoice: 'Get to your feet quickly and make a strong throw',
      explanations: {
        'Fire to first from your knees - you have the arm':
          'Heroic, but risky! Throwing from your knees reduces accuracy and arm strength. One mistake ends the season.',
        'Get to your feet quickly and make a strong throw':
          'PERFECT! Championship defense requires championship fundamentals. Get set, make the strong, accurate throw. This is how series are won.',
        'Flip to second base to cut down the lead runner':
          'Wrong read! The runner on third is already there. Focus on getting the out at first to end the inning.',
        'Hold the ball and prevent the runner from advancing':
          "Too conservative! You made a great stop - finish the play. The runner can't advance on a ground ball anyway.",
      },
      successRates: {
        'Fire to first from your knees - you have the arm': 45,
        'Get to your feet quickly and make a strong throw': 85,
        'Flip to second base to cut down the lead runner': 20,
        'Hold the ball and prevent the runner from advancing': 30,
      },
      tags: ['defense', 'championship', 'diving-play', 'clutch'],
      videoUrl: 'https://youtube.com/watch?v=example3',
      mlbExample: "Derek Jeter's flip play in the 2001 ALDS",
    },
    {
      id: 'baserunner_steal_001',
      title: 'World Series Steal',
      description:
        "Game 4 of the World Series, 7th inning. You're the tying run on first base. The count is 2-1 to a contact hitter. The catcher has been slow to release, and you got a great jump in your last attempt.",
      category: 'baserunner',
      difficulty: GameDifficulty.ADVANCED,
      inning: '7th',
      score: '3-4',
      count: '2-1',
      runners: 'You on 1st',
      outs: 1,
      weatherConditions: 'Clear, 70°F, Wind: Negligible',
      options: [
        'Go on first movement - you have the jump',
        'Wait for 3-1 count for better steal opportunity',
        'Stay put and trust the hitter to drive you in',
        "Get a better lead but don't commit to stealing",
      ],
      bestChoice: 'Go on first movement - you have the jump',
      explanations: {
        'Go on first movement - you have the jump':
          "BRILLIANT! You've done your homework, got a great read, and the count favors a steal. World Series moments require bold execution.",
        'Wait for 3-1 count for better steal opportunity':
          'Good thinking, but you might not get a 3-1 count. Strike while you have the advantage.',
        'Stay put and trust the hitter to drive you in':
          'Too passive! Getting into scoring position is crucial. Take matters into your own hands.',
        "Get a better lead but don't commit to stealing":
          "Indecisive! You've identified the perfect opportunity - commit and execute.",
      },
      successRates: {
        'Go on first movement - you have the jump': 82,
        'Wait for 3-1 count for better steal opportunity': 68,
        'Stay put and trust the hitter to drive you in': 40,
        "Get a better lead but don't commit to stealing": 55,
      },
      tags: ['stealing', 'world-series', 'baserunning', 'pressure'],
      videoUrl: 'https://youtube.com/watch?v=example4',
      mlbExample: "Dave Roberts' stolen base in 2004 ALCS Game 4",
    },
  ];

  for (const scenario of scenarios) {
    await prisma.scenario.upsert({
      where: { id: scenario.id },
      update: {},
      create: scenario,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${achievements.length} achievements`);
  console.log(`🎮 Created ${scenarios.length} enhanced scenarios`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
