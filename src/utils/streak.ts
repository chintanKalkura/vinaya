import { addDays } from './dates';
import { LogEntry } from '../types/log';

// Frozen days bridge the run but never add to the streak
export function calculateStreak(
  recentLog: LogEntry[],
  todayKey: string,
  frozenDates: string[] = [],
): number {
  const markedDates = new Set(
    recentLog.filter(entry => entry.kind === 'marker').map(entry => entry.date),
  );
  const frozen = new Set(frozenDates);
  const covered = (date: string) => markedDates.has(date) || frozen.has(date);

  const anchor = markedDates.has(todayKey) ? todayKey : addDays(todayKey, -1);
  if (!covered(anchor)) return 0;

  let streak = 0;
  let cursor = anchor;
  while (covered(cursor)) {
    if (markedDates.has(cursor)) streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
