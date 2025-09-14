'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Quest, Completion } from '@/types';
import { formatDate, getWeekEnd } from '@/lib/utils';
import { Calendar, Target, CheckCircle } from 'lucide-react';

interface WeeklyProgressProps {
  weeklyQuests: Quest[];
  completions: Completion[];
}

export function WeeklyProgress({ weeklyQuests, completions }: WeeklyProgressProps) {
  const weekEnd = getWeekEnd(new Date());
  const weekEndFormatted = formatDate(weekEnd);

  const getQuestStatus = (quest: Quest) => {
    const completion = completions.find(c => c.questId === quest.id);
    return completion?.status || 'pending';
  };

  const completedCount = weeklyQuests.filter(quest => getQuestStatus(quest) === 'success').length;
  const totalCount = weeklyQuests.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="quest-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Progress
        </CardTitle>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Resets: {weekEndFormatted} at 23:00
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="space-y-3">
          {weeklyQuests.map((quest) => {
            const status = getQuestStatus(quest);
            const isCompleted = status === 'success';

            return (
              <div 
                key={quest.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCompleted 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Target className="h-5 w-5 text-slate-400" />
                  )}
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {quest.title}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      +{quest.rewardEXP} EXP
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {isCompleted ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalCount === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No weekly quests this week</p>
            <p className="text-sm">Check back on Sunday for new challenges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
