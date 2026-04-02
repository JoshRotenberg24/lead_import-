import { NextRequest, NextResponse } from 'next/server';
import { AgentWebsiteContact, CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json() as { data: AgentWebsiteContact[] };

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Create rows with headers
    const rows = [CSV_TEMPLATE_HEADERS];

    data.forEach((contact) => {
      rows.push([
        contact.Name || '',
        contact.Email || '',
        contact.Phone || '',
        contact.Address || '',
        contact.City || '',
        contact.State || '',
        contact.Zip || '',
        contact.Birthday || '',
        contact.Type || '',
        contact.Anniversary || '',
        contact.Pipeline || '',
        contact.Texting || '',
        contact.Tags || '',
        contact.CampaignIDs || '',
        contact.MarketIDs || '',
        contact.Note || '',
        contact.Source || '',
      ]);
    });

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cleaned-leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}
