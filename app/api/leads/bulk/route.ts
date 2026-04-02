import { NextRequest, NextResponse } from 'next/server';
import {
  bulkUpdateLeads,
  bulkDeleteLeads,
} from '@/lib/services/leadService';

// POST /api/leads/bulk - Bulk operations on leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, leadIds, updateData } = body;

    if (!action || !leadIds || !Array.isArray(leadIds)) {
      return NextResponse.json(
        { error: 'action and leadIds array are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'update':
        if (!updateData) {
          return NextResponse.json(
            { error: 'updateData is required for update action' },
            { status: 400 }
          );
        }
        const updated = await bulkUpdateLeads(leadIds, updateData);
        return NextResponse.json({ success: true, count: updated.length });

      case 'delete':
        const result = await bulkDeleteLeads(leadIds);
        return NextResponse.json({
          success: true,
          deletedCount: result.count,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
