'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Punishment } from '@/types';
import { formatTime } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PunishmentQueueProps {
  punishments: Punishment[];
  onResolvePunishment: (punishmentId: string) => void;
}

export function PunishmentQueue({ punishments, onResolvePunishment }: PunishmentQueueProps) {
  const activePunishments = punishments.filter(p => !p.resolvedAt);

  if (activePunishments.length === 0) {
    return (
      <Card className="quest-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Punishment Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            No active punishments. Keep up the good work!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPunishmentDescription = (type: string) => {
    const descriptions = {
      'pushups_50': 'Do 50 push-ups',
      'squats_75': 'Do 75 bodyweight squats',
      'screen_detox_30': '30-minute screen detox after 21:00',
      'cold_shower_1': 'Take one 60-second cold shower',
      'extra_focus_block': 'Add one 25-minute focus block tomorrow'
    };
    return descriptions[type as keyof typeof descriptions] || type;
  };

  return (
    <Card className="quest-card border-red-200 dark:border-red-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Punishment Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activePunishments.map((punishment) => (
            <div 
              key={punishment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700"
            >
              <div>
                <div className="font-medium text-red-900 dark:text-red-100">
                  {getPunishmentDescription(punishment.punishmentType)}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Due: {formatTime(punishment.dueAt)}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolvePunishment(punishment.id)}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/30"
              >
                Complete
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
