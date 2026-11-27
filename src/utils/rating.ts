import { Habit, HabitCadence } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { LogEntry } from '../types/log';
import { clampCadenceTarget } from './cadence';
import { addDays, parseDate, toDateKey } from './dates';
import { streakRuns } from './history';
import { habitMarkers } from './hours';

// The five stars: docs/feature-development/release-1-readiness/habit-group-detail-page.md
// (decision 8). Each star is a goal over a rolling window ending today (or
// yesterday, until today is done), counted in times done against the target.
export type StarState = 'earned' | 'todo' | 'locked';

export interface RatingStar {
  goal: string;
  state: StarState;
  status: string; // "Earned", "2 more days", "1 day missed", "Opens 14 Dec"
}

export interface Rating {
  stars: number; // 0–5, the earned ones
  items: RatingStar[];
}

// Periods per window, and the goal wording per cadence (approved 27 Nov 2026)
export const RATING_WINDOW: Record<HabitCadence, number> = {
  Day: 7,
  Week: 4,
  Month: 3,
  Year: 1,
};

const GOALS: Record<HabitCadence, string[]> = {
  Day: [
    'Most days this week',
    'Every day this week',
    'Most days for 2 weeks',
    'Steady for 3 weeks',
  ],
  Week: [
    'Most of your target this month',
    'Every time this month',
    'Most of it for 2 months',
    'Steady for 3 months',
  ],
  Month: [
    'Most of your target in 3 months',
    'Every time in 3 months',
    'Most of it for 6 months',
    'Steady for 9 months',
  ],
  Year: [
    'Most of your target this year',
    'Every time this year',
    'Most of it for 2 years',
    'Steady for 3 years',
  ],
};

function shiftMonths(dateKey: string, months: number): string {
  const date = parseDate(dateKey);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toDateKey(target);
}

// The first day of `periods` rolling periods that end on `endKey`
export function windowStart(
  cadence: HabitCadence,
  endKey: string,
  periods: number,
): string {
  switch (cadence) {
    case 'Day':
      return addDays(endKey, -(periods - 1));
    case 'Week':
      return addDays(endKey, -(7 * periods - 1));
    case 'Month':
      return addDays(shiftMonths(endKey, -periods), 1);
    case 'Year':
      return addDays(shiftMonths(endKey, -12 * periods), 1);
  }
}

// The day a window of `periods` first fits after `createdKey`
function opensOn(
  cadence: HabitCadence,
  createdKey: string,
  periods: number,
): string {
  switch (cadence) {
    case 'Day':
      return addDays(createdKey, periods - 1);
    case 'Week':
      return addDays(createdKey, 7 * periods - 1);
    case 'Month':
      return addDays(shiftMonths(createdKey, periods), -1);
    case 'Year':
      return addDays(shiftMonths(createdKey, 12 * periods), -1);
  }
}

interface WindowCount {
  done: number; // each period counted up to the target
  needed: number;
  missed: number; // not done in periods after creation (can't be made up)
}

function countWindow(
  cadence: HabitCadence,
  target: number,
  dates: string[], // done days, sorted
  createdKey: string,
  endKey: string,
  periods: number,
): WindowCount {
  let done = 0;
  let missed = 0;
  let end = endKey;
  for (let i = 0; i < periods; i++) {
    const start = windowStart(cadence, end, 1);
    const inPeriod = Math.min(
      target,
      dates.filter(d => d >= start && d <= end).length,
    );
    done += inPeriod;
    if (start >= createdKey) missed += target - inPeriod;
    end = addDays(start, -1);
  }
  return { done, needed: target * periods, missed };
}

function shortDate(dateKey: string): string {
  return parseDate(dateKey).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function rating(
  markers: LogEntry[],
  cadence: HabitCadence,
  target: number | undefined,
  createdKey: string,
  todayKey: string,
  frozenDates: string[] = [],
): Rating {
  const dates = [
    ...new Set(
      markers
        .filter(m => m.kind === 'marker' && m.date <= todayKey)
        .map(m => m.date),
    ),
  ].sort();
  const perPeriod = cadence === 'Day' ? 1 : clampCadenceTarget(cadence, target);
  const n = RATING_WINDOW[cadence];
  // "1 day", "3 times"; statuses read "2 more days" and "1 day missed"
  const word = (count: number) =>
    cadence === 'Day'
      ? count === 1
        ? 'day'
        : 'days'
      : count === 1
      ? 'time'
      : 'times';
  const more = (count: number) => `${count} more ${word(count)}`;
  const missedText = (count: number) => `${count} ${word(count)} missed`;
  // Today counts once it's done; until then the windows end yesterday
  const end = dates.includes(todayKey) ? todayKey : addDays(todayKey, -1);
  const count = (periods: number) =>
    countWindow(cadence, perPeriod, dates, createdKey, end, periods);
  const mostOf = (needed: number) => Math.ceil(needed * 0.8);
  const { runs, alive } = streakRuns(markers, cadence, todayKey, frozenDates);

  const items: RatingStar[] = [];
  const earned = (goal: string): RatingStar => ({
    goal,
    state: 'earned',
    status: 'Earned',
  });

  // ★1 a streak is going
  items.push(
    alive
      ? earned('Keep your streak going')
      : {
          goal: 'Keep your streak going',
          state: 'todo',
          status: `1 more ${cadence === 'Day' ? 'day' : 'time'}`,
        },
  );

  // ★2 most of the last n, ★3 all of it
  const recent = count(n);
  items.push(
    recent.done >= mostOf(recent.needed)
      ? earned(GOALS[cadence][0])
      : {
          goal: GOALS[cadence][0],
          state: 'todo',
          status: more(mostOf(recent.needed) - recent.done),
        },
  );
  items.push(
    recent.done >= recent.needed
      ? earned(GOALS[cadence][1])
      : {
          goal: GOALS[cadence][1],
          state: 'todo',
          status:
            recent.missed > 0
              ? missedText(recent.missed)
              : more(recent.needed - recent.done),
        },
  );

  // ★4 most of the last 2n, ★5 most of the last 3n or a long enough streak
  const later = (periods: number, goal: string, extra?: () => boolean) => {
    const opens = opensOn(cadence, createdKey, periods);
    if (todayKey < opens) {
      return {
        goal,
        state: 'locked' as const,
        status: `Opens ${shortDate(opens)}`,
      };
    }
    const window = count(periods);
    if (window.done >= mostOf(window.needed) || extra?.()) return earned(goal);
    return {
      goal,
      state: 'todo' as const,
      status: more(mostOf(window.needed) - window.done),
    };
  };
  items.push(later(2 * n, GOALS[cadence][2]));
  const longRunSince = windowStart(cadence, end, 3 * n);
  items.push(
    later(3 * n, GOALS[cadence][3], () =>
      runs.some(run => run.length >= n * perPeriod && run.end >= longRunSince),
    ),
  );

  return {
    stars: items.filter(item => item.state === 'earned').length,
    items,
  };
}

// A habit's or group's rating: habits by their done days (Hours: target
// met), groups by their own completed days
export function ratingOf(item: Habit | HabitGroup, todayKey: string): Rating {
  const markers = 'type' in item ? habitMarkers(item) : item.history;
  return rating(
    markers,
    item.cadence,
    item.target,
    toDateKey(new Date(item.createdAt)),
    todayKey,
    item.streakFreeze?.frozenDates,
  );
}
