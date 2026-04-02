import { NextRequest, NextResponse } from 'next/server';
import { getLeadStats, getUpcomingDates } from '@/lib/services/leadService';

// GET /api/leads/stats - Get lead statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const stats = await getLeadStats(userId);
    const upcoming = await getUpcomingDates(userId, 30);

    return NextResponse.json({
      stats,
      upcoming,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
