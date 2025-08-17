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
      select: {
        id: true,
        points: true,
        level: true,
        gamesPlayed: true,
        totalCorrect: true,
        currentStreak: true,
        bestStreak: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate success rate
    const successRate = user.gamesPlayed > 0 ? (user.totalCorrect / user.gamesPlayed) * 100 : 0;

    return NextResponse.json({
      stats: {
        points: user.points,
        level: user.level,
        gamesPlayed: user.gamesPlayed,
        correctDecisions: user.totalCorrect,
        streak: user.currentStreak,
        bestStreak: user.bestStreak,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}