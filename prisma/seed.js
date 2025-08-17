const { PrismaClient } = require('@prisma/client');
const { updateAdminUser } = require('./update-admin.js');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default achievements
  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first scenario',
      type: 'COMPLETION',
      requirement: JSON.stringify({ gamesPlayed: 1 }),
      points: 10,
      icon: '🎯',
    },
    {
      name: 'Perfect Game',
      description: 'Get 10 decisions correct in a row',
      type: 'STREAK',
      requirement: JSON.stringify({ streak: 10 }),
      points: 50,
      icon: '🏆',
    },
    {
      name: 'Speed Demon',
      description: 'Average decision time under 3 seconds',
      type: 'SPEED',
      requirement: JSON.stringify({ averageTime: 3 }),
      points: 25,
      icon: '⚡',
    },
    {
      name: 'Clutch Player',
      description: 'Excel in high-pressure situations',
      type: 'ACCURACY',
      requirement: JSON.stringify({ clutchAccuracy: 80 }),
      points: 40,
      icon: '💎',
    },
    {
      name: 'Social Butterfly',
      description: 'Add 5 friends',
      type: 'SOCIAL',
      requirement: JSON.stringify({ friends: 5 }),
      points: 20,
      icon: '👥',
    },
  ];

  // Create scenarios
  const scenarios = [
    {
      id: 'demo_pitcher_001',
      title: 'Championship Pressure',
      description: 'Bottom of the 9th, two outs, bases loaded. Game 7 of the World Series.',
      category: 'pitcher',
      difficulty: 'EXPERT',
      inning: '9th',
      score: '3-4',
      count: '3-2',
      runners: 'Bases Loaded',
      outs: 2,
      weatherConditions: 'Clear, 72°F',
      options: JSON.stringify([
        'Challenge with fastball down the middle',
        'Slider low and away',
        'Curveball in the dirt',
        'Changeup at the knees',
      ]),
      bestChoice: 'Slider low and away',
      explanations: JSON.stringify({
        'Challenge with fastball down the middle':
          'Too risky! In pressure situations, location beats velocity.',
        'Slider low and away':
          'PERFECT! Forces a difficult swing while staying away from his strength.',
        'Curveball in the dirt': 'Good thinking, but slider is more reliable in this count.',
        'Changeup at the knees':
          'Risky choice - need something that looks like a strike but breaks away.',
      }),
      successRates: JSON.stringify({
        'Challenge with fastball down the middle': 25,
        'Slider low and away': 85,
        'Curveball in the dirt': 70,
        'Changeup at the knees': 60,
      }),
      tags: JSON.stringify(['pressure', 'world-series', 'closer']),
      videoUrl: 'https://youtube.com/watch?v=example1',
      mlbExample: "Mariano Rivera's cutter in Game 7",
      isPublic: true,
      timesPlayed: 1245,
      averageScore: 72.8,
    },
    {
      id: 'demo_batter_001',
      title: 'Walk-Off Opportunity',
      description: 'Bottom 9th, winning run on 3rd, 1 out. Count is 2-1.',
      category: 'batter',
      difficulty: 'ADVANCED',
      inning: '9th',
      score: '4-4',
      count: '2-1',
      runners: 'Runner on 3rd',
      outs: 1,
      weatherConditions: 'Clear, 75°F',
      options: JSON.stringify([
        'Swing for the fences',
        'Look for a pitch to drive to right field',
        'Try to work a walk',
        'Look for something up in the zone',
      ]),
      bestChoice: 'Look for a pitch to drive to right field',
      explanations: JSON.stringify({
        'Swing for the fences': 'Too aggressive! A base hit wins the game - no need for a homer.',
        'Look for a pitch to drive to right field':
          'EXCELLENT! Situational hitting at its finest. Drive in the run.',
        'Try to work a walk': 'Passive approach. Take control and drive in the run.',
        'Look for something up in the zone': 'Good thinking but location matters more than height.',
      }),
      successRates: JSON.stringify({
        'Swing for the fences': 40,
        'Look for a pitch to drive to right field': 80,
        'Try to work a walk': 50,
        'Look for something up in the zone': 65,
      }),
      tags: JSON.stringify(['walk-off', 'clutch', 'situational']),
      videoUrl: 'https://youtube.com/watch?v=example2',
      mlbExample: "Tony Gwynn's opposite field approach",
      isPublic: true,
      timesPlayed: 891,
      averageScore: 76.3,
    },
    {
      id: 'demo_fielder_001',
      title: 'Game-Saving Play',
      description: 'Sharp grounder to your right, runner heading to first.',
      category: 'fielder',
      difficulty: 'INTERMEDIATE',
      inning: '8th',
      score: '5-4',
      count: null,
      runners: 'Bases Empty',
      outs: 2,
      weatherConditions: 'Partly cloudy, 70°F',
      options: JSON.stringify([
        'Dive for the ball',
        'Take the angle and cut it off',
        'Let it go through for a single',
        'Charge hard and try to barehand it',
      ]),
      bestChoice: 'Take the angle and cut it off',
      explanations: JSON.stringify({
        'Dive for the ball': 'High risk - if you miss, it could be extra bases.',
        'Take the angle and cut it off':
          'SMART! Good defense is about reliability and making the routine play.',
        'Let it go through for a single': 'Too passive! You can make this play.',
        'Charge hard and try to barehand it': 'Unnecessary risk for a routine grounder.',
      }),
      successRates: JSON.stringify({
        'Dive for the ball': 60,
        'Take the angle and cut it off': 85,
        'Let it go through for a single': 100,
        'Charge hard and try to barehand it': 45,
      }),
      tags: JSON.stringify(['defense', 'fundamentals', 'positioning']),
      videoUrl: 'https://youtube.com/watch?v=example3',
      mlbExample: "Derek Jeter's fundamental approach",
      isPublic: true,
      timesPlayed: 567,
      averageScore: 81.2,
    },
    {
      id: 'demo_baserunner_001',
      title: 'Steal Attempt',
      description: 'On first base, good jump, count is 2-1 to the batter.',
      category: 'baserunner',
      difficulty: 'BEGINNER',
      inning: '6th',
      score: '2-3',
      count: '2-1',
      runners: 'You on 1st',
      outs: 1,
      weatherConditions: 'Clear, 68°F',
      options: JSON.stringify([
        'Go on first movement',
        'Wait for a better count',
        'Get a bigger lead first',
        'Stay put and let the batter hit',
      ]),
      bestChoice: 'Go on first movement',
      explanations: JSON.stringify({
        'Go on first movement': 'PERFECT! You got a good jump and the count favors a steal.',
        'Wait for a better count': 'This IS a good count! The pitcher has to throw a strike.',
        'Get a bigger lead first': 'You already have a good jump - go now!',
        'Stay put and let the batter hit': 'Too passive! Getting into scoring position is crucial.',
      }),
      successRates: JSON.stringify({
        'Go on first movement': 75,
        'Wait for a better count': 45,
        'Get a bigger lead first': 60,
        'Stay put and let the batter hit': 30,
      }),
      tags: JSON.stringify(['baserunning', 'stealing', 'timing']),
      videoUrl: 'https://youtube.com/watch?v=example4',
      mlbExample: "Rickey Henderson's base stealing technique",
      isPublic: true,
      timesPlayed: 423,
      averageScore: 79.1,
    },
  ];

  // Create achievements
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  // Create scenarios
  for (const scenario of scenarios) {
    await prisma.scenario.upsert({
      where: { id: scenario.id },
      update: scenario,
      create: scenario,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${achievements.length} achievements`);
  console.log(`🎮 Created ${scenarios.length} scenarios`);

  // Update admin user for Railway deployment
  console.log('\n🔧 Checking admin user...');
  await updateAdminUser();
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
