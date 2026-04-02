import { NextRequest, NextResponse } from 'next/server';
import { CSVProcessor } from '@/lib/csvProcessor';

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid CSV content' },
        { status: 400 }
      );
    }

    // Create processor and process file
    const processor = new CSVProcessor([]);
    const result = await processor.processFile(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('CSV processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process CSV' },
      { status: 500 }
    );
  }
}
