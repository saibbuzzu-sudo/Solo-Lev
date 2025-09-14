import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTodayInTimezone, getWeekStart, getWeekEnd } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const date = searchParams.get('date');
    
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let quests;
    const targetDate = date ? new Date(date) : getTodayInTimezone(user.timezone);

    if (type === 'daily') {
      quests = await prisma.quest.findMany({
        where: {
          userId: user.id,
          type: 'DAILY',
          isActive: true,
          createdAt: {
            gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
            lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
          }
        },
        include: {
          completions: {
            where: {
              completedAt: {
                gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
              }
            }
          }
        }
      });
    } else if (type === 'weekly') {
      const weekStart = getWeekStart(targetDate);
      const weekEnd = getWeekEnd(targetDate);
      
      quests = await prisma.quest.findMany({
        where: {
          userId: user.id,
          type: 'WEEKLY',
          isActive: true,
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        include: {
          completions: {
            where: {
              completedAt: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          }
        }
      });
    } else {
      // Get both daily and weekly quests
      const weekStart = getWeekStart(targetDate);
      const weekEnd = getWeekEnd(targetDate);
      
      quests = await prisma.quest.findMany({
        where: {
          userId: user.id,
          isActive: true,
          OR: [
            {
              type: 'DAILY',
              createdAt: {
                gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
                lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
              }
            },
            {
              type: 'WEEKLY',
              createdAt: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          ]
        },
        include: {
          completions: {
            where: {
              completedAt: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: quests
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, windowStart, windowEnd, target, affects, rewardEXP, penalty, tags } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const quest = await prisma.quest.create({
      data: {
        title,
        type: type.toUpperCase(),
        windowStart,
        windowEnd,
        target,
        affects,
        rewardEXP,
        penalty,
        tags,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: quest
    });
  } catch (error) {
    console.error('Error creating quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
