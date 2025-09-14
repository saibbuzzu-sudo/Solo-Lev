'use client';

import { useState, useEffect } from 'react';
import { CharacterHeader } from '@/components/dashboard/character-header';
import { QuestList } from '@/components/dashboard/quest-list';
import { WeeklyProgress } from '@/components/dashboard/weekly-progress';
import { PunishmentQueue } from '@/components/dashboard/punishment-queue';
import { User, Quest, Completion, LevelCalculation, Punishment } from '@/types';
import { getTodayInTimezone } from '@/lib/utils';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelCalculation | null>(null);
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user data
      const userResponse = await fetch('/api/user');
      const userData = await userResponse.json();
      if (userData.success) {
        setUser(userData.data);
        setLevelProgress(userData.data.levelProgress);
      }

      // Fetch today's quests
      const today = getTodayInTimezone();
      const questsResponse = await fetch(`/api/quests?date=${today.toISOString().split('T')[0]}`);
      const questsData = await questsResponse.json();
      if (questsData.success) {
        const allQuests = questsData.data;
        setDailyQuests(allQuests.filter((q: Quest) => q.type === 'daily'));
        setWeeklyQuests(allQuests.filter((q: Quest) => q.type === 'weekly'));
        
        // Extract completions from quests
        const allCompletions: Completion[] = [];
        allQuests.forEach((quest: Quest & { completions: Completion[] }) => {
          if (quest.completions) {
            allCompletions.push(...quest.completions);
          }
        });
        setCompletions(allCompletions);
      }

      // Fetch punishments
      const punishmentsResponse = await fetch('/api/punishments');
      const punishmentsData = await punishmentsResponse.json();
      if (punishmentsData.success) {
        setPunishments(punishmentsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: string, value?: number) => {
    try {
      const response = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
          value,
          status: 'success'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setUser(data.data.user);
        setLevelProgress(data.data.user.levelProgress);
        
        // Add completion to local state
        setCompletions(prev => [...prev, data.data.completion]);
        
        // Refresh quest data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const handleFailQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questId,
          status: 'fail'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setUser(data.data.user);
        setLevelProgress(data.data.user.levelProgress);
        
        // Add completion to local state
        setCompletions(prev => [...prev, data.data.completion]);
        
        // Refresh quest data
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error failing quest:', error);
    }
  };

  const handleResolvePunishment = async (punishmentId: string) => {
    try {
      const response = await fetch('/api/punishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ punishmentId }),
      });

      const data = await response.json();
      if (data.success) {
        setPunishments(prev => 
          prev.map(p => 
            p.id === punishmentId 
              ? { ...p, resolvedAt: new Date() }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error resolving punishment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            System Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-slate-100 mb-2">
          Solo Leveling System
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400">
          Rise, Adventurer. Your daily missions await.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Character Header */}
          {levelProgress && (
            <CharacterHeader user={user} levelProgress={levelProgress} />
          )}

          {/* Daily Quests */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Today's Quests
            </h2>
            {dailyQuests.length > 0 ? (
              <QuestList
                quests={dailyQuests}
                completions={completions}
                onCompleteQuest={handleCompleteQuest}
                onFailQuest={handleFailQuest}
              />
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  No quests available today. Check back tomorrow!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Punishment Queue */}
          <PunishmentQueue
            punishments={punishments}
            onResolvePunishment={handleResolvePunishment}
          />

          {/* Weekly Progress */}
          <WeeklyProgress
            weeklyQuests={weeklyQuests}
            completions={completions}
          />

          {/* Quick Stats */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Daily Streak:</span>
                <span className="font-medium">0 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Weekly Streak:</span>
                <span className="font-medium">0 weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total EXP:</span>
                <span className="font-medium">{user.exp.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
