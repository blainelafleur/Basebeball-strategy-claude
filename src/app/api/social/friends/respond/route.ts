import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { userId, accept } = body;

    if (!userId || typeof accept !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and accept status are required' },
        { status: 400 }
      );
    }

    // Find the pending friendship request
    const friendship = await prisma.friendship.findFirst({
      where: {
        senderId: userId,
        receiverId: user.id,
        status: 'PENDING',
      },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (accept) {
      // Accept the friend request
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: 'ACCEPTED' },
      });

      return NextResponse.json({
        success: true,
        friendship: updatedFriendship,
        message: 'Friend request accepted',
      });
    } else {
      // Decline the friend request by deleting it
      await prisma.friendship.delete({
        where: { id: friendship.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Friend request declined',
      });
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return NextResponse.json({ error: 'Failed to respond to friend request' }, { status: 500 });
  }
}
