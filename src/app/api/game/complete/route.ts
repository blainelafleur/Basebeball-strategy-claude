import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAchievements } from '@/lib/achievements';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      scenarioId,
      success,
      points,
      responseTime,
      difficulty,
      category,
      playerChoice,
      isOptimal,
    } = body;

    // Create game record
    const game = await prisma.game.create({
      data: {
        userId: user.id,
        scenarioId,
        success,
        points,
        responseTime,
        difficulty,
        playerChoice,
        isOptimal,
      },
    });

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: points },
        gamesPlayed: { increment: 1 },
        ...(success && {
          correctAnswers: { increment: 1 },
          currentStreak: { increment: 1 },
        }),
        ...(!success && {
          currentStreak: 0,
        }),
        // Update best streak if current streak is higher
        bestStreak:
          success && user.currentStreak + 1 > user.bestStreak
            ? user.currentStreak + 1
            : user.bestStreak,
      },
    });

    // Check for new achievements
    const newAchievements = await checkAchievements(user.id, {
      success,
      responseTime,
      points,
      category,
    });

    // Update scenario stats if it exists
    if (scenarioId) {
      await prisma.scenario.updateMany({
        where: { id: scenarioId },
        data: {
          timesPlayed: { increment: 1 },
          // This is a simplified average - in production you'd want more sophisticated averaging
          averageScore: success ? points : 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      game: game,
      user: {
        points: updatedUser.points,
        level: updatedUser.level,
        currentStreak: updatedUser.currentStreak,
        bestStreak: updatedUser.bestStreak,
      },
      achievements: newAchievements,
    });
  } catch (error) {
    console.error('Error completing game:', error);
    return NextResponse.json({ error: 'Failed to complete game' }, { status: 500 });
  }
}
