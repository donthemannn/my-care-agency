import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { syncProfile } from '@/lib/db/syncProfile';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await syncProfile({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    });

    return NextResponse.json({ success: true, message: 'Profile synced successfully' });
  } catch (error) {
    console.error('Profile sync API error:', error);
    return NextResponse.json(
      { error: 'Failed to sync profile' },
      { status: 500 }
    );
  }
}
