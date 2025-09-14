import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getTodayInTimezone(timezone: string = 'Europe/London'): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: timezone }));
}

export function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

export function getWeekEnd(date: Date): Date {
  const weekEnd = new Date(date);
  const day = weekEnd.getDay();
  const diff = weekEnd.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
  weekEnd.setDate(diff);
  weekEnd.setHours(23, 0, 0, 0); // Sunday 23:00
  return weekEnd;
}

export function isWithinTimeWindow(
  time: string, // "06:00" format
  windowStart: string,
  windowEnd: string
): boolean {
  const currentTime = time.split(':').map(Number);
  const startTime = windowStart.split(':').map(Number);
  const endTime = windowEnd.split(':').map(Number);
  
  const currentMinutes = currentTime[0] * 60 + currentTime[1];
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function getStatColor(stat: string): string {
  const colors = {
    STR: 'text-red-500',
    INT: 'text-blue-500', 
    CHA: 'text-purple-500',
    WIL: 'text-green-500',
    VIT: 'text-orange-500'
  };
  return colors[stat as keyof typeof colors] || 'text-gray-500';
}

export function getStatIcon(stat: string): string {
  const icons = {
    STR: '💪',
    INT: '🧠',
    CHA: '🎭',
    WIL: '🛡️',
    VIT: '❤️'
  };
  return icons[stat as keyof typeof icons] || '❓';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
