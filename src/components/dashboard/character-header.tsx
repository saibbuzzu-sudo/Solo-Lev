'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getStatColor, getStatIcon } from '@/lib/utils';
import { User, LevelCalculation } from '@/types';

interface CharacterHeaderProps {
  user: User;
  levelProgress: LevelCalculation;
}

export function CharacterHeader({ user, levelProgress }: CharacterHeaderProps) {
  const progressPercentage = (levelProgress.currentExp / levelProgress.totalExpForLevel) * 100;

  return (
    <Card className="quest-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {user.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Level {user.level} • {user.exp.toLocaleString()} EXP
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Next Level
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {levelProgress.expToNext.toLocaleString()} EXP
            </div>
          </div>
        </div>

        {/* EXP Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>Progress to Level {user.level + 1}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="exp-bar">
            <div 
              className="exp-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(user.stats).map(([stat, value]) => (
            <div key={stat} className="text-center">
              <div className={`text-2xl mb-1 ${getStatColor(stat)}`}>
                {getStatIcon(stat)}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                {stat}
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Active Titles */}
        {user.titles && user.titles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Active Titles
            </div>
            <div className="flex flex-wrap gap-2">
              {user.titles.map((title, index) => (
                <span key={index} className="title-badge">
                  {title}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
