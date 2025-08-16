import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateScenarioSuggestions } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and stats
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        games: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 games for recent performance
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to AI suggestions (PRO+ feature)
    if (user.role === 'FREE') {
      return NextResponse.json(
        {
          error: 'AI suggestions are a Pro feature',
          suggestions: [
            'Practice more scenarios to improve your skills',
            'Try scenarios at different difficulty levels',
            'Focus on understanding the reasoning behind each decision',
          ],
        },
        { status: 403 }
      );
    }

    // Calculate recent performance
    const recentGames = user.games;
    const recentCorrect = recentGames.filter((game) => game.success).length;
    const recentPerformance =
      recentGames.length > 0 ? Math.round((recentCorrect / recentGames.length) * 100) : 0;

    // Analyze weak areas based on recent games
    const categoryPerformance = recentGames.reduce(
      (acc, game) => {
        const category = game.scenarioId?.split('_')[0] || 'general';
        if (!acc[category]) {
          acc[category] = { total: 0, correct: 0 };
        }
        acc[category].total++;
        if (game.success) acc[category].correct++;
        return acc;
      },
      {} as Record<string, { total: number; correct: number }>
    );

    const weakAreas = Object.entries(categoryPerformance)
      .filter(
        ([, performance]) => performance.total >= 3 && performance.correct / performance.total < 0.7
      )
      .map(([category]) => category);

    const strengths = Object.entries(categoryPerformance)
      .filter(
        ([, performance]) =>
          performance.total >= 3 && performance.correct / performance.total >= 0.8
      )
      .map(([category]) => category);

    // Generate AI suggestions
    const suggestions = await generateScenarioSuggestions({
      level: user.level,
      weakAreas,
      recentPerformance,
      preferredCategory: undefined, // Could be determined from user preferences
    });

    return NextResponse.json({
      suggestions,
      userStats: {
        recentPerformance,
        totalGames: user.gamesPlayed,
        level: user.level,
        weakAreas,
        strengths,
      },
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
