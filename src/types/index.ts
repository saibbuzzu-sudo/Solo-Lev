// Core types for the Solo Leveling System

export interface User {
  id: string;
  name: string;
  timezone: string;
  level: number;
  exp: number;
  stats: Stats;
  titles: string[];
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stats {
  STR: number; // Strength
  INT: number; // Intelligence
  CHA: number; // Charisma
  WIL: number; // Willpower
  VIT: number; // Vitality
}

export interface UserSettings {
  humorStyle: 'mild' | 'standard' | 'savage';
  penaltyIntensity: 'low' | 'medium' | 'high';
}

export interface Quest {
  id: string;
  title: string;
  type: 'daily' | 'weekly';
  templateId?: string;
  windowStart?: string; // "06:00"
  windowEnd?: string;   // "23:00"
  deadline?: Date;      // For weekly quests
  target: QuestTarget;
  criteria?: QuestCriteria; // For weekly quests
  affects: StatAffect[];
  rewardEXP: number;
  penalty?: QuestPenalty;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestTarget {
  kind: 'count' | 'duration' | 'boolean';
  value: number;
  unit?: string; // "words", "minutes", "steps"
}

export interface QuestCriteria {
  kind: 'countCompletions' | 'wordsNet' | 'streak';
  of?: string; // Tag to count
  value: number;
}

export interface StatAffect {
  stat: keyof Stats;
  weight: number;
}

export interface QuestPenalty {
  exp: number;
  punishmentQuestId?: string;
  title?: string;
  durationHours?: number;
}

export interface Completion {
  id: string;
  questId: string;
  userId: string;
  status: 'success' | 'fail' | 'partial';
  value?: number;
  notes?: string;
  evidenceUrl?: string;
  completedAt: Date;
  createdAt: Date;
}

export interface Streak {
  id: string;
  userId: string;
  kind: 'daily' | 'weekly';
  count: number;
  lastDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Title {
  id: string;
  name: string;
  description?: string;
  effects?: TitleEffect;
  isPositive: boolean;
  requirements?: TitleRequirements;
  createdAt: Date;
}

export interface TitleEffect {
  stat?: keyof Stats;
  value?: number;
  duration?: 'permanent' | 'temporary';
  hours?: number;
}

export interface TitleRequirements {
  quests?: string[];
  stats?: Partial<Stats>;
  streaks?: { kind: 'daily' | 'weekly'; count: number };
}

export interface UserTitle {
  id: string;
  userId: string;
  titleId: string;
  activeFrom: Date;
  activeTo?: Date;
  permanent: boolean;
  createdAt: Date;
}

export interface Punishment {
  id: string;
  userId: string;
  questId: string;
  punishmentType: string;
  dueAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface QuestTemplate {
  id: string;
  title: string;
  type: 'daily' | 'weekly';
  windowStart?: string;
  windowEnd?: string;
  target: QuestTarget;
  affects: StatAffect[];
  rewardEXP: number;
  penalty?: QuestPenalty;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Game mechanics types
export interface LevelCalculation {
  currentLevel: number;
  currentExp: number;
  expToNext: number;
  totalExpForLevel: number;
}

export interface StatAllocation {
  availablePoints: number;
  currentStats: Stats;
  suggestedAllocation?: Partial<Stats>;
}

export interface QuestEvaluation {
  questId: string;
  completed: boolean;
  expGained: number;
  statWeights: Partial<Stats>;
  penaltyApplied?: QuestPenalty;
}

export interface WeeklyEvaluation {
  weekStart: Date;
  weekEnd: Date;
  dailyCompletionRate: number;
  weeklyQuestsCompleted: number;
  bonusExp: number;
  penaltiesApplied: QuestPenalty[];
  newTitles: string[];
}

// UI State types
export interface DashboardState {
  user: User;
  todayQuests: Quest[];
  weeklyQuests: Quest[];
  activePunishments: Punishment[];
  dailyStreak: number;
  weeklyStreak: number;
  expToNextLevel: number;
  activeTitles: string[];
}

export interface QuestFormData {
  title: string;
  type: 'daily' | 'weekly';
  windowStart?: string;
  windowEnd?: string;
  target: QuestTarget;
  affects: StatAffect[];
  rewardEXP: number;
  penalty?: QuestPenalty;
  tags: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QuestCompletionRequest {
  questId: string;
  value?: number;
  notes?: string;
  evidenceUrl?: string;
}

export interface StatAllocationRequest {
  STR?: number;
  INT?: number;
  CHA?: number;
  WIL?: number;
  VIT?: number;
}

// Constants
export const STAT_NAMES: Record<keyof Stats, string> = {
  STR: 'Strength',
  INT: 'Intelligence', 
  CHA: 'Charisma',
  WIL: 'Willpower',
  VIT: 'Vitality'
};

export const QUEST_TAGS = {
  FITNESS: 'fitness',
  MIND: 'mind',
  RESEARCH: 'research',
  READING: 'reading',
  WILLPOWER: 'willpower',
  PRODUCTIVITY: 'productivity',
  RECOVERY: 'recovery'
} as const;

export const PUNISHMENT_TYPES = {
  PUSHUPS_50: 'pushups_50',
  SQUATS_75: 'squats_75',
  SCREEN_DETOX_30: 'screen_detox_30',
  COLD_SHOWER_1: 'cold_shower_1',
  EXTRA_FOCUS_BLOCK: 'extra_focus_block'
} as const;
