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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get accepted friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: user.id, status: 'ACCEPTED' },
          { receiverId: user.id, status: 'ACCEPTED' },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
            level: true,
            gamesPlayed: true,
            currentStreak: true,
            updatedAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
            level: true,
            gamesPlayed: true,
            currentStreak: true,
            updatedAt: true,
          },
        },
      },
    });

    const friends = friendships.map((friendship) => {
      const friend = friendship.senderId === user.id ? friendship.receiver : friendship.sender;
      return {
        ...friend,
        name: friend.name || friend.email,
        status: 'accepted',
        lastActive: friend.updatedAt.toISOString(),
      };
    });

    // Get pending requests (received)
    const pendingReceived = await prisma.friendship.findMany({
      where: {
        receiverId: user.id,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
            level: true,
            gamesPlayed: true,
            currentStreak: true,
            updatedAt: true,
          },
        },
      },
    });

    const pendingRequests = pendingReceived.map((friendship) => ({
      ...friendship.sender,
      name: friendship.sender.name || friendship.sender.email,
      status: 'pending_received',
      lastActive: friendship.sender.updatedAt.toISOString(),
    }));

    // Get sent requests
    const pendingSent = await prisma.friendship.findMany({
      where: {
        senderId: user.id,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            points: true,
            level: true,
            gamesPlayed: true,
            currentStreak: true,
            updatedAt: true,
          },
        },
      },
    });

    const sentRequests = pendingSent.map((friendship) => ({
      ...friendship.receiver,
      name: friendship.receiver.name || friendship.receiver.email,
      status: 'pending_sent',
      lastActive: friendship.receiver.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      friends,
      pendingRequests,
      sentRequests,
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}
