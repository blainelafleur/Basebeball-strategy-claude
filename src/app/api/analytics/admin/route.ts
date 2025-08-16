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
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Platform Overview
    const totalUsers = await prisma.user.count();
    const totalGames = await prisma.game.count();
    const totalScenarios = await prisma.scenario.count();

    // User distribution by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // Active users (played in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        games: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Games played over time (last 30 days)
    const gamesOverTime = await prisma.game.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Process games over time into daily buckets
    const dailyGames = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateString = date.toISOString().split('T')[0];

      const dayGames = gamesOverTime.filter(
        (game) => game.createdAt.toISOString().split('T')[0] === dateString
      );

      return {
        date: dateString,
        games: dayGames.reduce((sum, g) => sum + g._count.id, 0),
      };
    });

    // Scenario popularity
    const scenarioStats = await prisma.scenario.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        timesPlayed: true,
        averageScore: true,
        _count: {
          select: {
            games: true,
          },
        },
      },
      orderBy: {
        timesPlayed: 'desc',
      },
      take: 10,
    });

    // Performance by category across all users
    const categoryPerformance = await prisma.game.groupBy({
      by: ['scenarioId'],
      _count: {
        id: true,
      },
      _avg: {
        points: true,
        responseTime: true,
      },
      where: {
        scenarioId: {
          not: null,
        },
      },
    });

    // Process category performance
    const categoryStats = categoryPerformance.reduce(
      (acc, game) => {
        const category = game.scenarioId?.split('_')[0] || 'unknown';

        if (!acc[category]) {
          acc[category] = {
            totalGames: 0,
            avgPoints: 0,
            avgResponseTime: 0,
            gameCount: 0,
          };
        }

        acc[category].totalGames += game._count.id;
        acc[category].avgPoints += (game._avg.points || 0) * game._count.id;
        acc[category].avgResponseTime += (game._avg.responseTime || 0) * game._count.id;
        acc[category].gameCount++;

        return acc;
      },
      {} as Record<
        string,
        { totalGames: number; avgPoints: number; avgResponseTime: number; gameCount: number }
      >
    );

    // Calculate final averages for categories
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      if (stats.totalGames > 0) {
        stats.avgPoints = stats.avgPoints / stats.totalGames;
        stats.avgResponseTime = stats.avgResponseTime / stats.totalGames;
      }
    });

    // Recent user registrations
    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Revenue data (if subscription data exists)
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: {
        plan: true,
      },
      where: {
        active: true,
      },
    });

    // Top performing users
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        gamesPlayed: true,
        currentStreak: true,
        bestStreak: true,
      },
      orderBy: {
        points: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalGames,
        totalScenarios,
        activeUsers,
        recentRegistrations,
        conversionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      },
      userDistribution: usersByRole.map((role) => ({
        role: role.role,
        count: role._count.role,
        percentage: totalUsers > 0 ? (role._count.role / totalUsers) * 100 : 0,
      })),
      subscriptionStats: subscriptionStats.map((sub) => ({
        plan: sub.plan,
        count: sub._count.plan,
      })),
      activityTrend: dailyGames,
      scenarioPopularity: scenarioStats.map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        category: scenario.category,
        difficulty: scenario.difficulty,
        timesPlayed: scenario.timesPlayed,
        averageScore: scenario.averageScore,
        recentGames: scenario._count.games,
      })),
      categoryPerformance: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        totalGames: stats.totalGames,
        avgPoints: Math.round(stats.avgPoints * 100) / 100,
        avgResponseTime: Math.round(stats.avgResponseTime * 100) / 100,
      })),
      topUsers: topUsers.map((user) => ({
        id: user.id,
        name: user.name || user.email,
        points: user.points,
        level: user.level,
        gamesPlayed: user.gamesPlayed,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
