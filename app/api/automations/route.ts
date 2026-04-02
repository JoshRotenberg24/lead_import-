import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/automations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const type = searchParams.get('type') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (type) where.type = type;

    const automations = await prisma.automation.findMany({
      where,
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(automations);
  } catch (error) {
    console.error('Error fetching automations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
      { status: 500 }
    );
  }
}

// POST /api/automations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type, templateId } = body;

    if (!userId || !name || !type || !templateId) {
      return NextResponse.json(
        { error: 'userId, name, type, and templateId are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const automation = await prisma.automation.create({
      data: {
        userId,
        name,
        type,
        templateId,
        description: body.description,
        triggerField: body.triggerField,
        daysBefore: body.daysBefore || 0,
        isActive: body.isActive !== false,
        holidayDate: body.holidayDate,
        holidayName: body.holidayName,
      },
      include: { template: true },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}
