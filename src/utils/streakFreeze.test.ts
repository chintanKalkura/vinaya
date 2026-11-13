import {
  applyFreezes,
  clampFreezeInterval,
  earnFreezes,
  nextBreakDay,
  withAppliedFreezes,
  withEarnedFreezes,
} from './streakFreeze';
import { getStreak } from './cadence';
import { addDays } from './dates';
import { StreakFreezeState } from '../types/habit';
import { LogEntry } from '../types/log';

const DAY_1 = '2024-06-01';

// Day n of the worked examples, day 1 = DAY_1
function day(n: number): string {
  return addDays(DAY_1, n - 1);
}

function markers(...days: number[]): LogEntry[] {
  return days.map(n => ({ date: day(n), kind: 'marker', value: 1 }));
}

function daysRange(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function freeze(overrides: Partial<StreakFreezeState> = {}): StreakFreezeState {
  return { available: 0, earnedAtStreak: 0, frozenDates: [], ...overrides };
}

describe('clampFreezeInterval', () => {
  it('should cap N at 100', () => {
    expect(clampFreezeInterval(250)).toBe(100);
  });

  it('should fall back to the default 7 for a missing or invalid N', () => {
    expect([clampFreezeInterval(undefined), clampFreezeInterval(0)]).toEqual([
      7, 7,
    ]);
  });
});

describe('earnFreezes', () => {
  it('should earn one freeze for a streak of 11 with N 7', () => {
    expect(earnFreezes(freeze(), 11, 7)).toMatchObject({
      available: 1,
      earnedAtStreak: 7,
    });
  });

  it('should not earn a second freeze until the streak reaches 14', () => {
    const at11 = earnFreezes(freeze(), 11, 7);

    expect([
      earnFreezes(at11, 13, 7).available,
      earnFreezes(at11, 14, 7).available,
    ]).toEqual([1, 2]);
  });

  it('should return the same state when nothing is earned', () => {
    const state = freeze({ available: 1, earnedAtStreak: 7 });

    expect(earnFreezes(state, 8, 7)).toBe(state);
  });

  it('should undo the freeze earned today when today is unmarked', () => {
    const earned = earnFreezes(freeze(), 7, 7);

    expect(earnFreezes(earned, 6, 7)).toMatchObject({
      available: 0,
      earnedAtStreak: 0,
    });
  });

  it('should keep freezes held when the streak is 0', () => {
    expect(
      earnFreezes(freeze({ available: 2, earnedAtStreak: 0 }), 0, 7),
    ).toMatchObject({ available: 2, earnedAtStreak: 0 });
  });
});

describe('nextBreakDay', () => {
  it('should be undefined for a Day run marked yesterday', () => {
    expect(
      nextBreakDay(markers(...daysRange(1, 9)), 'Day', day(10), []),
    ).toBeUndefined();
  });

  it('should be the missed day for a Day run', () => {
    expect(nextBreakDay(markers(...daysRange(1, 9)), 'Day', day(11), [])).toBe(
      day(10),
    );
  });

  it('should be undefined when there is no run', () => {
    expect(nextBreakDay([], 'Day', day(11), [])).toBeUndefined();
  });

  it('should be undefined for a Week run on the day one window after its latest mark', () => {
    expect(nextBreakDay(markers(1, 4, 7), 'Week', day(14), [])).toBeUndefined();
  });

  it('should be that last day once it passed without a mark for a Week run', () => {
    expect(nextBreakDay(markers(1, 4, 7), 'Week', day(15), [])).toBe(day(14));
  });

  it('should move one day later for each frozen day of a Week run', () => {
    expect([
      nextBreakDay(markers(1, 4, 7), 'Week', day(15), [day(14)]),
      nextBreakDay(markers(1, 4, 7), 'Week', day(16), [day(14)]),
    ]).toEqual([undefined, day(15)]);
  });
});

describe('applyFreezes', () => {
  it('should freeze a missed Day and keep the streak', () => {
    const marks = markers(...daysRange(1, 9));
    const next = applyFreezes(freeze({ available: 1 }), marks, 'Day', day(11));

    expect([next, getStreak(marks, 'Day', day(11), next.frozenDates)]).toEqual([
      {
        available: 0,
        earnedAtStreak: 0,
        frozenDates: [day(10)],
        lastUsedOn: day(11),
      },
      9,
    ]);
  });

  it('should use only one freeze for one missed day', () => {
    const next = applyFreezes(
      freeze({ available: 3, earnedAtStreak: 7 }),
      markers(...daysRange(1, 9)),
      'Day',
      day(11),
    );

    expect(next.available).toBe(2);
  });

  it('should not add to the streak once the habit is marked again', () => {
    const marks = markers(...daysRange(1, 9));
    const next = applyFreezes(freeze({ available: 1 }), marks, 'Day', day(11));

    expect(
      getStreak([...marks, ...markers(11)], 'Day', day(11), next.frozenDates),
    ).toBe(10);
  });

  it('should use one freeze for each missed day', () => {
    const next = applyFreezes(
      freeze({ available: 2, earnedAtStreak: 7 }),
      markers(...daysRange(1, 9)),
      'Day',
      day(12),
    );

    expect(next.frozenDates).toEqual([day(10), day(11)]);
  });

  it('should end the run and reset earnedAtStreak with too few freezes', () => {
    const marks = markers(...daysRange(1, 9));
    const next = applyFreezes(
      freeze({ available: 1, earnedAtStreak: 7 }),
      marks,
      'Day',
      day(13),
    );

    expect([
      next.available,
      next.earnedAtStreak,
      getStreak(marks, 'Day', day(13), next.frozenDates),
    ]).toEqual([0, 0, 0]);
  });

  it('should reset earnedAtStreak when the run broke with no freezes', () => {
    const next = applyFreezes(
      freeze({ earnedAtStreak: 7 }),
      markers(...daysRange(1, 9)),
      'Day',
      day(12),
    );

    expect(next.earnedAtStreak).toBe(0);
  });

  it('should freeze the missed last day of a Week run and give it one more day', () => {
    const marks = markers(1, 4, 7);
    const next = applyFreezes(freeze({ available: 1 }), marks, 'Week', day(15));

    expect([
      next.frozenDates,
      getStreak(marks, 'Week', day(15), next.frozenDates),
      nextBreakDay(marks, 'Week', day(16), next.frozenDates),
    ]).toEqual([[day(14)], 3, day(15)]);
  });

  it('should not use a freeze on the last day a Week run can still be marked', () => {
    const state = freeze({ available: 1 });

    expect(applyFreezes(state, markers(1, 4, 7), 'Week', day(14))).toBe(state);
  });

  it('should give the same result opened daily or after a gap', () => {
    const marks = markers(...daysRange(1, 9));
    const start = freeze({ available: 3, earnedAtStreak: 7 });
    const daily = [11, 12, 13, 14].reduce(
      (state, n) => applyFreezes(state, marks, 'Day', day(n)),
      start,
    );
    const once = applyFreezes(start, marks, 'Day', day(14));

    expect([daily.available, daily.frozenDates]).toEqual([
      once.available,
      once.frozenDates,
    ]);
  });

  it('should return the same state while the run is alive', () => {
    const state = freeze({ available: 1, earnedAtStreak: 7 });

    expect(
      applyFreezes(state, markers(...daysRange(1, 9)), 'Day', day(10)),
    ).toBe(state);
  });
});

describe('withEarnedFreezes and withAppliedFreezes', () => {
  const item: {
    cadence: 'Day';
    streakFreezeInterval: number;
    streakFreeze?: StreakFreezeState;
  } = { cadence: 'Day', streakFreezeInterval: 7 };

  it('should return the same item when nothing changes', () => {
    expect(withEarnedFreezes(item, markers(1, 2), day(2))).toBe(item);
  });

  it('should store the freeze earned by the streak', () => {
    expect(
      withEarnedFreezes(item, markers(...daysRange(1, 7)), day(7)).streakFreeze,
    ).toEqual(freeze({ available: 1, earnedAtStreak: 7 }));
  });

  it('should store a freeze used today', () => {
    const held = { ...item, streakFreeze: freeze({ available: 1 }) };

    expect(
      withAppliedFreezes(held, markers(...daysRange(1, 9)), day(11))
        .streakFreeze?.lastUsedOn,
    ).toBe(day(11));
  });
});
