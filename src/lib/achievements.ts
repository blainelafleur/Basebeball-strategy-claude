import { prisma } from './prisma';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  type: 'GAMES_PLAYED' | 'STREAK' | 'ACCURACY' | 'SPEED' | 'CATEGORY' | 'POINTS' | 'SPECIAL';
  category?: string;
  icon: string;
  points: number;
  requirement: {
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    condition?: 'gte' | 'lte' | 'eq';
  };
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  isHidden?: boolean;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Games Played Achievements
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Complete your first scenario',
    type: 'GAMES_PLAYED',
    icon: '🏃',
    points: 10,
    requirement: { target: 1, condition: 'gte' },
    tier: 'bronze',
  },
  {
    id: 'games_10',
    name: 'Getting Started',
    description: 'Complete 10 scenarios',
    type: 'GAMES_PLAYED',
    icon: '⚾',
    points: 50,
    requirement: { target: 10, condition: 'gte' },
    tier: 'bronze',
  },
  {
    id: 'games_50',
    name: 'Dedicated Player',
    description: 'Complete 50 scenarios',
    type: 'GAMES_PLAYED',
    icon: '🏆',
    points: 200,
    requirement: { target: 50, condition: 'gte' },
    tier: 'silver',
  },
  {
    id: 'games_100',
    name: 'Century Mark',
    description: 'Complete 100 scenarios',
    type: 'GAMES_PLAYED',
    icon: '💯',
    points: 500,
    requirement: { target: 100, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'games_500',
    name: 'Master Strategist',
    description: 'Complete 500 scenarios',
    type: 'GAMES_PLAYED',
    icon: '👑',
    points: 2000,
    requirement: { target: 500, condition: 'gte' },
    tier: 'diamond',
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Get 3 correct answers in a row',
    type: 'STREAK',
    icon: '🔥',
    points: 25,
    requirement: { target: 3, condition: 'gte' },
    tier: 'bronze',
  },
  {
    id: 'streak_5',
    name: 'On Fire',
    description: 'Get 5 correct answers in a row',
    type: 'STREAK',
    icon: '🌟',
    points: 50,
    requirement: { target: 5, condition: 'gte' },
    tier: 'bronze',
  },
  {
    id: 'streak_10',
    name: 'Unstoppable',
    description: 'Get 10 correct answers in a row',
    type: 'STREAK',
    icon: '⚡',
    points: 150,
    requirement: { target: 10, condition: 'gte' },
    tier: 'silver',
  },
  {
    id: 'streak_20',
    name: 'Perfect Vision',
    description: 'Get 20 correct answers in a row',
    type: 'STREAK',
    icon: '🎯',
    points: 400,
    requirement: { target: 20, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'streak_50',
    name: 'Legendary',
    description: 'Get 50 correct answers in a row',
    type: 'STREAK',
    icon: '🏅',
    points: 1000,
    requirement: { target: 50, condition: 'gte' },
    tier: 'diamond',
  },

  // Accuracy Achievements
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Complete a scenario with 100% accuracy',
    type: 'ACCURACY',
    icon: '💎',
    points: 100,
    requirement: { target: 100, condition: 'gte' },
    tier: 'silver',
  },
  {
    id: 'ace_pitcher',
    name: 'Ace Pitcher',
    description: '90% accuracy in pitcher scenarios (min 10 games)',
    type: 'ACCURACY',
    category: 'pitcher',
    icon: '⚾',
    points: 200,
    requirement: { target: 90, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'clutch_hitter',
    name: 'Clutch Hitter',
    description: '90% accuracy in batter scenarios (min 10 games)',
    type: 'ACCURACY',
    category: 'batter',
    icon: '🏏',
    points: 200,
    requirement: { target: 90, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'gold_glove',
    name: 'Gold Glove',
    description: '90% accuracy in fielder scenarios (min 10 games)',
    type: 'ACCURACY',
    category: 'fielder',
    icon: '🥎',
    points: 200,
    requirement: { target: 90, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: '90% accuracy in baserunner scenarios (min 10 games)',
    type: 'ACCURACY',
    category: 'baserunner',
    icon: '🏃',
    points: 200,
    requirement: { target: 90, condition: 'gte' },
    tier: 'gold',
  },

  // Speed Achievements
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: 'Answer a scenario correctly in under 3 seconds',
    type: 'SPEED',
    icon: '💨',
    points: 50,
    requirement: { target: 3, condition: 'lte' },
    tier: 'bronze',
  },
  {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Average response time under 5 seconds (min 20 games)',
    type: 'SPEED',
    icon: '⚡',
    points: 300,
    requirement: { target: 5, condition: 'lte' },
    tier: 'gold',
  },

  // Points Achievements
  {
    id: 'points_1000',
    name: 'Rising Star',
    description: 'Earn 1,000 total points',
    type: 'POINTS',
    icon: '⭐',
    points: 100,
    requirement: { target: 1000, condition: 'gte' },
    tier: 'bronze',
  },
  {
    id: 'points_5000',
    name: 'All-Star',
    description: 'Earn 5,000 total points',
    type: 'POINTS',
    icon: '🌟',
    points: 250,
    requirement: { target: 5000, condition: 'gte' },
    tier: 'silver',
  },
  {
    id: 'points_10000',
    name: 'Hall of Famer',
    description: 'Earn 10,000 total points',
    type: 'POINTS',
    icon: '🏛️',
    points: 500,
    requirement: { target: 10000, condition: 'gte' },
    tier: 'gold',
  },
  {
    id: 'points_25000',
    name: 'Baseball Legend',
    description: 'Earn 25,000 total points',
    type: 'POINTS',
    icon: '👑',
    points: 1000,
    requirement: { target: 25000, condition: 'gte' },
    tier: 'diamond',
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a scenario before 8 AM',
    type: 'SPECIAL',
    icon: '🐦',
    points: 25,
    requirement: { target: 1, condition: 'gte' },
    tier: 'bronze',
    isHidden: true,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a scenario after 10 PM',
    type: 'SPECIAL',
    icon: '🦉',
    points: 25,
    requirement: { target: 1, condition: 'gte' },
    tier: 'bronze',
    isHidden: true,
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete 10 scenarios on weekends',
    type: 'SPECIAL',
    icon: '🏖️',
    points: 100,
    requirement: { target: 10, condition: 'gte' },
    tier: 'silver',
  },
  {
    id: 'daily_grind',
    name: 'Daily Grind',
    description: 'Complete at least one scenario for 7 consecutive days',
    type: 'SPECIAL',
    icon: '📅',
    points: 200,
    requirement: { target: 7, condition: 'gte' },
    tier: 'gold',
  },
];

export interface UserStats {
  totalGames: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  averageAccuracy: number;
  averageResponseTime: number;
  categoryStats: Record<
    string,
    {
      games: number;
      accuracy: number;
      avgResponseTime: number;
    }
  >;
  recentGames: Array<{
    date: Date;
    success: boolean;
    responseTime: number;
    category: string;
  }>;
}

export async function checkAchievements(
  userId: string,
  gameData?: {
    success: boolean;
    responseTime: number;
    points: number;
    category: string;
  }
): Promise<string[]> {
  const unlockedAchievements: string[] = [];

  // Get user's current achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const achievedIds = new Set(existingAchievements.map((a) => a.achievementId));

  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      games: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  if (!user) return [];

  const stats = calculateUserStats(user.games);

  // Check each achievement
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (achievedIds.has(achievement.id)) continue;

    let isUnlocked = false;

    switch (achievement.type) {
      case 'GAMES_PLAYED':
        isUnlocked = checkCondition(stats.totalGames, achievement.requirement);
        break;

      case 'STREAK':
        isUnlocked = checkCondition(stats.bestStreak, achievement.requirement);
        break;

      case 'ACCURACY':
        if (achievement.category) {
          const categoryStats = stats.categoryStats[achievement.category];
          if (categoryStats && categoryStats.games >= 10) {
            isUnlocked = checkCondition(categoryStats.accuracy, achievement.requirement);
          }
        } else {
          isUnlocked = checkCondition(stats.averageAccuracy, achievement.requirement);
        }
        break;

      case 'SPEED':
        if (achievement.id === 'quick_thinker' && gameData) {
          isUnlocked =
            gameData.success && checkCondition(gameData.responseTime, achievement.requirement);
        } else if (achievement.id === 'lightning_fast' && stats.totalGames >= 20) {
          isUnlocked = checkCondition(stats.averageResponseTime, achievement.requirement);
        }
        break;

      case 'POINTS':
        isUnlocked = checkCondition(stats.totalPoints, achievement.requirement);
        break;

      case 'SPECIAL':
        isUnlocked = await checkSpecialAchievement(achievement, userId, gameData);
        break;
    }

    if (isUnlocked) {
      // Create achievement record
      await createAchievement(achievement);

      // Award achievement to user
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award points to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: achievement.points },
        },
      });

      unlockedAchievements.push(achievement.id);
    }
  }

  return unlockedAchievements;
}

function calculateUserStats(
  games: Array<{
    success: boolean;
    points: number;
    responseTime: number;
    scenarioId?: string;
    createdAt: Date;
  }>
): UserStats {
  const totalGames = games.length;
  const successfulGames = games.filter((g) => g.success);
  const totalPoints = games.reduce((sum, g) => sum + (g.points || 0), 0);

  // Calculate streaks
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Current streak from most recent games
  for (let i = 0; i < games.length; i++) {
    if (games[i].success) {
      currentStreak = i === 0 ? 1 : currentStreak + 1;
    } else {
      break;
    }
  }

  // Best streak
  games.forEach((game) => {
    if (game.success) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Category stats
  const categoryStats: Record<
    string,
    { games: number; accuracy: number; avgResponseTime: number }
  > = {};

  games.forEach((game) => {
    const category = game.scenarioId?.split('_')[0] || 'unknown';
    if (!categoryStats[category]) {
      categoryStats[category] = { games: 0, accuracy: 0, avgResponseTime: 0 };
    }
    categoryStats[category].games++;
  });

  Object.keys(categoryStats).forEach((category) => {
    const categoryGames = games.filter((g) => g.scenarioId?.startsWith(category));
    const successful = categoryGames.filter((g) => g.success);

    categoryStats[category].accuracy =
      categoryGames.length > 0 ? (successful.length / categoryGames.length) * 100 : 0;

    categoryStats[category].avgResponseTime =
      categoryGames.length > 0
        ? categoryGames.reduce((sum, g) => sum + g.responseTime, 0) / categoryGames.length
        : 0;
  });

  return {
    totalGames,
    totalPoints,
    currentStreak,
    bestStreak,
    averageAccuracy: totalGames > 0 ? (successfulGames.length / totalGames) * 100 : 0,
    averageResponseTime:
      totalGames > 0 ? games.reduce((sum, g) => sum + g.responseTime, 0) / totalGames : 0,
    categoryStats,
    recentGames: games.slice(0, 20).map((g) => ({
      date: g.createdAt,
      success: g.success,
      responseTime: g.responseTime,
      category: g.scenarioId?.split('_')[0] || 'unknown',
    })),
  };
}

function checkCondition(value: number, requirement: AchievementDefinition['requirement']): boolean {
  const { target, condition = 'gte' } = requirement;

  switch (condition) {
    case 'gte':
      return value >= target;
    case 'lte':
      return value <= target;
    case 'eq':
      return value === target;
    default:
      return false;
  }
}

async function checkSpecialAchievement(
  achievement: AchievementDefinition,
  userId: string,
  gameData?: {
    success: boolean;
    responseTime: number;
    points: number;
    category: string;
  }
): Promise<boolean> {
  switch (achievement.id) {
    case 'early_bird':
      if (gameData) {
        const hour = new Date().getHours();
        return hour < 8;
      }
      break;

    case 'night_owl':
      if (gameData) {
        const hour = new Date().getHours();
        return hour >= 22;
      }
      break;

    case 'weekend_warrior':
      const weekendGames = await prisma.game.count({
        where: {
          userId,
          success: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });
      // This is simplified - would need to check actual weekend dates
      return weekendGames >= 10;

    case 'daily_grind':
      // Check if user has played for 7 consecutive days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toDateString();
      });

      const gamesLast7Days = await prisma.game.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      });

      const playedDays = new Set(gamesLast7Days.map((g) => g.createdAt.toDateString()));

      return last7Days.every((day) => playedDays.has(day));
  }

  return false;
}

async function createAchievement(achievement: AchievementDefinition): Promise<void> {
  await prisma.achievement.upsert({
    where: { id: achievement.id },
    update: {},
    create: {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      type: achievement.type,
      category: achievement.category,
      icon: achievement.icon,
      points: achievement.points,
      tier: achievement.tier.toUpperCase() as 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND',
      isHidden: achievement.isHidden || false,
    },
  });
}

export function calculateLevel(points: number): {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  // Level calculation: 100 points for level 1, then increases by 50 per level
  let level = 1;
  let totalXPNeeded = 0;
  let nextLevelXP = 100;

  while (points >= totalXPNeeded + nextLevelXP) {
    totalXPNeeded += nextLevelXP;
    level++;
    nextLevelXP = 100 + (level - 1) * 50; // Increases by 50 each level
  }

  const currentXP = points - totalXPNeeded;
  const progress = (currentXP / nextLevelXP) * 100;

  return {
    level,
    currentXP,
    nextLevelXP,
    progress,
  };
}
