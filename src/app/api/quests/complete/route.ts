import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateQuest, calculateLevelProgress, shouldLevelUp, levelUpUser } from '@/lib/game-mechanics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questId, value, notes, evidenceUrl, status = 'success' } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    });

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    // Create completion record
    const completion = await prisma.completion.create({
      data: {
        questId,
        userId: user.id,
        status: status.toUpperCase(),
        value,
        notes,
        evidenceUrl
      }
    });

    // Get daily streak for bonus calculation
    const dailyStreak = await prisma.streak.findUnique({
      where: { userId_kind: { userId: user.id, kind: 'DAILY' } }
    });

    // Evaluate quest and calculate rewards
    const evaluation = evaluateQuest(quest, completion, dailyStreak?.count || 0);
    
    // Update user EXP and stats
    const newExp = user.exp + evaluation.expGained;
    const newStats = { ...user.stats };
    
    // Apply stat weights
    if (evaluation.statWeights) {
      Object.entries(evaluation.statWeights).forEach(([stat, weight]) => {
        newStats[stat as keyof typeof newStats] += Math.round(weight);
      });
    }

    // Check for level up
    let levelUpResult = null;
    if (shouldLevelUp({ ...user, exp: newExp })) {
      levelUpResult = levelUpUser({ ...user, exp: newExp, stats: newStats });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        exp: newExp,
        stats: levelUpResult ? levelUpResult.newStats : newStats,
        level: levelUpResult ? levelUpResult.newLevel : user.level
      }
    });

    // Update daily streak if quest was successful
    if (evaluation.completed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastStreakDate = dailyStreak ? new Date(dailyStreak.lastDate) : null;
      const isConsecutive = lastStreakDate && 
        lastStreakDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000;

      await prisma.streak.upsert({
        where: { userId_kind: { userId: user.id, kind: 'DAILY' } },
        update: {
          count: isConsecutive ? (dailyStreak?.count || 0) + 1 : 1,
          lastDate: today
        },
        create: {
          userId: user.id,
          kind: 'DAILY',
          count: 1,
          lastDate: today
        }
      });
    }

    // Apply penalties if quest failed
    if (evaluation.penaltyApplied) {
      // TODO: Implement penalty application logic
      console.log('Penalty applied:', evaluation.penaltyApplied);
    }

    const levelProgress = calculateLevelProgress(updatedUser.exp);

    return NextResponse.json({
      success: true,
      data: {
        completion,
        evaluation,
        user: {
          ...updatedUser,
          levelProgress
        },
        levelUp: levelUpResult
      }
    });
  } catch (error) {
    console.error('Error completing quest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
