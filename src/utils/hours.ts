import { Habit } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';

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

// Days whose logged hours met the target, as marker entries, so the
// Checkmark streak and colour rules apply unchanged to Hours habits
export function targetMetLog(
  habit: Habit,
  log: LogEntry[] = habit.recentLog,
): LogEntry[] {
  const target = habit.targetHours ?? 0;
  if (target <= 0) return [];
  return log
    .filter(entry => entry.kind === 'hours' && entry.value >= target)
    .map(entry => ({ date: entry.date, kind: 'marker', value: 1 }));
}
