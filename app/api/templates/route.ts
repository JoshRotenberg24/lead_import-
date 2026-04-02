import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/templates - List email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const category = searchParams.get('category') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    if (category) {
      where.category = category;
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, subject, htmlBody, category } = body;

    if (!userId || !name || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'userId, name, subject, and htmlBody are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        userId,
        name,
        subject,
        htmlBody,
        category: category || 'custom',
        tags: body.tags || [],
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
