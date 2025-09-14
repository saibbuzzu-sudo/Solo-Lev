import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const punishments = await prisma.punishment.findMany({
      where: {
        userId: user.id,
        resolvedAt: null
      },
      orderBy: {
        dueAt: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: punishments
    });
  } catch (error) {
    console.error('Error fetching punishments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { punishmentId } = body;

    const punishment = await prisma.punishment.update({
      where: { id: punishmentId },
      data: {
        resolvedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: punishment
    });
  } catch (error) {
    console.error('Error resolving punishment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
