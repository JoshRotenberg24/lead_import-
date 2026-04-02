import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leads - List leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '50');
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = {
      userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, ...data } = body;

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: 'userId, name, and email are required' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existing = await prisma.lead.findFirst({
      where: { userId, email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists for this user' },
        { status: 409 }
      );
    }

    const lead = await prisma.lead.create({
      data: {
        userId,
        name,
        email: email.toLowerCase(),
        ...data,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
