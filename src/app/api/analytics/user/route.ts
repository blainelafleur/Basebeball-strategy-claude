import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        games: {
          orderBy: { createdAt: 'desc' },
          take: 100, // Last 100 games for analysis
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate analytics
    const games = user.games;
    const totalGames = games.length;
    const correctAnswers = games.filter((game) => game.success).length;
    const overallAccuracy = totalGames > 0 ? (correctAnswers / totalGames) * 100 : 0;

    // Performance by category
    const categoryStats = games.reduce(
      (acc, game) => {
        // Extract category from scenarioId (e.g., "pitcher_clutch_001" -> "pitcher")
        const category = game.scenarioId?.split('_')[0] || 'unknown';

        if (!acc[category]) {
          acc[category] = { total: 0, correct: 0, totalTime: 0, points: 0 };
        }

        acc[category].total++;
        if (game.success) acc[category].correct++;
        acc[category].totalTime += game.responseTime;
        acc[category].points += game.points;

        return acc;
      },
      {} as Record<string, { total: number; correct: number; totalTime: number; points: number }>
    );

    // Performance by difficulty
    const difficultyStats = games.reduce(
      (acc, game) => {
        const difficulty = game.difficulty;

        if (!acc[difficulty]) {
          acc[difficulty] = { total: 0, correct: 0, averageTime: 0, points: 0 };
        }

        acc[difficulty].total++;
        if (game.success) acc[difficulty].correct++;
        acc[difficulty].averageTime += game.responseTime;
        acc[difficulty].points += game.points;

        return acc;
      },
      {} as Record<string, { total: number; correct: number; averageTime: number; points: number }>
    );

    // Calculate averages for difficulty stats
    Object.keys(difficultyStats).forEach((difficulty) => {
      const stats = difficultyStats[difficulty];
      stats.averageTime = stats.total > 0 ? stats.averageTime / stats.total : 0;
    });

    // Recent performance trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentGames = games.filter((game) => game.createdAt >= thirtyDaysAgo);
    const performanceTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dayGames = recentGames.filter(
        (game) => game.createdAt.toDateString() === date.toDateString()
      );

      return {
        date: date.toISOString().split('T')[0],
        games: dayGames.length,
        accuracy:
          dayGames.length > 0
            ? (dayGames.filter((g) => g.success).length / dayGames.length) * 100
            : 0,
        avgResponseTime:
          dayGames.length > 0
            ? dayGames.reduce((sum, g) => sum + g.responseTime, 0) / dayGames.length
            : 0,
        points: dayGames.reduce((sum, g) => sum + g.points, 0),
      };
    });

    // Streaks analysis
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from most recent games)
    for (let i = 0; i < games.length; i++) {
      if (games[i].success) {
        currentStreak = i === 0 ? 1 : currentStreak + 1;
      } else {
        break;
      }
    }

    // Calculate best streak
    games.forEach((game) => {
      if (game.success) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Achievements data
    const achievementData = user.achievements.map((ua) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      type: ua.achievement.type,
      icon: ua.achievement.icon,
      points: ua.achievement.points,
      unlockedAt: ua.unlockedAt,
    }));

    // Response time analysis
    const avgResponseTime =
      totalGames > 0 ? games.reduce((sum, game) => sum + game.responseTime, 0) / totalGames : 0;

    const fastestResponse = totalGames > 0 ? Math.min(...games.map((g) => g.responseTime)) : 0;

    // Strengths and weaknesses
    const categoryAccuracies = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        games: stats.total,
      }))
      .filter((item) => item.games >= 3); // Only categories with at least 3 games

    const strengths = categoryAccuracies
      .filter((item) => item.accuracy >= 75)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 3);

    const weaknesses = categoryAccuracies
      .filter((item) => item.accuracy < 65)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return NextResponse.json({
      overview: {
        totalGames,
        overallAccuracy: Math.round(overallAccuracy * 100) / 100,
        totalPoints: user.points,
        currentLevel: user.level,
        currentStreak,
        bestStreak,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        fastestResponse: Math.round(fastestResponse * 100) / 100,
      },
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100 * 100) / 100 : 0,
        avgResponseTime:
          stats.total > 0 ? Math.round((stats.totalTime / stats.total) * 100) / 100 : 0,
        totalPoints: stats.points,
      })),
      difficultyStats: Object.entries(difficultyStats).map(([difficulty, stats]) => ({
        difficulty,
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100 * 100) / 100 : 0,
        avgResponseTime: Math.round(stats.averageTime * 100) / 100,
        totalPoints: stats.points,
      })),
      performanceTrend,
      achievements: achievementData,
      insights: {
        strengths: strengths.map((s) => ({
          category: s.category,
          accuracy: Math.round(s.accuracy * 100) / 100,
          games: s.games,
        })),
        weaknesses: weaknesses.map((w) => ({
          category: w.category,
          accuracy: Math.round(w.accuracy * 100) / 100,
          games: w.games,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
