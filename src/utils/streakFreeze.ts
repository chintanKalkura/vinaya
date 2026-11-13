import { HabitCadence, StreakFreezeState } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { NO_FREEZE, daysBetween, getStreak, windowLength } from './cadence';
import { addDays } from './dates';
import { calculateStreak } from './streak';

// Streak freeze rules: docs/feature-development/streak-freeze.md

export function clampFreezeInterval(value: number | undefined): number {
  const whole = Number.isFinite(value) ? Math.round(value as number) : 0;
  if (whole < 1) return DEFAULT_HABIT_LIMITS.streakFreezeIntervalDefault;
  return Math.min(DEFAULT_HABIT_LIMITS.streakFreezeIntervalMax, whole);
}

// One freeze per N streak in the current run, in blocks that don't overlap.
// Unmarking today undoes the freeze it earned, if it is still held.
export function earnFreezes(
  state: StreakFreezeState = NO_FREEZE,
  streak: number,
  interval: number,
): StreakFreezeState {
  const n = clampFreezeInterval(interval);
  let { available, earnedAtStreak } = state;

  while (streak - earnedAtStreak >= n) {
    available += 1;
    earnedAtStreak += n;
  }
  if (earnedAtStreak > 0 && streak < earnedAtStreak) {
    available = Math.max(0, available - 1);
    earnedAtStreak -= n;
  }
  if (streak === 0) earnedAtStreak = 0;

  if (
    available === state.available &&
    earnedAtStreak === state.earnedAtStreak
  ) {
    return state;
  }
  return { ...state, available, earnedAtStreak };
}

function latest(dates: string[]): string | undefined {
  return dates.reduce<string | undefined>(
    (max, date) => (max === undefined || date > max ? date : max),
    undefined,
  );
}

// The missed day that breaks the run without another freeze, or undefined
// while the run is alive (or there is no run). It is always in the past.
export function nextBreakDay(
  markers: LogEntry[],
  cadence: HabitCadence,
  todayKey: string,
  frozenDates: string[],
): string | undefined {
  const marked = markers
    .filter(entry => entry.kind === 'marker' && entry.date <= todayKey)
    .map(entry => entry.date);

  if (cadence === 'Day') {
    const lastCovered = latest([...marked, ...frozenDates]);
    if (lastCovered === undefined) return undefined;
    if (lastCovered >= addDays(todayKey, -1)) return undefined;
    const breakDay = addDays(lastCovered, 1);
    return calculateStreak(markers, breakDay, frozenDates) > 0
      ? breakDay
      : undefined;
  }

  const lastMark = latest(marked);
  if (lastMark === undefined) return undefined;
  const slack =
    windowLength(cadence, todayKey) +
    frozenDates.filter(date => date > lastMark && date <= todayKey).length;
  // The last day a mark could have kept the run, now passed without one
  return daysBetween(lastMark, todayKey) <= slack
    ? undefined
    : addDays(lastMark, slack);
}

// Run once a day: each freeze covers one break day, oldest first, so the
// result is the same however many days passed since the app was opened
export function applyFreezes(
  state: StreakFreezeState = NO_FREEZE,
  markers: LogEntry[],
  cadence: HabitCadence,
  todayKey: string,
): StreakFreezeState {
  let { available, lastUsedOn } = state;
  const frozenDates = [...state.frozenDates];

  for (
    let day = nextBreakDay(markers, cadence, todayKey, frozenDates);
    day !== undefined && available > 0;
    day = nextBreakDay(markers, cadence, todayKey, frozenDates)
  ) {
    frozenDates.push(day);
    available -= 1;
    lastUsedOn = todayKey;
  }

  const runEnded = getStreak(markers, cadence, todayKey, frozenDates) === 0;
  const earnedAtStreak = runEnded ? 0 : state.earnedAtStreak;

  if (
    available === state.available &&
    earnedAtStreak === state.earnedAtStreak
  ) {
    return state;
  }
  return { available, earnedAtStreak, frozenDates, lastUsedOn };
}

interface Freezable {
  cadence: HabitCadence;
  streakFreezeInterval: number;
  streakFreeze?: StreakFreezeState;
}

// `markers` holds one marker per marked day (Hours habits: target-met days)
export function withEarnedFreezes<T extends Freezable>(
  item: T,
  markers: LogEntry[],
  todayKey: string,
): T {
  const current = item.streakFreeze ?? NO_FREEZE;
  const streak = getStreak(
    markers,
    item.cadence,
    todayKey,
    current.frozenDates,
  );
  const next = earnFreezes(current, streak, item.streakFreezeInterval);
  return next === current ? item : { ...item, streakFreeze: next };
}

export function withAppliedFreezes<T extends Freezable>(
  item: T,
  markers: LogEntry[],
  todayKey: string,
): T {
  const current = item.streakFreeze ?? NO_FREEZE;
  const next = applyFreezes(current, markers, item.cadence, todayKey);
  return next === current ? item : { ...item, streakFreeze: next };
}
