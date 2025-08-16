import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Social features temporarily disabled for deployment
    return NextResponse.json(
      {
        error: 'Social features are currently under development',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
