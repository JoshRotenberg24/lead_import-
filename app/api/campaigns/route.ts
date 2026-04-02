import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (status) where.status = status;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, templateId } = body;

    if (!userId || !name || !templateId) {
      return NextResponse.json(
        { error: 'userId, name, and templateId are required' },
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

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        templateId,
        description: body.description,
        status: body.status || 'draft',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        fromName: body.fromName,
        fromEmail: body.fromEmail,
        replyTo: body.replyTo,
        targetTags: body.targetTags || [],
        targetSources: body.targetSources || [],
      },
      include: { template: true },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
