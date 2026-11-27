import { rating, windowStart } from './rating';
import { addDays } from './dates';
import { LogEntry } from '../types/log';

const TODAY = '2026-11-26';
const mark = (date: string): LogEntry => ({ date, kind: 'marker', value: 1 });
const daysAgo = (...offsets: number[]) =>
  offsets.map(n => mark(addDays(TODAY, -n)));
const range = (from: number, to: number) => {
  const out: number[] = [];
  for (let i = from; i >= to; i--) out.push(i);
  return out;
};
const LONG_AGO = '2026-01-01';
const states = (r: ReturnType<typeof rating>) => r.items.map(i => i.state);

describe('rating, daily habits', () => {
  it('should give all five stars for every day of the last 3 weeks', () => {
    const r = rating(
      daysAgo(...range(20, 0)),
      'Day',
      undefined,
      LONG_AGO,
      TODAY,
    );

    expect([r.stars, r.items.map(i => i.goal)]).toEqual([
      5,
      [
        'Keep your streak going',
        'Most days this week',
        'Every day this week',
        'Most days for 2 weeks',
        'Steady for 3 weeks',
      ],
    ]);
  });

  it('should count a missed day against "Every day this week" only', () => {
    const r = rating(
      daysAgo(...range(20, 0).filter(n => n !== 3)),
      'Day',
      undefined,
      LONG_AGO,
      TODAY,
    );

    expect([r.stars, r.items[2]]).toEqual([
      4,
      { goal: 'Every day this week', state: 'todo', status: '1 day missed' },
    ]);
  });

  it('should leave today out until it is done', () => {
    const r = rating(
      daysAgo(...range(20, 1)),
      'Day',
      undefined,
      LONG_AGO,
      TODAY,
    );

    expect(r.stars).toBe(5);
  });

  it('should build a new habit up star by star, out of the full window', () => {
    const created = addDays(TODAY, -2);
    const r = rating(daysAgo(2, 1, 0), 'Day', undefined, created, TODAY);

    expect(r.items.map(i => [i.state, i.status])).toEqual([
      ['earned', 'Earned'],
      ['todo', '3 more days'],
      ['todo', '4 more days'],
      ['locked', 'Opens 7 Dec'],
      ['locked', 'Opens 14 Dec'],
    ]);
  });

  it('should earn ★2 on day 6 and ★3 on day 7 of a new habit', () => {
    const day = (k: number) => {
      const created = addDays(TODAY, -(k - 1));
      return rating(
        daysAgo(...range(k - 1, 0)),
        'Day',
        undefined,
        created,
        TODAY,
      ).stars;
    };

    expect([day(1), day(5), day(6), day(7), day(14), day(21)]).toEqual([
      1, 1, 2, 3, 4, 5,
    ]);
  });

  it('should not count marks from before the habit was created', () => {
    const r = rating(daysAgo(...range(10, 0)), 'Day', undefined, TODAY, TODAY);

    expect(states(r).slice(0, 3)).toEqual(['earned', 'todo', 'todo']);
  });

  it('should take "Most days for 2 weeks" over the whole 14 days', () => {
    // This week 7 of 7, the week before 5 of 7: 12 of 14 together
    const log = daysAgo(...range(6, 0), 7, 8, 9, 10, 11);
    const r = rating(log, 'Day', undefined, LONG_AGO, TODAY);

    expect(r.items[3].state).toBe('earned');
  });

  it('should earn ★5 from a 7-day streak within the last 21 days', () => {
    // 7 in a row 15–9 days ago, little since: under 80% of 21 days
    const log = daysAgo(...range(15, 9), 2);
    const r = rating(log, 'Day', undefined, LONG_AGO, TODAY);

    expect([r.items[4].state, r.items[3].state]).toEqual(['earned', 'todo']);
  });

  it('should not count a long streak that ended before the window', () => {
    const log = daysAgo(...range(40, 25), 2);

    expect(rating(log, 'Day', undefined, LONG_AGO, TODAY).items[4].state).toBe(
      'todo',
    );
  });

  it('should treat frozen days as not done but let them carry the streak', () => {
    const log = daysAgo(...range(20, 2), 0);
    const r = rating(log, 'Day', undefined, LONG_AGO, TODAY, [
      addDays(TODAY, -1),
    ]);

    expect([r.items[0].state, r.items[2].status]).toEqual([
      'earned',
      '1 day missed',
    ]);
  });

  it('should say what is left for a todo star', () => {
    const r = rating(daysAgo(0, 1, 2), 'Day', undefined, LONG_AGO, TODAY);

    expect(r.items[1]).toEqual({
      goal: 'Most days this week',
      state: 'todo',
      status: '3 more days',
    });
  });
});

describe('rating, other cadences', () => {
  it('should count times against the target, each week up to it', () => {
    // 3 a week; 6 in the newest week can't cover the empty one before it
    const log = daysAgo(0, 1, 2, 3, 4, 5, 15, 16, 17, 22, 23, 24);
    const r = rating(log, 'Week', 3, LONG_AGO, TODAY);

    expect([r.items[1].goal, r.items[1].state, r.items[1].status]).toEqual([
      'Most of your target this month',
      'todo',
      '1 more time',
    ]);
  });

  it('should use the cadence wording', () => {
    expect([
      rating([], 'Month', 2, LONG_AGO, TODAY).items[4].goal,
      rating([], 'Year', 5, LONG_AGO, TODAY).items[3].goal,
    ]).toEqual(['Steady for 9 months', 'Most of it for 2 years']);
  });

  it('should lock ★4 and ★5 of a young yearly habit', () => {
    expect(states(rating([], 'Year', 5, '2026-03-01', TODAY))).toEqual([
      'todo',
      'todo',
      'todo',
      'locked',
      'locked',
    ]);
  });
});

describe('windowStart', () => {
  it.each([
    ['Day', 7, '2026-11-20'],
    ['Week', 4, '2026-10-30'],
    ['Month', 3, '2026-08-27'],
    ['Year', 1, '2025-11-27'],
  ] as const)('should start %s × %i on %s', (cadence, periods, start) => {
    expect(windowStart(cadence, TODAY, periods)).toBe(start);
  });

  it('should keep a month-end inside a shorter month', () => {
    expect(windowStart('Month', '2026-03-31', 1)).toBe('2026-03-01');
  });
});
