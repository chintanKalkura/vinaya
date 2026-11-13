import { HabitCadence } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { parseDate } from './dates';
import { calculateStreak } from './streak';

// Rolling-window tracking: docs/feature-development/week-month-year-cadence.md

export interface CadenceStatus {
  markedToday: boolean;
  complete: boolean;
  streak: number;
}

function daysBetween(fromKey: string, toKey: string): number {
  const ms = parseDate(toKey).getTime() - parseDate(fromKey).getTime();
  return Math.round(ms / 86400000);
}

export function windowLength(cadence: HabitCadence, todayKey: string): number {
  const today = parseDate(todayKey);
  switch (cadence) {
    case 'Day':
      return 1;
    case 'Week':
      return 7;
    case 'Month':
      return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    case 'Year': {
      const year = today.getFullYear();
      const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return leap ? 366 : 365;
    }
  }
}

export function clampCadenceTarget(
  cadence: HabitCadence,
  value: number | undefined,
): number {
  if (cadence === 'Day') return 1;
  const max = DEFAULT_HABIT_LIMITS.cadenceTargetMax[cadence];
  const whole = Number.isFinite(value) ? Math.round(value as number) : 1;
  return Math.min(max, Math.max(1, whole));
}

// `markers` holds one marker entry per marked day (any order)
export function getCadenceStatus(
  markers: LogEntry[],
  cadence: HabitCadence,
  target: number | undefined,
  todayKey: string,
): CadenceStatus {
  const dates = [
    ...new Set(
      markers
        .filter(entry => entry.kind === 'marker' && entry.date <= todayKey)
        .map(entry => entry.date),
    ),
  ].sort((a, b) => (a < b ? 1 : -1));
  const markedToday = dates[0] === todayKey;

  if (cadence === 'Day') {
    return {
      markedToday,
      complete: markedToday,
      streak: calculateStreak(markers, todayKey),
    };
  }

  const window = windowLength(cadence, todayKey);
  const inWindow = dates.filter(date => daysBetween(date, todayKey) < window);
  const complete = inWindow.length >= clampCadenceTarget(cadence, target);

  if (dates.length === 0 || daysBetween(dates[0], todayKey) >= window) {
    return { markedToday, complete, streak: 0 };
  }
  let streak = 1;
  while (
    streak < dates.length &&
    daysBetween(dates[streak], dates[streak - 1]) <= window
  ) {
    streak += 1;
  }
  return { markedToday, complete, streak };
}
