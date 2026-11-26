import {
  calendarRangeStart,
  completionRate,
  completionUnits,
  defaultCalendarRange,
  heatSteps,
  heatmap,
  periodStart,
  starRating,
  streakSummary,
  trendAxis,
  trendPoints,
} from './history';
import { getStreak } from './cadence';
import { addDays } from './dates';
import { LogEntry } from '../types/log';

const TODAY = '2026-11-26'; // a Thursday
const mark = (date: string): LogEntry => ({ date, kind: 'marker', value: 1 });
const ago = (n: number) => addDays(TODAY, -n);
const marksAgo = (...offsets: number[]) => offsets.map(n => mark(ago(n)));
const range = (from: number, to: number) => {
  const out: number[] = [];
  for (let i = from; i >= to; i--) out.push(i);
  return out;
};

describe('streakSummary', () => {
  it('should give current, best and previous runs', () => {
    // runs: 3 (ended), 5 (ended), 2 (alive)
    const log = marksAgo(...range(20, 18), ...range(15, 11), 1, 0);

    expect(streakSummary(log, 'Day', TODAY)).toEqual({
      current: 2,
      best: 5,
      previous: 5,
    });
  });

  it('should show the ended run as previous when current is 0', () => {
    expect(streakSummary(marksAgo(...range(8, 5)), 'Day', TODAY)).toEqual({
      current: 0,
      best: 4,
      previous: 4,
    });
  });

  it('should let frozen days bridge a run without adding to it', () => {
    const log = marksAgo(5, 4, 2, 1);

    expect(streakSummary(log, 'Day', TODAY, [ago(3)])).toEqual({
      current: 4,
      best: 4,
      previous: 0,
    });
  });

  it('should be all zero with no marks', () => {
    expect(streakSummary([], 'Week', TODAY)).toEqual({
      current: 0,
      best: 0,
      previous: 0,
    });
  });

  // Current must always equal the banner's streak
  it.each(['Day', 'Week', 'Month', 'Year'] as const)(
    'should match getStreak for %s on random histories',
    cadence => {
      let x = 42;
      const rand = () => (x = (x * 16807) % 2147483647) / 2147483647;
      for (let trial = 0; trial < 20; trial++) {
        const log = range(400, 0)
          .filter(() => rand() < 0.3)
          .map(n => mark(ago(n)));
        const frozen = range(400, 0)
          .filter(() => rand() < 0.03)
          .map(ago);
        expect(streakSummary(log, cadence, TODAY, frozen).current).toBe(
          getStreak(log, cadence, TODAY, frozen),
        );
      }
    },
  );
});

describe('periodStart', () => {
  it.each([
    ['Week', 'monday', '2026-11-23'],
    ['Week', 'sunday', '2026-11-22'],
    ['Month', 'monday', '2026-11-01'],
    ['Year', 'monday', '2026-01-01'],
    ['Day', 'monday', TODAY],
  ] as const)('should start a %s (%s) on %s', (cadence, weekStart, start) => {
    expect(periodStart(cadence, TODAY, weekStart)).toBe(start);
  });
});

describe('completionUnits and completionRate', () => {
  it('should count days since creation, leaving out today until marked', () => {
    const units = completionUnits(
      marksAgo(3, 1),
      'Day',
      undefined,
      ago(4),
      TODAY,
      'monday',
    );

    expect([units.length, completionRate(units)]).toEqual([
      4,
      { done: 2, total: 4, rate: 0.5 },
    ]);
  });

  it('should count today once it is marked', () => {
    const units = completionUnits(
      marksAgo(0),
      'Day',
      undefined,
      ago(1),
      TODAY,
      'monday',
    );

    expect(completionRate(units)).toEqual({ done: 1, total: 2, rate: 0.5 });
  });

  it('should count calendar weeks that met the target', () => {
    // Created Mon 2 Nov. Weeks: 2–8 (3 marks), 9–15 (1), 16–22 (3), 23–29 (current, 1)
    const log = [
      '2026-11-02',
      '2026-11-04',
      '2026-11-06',
      '2026-11-10',
      '2026-11-17',
      '2026-11-18',
      '2026-11-20',
      '2026-11-24',
    ].map(mark);
    const units = completionUnits(
      log,
      'Week',
      3,
      '2026-11-02',
      TODAY,
      'monday',
    );

    expect(units.map(u => [u.start, u.done])).toEqual([
      ['2026-11-02', true],
      ['2026-11-09', false],
      ['2026-11-16', true],
    ]);
  });

  it('should follow the week start', () => {
    const units = completionUnits([], 'Week', 1, '2026-11-01', TODAY, 'sunday');

    expect(units.map(u => u.start)).toEqual([
      '2026-11-01',
      '2026-11-08',
      '2026-11-15',
    ]);
  });

  it('should count a partial first period only if it met the target', () => {
    // Created on a Thursday: the first week is partial
    const missed = completionUnits(
      [],
      'Week',
      2,
      '2026-11-05',
      TODAY,
      'monday',
    );
    const met = completionUnits(
      [mark('2026-11-05'), mark('2026-11-06')],
      'Week',
      2,
      '2026-11-05',
      TODAY,
      'monday',
    );

    expect([missed[0].start, met[0].start]).toEqual([
      '2026-11-09',
      '2026-11-02',
    ]);
  });

  it('should count the current period once it met the target', () => {
    const units = completionUnits(
      marksAgo(2, 1, 0),
      'Week',
      3,
      '2026-11-23',
      TODAY,
      'monday',
    );

    expect(units).toEqual([
      { start: '2026-11-23', end: '2026-11-29', done: true },
    ]);
  });

  it('should use calendar months and years', () => {
    const months = completionUnits(
      [mark('2026-09-10')],
      'Month',
      1,
      '2026-08-01',
      TODAY,
      'monday',
    );
    const years = completionUnits(
      [mark('2025-03-01')],
      'Year',
      1,
      '2024-01-01',
      TODAY,
      'monday',
    );

    expect([months.map(u => u.done), years.map(u => u.done)]).toEqual([
      [false, true, false],
      [false, true],
    ]);
  });

  it('should ignore marks before creation', () => {
    const units = completionUnits(
      marksAgo(10, 1),
      'Day',
      undefined,
      ago(2),
      TODAY,
      'monday',
    );

    expect(completionRate(units).done).toBe(1);
  });

  it('should have no rate before anything counts', () => {
    expect(
      completionRate(
        completionUnits([], 'Day', undefined, TODAY, TODAY, 'monday'),
      ),
    ).toEqual({
      done: 0,
      total: 0,
      rate: null,
    });
  });
});

describe('trendAxis', () => {
  it.each([
    ['Day', 400, 40, 10],
    ['Day', 100, 10, 10],
    ['Day', 73, 5, 10],
    ['Day', 50, 5, 10],
    ['Day', 37, 3, 10],
    ['Day', 12, 1, 10],
    ['Day', 6, 1, 6],
    ['Week', 9, 1, 9],
    ['Week', 19, 1, 10],
    ['Week', 20, 2, 10],
    ['Week', 45, 4, 10],
    ['Week', 80, 8, 10],
    ['Month', 11, 1, 11],
    ['Month', 24, 2, 12],
    ['Month', 40, 3, 12],
    ['Year', 3, 1, 3],
    ['Year', 25, 2, 10],
    ['Day', 0, 1, 0],
  ] as const)(
    'should give %s with %i units a step of %i and %i points',
    (cadence, units, step, points) => {
      expect(trendAxis(cadence, units)).toEqual({ step, points });
    },
  );
});

describe('trendPoints', () => {
  it('should rate each slice on its own, most recent first', () => {
    // 50 days: newest 5 all done, next 5 have 4, next 5 have 5, the rest none
    const units = Array.from({ length: 50 }, (_, i) => {
      const back = 49 - i; // 0 = newest
      const done =
        back < 5 ||
        (back >= 5 && back < 10 && back !== 7) ||
        (back >= 10 && back < 15);
      return { start: ago(back), end: ago(back), done };
    });

    expect(trendPoints(units, 'Day').slice(0, 4)).toEqual([
      { x: 5, rate: 1 },
      { x: 10, rate: 0.8 },
      { x: 15, rate: 1 },
      { x: 20, rate: 0 },
    ]);
  });
});

describe('heatmap', () => {
  it('should share marks by weekday in week-start order', () => {
    // Two weeks from Mon 9 Nov to Sun 22 Nov, marked on both Mondays and one Tuesday
    const log = ['2026-11-09', '2026-11-16', '2026-11-10'].map(mark);
    const slots = heatmap(log, 'Day', '2026-11-09', '2026-11-22', 'monday');

    expect(slots.slice(0, 3)).toEqual([
      { label: 'Mon', share: 1 },
      { label: 'Tue', share: 0.5 },
      { label: 'Wed', share: 0 },
    ]);
  });

  it('should start on Sunday when the week does', () => {
    expect(
      heatmap([], 'Week', ago(10), TODAY, 'sunday').map(s => s.label),
    ).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('should use Wk1–Wk5 for Month habits, with days 29–31 in Wk5', () => {
    const slots = heatmap(
      [mark('2026-10-30')],
      'Month',
      '2026-10-01',
      '2026-11-01',
      'monday',
    );

    expect(slots.map(s => [s.label, s.share])).toEqual([
      ['Wk1', 0],
      ['Wk2', 0],
      ['Wk3', 0],
      ['Wk4', 0],
      ['Wk5', 1 / 3],
    ]);
  });

  it('should use months for Year habits, with no share for months not reached', () => {
    const slots = heatmap([], 'Year', '2026-10-01', TODAY, 'monday');

    expect([slots[0], slots[9].share, slots[11]]).toEqual([
      { label: 'Jan', share: null },
      0,
      { label: 'Dec', share: null },
    ]);
  });

  it('should leave today out until it is marked', () => {
    const unmarked = heatmap([], 'Day', TODAY, TODAY, 'monday');
    const marked = heatmap([mark(TODAY)], 'Day', TODAY, TODAY, 'monday');

    expect([unmarked[3].share, marked[3].share]).toEqual([null, 1]);
  });
});

describe('calendar ranges', () => {
  it.each([
    ['Day', 'week'],
    ['Week', 'week'],
    ['Month', 'month'],
    ['Year', 'month'],
  ] as const)('should default %s habits to %s', (cadence, rangeId) => {
    expect(defaultCalendarRange(cadence)).toBe(rangeId);
  });

  it.each([
    ['week', '2026-11-20'],
    ['month', '2026-10-27'],
    ['3m', '2026-08-27'],
    ['6m', '2026-05-27'],
    ['year', '2025-11-27'],
  ] as const)('should start %s on %s, ending today', (rangeId, start) => {
    expect(calendarRangeStart(rangeId, TODAY)).toBe(start);
  });

  it('should keep a month-end start inside a shorter month', () => {
    expect(calendarRangeStart('month', '2026-03-31')).toBe('2026-03-01');
  });
});

describe('starRating', () => {
  it.each([
    [null, 0],
    [0, 0],
    [0.09, 0],
    [0.1, 1],
    [0.2, 1],
    [0.4, 2],
    [0.6, 3],
    [0.84, 4],
    [0.9, 5],
    [1, 5],
  ])('should give %p a rating of %i stars', (rate, stars) => {
    expect(starRating(rate)).toBe(stars);
  });
});

describe('heatSteps', () => {
  const slots = (...shares: (number | null)[]) =>
    shares.map((share, i) => ({ label: String(i), share }));

  it('should band Day and Week shares in steps of 20%', () => {
    expect(heatSteps(slots(0, 0.19, 0.2, 0.55, 0.79, 0.8, 1), 'Day')).toEqual([
      0, 0, 1, 2, 3, 4, 4,
    ]);
  });

  it('should band Month and Year shares relative to the busiest slot', () => {
    expect(heatSteps(slots(0.03, 0.06, 0.015, null), 'Year')).toEqual([
      2, 4, 1, 0,
    ]);
  });

  it('should leave every step at 0 with no marks', () => {
    expect(heatSteps(slots(0, 0, null), 'Month')).toEqual([0, 0, 0]);
  });
});
