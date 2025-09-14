import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateLevelProgress } from '@/lib/game-mechanics';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const levelProgress = calculateLevelProgress(user.exp);
    
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        levelProgress
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { stats, settings } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(stats && { stats }),
        ...(settings && { settings })
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
