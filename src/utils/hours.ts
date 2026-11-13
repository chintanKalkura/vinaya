import { Habit } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';

export function clampHours(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(
    DEFAULT_HABIT_LIMITS.hoursTargetMax,
    Math.max(0, Math.round(value)),
  );
}

export function getHoursToday(habit: Habit, todayKey: string): number {
  const entry = habit.recentLog.find(
    e => e.kind === 'hours' && e.date === todayKey,
  );
  return entry?.value ?? 0;
}
