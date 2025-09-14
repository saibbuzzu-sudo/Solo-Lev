import { Stats, LevelCalculation, QuestEvaluation, WeeklyEvaluation, Quest, Completion, User } from '@/types';

/**
 * Calculate EXP required for a given level
 * Formula: Base 1,000 + (N-1) * (500 + 250*(N-1))
 */
export function calculateExpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 1000 + (level - 1) * (500 + 250 * (level - 1));
}

/**
 * Calculate current level and EXP progress
 */
export function calculateLevelProgress(exp: number): LevelCalculation {
  let currentLevel = 1;
  let totalExpForLevel = 0;
  
  while (totalExpForLevel <= exp) {
    currentLevel++;
    totalExpForLevel = calculateExpForLevel(currentLevel);
  }
  
  currentLevel--; // Go back one level since we exceeded
  const expToNext = totalExpForLevel - exp;
  const currentLevelExp = calculateExpForLevel(currentLevel);
  
  return {
    currentLevel,
    currentExp: exp - currentLevelExp,
    expToNext,
    totalExpForLevel: totalExpForLevel - currentLevelExp
  };
}

/**
 * Calculate streak bonus multiplier
 * +10% per 7 consecutive days, max +40%
 */
export function calculateStreakBonus(streakCount: number): number {
  const streakTiers = Math.floor(streakCount / 7);
  return Math.min(streakTiers * 0.1, 0.4); // Max 40% bonus
}

/**
 * Calculate quest EXP with difficulty and streak bonuses
 */
export function calculateQuestExp(
  baseExp: number,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal',
  streakCount: number = 0
): number {
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1.0,
    hard: 1.3
  }[difficulty];
  
  const streakBonus = calculateStreakBonus(streakCount);
  const adherenceMultiplier = 1.0 + streakBonus;
  
  return Math.round(baseExp * difficultyMultiplier * adherenceMultiplier);
}

/**
 * Evaluate a quest completion
 */
export function evaluateQuest(
  quest: Quest,
  completion: Completion | null,
  dailyStreak: number
): QuestEvaluation {
  const completed = completion?.status === 'success';
  const expGained = completed 
    ? calculateQuestExp(quest.rewardEXP, 'normal', dailyStreak)
    : 0;
  
  const statWeights: Partial<Stats> = {};
  if (completed && quest.affects) {
    quest.affects.forEach(affect => {
      statWeights[affect.stat] = (statWeights[affect.stat] || 0) + affect.weight;
    });
  }
  
  const penaltyApplied = !completed ? quest.penalty : undefined;
  
  return {
    questId: quest.id,
    completed,
    expGained,
    statWeights,
    penaltyApplied
  };
}

/**
 * Calculate stat allocation suggestion based on recent quest completions
 */
export function suggestStatAllocation(
  recentCompletions: QuestEvaluation[],
  currentStats: Stats
): Partial<Stats> {
  const statWeights: Partial<Stats> = {};
  
  // Accumulate weights from recent completions
  recentCompletions.forEach(eval => {
    Object.entries(eval.statWeights).forEach(([stat, weight]) => {
      statWeights[stat as keyof Stats] = (statWeights[stat as keyof Stats] || 0) + weight;
    });
  });
  
  // Find the lowest stat to avoid soft cap penalties
  const statsArray = Object.entries(currentStats) as [keyof Stats, number][];
  const lowestStat = Math.min(...statsArray.map(([, value]) => value));
  
  // Suggest allocation proportional to recent activity, but boost lowest stat
  const totalWeight = Object.values(statWeights).reduce((sum, weight) => sum + weight, 0);
  const suggestion: Partial<Stats> = {};
  
  if (totalWeight > 0) {
    Object.entries(statWeights).forEach(([stat, weight]) => {
      const baseAllocation = (weight / totalWeight) * 5; // 5 points to allocate
      const lowestStatBoost = currentStats[stat as keyof Stats] === lowestStat ? 1 : 0;
      suggestion[stat as keyof Stats] = Math.round(baseAllocation + lowestStatBoost);
    });
  } else {
    // If no recent activity, boost lowest stat
    statsArray.forEach(([stat, value]) => {
      if (value === lowestStat) {
        suggestion[stat] = 3; // Boost lowest stat
      }
    });
  }
  
  return suggestion;
}

/**
 * Check for soft cap penalties
 * Diminishing returns above 30, or if stat > 2x the lowest stat
 */
export function checkSoftCapPenalty(stats: Stats): { stat: keyof Stats; penalty: number }[] {
  const penalties: { stat: keyof Stats; penalty: number }[] = [];
  const statsArray = Object.entries(stats) as [keyof Stats, number][];
  const lowestStat = Math.min(...statsArray.map(([, value]) => value));
  
  statsArray.forEach(([stat, value]) => {
    let penalty = 0;
    
    // Penalty for stats above 30
    if (value > 30) {
      penalty += 0.5; // 50% EXP penalty
    }
    
    // Penalty for stats more than 2x the lowest stat
    if (value > lowestStat * 2) {
      penalty += 0.5; // Additional 50% EXP penalty
    }
    
    if (penalty > 0) {
      penalties.push({ stat, penalty });
    }
  });
  
  return penalties;
}

/**
 * Evaluate weekly progress
 */
export function evaluateWeeklyProgress(
  weekStart: Date,
  weekEnd: Date,
  dailyQuests: Quest[],
  weeklyQuests: Quest[],
  completions: Completion[]
): WeeklyEvaluation {
  const dailyCompletions = completions.filter(c => 
    c.completedAt >= weekStart && 
    c.completedAt <= weekEnd &&
    dailyQuests.some(q => q.id === c.questId)
  );
  
  const weeklyCompletions = completions.filter(c =>
    c.completedAt >= weekStart &&
    c.completedAt <= weekEnd &&
    weeklyQuests.some(q => q.id === c.questId)
  );
  
  const dailyCompletionRate = dailyQuests.length > 0 
    ? dailyCompletions.length / dailyQuests.length 
    : 0;
  
  const weeklyQuestsCompleted = weeklyCompletions.length;
  
  // Bonus EXP for 80%+ daily completion and all weekly quests
  const bonusExp = (dailyCompletionRate >= 0.8 && weeklyQuestsCompleted === weeklyQuests.length) ? 50 : 0;
  
  // Apply penalties for failed quests
  const penaltiesApplied: any[] = [];
  dailyQuests.forEach(quest => {
    const completion = completions.find(c => c.questId === quest.id);
    if (!completion || completion.status !== 'success') {
      if (quest.penalty) {
        penaltiesApplied.push(quest.penalty);
      }
    }
  });
  
  return {
    weekStart,
    weekEnd,
    dailyCompletionRate,
    weeklyQuestsCompleted,
    bonusExp,
    penaltiesApplied,
    newTitles: [] // TODO: Implement title checking logic
  };
}

/**
 * Check if user should level up
 */
export function shouldLevelUp(user: User): boolean {
  const levelProgress = calculateLevelProgress(user.exp);
  return levelProgress.expToNext <= 0;
}

/**
 * Level up user and return new stats
 */
export function levelUpUser(user: User, statAllocation?: Partial<Stats>): { newLevel: number; newStats: Stats; availablePoints: number } {
  const levelProgress = calculateLevelProgress(user.exp);
  const newLevel = levelProgress.currentLevel;
  const availablePoints = 5; // 5 points per level
  
  const newStats = { ...user.stats };
  
  if (statAllocation) {
    Object.entries(statAllocation).forEach(([stat, points]) => {
      if (points && points > 0) {
        newStats[stat as keyof Stats] += points;
      }
    });
  }
  
  return {
    newLevel,
    newStats,
    availablePoints
  };
}

/**
 * Generate daily quest from template
 */
export function generateDailyQuest(template: any, date: Date): Partial<Quest> {
  return {
    title: template.title,
    type: 'daily',
    windowStart: template.windowStart,
    windowEnd: template.windowEnd,
    target: template.target,
    affects: template.affects,
    rewardEXP: template.rewardEXP,
    penalty: template.penalty,
    tags: template.tags,
    isActive: true
  };
}

/**
 * Generate weekly quest from template
 */
export function generateWeeklyQuest(template: any, weekStart: Date): Partial<Quest> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 0, 0, 0); // Sunday 23:00
  
  return {
    title: template.title,
    type: 'weekly',
    deadline: weekEnd,
    criteria: template.criteria,
    affects: template.affects,
    rewardEXP: template.rewardEXP,
    penalty: template.penalty,
    tags: template.tags,
    isActive: true
  };
}
