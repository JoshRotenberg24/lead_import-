import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CSVProcessor } from '@/lib/csvProcessor';
import Papa from 'papaparse';

// POST /api/imports - Bulk import leads from CSV
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, csvContent, fileName } = body;

    if (!userId || !csvContent) {
      return NextResponse.json(
        { error: 'userId and csvContent are required' },
        { status: 400 }
      );
    }

    // Extract headers from CSV content
    const firstLine = csvContent.split('\n')[0];
    const headers = Papa.parse(firstLine).data[0] as string[];

    // Process CSV using existing CSV processor
    const processor = new CSVProcessor(headers);
    const result = await processor.processFile(csvContent);

    // Create import record
    const importRecord = await prisma.leadImport.create({
      data: {
        fileName: fileName || 'import.csv',
        totalRows: result.totalRows,
        validRows: result.validRows,
        errorRows: result.invalidRows.length,
        status: 'completed',
        errorDetails: result.invalidRows.length > 0 ? JSON.stringify(result.invalidRows) : null,
      },
    });

    // Insert valid leads
    const createdLeads = [];
    for (const awContact of result.cleanedData) {
      try {
        const lead = await prisma.lead.create({
          data: {
            userId,
            name: awContact.Name,
            email: awContact.Email.toLowerCase(),
            firstName: awContact.Name.split(' ')[0] || undefined,
            lastName: awContact.Name.split(' ').slice(1).join(' ') || undefined,
            phone: awContact.Phone,
            address: awContact.Address,
            city: awContact.City,
            state: awContact.State,
            zip: awContact.Zip,
            birthday: awContact.Birthday,
            type: awContact.Type,
            anniversary: awContact.Anniversary,
            pipeline: awContact.Pipeline,
            texting: awContact.Texting,
            tags: awContact.Tags ? JSON.stringify(awContact.Tags.split(',').map(t => t.trim())) : '[]',
            campaignIds: awContact.CampaignIDs ? JSON.stringify(awContact.CampaignIDs.split(',').map(c => c.trim())) : '[]',
            marketIds: awContact.MarketIDs ? JSON.stringify(awContact.MarketIDs.split(',').map(m => m.trim())) : '[]',
            note: awContact.Note,
            source: awContact.Source,
          },
        });
        createdLeads.push(lead.id);
      } catch (err: any) {
        // Handle duplicate email error
        if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
          console.log(`Skipping duplicate email: ${awContact.Email}`);
        } else {
          throw err;
        }
      }
    }

    // Update import record with created lead IDs
    await prisma.leadImport.update({
      where: { id: importRecord.id },
      data: {
        importedLeadIds: JSON.stringify(createdLeads),
      },
    });

    return NextResponse.json({
      importId: importRecord.id,
      totalRows: result.totalRows,
      validRows: result.validRows,
      errorRows: result.invalidRows.length,
      createdLeads: createdLeads.length,
      errors: result.invalidRows,
      duplicateEmails: result.duplicateEmails,
    });
  } catch (error) {
    console.error('Error importing leads:', error);
    return NextResponse.json(
      { error: 'Failed to import leads' },
      { status: 500 }
    );
  }
}

// GET /api/imports - List import history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const imports = await prisma.leadImport.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(imports);
  } catch (error) {
    console.error('Error fetching imports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch imports' },
      { status: 500 }
    );
  }
}
