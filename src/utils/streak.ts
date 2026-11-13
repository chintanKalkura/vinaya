import { addDays } from './dates';
import { LogEntry } from '../types/log';

export function calculateStreak(
  recentLog: LogEntry[],
  todayKey: string,
): number {
  const markedDates = new Set(
    recentLog.filter(entry => entry.kind === 'marker').map(entry => entry.date),
  );

  const anchor = markedDates.has(todayKey) ? todayKey : addDays(todayKey, -1);
  if (!markedDates.has(anchor)) return 0;

  let streak = 1;
  let cursor = anchor;
  while (markedDates.has(addDays(cursor, -1))) {
    cursor = addDays(cursor, -1);
    streak += 1;
  }
  return streak;
}

export type MarkColorState = 'marked' | 'unmarked';

export interface HabitVisualState {
  habitColorState: MarkColorState;
  streakValue: number;
}

export function deriveHabitVisualState(
  recentLog: LogEntry[],
  todayKey: string,
): HabitVisualState {
  const streakValue = calculateStreak(recentLog, todayKey);
  const isTodayMarked = recentLog.some(
    entry => entry.kind === 'marker' && entry.date === todayKey,
  );

  return {
    habitColorState: isTodayMarked ? 'marked' : 'unmarked',
    streakValue,
  };
}
