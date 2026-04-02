import { NextRequest, NextResponse } from 'next/server';
import { CSV_TEMPLATE_HEADERS } from '@/types/contacts';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    // Create template with headers and one example row
    const rows = [
      CSV_TEMPLATE_HEADERS,
      [
        'John Doe',
        'john@example.com',
        '5551234567',
        '123 Main St',
        'Springfield',
        'IL',
        '62701',
        '1990-01-15',
        'Lead',
        '2020-06-20',
        'Sales',
        'Yes',
        'VIP,Hot Lead',
        'CAMP123,CAMP456',
        'MARKET1,MARKET2',
        'Interested in services',
        'Website Form',
      ],
    ];

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contact-template.csv"',
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
