import { HabitCadence } from '../types/habit';
import { LogEntry } from '../types/log';
import { WeekStart } from '../types/settings';
import { clampCadenceTarget, daysBetween, windowLength } from './cadence';
import { addDays, parseDate, toDateKey } from './dates';

// Stats for the habit and group page:
// docs/feature-development/release-1-readiness/habit-group-detail-page.md
// All functions are pure and take one marker per marked day (Hours habits:
// the days that met the target, from habitMarkers()).

function markedDates(markers: LogEntry[], todayKey: string): string[] {
  return [
    ...new Set(
      markers
        .filter(entry => entry.kind === 'marker' && entry.date <= todayKey)
        .map(entry => entry.date),
    ),
  ].sort();
}

// ---- Streaks ----

export interface StreakSummary {
  current: number;
  best: number;
  previous: number; // the run before the latest one; the ended run when current is 0
}

// Runs follow the same rules as getStreak: a mark continues the run while it
// is within one window of the one before, frozen days adding one day each
export function streakSummary(
  markers: LogEntry[],
  cadence: HabitCadence,
  todayKey: string,
  frozenDates: string[] = [],
): StreakSummary {
  const dates = markedDates(markers, todayKey);
  if (dates.length === 0) return { current: 0, best: 0, previous: 0 };
  const w = windowLength(cadence, todayKey);
  const frozen = [...frozenDates].sort();
  const frozenBetween = (older: string, newer: string) =>
    frozen.filter(date => date > older && date <= newer).length;

  const runs: number[] = [];
  let length = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i - 1], dates[i]);
    if (gap <= w + frozenBetween(dates[i - 1], dates[i])) length += 1;
    else {
      runs.push(length);
      length = 1;
    }
  }
  runs.push(length);

  const last = dates[dates.length - 1];
  const alive =
    daysBetween(last, todayKey) <= w + frozenBetween(last, todayKey);
  const current = alive ? runs[runs.length - 1] : 0;
  const previous = alive ? runs[runs.length - 2] ?? 0 : runs[runs.length - 1];
  return { current, best: Math.max(...runs), previous };
}

// ---- Calendar periods ----

export function periodStart(
  cadence: HabitCadence,
  dateKey: string,
  weekStart: WeekStart,
): string {
  const date = parseDate(dateKey);
  switch (cadence) {
    case 'Day':
      return dateKey;
    case 'Week': {
      const first = weekStart === 'sunday' ? 0 : 1;
      return addDays(dateKey, -((date.getDay() - first + 7) % 7));
    }
    case 'Month':
      return toDateKey(new Date(date.getFullYear(), date.getMonth(), 1));
    case 'Year':
      return toDateKey(new Date(date.getFullYear(), 0, 1));
  }
}

function nextPeriodStart(cadence: HabitCadence, startKey: string): string {
  const date = parseDate(startKey);
  switch (cadence) {
    case 'Day':
      return addDays(startKey, 1);
    case 'Week':
      return addDays(startKey, 7);
    case 'Month':
      return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    case 'Year':
      return toDateKey(new Date(date.getFullYear() + 1, 0, 1));
  }
}

// ---- Completion ----

// A day (Day cadence) or a calendar week, month or year that met the target
export interface CompletionUnit {
  start: string;
  end: string;
  done: boolean;
}

// Oldest first. The current day or period counts only once complete, and a
// first period the item only partly existed in counts only if it met its
// target. Frozen days are not marks, so they count as not done.
export function completionUnits(
  markers: LogEntry[],
  cadence: HabitCadence,
  target: number | undefined,
  createdKey: string,
  todayKey: string,
  weekStart: WeekStart,
): CompletionUnit[] {
  const dates = markedDates(markers, todayKey).filter(d => d >= createdKey);
  const needed = clampCadenceTarget(cadence, target);
  const units: CompletionUnit[] = [];
  let next = 0;
  for (
    let start = periodStart(cadence, createdKey, weekStart);
    start <= todayKey;
    start = nextPeriodStart(cadence, start)
  ) {
    const end = addDays(nextPeriodStart(cadence, start), -1);
    let count = 0;
    while (next < dates.length && dates[next] <= end) {
      count += 1;
      next += 1;
    }
    const done = count >= needed;
    const current = end >= todayKey;
    const partialFirst = start < createdKey;
    if (done || (!current && !partialFirst)) units.push({ start, end, done });
  }
  return units;
}

export interface CompletionRate {
  done: number;
  total: number;
  rate: number | null; // 0..1, null before anything counts
}

export function completionRate(units: CompletionUnit[]): CompletionRate {
  const done = units.filter(unit => unit.done).length;
  return {
    done,
    total: units.length,
    rate: units.length > 0 ? done / units.length : null,
  };
}

// ---- Trend ----

export interface TrendAxis {
  step: number; // units per point
  points: number;
}

// Up to 10 points (12 for months), each a slice of `step` units, with the
// step scaled to the history so every slice holds full data
export function trendAxis(cadence: HabitCadence, units: number): TrendAxis {
  let step: number;
  let maxPoints = 10;
  switch (cadence) {
    case 'Day':
      step =
        units >= 50
          ? 5 * Math.floor(units / 50)
          : Math.max(1, Math.floor(units / 10));
      break;
    case 'Week':
      step = 1;
      while (step * 2 * 10 <= units) step *= 2;
      break;
    case 'Month':
      maxPoints = 12;
      step = Math.max(1, Math.floor(units / 12));
      break;
    case 'Year':
      step = Math.max(1, Math.floor(units / 10));
      break;
  }
  return { step, points: Math.min(maxPoints, Math.floor(units / step)) };
}

export interface TrendPoint {
  x: number; // units back, at the slice's far end (5, 10, 15 …)
  rate: number; // 0..1 for that slice alone
}

// Most recent slice first
export function trendPoints(
  units: CompletionUnit[],
  cadence: HabitCadence,
): TrendPoint[] {
  const { step, points } = trendAxis(cadence, units.length);
  const newest = [...units].reverse();
  const out: TrendPoint[] = [];
  for (let i = 0; i < points; i++) {
    const slice = newest.slice(i * step, (i + 1) * step);
    const done = slice.filter(unit => unit.done).length;
    out.push({ x: (i + 1) * step, rate: done / step });
  }
  return out;
}

// ---- Heatmap ----

export interface HeatSlot {
  label: string;
  share: number | null; // marked days ÷ days in this slot, null if none yet
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Day and Week habits: by weekday, in week-start order. Month habits: Wk1–Wk5
// of the month (days 1–7 … 29–31). Year habits: by month. Today counts only
// once marked.
export function heatmap(
  markers: LogEntry[],
  cadence: HabitCadence,
  createdKey: string,
  todayKey: string,
  weekStart: WeekStart,
): HeatSlot[] {
  const marked = new Set(markedDates(markers, todayKey));
  let labels: string[];
  let slotOf: (date: Date) => number;
  if (cadence === 'Month') {
    labels = ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5'];
    slotOf = date => Math.floor((date.getDate() - 1) / 7);
  } else if (cadence === 'Year') {
    labels = MONTHS;
    slotOf = date => date.getMonth();
  } else {
    const first = weekStart === 'sunday' ? 0 : 1;
    labels = WEEKDAYS.map((_, i) => WEEKDAYS[(i + first) % 7]);
    slotOf = date => (date.getDay() - first + 7) % 7;
  }

  const total = labels.map(() => 0);
  const hit = labels.map(() => 0);
  for (let day = createdKey; day <= todayKey; day = addDays(day, 1)) {
    const isMarked = marked.has(day);
    if (day === todayKey && !isMarked) break;
    const slot = slotOf(parseDate(day));
    total[slot] += 1;
    if (isMarked) hit[slot] += 1;
  }
  return labels.map((label, i) => ({
    label,
    share: total[i] > 0 ? hit[i] / total[i] : null,
  }));
}

// ---- Calendar ranges ----

export type CalendarRange = 'week' | 'month' | '3m' | '6m' | 'year';
export const CALENDAR_RANGES: CalendarRange[] = [
  'week',
  'month',
  '3m',
  '6m',
  'year',
];

export function defaultCalendarRange(cadence: HabitCadence): CalendarRange {
  return cadence === 'Day' || cadence === 'Week' ? 'week' : 'month';
}

// The oldest day shown; the range ends today
export function calendarRangeStart(
  range: CalendarRange,
  todayKey: string,
): string {
  if (range === 'week') return addDays(todayKey, -6);
  const months = { month: 1, '3m': 3, '6m': 6, year: 12 }[range];
  const today = parseDate(todayKey);
  const back = new Date(today.getFullYear(), today.getMonth() - months, 1);
  // Same day of the month, kept inside a shorter month
  const lastDay = new Date(
    back.getFullYear(),
    back.getMonth() + 1,
    0,
  ).getDate();
  back.setDate(Math.min(today.getDate(), lastDay));
  return addDays(toDateKey(back), 1);
}
