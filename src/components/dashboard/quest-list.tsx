'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quest, Completion } from '@/types';
import { formatTime, calculateProgress } from '@/lib/utils';
import { CheckCircle, Circle, Clock, Target, Zap } from 'lucide-react';

interface QuestListProps {
  quests: Quest[];
  completions: Completion[];
  onCompleteQuest: (questId: string, value?: number) => void;
  onFailQuest: (questId: string) => void;
}

export function QuestList({ quests, completions, onCompleteQuest, onFailQuest }: QuestListProps) {
  const [completingQuests, setCompletingQuests] = useState<Set<string>>(new Set());

  const handleComplete = async (questId: string, value?: number) => {
    setCompletingQuests(prev => new Set(prev).add(questId));
    try {
      await onCompleteQuest(questId, value);
    } finally {
      setCompletingQuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  const handleFail = async (questId: string) => {
    setCompletingQuests(prev => new Set(prev).add(questId));
    try {
      await onFailQuest(questId);
    } finally {
      setCompletingQuests(prev => {
        const newSet = new Set(prev);
        newSet.delete(questId);
        return newSet;
      });
    }
  };

  const getQuestStatus = (quest: Quest) => {
    const completion = completions.find(c => c.questId === quest.id);
    if (!completion) return 'pending';
    return completion.status;
  };

  const getQuestProgress = (quest: Quest) => {
    const completion = completions.find(c => c.questId === quest.id);
    if (!completion || !completion.value) return 0;
    
    const target = quest.target.value;
    return calculateProgress(completion.value, target);
  };

  const isQuestInWindow = (quest: Quest) => {
    if (!quest.windowStart || !quest.windowEnd) return true;
    
    const now = new Date();
    const currentTime = formatTime(now);
    return currentTime >= quest.windowStart && currentTime <= quest.windowEnd;
  };

  const getStatAffects = (quest: Quest) => {
    return quest.affects?.map(affect => ({
      stat: affect.stat,
      weight: affect.weight,
      icon: getStatIcon(affect.stat)
    })) || [];
  };

  const getStatIcon = (stat: string) => {
    const icons = {
      STR: '💪',
      INT: '🧠',
      CHA: '🎭',
      WIL: '🛡️',
      VIT: '❤️'
    };
    return icons[stat as keyof typeof icons] || '❓';
  };

  return (
    <div className="space-y-4">
      {quests.map((quest) => {
        const status = getQuestStatus(quest);
        const progress = getQuestProgress(quest);
        const isInWindow = isQuestInWindow(quest);
        const isCompleting = completingQuests.has(quest.id);
        const statAffects = getStatAffects(quest);

        return (
          <Card 
            key={quest.id} 
            className={`quest-card ${
              status === 'success' ? 'quest-complete' : 
              status === 'fail' ? 'quest-failed' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-400" />
                  )}
                  {quest.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Zap className="h-4 w-4" />
                  +{quest.rewardEXP} EXP
                </div>
              </div>
              
              {quest.windowStart && quest.windowEnd && (
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  {quest.windowStart} - {quest.windowEnd}
                  {!isInWindow && (
                    <span className="text-orange-500 ml-2">(Outside window)</span>
                  )}
                </div>
              )}

              {quest.deadline && (
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                  <Target className="h-4 w-4" />
                  Due: {formatTime(quest.deadline)}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {/* Target Description */}
              <div className="mb-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Target: {quest.target.value} {quest.target.unit}
                </div>
                {status === 'success' && quest.target.kind === 'count' && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Completed: {completions.find(c => c.questId === quest.id)?.value || 0} {quest.target.unit}
                  </div>
                )}
              </div>

              {/* Progress Bar for count-based quests */}
              {quest.target.kind === 'count' && status !== 'success' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="stat-bar">
                    <div 
                      className="stat-fill bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stat Affects */}
              {statAffects.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Affects:
                  </div>
                  <div className="flex gap-2">
                    {statAffects.map((affect, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800"
                      >
                        <span>{affect.icon}</span>
                        <span className="font-medium">{affect.stat}</span>
                        <span className="text-slate-500">+{affect.weight}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {quest.tags && quest.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {quest.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 rounded-full text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleComplete(quest.id, quest.target.value)}
                    disabled={isCompleting || !isInWindow}
                    className="flex-1"
                  >
                    {isCompleting ? 'Completing...' : 'Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFail(quest.id)}
                    disabled={isCompleting}
                  >
                    Fail
                  </Button>
                </div>
              )}

              {status === 'success' && (
                <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                  ✓ Completed
                </div>
              )}

              {status === 'fail' && (
                <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                  ✗ Failed
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
