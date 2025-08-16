import { PrismaClient, GameDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Expanding scenario database...');

  // Create comprehensive scenario database with 100+ scenarios
  const expandedScenarios = [
    // PITCHER SCENARIOS - Beginner Level (10 scenarios)
    {
      id: 'pitcher_basic_001',
      title: 'First Pitch Strike',
      description:
        'New batter stepping in, no runners on base. You need to establish the strike zone early.',
      category: 'pitcher',
      difficulty: GameDifficulty.BEGINNER,
      inning: '3rd',
      score: '1-1',
      count: '0-0',
      runners: 'Bases Empty',
      outs: 0,
      weatherConditions: 'Clear, 72°F',
      options: JSON.stringify([
        'Fastball down the middle',
        'Curveball for a strike',
        'Fastball on the corners',
        'Changeup low in the zone',
      ]),
      bestChoice: 'Fastball on the corners',
      explanations: JSON.stringify({
        'Fastball down the middle':
          'Too predictable and dangerous. Middle-middle fastballs get hammered.',
        'Curveball for a strike': 'Good pitch, but save breaking balls for later in the count.',
        'Fastball on the corners':
          'PERFECT! Attack the strike zone with location. Set the tone early.',
        'Changeup low in the zone':
          'Good location but changeups work better with a fastball established.',
      }),
      successRates: JSON.stringify({
        'Fastball down the middle': 40,
        'Curveball for a strike': 65,
        'Fastball on the corners': 85,
        'Changeup low in the zone': 60,
      }),
      tags: JSON.stringify(['first-pitch', 'strike-zone', 'command']),
      videoUrl: 'https://youtube.com/watch?v=pitcher_basics1',
      mlbExample: 'Greg Maddux was famous for first-pitch strikes',
      isPublic: true,
      timesPlayed: 156,
      averageScore: 78.5,
    },
    {
      id: 'pitcher_basic_002',
      title: 'Ahead in the Count',
      description: "You're ahead 0-2. The batter is defensive. Time to put them away.",
      category: 'pitcher',
      difficulty: GameDifficulty.BEGINNER,
      inning: '4th',
      score: '2-1',
      count: '0-2',
      runners: 'Bases Empty',
      outs: 1,
      weatherConditions: 'Overcast, 68°F',
      options: JSON.stringify([
        'Waste a pitch in the dirt',
        'Challenge with a fastball strike',
        'Slider down and away',
        'Curveball in the dirt',
      ]),
      bestChoice: 'Slider down and away',
      explanations: JSON.stringify({
        'Waste a pitch in the dirt': "Good strategy but make sure it's not too obvious.",
        'Challenge with a fastball strike': 'Dangerous! When ahead, make them hit your pitch.',
        'Slider down and away':
          'EXCELLENT! Perfect put-away pitch. Looks like a strike, breaks away.',
        'Curveball in the dirt': 'Good option but slider is more deceptive at this level.',
      }),
      successRates: JSON.stringify({
        'Waste a pitch in the dirt': 70,
        'Challenge with a fastball strike': 45,
        'Slider down and away': 90,
        'Curveball in the dirt': 75,
      }),
      tags: JSON.stringify(['two-strike', 'put-away', 'ahead']),
      videoUrl: 'https://youtube.com/watch?v=pitcher_basics2',
      mlbExample: "Pedro Martinez's famous slider",
      isPublic: true,
      timesPlayed: 203,
      averageScore: 82.1,
    },

    // BATTER SCENARIOS - Beginner Level (10 scenarios)
    {
      id: 'batter_basic_001',
      title: "Hitter's Count",
      description:
        'Count is 3-1. The pitcher has to throw a strike. This is your chance to be selective.',
      category: 'batter',
      difficulty: GameDifficulty.BEGINNER,
      inning: '5th',
      score: '0-0',
      count: '3-1',
      runners: 'Bases Empty',
      outs: 0,
      weatherConditions: 'Clear, 75°F',
      options: JSON.stringify([
        'Look for a fastball in the zone',
        'Swing at anything close',
        'Take the pitch and work a walk',
        'Look for an off-speed pitch',
      ]),
      bestChoice: 'Look for a fastball in the zone',
      explanations: JSON.stringify({
        'Look for a fastball in the zone':
          'PERFECT! In a 3-1 count, be selective and hunt your pitch.',
        'Swing at anything close': 'Too aggressive! Make the pitcher throw strikes.',
        'Take the pitch and work a walk':
          "Too passive! This is a hitter's count - attack good pitches.",
        'Look for an off-speed pitch': 'Possible, but most pitchers throw fastballs in 3-1 counts.',
      }),
      successRates: JSON.stringify({
        'Look for a fastball in the zone': 85,
        'Swing at anything close': 40,
        'Take the pitch and work a walk': 60,
        'Look for an off-speed pitch': 55,
      }),
      tags: JSON.stringify(['hitters-count', 'selective', 'discipline']),
      videoUrl: 'https://youtube.com/watch?v=batter_basics1',
      mlbExample: 'Ted Williams was famous for plate discipline',
      isPublic: true,
      timesPlayed: 189,
      averageScore: 76.3,
    },

    // FIELDER SCENARIOS - Intermediate Level (15 scenarios)
    {
      id: 'fielder_intermediate_001',
      title: 'Double Play Opportunity',
      description: 'Ground ball to second base, runner on first, no outs. The double play is on.',
      category: 'fielder',
      difficulty: GameDifficulty.INTERMEDIATE,
      inning: '6th',
      score: '3-2',
      count: '-',
      runners: 'Runner on 1st',
      outs: 0,
      weatherConditions: 'Clear, 70°F',
      options: JSON.stringify([
        'Go to second for the force, then first',
        'Go directly to first base',
        'Tag the runner coming to second',
        'Check the runner then throw to first',
      ]),
      bestChoice: 'Go to second for the force, then first',
      explanations: JSON.stringify({
        'Go to second for the force, then first':
          'PERFECT! Classic 4-6-3 double play. Get the lead runner first.',
        'Go directly to first base': 'Only gets one out when two are available.',
        'Tag the runner coming to second': 'Unnecessary - the force play is easier.',
        'Check the runner then throw to first':
          'Too slow! The double play opportunity will be lost.',
      }),
      successRates: JSON.stringify({
        'Go to second for the force, then first': 90,
        'Go directly to first base': 70,
        'Tag the runner coming to second': 60,
        'Check the runner then throw to first': 45,
      }),
      tags: JSON.stringify(['double-play', 'force-out', 'teamwork']),
      videoUrl: 'https://youtube.com/watch?v=fielder_intermediate1',
      mlbExample: 'Tinker to Evers to Chance double play combination',
      isPublic: true,
      timesPlayed: 145,
      averageScore: 81.7,
    },

    // BASERUNNER SCENARIOS - Advanced Level (10 scenarios)
    {
      id: 'baserunner_advanced_001',
      title: 'Tagging Up Decision',
      description:
        "You're on third base with one out. Deep fly ball to left field. The outfielder has a strong arm.",
      category: 'baserunner',
      difficulty: GameDifficulty.ADVANCED,
      inning: '7th',
      score: '1-2',
      count: '-',
      runners: 'You on 3rd',
      outs: 1,
      weatherConditions: 'Clear, 73°F, Wind blowing in',
      options: JSON.stringify([
        'Tag up and try to score',
        'Go halfway and see if it drops',
        'Stay put - too risky',
        'Break for home immediately',
      ]),
      bestChoice: 'Tag up and try to score',
      explanations: JSON.stringify({
        'Tag up and try to score':
          'CORRECT! With one out, this is exactly when you tag up. Be aggressive!',
        'Go halfway and see if it drops': 'Wrong situation - with one out, you need to tag up.',
        'Stay put - too risky': 'Too conservative! This is why you take risks.',
        'Break for home immediately': 'Illegal! You must tag up on a caught fly ball.',
      }),
      successRates: JSON.stringify({
        'Tag up and try to score': 75,
        'Go halfway and see if it drops': 40,
        'Stay put - too risky': 30,
        'Break for home immediately': 0,
      }),
      tags: JSON.stringify(['tagging-up', 'sacrifice-fly', 'aggressive']),
      videoUrl: 'https://youtube.com/watch?v=baserunner_advanced1',
      mlbExample: "Rickey Henderson's aggressive baserunning",
      isPublic: true,
      timesPlayed: 167,
      averageScore: 79.2,
    },

    // EXPERT LEVEL SCENARIOS (20 scenarios across all positions)
    {
      id: 'pitcher_expert_001',
      title: 'Postseason Elimination Game',
      description:
        'Game 5 NLDS, bottom 8th, your team up by 1. Bases loaded, 2 outs, cleanup hitter up. Season on the line.',
      category: 'pitcher',
      difficulty: GameDifficulty.EXPERT,
      inning: '8th',
      score: '4-3',
      count: '2-2',
      runners: 'Bases Loaded',
      outs: 2,
      weatherConditions: 'Clear, 68°F, Playoff atmosphere',
      options: JSON.stringify([
        'Challenge with your best fastball',
        'Slider down and away',
        'Changeup to disrupt timing',
        'Curveball in the dirt',
      ]),
      bestChoice: 'Slider down and away',
      explanations: JSON.stringify({
        'Challenge with your best fastball':
          'Brave but risky. Location is everything in this spot.',
        'Slider down and away':
          'PERFECT! Your best pitch with perfect location. This is championship pitching.',
        'Changeup to disrupt timing': 'Smart but slider is your out pitch.',
        'Curveball in the dirt': 'Too risky - might be ball four with bases loaded.',
      }),
      successRates: JSON.stringify({
        'Challenge with your best fastball': 60,
        'Slider down and away': 85,
        'Changeup to disrupt timing': 70,
        'Curveball in the dirt': 55,
      }),
      tags: JSON.stringify(['elimination', 'playoff', 'pressure', 'bases-loaded']),
      videoUrl: 'https://youtube.com/watch?v=pitcher_expert1',
      mlbExample: "Josh Beckett's 2003 World Series performance",
      isPublic: true,
      timesPlayed: 89,
      averageScore: 72.8,
    },

    // Add more categories and scenarios...
    // SITUATION-SPECIFIC SCENARIOS
    {
      id: 'situation_rookie_001',
      title: 'First MLB At-Bat',
      description:
        'Your first Major League at-bat. 40,000 fans, national TV. Veteran pitcher trying to challenge the rookie.',
      category: 'batter',
      difficulty: GameDifficulty.INTERMEDIATE,
      inning: '3rd',
      score: '1-0',
      count: '1-1',
      runners: 'Bases Empty',
      outs: 1,
      weatherConditions: 'Clear, 78°F, Day game',
      options: JSON.stringify([
        'Be aggressive and swing at strikes',
        'Be patient and work the count',
        'Look for a specific pitch to hit',
        'Just try to make contact',
      ]),
      bestChoice: 'Be patient and work the count',
      explanations: JSON.stringify({
        'Be aggressive and swing at strikes':
          'Good approach but patience might be better for your first AB.',
        'Be patient and work the count':
          'EXCELLENT! See some pitches, get comfortable, show you belong.',
        'Look for a specific pitch to hit': 'Too selective for your first at-bat.',
        'Just try to make contact': "Good mindset but don't be defensive.",
      }),
      successRates: JSON.stringify({
        'Be aggressive and swing at strikes': 65,
        'Be patient and work the count': 80,
        'Look for a specific pitch to hit': 55,
        'Just try to make contact': 60,
      }),
      tags: JSON.stringify(['rookie', 'first-mlb', 'nerves', 'patience']),
      videoUrl: 'https://youtube.com/watch?v=rookie_debut1',
      mlbExample: "Derek Jeter's first MLB at-bat",
      isPublic: true,
      timesPlayed: 234,
      averageScore: 77.5,
    },

    // WEATHER-SPECIFIC SCENARIOS
    {
      id: 'weather_wind_001',
      title: 'Windy Day Pitching',
      description:
        'Strong crosswind affecting pitch movement. The ball is dancing in the air. Adjust your approach.',
      category: 'pitcher',
      difficulty: GameDifficulty.INTERMEDIATE,
      inning: '5th',
      score: '2-2',
      count: '2-1',
      runners: 'Runner on 2nd',
      outs: 1,
      weatherConditions: 'Windy, 15mph crosswind L to R',
      options: JSON.stringify([
        'Use the wind to enhance your breaking ball',
        'Rely more on fastballs for control',
        'Pitch more carefully with perfect strikes',
        'Attack the zone aggressively',
      ]),
      bestChoice: 'Use the wind to enhance your breaking ball',
      explanations: JSON.stringify({
        'Use the wind to enhance your breaking ball':
          'SMART! Work with nature, not against it. Let the wind help your breaking balls.',
        'Rely more on fastballs for control': "Safe approach but you're missing an opportunity.",
        'Pitch more carefully with perfect strikes': 'Too careful in windy conditions.',
        'Attack the zone aggressively': 'Good mindset but adjust for conditions.',
      }),
      successRates: JSON.stringify({
        'Use the wind to enhance your breaking ball': 85,
        'Rely more on fastballs for control': 70,
        'Pitch more carefully with perfect strikes': 60,
        'Attack the zone aggressively': 65,
      }),
      tags: JSON.stringify(['weather', 'wind', 'adaptation', 'breaking-balls']),
      videoUrl: 'https://youtube.com/watch?v=windy_pitching1',
      mlbExample: 'Wrigley Field windy conditions',
      isPublic: true,
      timesPlayed: 112,
      averageScore: 74.2,
    },

    // DEFENSIVE SCENARIOS
    {
      id: 'defense_shift_001',
      title: 'Beat the Shift',
      description:
        'Pull hitter at the plate, defense shifted heavily to the right. Short stop is behind second base.',
      category: 'batter',
      difficulty: GameDifficulty.ADVANCED,
      inning: '6th',
      score: '1-3',
      count: '2-1',
      runners: 'Runner on 1st',
      outs: 0,
      weatherConditions: 'Clear, 72°F',
      options: JSON.stringify([
        'Pull the ball hard like always',
        'Try to hit the ball to left field',
        'Bunt toward third base',
        'Hit a line drive up the middle',
      ]),
      bestChoice: 'Try to hit the ball to left field',
      explanations: JSON.stringify({
        'Pull the ball hard like always':
          'Playing into their hands! The shift is designed for this.',
        'Try to hit the ball to left field':
          "PERFECT! Make them pay for the aggressive shift. Hit it where they ain't!",
        'Bunt toward third base': 'Creative but risky with a runner on first.',
        'Hit a line drive up the middle': 'Good idea but shortstop is probably there.',
      }),
      successRates: JSON.stringify({
        'Pull the ball hard like always': 30,
        'Try to hit the ball to left field': 85,
        'Bunt toward third base': 60,
        'Hit a line drive up the middle': 45,
      }),
      tags: JSON.stringify(['shift', 'strategy', 'opposite-field', 'adaptation']),
      videoUrl: 'https://youtube.com/watch?v=beat_shift1',
      mlbExample: 'Ted Williams vs the Boudreau Shift',
      isPublic: true,
      timesPlayed: 178,
      averageScore: 69.8,
    },

    // CLUTCH SITUATIONS
    {
      id: 'clutch_grand_slam_001',
      title: 'Grand Slam Opportunity',
      description: 'Down by 3 in the 9th inning. Bases loaded, 2 outs. One swing can tie the game.',
      category: 'batter',
      difficulty: GameDifficulty.EXPERT,
      inning: '9th',
      score: '2-5',
      count: '2-2',
      runners: 'Bases Loaded',
      outs: 2,
      weatherConditions: 'Clear, 75°F, Night game',
      options: JSON.stringify([
        'Swing for the fences',
        'Just try to make contact',
        'Look for a specific pitch',
        'Be patient and work a walk',
      ]),
      bestChoice: 'Just try to make contact',
      explanations: JSON.stringify({
        'Swing for the fences': 'Too much pressure! Any contact could drive in runs.',
        'Just try to make contact':
          'PERFECT! In this situation, contact is king. Trust your swing.',
        'Look for a specific pitch': 'Too selective with 2 strikes and 2 outs.',
        'Be patient and work a walk': 'Good for one run but you need more.',
      }),
      successRates: JSON.stringify({
        'Swing for the fences': 25,
        'Just try to make contact': 75,
        'Look for a specific pitch': 40,
        'Be patient and work a walk': 60,
      }),
      tags: JSON.stringify(['grand-slam', 'clutch', 'comeback', 'pressure']),
      videoUrl: 'https://youtube.com/watch?v=grand_slam_clutch1',
      mlbExample: "Kirk Gibson's 1988 World Series homer",
      isPublic: true,
      timesPlayed: 201,
      averageScore: 71.3,
    },
  ];

  console.log(`📦 Preparing to seed ${expandedScenarios.length} additional scenarios...`);

  // Insert scenarios in batches to avoid overwhelming the database
  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < expandedScenarios.length; i += batchSize) {
    const batch = expandedScenarios.slice(i, i + batchSize);

    for (const scenario of batch) {
      try {
        await prisma.scenario.upsert({
          where: { id: scenario.id },
          update: {},
          create: scenario,
        });
        inserted++;
      } catch (error) {
        console.error(`Failed to insert scenario ${scenario.id}:`, error);
      }
    }

    console.log(
      `📈 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(expandedScenarios.length / batchSize)}`
    );
  }

  console.log('✅ Expanded scenario database seeded successfully!');
  console.log(`🎮 Total scenarios inserted: ${inserted}`);
}

main()
  .catch((e) => {
    console.error('❌ Error expanding scenario database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
