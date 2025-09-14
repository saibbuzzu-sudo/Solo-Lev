'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stats } from '@/types';
import { getStatColor, getStatIcon } from '@/lib/utils';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface CharacterSheetProps {
  user: User;
  onUpdateStats: (stats: Stats) => void;
}

export function CharacterSheet({ user, onUpdateStats }: CharacterSheetProps) {
  const [editingStats, setEditingStats] = useState<Stats>({ ...user.stats });
  const [availablePoints, setAvailablePoints] = useState(0); // This would come from level-up logic

  const handleStatChange = (stat: keyof Stats, delta: number) => {
    if (availablePoints <= 0 && delta > 0) return;
    
    setEditingStats(prev => ({
      ...prev,
      [stat]: Math.max(0, prev[stat] + delta)
    }));
    
    if (delta > 0) {
      setAvailablePoints(prev => prev - 1);
    } else {
      setAvailablePoints(prev => prev + 1);
    }
  };

  const handleSave = () => {
    onUpdateStats(editingStats);
  };

  const handleReset = () => {
    setEditingStats({ ...user.stats });
    setAvailablePoints(0);
  };

  const hasChanges = JSON.stringify(editingStats) !== JSON.stringify(user.stats);

  return (
    <Card className="quest-card">
      <CardHeader>
        <CardTitle>Character Sheet</CardTitle>
        {availablePoints > 0 && (
          <div className="text-sm text-blue-600 dark:text-blue-400">
            {availablePoints} points available to allocate
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(editingStats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStatIcon(stat)}</span>
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {stat}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {getStatDescription(stat)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatChange(stat as keyof Stats, -1)}
                  disabled={value <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className={`text-xl font-bold min-w-[3rem] text-center ${getStatColor(stat)}`}>
                  {value}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatChange(stat as keyof Stats, 1)}
                  disabled={availablePoints <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatDescription(stat: string): string {
  const descriptions = {
    STR: 'Physical strength, workouts, mobility',
    INT: 'Intelligence, research, writing, learning',
    CHA: 'Charisma, communication, teaching',
    WIL: 'Willpower, focus, routine adherence',
    VIT: 'Vitality, sleep, hydration, recovery'
  };
  return descriptions[stat as keyof typeof descriptions] || '';
}
