import { HabitCadence, StreakFreezeState } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { NO_FREEZE, daysBetween, getStreak, windowLength } from './cadence';
import { addDays } from './dates';
import { calculateStreak } from './streak';

// Streak freeze rules: docs/feature-development/habits-section/streak-freeze.md

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

// After past days change: replays the whole history day by day, as if the app
// had been opened every day. Each morning freezes cover missed days (before
// that day's mark), each evening the day's streak earns freezes. The stored
// state is otherwise never worked out from history (streak-freeze.md, decision 2).
//
// Gives the same result as calling applyFreezes and earnFreezes once a day,
// but in a single pass: it carries the current run forward instead of
// re-reading the whole history each day, so years of marks take milliseconds.
export function rebuildFreezeState(
  markers: LogEntry[],
  cadence: HabitCadence,
  interval: number,
  todayKey: string,
): StreakFreezeState {
  const n = clampFreezeInterval(interval);
  const dates = [
    ...new Set(
      markers
        .filter(entry => entry.kind === 'marker' && entry.date <= todayKey)
        .map(entry => entry.date),
    ),
  ].sort();
  let available = 0;
  let earnedAtStreak = 0;
  let lastUsedOn: string | undefined;
  const frozenDates: string[] = []; // added oldest first, so stays sorted

  // Frozen days in (older, newer]
  const frozenBetween = (older: string, newer: string) => {
    let count = 0;
    for (let i = frozenDates.length - 1; i >= 0; i--) {
      if (frozenDates[i] <= older) break;
      if (frozenDates[i] <= newer) count += 1;
    }
    return count;
  };

  // The run holding the latest mark, as getStreak sees it with window `w`
  const run: string[] = [];
  let runWindow = 0;
  let marked = 0; // dates[0..marked) are on or before the current day
  const rebuildRun = (w: number) => {
    run.length = 0;
    let i = marked - 1;
    run.unshift(dates[i]);
    while (
      i > 0 &&
      daysBetween(dates[i - 1], dates[i]) <=
        w + frozenBetween(dates[i - 1], dates[i])
    ) {
      i -= 1;
      run.unshift(dates[i]);
    }
  };

  // Nothing happens before the first mark
  for (let day = dates[0] ?? todayKey; day <= todayKey; day = addDays(day, 1)) {
    const w = windowLength(cadence, day);
    if (run.length > 0 && w !== runWindow) rebuildRun(w);
    runWindow = w;

    // Morning: a freeze for each day the run would break on, oldest first
    let alive = false;
    while (run.length > 0) {
      const last = run[run.length - 1];
      const slack = w + frozenBetween(last, day);
      if (daysBetween(last, day) <= slack) {
        alive = true;
        break;
      }
      if (available === 0) break;
      frozenDates.push(addDays(last, slack));
      available -= 1;
      lastUsedOn = day;
    }
    if (!alive) {
      run.length = 0;
      earnedAtStreak = 0;
    }

    // Evening: the day's mark, then freezes earned by the streak
    if (marked < dates.length && dates[marked] === day) {
      marked += 1;
      if (alive) run.push(day);
      else run.splice(0, run.length, day);
    }
    const streak = run.length;
    while (streak - earnedAtStreak >= n) {
      available += 1;
      earnedAtStreak += n;
    }
    if (earnedAtStreak > 0 && streak < earnedAtStreak) {
      available = Math.max(0, available - 1);
      earnedAtStreak -= n;
    }
    if (streak === 0) earnedAtStreak = 0;
  }

  return {
    available,
    earnedAtStreak,
    frozenDates,
    ...(lastUsedOn !== undefined ? { lastUsedOn } : {}),
  };
}
