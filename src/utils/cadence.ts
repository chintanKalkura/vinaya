import { HabitCadence, StreakFreezeState } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { parseDate } from './dates';
import { calculateStreak } from './streak';

// Rolling-window tracking: docs/feature-development/habits-section/week-month-year-cadence.md

export interface CadenceStatus {
  markedToday: boolean;
  complete: boolean;
  streak: number;
  frozenToday: boolean; // a freeze was used today and kept the streak alive
  freezesLeft: number;
}

export const NO_FREEZE: StreakFreezeState = {
  available: 0,
  earnedAtStreak: 0,
  frozenDates: [],
};

export function daysBetween(fromKey: string, toKey: string): number {
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
  freeze: StreakFreezeState = NO_FREEZE,
): CadenceStatus {
  const streak = getStreak(markers, cadence, todayKey, freeze.frozenDates);
  const { markedToday, complete } = getWindowState(
    markers,
    cadence,
    target,
    todayKey,
  );
  return {
    markedToday,
    complete,
    streak,
    frozenToday: freeze.lastUsedOn === todayKey && streak > 0,
    freezesLeft: freeze.available,
  };
}

function markedDates(markers: LogEntry[], todayKey: string): string[] {
  return [
    ...new Set(
      markers
        .filter(entry => entry.kind === 'marker' && entry.date <= todayKey)
        .map(entry => entry.date),
    ),
  ].sort((a, b) => (a < b ? 1 : -1));
}

function getWindowState(
  markers: LogEntry[],
  cadence: HabitCadence,
  target: number | undefined,
  todayKey: string,
): { markedToday: boolean; complete: boolean } {
  const dates = markedDates(markers, todayKey);
  const markedToday = dates[0] === todayKey;
  if (cadence === 'Day') return { markedToday, complete: markedToday };

  const window = windowLength(cadence, todayKey);
  const inWindow = dates.filter(date => daysBetween(date, todayKey) < window);
  return {
    markedToday,
    complete: inWindow.length >= clampCadenceTarget(cadence, target),
  };
}

// The run stays alive through the day one window after the latest mark, like
// a Day run through the day after its mark. Frozen days bridge the run (one
// day of slack each) but never add to it
export function getStreak(
  markers: LogEntry[],
  cadence: HabitCadence,
  todayKey: string,
  frozenDates: string[] = [],
): number {
  if (cadence === 'Day') return calculateStreak(markers, todayKey, frozenDates);

  const dates = markedDates(markers, todayKey);
  const window = windowLength(cadence, todayKey);
  const frozenBetween = (from: string, to: string) =>
    frozenDates.filter(date => date > from && date <= to).length;

  if (
    dates.length === 0 ||
    daysBetween(dates[0], todayKey) > window + frozenBetween(dates[0], todayKey)
  ) {
    return 0;
  }
  let streak = 1;
  while (
    streak < dates.length &&
    daysBetween(dates[streak], dates[streak - 1]) <=
      window + frozenBetween(dates[streak], dates[streak - 1])
  ) {
    streak += 1;
  }
  return streak;
}
