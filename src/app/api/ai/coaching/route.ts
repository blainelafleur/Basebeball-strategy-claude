import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAICoaching, CoachingRequest } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coachingRequest: CoachingRequest = await request.json();

    // Validate request
    if (!coachingRequest.scenario || !coachingRequest.userChoice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user to check if they have access to AI coaching
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to AI coaching (PRO+ feature)
    if (user.role === 'FREE') {
      return NextResponse.json(
        {
          error: 'AI coaching is a Pro feature',
          message: 'Upgrade to Pro to access personalized AI coaching and feedback.',
        },
        { status: 403 }
      );
    }

    // Get AI coaching response
    const coachingResponse = await getAICoaching(coachingRequest);

    // Log the coaching session for analytics (optional)
    try {
      await prisma.game.create({
        data: {
          userId: user.id,
          scenarioId: 'ai_coaching_session', // Special ID for AI coaching
          decision: coachingRequest.userChoice,
          success: coachingRequest.isCorrect,
          points: coachingRequest.isCorrect ? 10 : 5, // Bonus points for using AI coaching
          responseTime: 0, // AI coaching doesn't track response time
          isOptimal: coachingRequest.isCorrect,
          difficulty: coachingRequest.scenario.difficulty as
            | 'BEGINNER'
            | 'INTERMEDIATE'
            | 'ADVANCED'
            | 'EXPERT',
        },
      });
    } catch (error) {
      console.warn('Failed to log AI coaching session:', error);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(coachingResponse);
  } catch (error) {
    console.error('Error in AI coaching:', error);
    return NextResponse.json({ error: 'Failed to get coaching feedback' }, { status: 500 });
  }
}
