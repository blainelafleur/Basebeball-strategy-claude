import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Overall leaderboard - by total points
    const overall = await prisma.user.findMany({
      where: {
        gamesPlayed: { gt: 0 },
      },
      orderBy: [{ points: 'desc' }, { gamesPlayed: 'desc' }],
      take: 50,
      include: {
        games: {
          select: {
            success: true,
            responseTime: true,
          },
        },
      },
    });

    // Weekly leaderboard - games played in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyPlayers = await prisma.user.findMany({
      where: {
        games: {
          some: {
            createdAt: { gte: weekAgo },
          },
        },
      },
      include: {
        games: {
          where: {
            createdAt: { gte: weekAgo },
          },
        },
      },
      take: 50,
    });

    const weekly = weeklyPlayers
      .map((user) => {
        const weekGames = user.games;
        const weekPoints = weekGames.reduce((sum, game) => sum + game.points, 0);
        const weekCorrect = weekGames.filter((game) => game.success).length;
        const weekAccuracy = weekGames.length > 0 ? (weekCorrect / weekGames.length) * 100 : 0;
        const weekAvgTime =
          weekGames.length > 0
            ? weekGames.reduce((sum, game) => sum + game.responseTime, 0) / weekGames.length
            : 0;

        return {
          id: user.id,
          name: user.name || user.email,
          points: weekPoints,
          level: user.level,
          gamesPlayed: weekGames.length,
          accuracy: Math.round(weekAccuracy * 100) / 100,
          avgResponseTime: Math.round(weekAvgTime * 100) / 100,
          currentStreak: user.currentStreak,
          bestStreak: user.bestStreak,
        };
      })
      .filter((user) => user.gamesPlayed > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);

    // Monthly leaderboard
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const monthlyPlayers = await prisma.user.findMany({
      where: {
        games: {
          some: {
            createdAt: { gte: monthAgo },
          },
        },
      },
      include: {
        games: {
          where: {
            createdAt: { gte: monthAgo },
          },
        },
      },
      take: 50,
    });

    const monthly = monthlyPlayers
      .map((user) => {
        const monthGames = user.games;
        const monthPoints = monthGames.reduce((sum, game) => sum + game.points, 0);
        const monthCorrect = monthGames.filter((game) => game.success).length;
        const monthAccuracy = monthGames.length > 0 ? (monthCorrect / monthGames.length) * 100 : 0;
        const monthAvgTime =
          monthGames.length > 0
            ? monthGames.reduce((sum, game) => sum + game.responseTime, 0) / monthGames.length
            : 0;

        return {
          id: user.id,
          name: user.name || user.email,
          points: monthPoints,
          level: user.level,
          gamesPlayed: monthGames.length,
          accuracy: Math.round(monthAccuracy * 100) / 100,
          avgResponseTime: Math.round(monthAvgTime * 100) / 100,
          currentStreak: user.currentStreak,
          bestStreak: user.bestStreak,
        };
      })
      .filter((user) => user.gamesPlayed > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);

    // Streak leaderboard
    const streaks = await prisma.user.findMany({
      where: {
        bestStreak: { gt: 0 },
      },
      orderBy: [{ bestStreak: 'desc' }, { currentStreak: 'desc' }, { points: 'desc' }],
      take: 50,
      include: {
        games: {
          select: {
            success: true,
            responseTime: true,
          },
        },
      },
    });

    // Accuracy leaderboard (min 20 games)
    const accuracyUsers = await prisma.user.findMany({
      where: {
        gamesPlayed: { gte: 20 },
      },
      include: {
        games: {
          select: {
            success: true,
            responseTime: true,
          },
        },
      },
      take: 100,
    });

    const accuracy = accuracyUsers
      .map((user) => {
        const correctAnswers = user.games.filter((game) => game.success).length;
        const accuracy = user.gamesPlayed > 0 ? (correctAnswers / user.gamesPlayed) * 100 : 0;
        const avgResponseTime =
          user.games.length > 0
            ? user.games.reduce((sum, game) => sum + game.responseTime, 0) / user.games.length
            : 0;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points,
          level: user.level,
          gamesPlayed: user.gamesPlayed,
          correctAnswers,
          currentStreak: user.currentStreak,
          bestStreak: user.bestStreak,
          avgResponseTime,
          accuracy,
        };
      })
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 50);

    // Speed leaderboard (min 20 games, fastest average response time)
    const speedUsers = await prisma.user.findMany({
      where: {
        gamesPlayed: { gte: 20 },
      },
      include: {
        games: {
          select: {
            success: true,
            responseTime: true,
          },
        },
      },
      take: 100,
    });

    const speed = speedUsers
      .map((user) => {
        const avgResponseTime =
          user.games.length > 0
            ? user.games.reduce((sum, game) => sum + game.responseTime, 0) / user.games.length
            : 0;
        return {
          ...user,
          avgResponseTime,
        };
      })
      .filter((user) => user.avgResponseTime > 0)
      .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
      .slice(0, 50);

    // Add ranks and format data
    const addRanks = (users: unknown[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users.map((user: any, index: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const correctAnswers = user.games?.filter((game: any) => game.success).length || 0;
        const avgResponseTime =
          user.games?.length > 0
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              user.games.reduce((sum: number, game: any) => sum + game.responseTime, 0) /
              user.games.length
            : user.avgResponseTime || 0;

        return {
          ...user,
          name: user.name || user.email,
          accuracy:
            user.accuracy ||
            (user.gamesPlayed > 0
              ? Math.round((correctAnswers / user.gamesPlayed) * 100 * 100) / 100
              : 0),
          avgResponseTime: Math.round(avgResponseTime * 100) / 100,
          rank: index + 1,
        };
      });

    return NextResponse.json({
      overall: addRanks(overall),
      weekly: weekly.map((user, index) => ({ ...user, rank: index + 1 })),
      monthly: monthly.map((user, index) => ({ ...user, rank: index + 1 })),
      streaks: addRanks(streaks),
      accuracy: addRanks(accuracy),
      speed: addRanks(speed),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
