import { NextRequest, NextResponse } from 'next/server';
import { getEmailStats } from '@/lib/services/emailService';

// GET /api/emails/stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const stats = await getEmailStats(userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email stats' },
      { status: 500 }
    );
  }
}
