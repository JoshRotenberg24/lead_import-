import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/types/validation';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json() as { errors: ValidationError[] };

    if (!Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid errors format' },
        { status: 400 }
      );
    }

    // Create rows with headers
    const rows = [['Row #', 'Field', 'Value', 'Error']];

    errors.forEach((error) => {
      rows.push([
        String(error.rowIndex + 1),
        error.field,
        error.value,
        error.error,
      ]);
    });

    const csv = Papa.unparse(rows);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="error-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error CSV download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate error report' },
      { status: 500 }
    );
  }
}
