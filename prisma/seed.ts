import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { id: 'default-user' },
    update: {},
    create: {
      id: 'default-user',
      name: 'Salvo',
      timezone: 'Europe/London',
      level: 1,
      exp: 0,
      stats: {
        STR: 10,
        INT: 10,
        CHA: 10,
        WIL: 10,
        VIT: 10
      },
      titles: ['Novice Adventurer'],
      settings: {
        humorStyle: 'standard',
        penaltyIntensity: 'medium'
      }
    }
  });

  // Create quest templates
  const dailyTemplates = [
    {
      title: 'Kettlebell — 30 min',
      type: 'DAILY' as const,
      windowStart: '06:00',
      windowEnd: '22:00',
      target: { kind: 'duration', value: 30, unit: 'minutes' },
      affects: [
        { stat: 'STR', weight: 1.0 },
        { stat: 'WIL', weight: 0.5 }
      ],
      rewardEXP: 20,
      penalty: { exp: -10, punishmentQuestId: 'squats_75' },
      tags: ['fitness', 'workout']
    },
    {
      title: 'Write 300 words',
      type: 'DAILY' as const,
      windowStart: '07:00',
      windowEnd: '23:00',
      target: { kind: 'count', value: 300, unit: 'words' },
      affects: [
        { stat: 'INT', weight: 1.0 },
        { stat: 'WIL', weight: 0.5 }
      ],
      rewardEXP: 20,
      penalty: { exp: -10, punishmentQuestId: 'extra_focus_block' },
      tags: ['research', 'writing']
    },
    {
      title: 'Read 20 minutes',
      type: 'DAILY' as const,
      windowStart: '00:00',
      windowEnd: '23:59',
      target: { kind: 'duration', value: 20, unit: 'minutes' },
      affects: [
        { stat: 'INT', weight: 1.0 }
      ],
      rewardEXP: 15,
      penalty: { exp: -10, punishmentQuestId: 'screen_detox_30' },
      tags: ['reading', 'learning']
    },
    {
      title: '2×25-min focus blocks',
      type: 'DAILY' as const,
      windowStart: '08:00',
      windowEnd: '18:00',
      target: { kind: 'count', value: 2, unit: 'blocks' },
      affects: [
        { stat: 'WIL', weight: 1.0 },
        { stat: 'INT', weight: 0.3 }
      ],
      rewardEXP: 25,
      penalty: { exp: -10, punishmentQuestId: 'extra_focus_block' },
      tags: ['productivity', 'focus']
    },
    {
      title: 'Walk 8k steps',
      type: 'DAILY' as const,
      windowStart: '06:00',
      windowEnd: '23:00',
      target: { kind: 'count', value: 8000, unit: 'steps' },
      affects: [
        { stat: 'STR', weight: 0.5 },
        { stat: 'VIT', weight: 0.8 }
      ],
      rewardEXP: 15,
      penalty: { exp: -10, punishmentQuestId: 'pushups_50' },
      tags: ['fitness', 'mobility']
    },
    {
      title: 'No phone first 30 min',
      type: 'DAILY' as const,
      windowStart: '06:00',
      windowEnd: '09:00',
      target: { kind: 'boolean', value: 1, unit: 'success' },
      affects: [
        { stat: 'WIL', weight: 0.8 }
      ],
      rewardEXP: 10,
      penalty: { exp: -5, punishmentQuestId: 'screen_detox_30' },
      tags: ['willpower', 'digital-hygiene']
    }
  ];

  const weeklyTemplates = [
    {
      title: 'Complete 4 workouts',
      type: 'WEEKLY' as const,
      criteria: { kind: 'countCompletions', of: 'workout', value: 4 },
      affects: [
        { stat: 'STR', weight: 2.0 },
        { stat: 'WIL', weight: 1.0 }
      ],
      rewardEXP: 150,
      penalty: { exp: -50, title: 'Dungeon-Dodger', durationHours: 24 },
      tags: ['fitness', 'consistency']
    },
    {
      title: 'Finish one research section',
      type: 'WEEKLY' as const,
      criteria: { kind: 'wordsNet', value: 1500 },
      affects: [
        { stat: 'INT', weight: 2.0 },
        { stat: 'WIL', weight: 1.0 }
      ],
      rewardEXP: 200,
      penalty: { exp: -50, title: 'E-Rank Scholar', durationHours: 24 },
      tags: ['research', 'writing']
    },
    {
      title: 'Complete one chapter',
      type: 'WEEKLY' as const,
      criteria: { kind: 'countCompletions', of: 'reading', value: 1 },
      affects: [
        { stat: 'INT', weight: 1.5 }
      ],
      rewardEXP: 100,
      penalty: { exp: -30, title: 'Bookworm Slacker', durationHours: 12 },
      tags: ['reading', 'learning']
    }
  ];

  // Create daily quest templates
  for (const template of dailyTemplates) {
    await prisma.questTemplate.upsert({
      where: { id: template.title.toLowerCase().replace(/\s+/g, '-') },
      update: template,
      create: {
        id: template.title.toLowerCase().replace(/\s+/g, '-'),
        ...template
      }
    });
  }

  // Create weekly quest templates
  for (const template of weeklyTemplates) {
    await prisma.questTemplate.upsert({
      where: { id: template.title.toLowerCase().replace(/\s+/g, '-') },
      update: template,
      create: {
        id: template.title.toLowerCase().replace(/\s+/g, '-'),
        ...template
      }
    });
  }

  // Create titles
  const titles = [
    {
      name: 'Novice Adventurer',
      description: 'Just starting your journey',
      isPositive: true,
      requirements: {}
    },
    {
      name: 'Early Riser',
      description: 'Complete 5 mornings in a row',
      effects: { stat: 'WIL', value: 5, duration: 'temporary', hours: 24 },
      isPositive: true,
      requirements: { streaks: { kind: 'daily', count: 5 } }
    },
    {
      name: 'Iron Quill',
      description: '7 consecutive writing days',
      effects: { stat: 'INT', value: 1, duration: 'permanent' },
      isPositive: true,
      requirements: { quests: ['write-300-words'] }
    },
    {
      name: 'Kettlebell Knight',
      description: '12 workouts in 3 weeks',
      effects: { stat: 'STR', value: 1, duration: 'permanent' },
      isPositive: true,
      requirements: { quests: ['kettlebell-30-min'] }
    },
    {
      name: 'Quiet Mind',
      description: '7 days of <1h social media',
      effects: { stat: 'VIT', value: 1, duration: 'permanent' },
      isPositive: true,
      requirements: {}
    },
    {
      name: 'E-Rank Scholar',
      description: 'Failed to complete research goals',
      effects: { stat: 'WIL', value: -1, duration: 'temporary', hours: 24 },
      isPositive: false,
      requirements: {}
    },
    {
      name: 'Dungeon-Dodger',
      description: 'Avoided the fitness dungeon',
      effects: { stat: 'STR', value: -1, duration: 'temporary', hours: 24 },
      isPositive: false,
      requirements: {}
    }
  ];

  for (const title of titles) {
    await prisma.title.upsert({
      where: { name: title.name },
      update: title,
      create: title
    });
  }

  // Create initial streaks
  await prisma.streak.upsert({
    where: { userId_kind: { userId: user.id, kind: 'DAILY' } },
    update: {},
    create: {
      userId: user.id,
      kind: 'DAILY',
      count: 0,
      lastDate: new Date()
    }
  });

  await prisma.streak.upsert({
    where: { userId_kind: { userId: user.id, kind: 'WEEKLY' } },
    update: {},
    create: {
      userId: user.id,
      kind: 'WEEKLY',
      count: 0,
      lastDate: new Date()
    }
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
