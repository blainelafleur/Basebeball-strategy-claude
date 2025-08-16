import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        users: [],
        message: 'Search query must be at least 2 characters',
      });
    }

    // Get existing friend relationships to exclude them from results
    const existingRelationships = await prisma.friendship.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const excludeUserIds = new Set([
      user.id, // Exclude self
      ...existingRelationships.map((rel) => rel.senderId),
      ...existingRelationships.map((rel) => rel.receiverId),
    ]);

    // Search users by name or email
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              notIn: Array.from(excludeUserIds),
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        gamesPlayed: true,
        currentStreak: true,
      },
      take: 10, // Limit results
    });

    const formattedUsers = users.map((u) => ({
      ...u,
      name: u.name || u.email.split('@')[0], // Use email prefix if no name
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
