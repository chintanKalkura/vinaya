import {
  applyFreezes,
  clampFreezeInterval,
  earnFreezes,
  nextBreakDay,
  rebuildFreezeState,
  withAppliedFreezes,
  withEarnedFreezes,
} from './streakFreeze';
import { NO_FREEZE, getStreak } from './cadence';
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

describe('rebuildFreezeState', () => {
  const TODAY_KEY = '2026-11-26';
  const mark = (date: string) => ({ date, kind: 'marker' as const, value: 1 });
  const days = (from: number, to: number) => {
    const out = [];
    for (let i = from; i <= to; i++) out.push(mark(addDays(TODAY_KEY, i)));
    return out;
  };

  it('should earn a freeze every N streak days', () => {
    const state = rebuildFreezeState(
      days(-13, 0),
      'Day',
      7,
      addDays(TODAY_KEY, -13),
      TODAY_KEY,
    );

    expect([state.available, state.earnedAtStreak, state.frozenDates]).toEqual([
      2,
      14,
      [],
    ]);
  });

  it('should use a held freeze on a missed day and keep the run', () => {
    const markers = [...days(-10, -2), mark(TODAY_KEY)];
    const state = rebuildFreezeState(
      markers,
      'Day',
      7,
      addDays(TODAY_KEY, -10),
      TODAY_KEY,
    );

    expect([state.available, state.frozenDates, state.lastUsedOn]).toEqual([
      0,
      [addDays(TODAY_KEY, -1)],
      TODAY_KEY,
    ]);
  });

  it('should give the freeze back when the frozen day gets marked', () => {
    const state = rebuildFreezeState(
      days(-10, 0),
      'Day',
      7,
      addDays(TODAY_KEY, -10),
      TODAY_KEY,
    );

    expect([state.available, state.frozenDates]).toEqual([1, []]);
  });

  it('should end the run when there are no freezes to cover a gap', () => {
    const markers = [...days(-5, -3), ...days(-1, 0)];
    const state = rebuildFreezeState(
      markers,
      'Day',
      7,
      addDays(TODAY_KEY, -5),
      TODAY_KEY,
    );

    expect([state.available, state.earnedAtStreak, state.frozenDates]).toEqual([
      0,
      0,
      [],
    ]);
  });

  it('should match opening the app every day', () => {
    const markers = [...days(-30, -20), ...days(-18, -9), ...days(-6, 0)];
    let daily = NO_FREEZE;
    for (let i = -30; i <= 0; i++) {
      const day = addDays(TODAY_KEY, i);
      const before = markers.filter(m => m.date < day);
      daily = applyFreezes(daily, before, 'Day', day);
      const upTo = markers.filter(m => m.date <= day);
      daily = earnFreezes(
        daily,
        getStreak(upTo, 'Day', day, daily.frozenDates),
        7,
      );
    }

    expect(
      rebuildFreezeState(markers, 'Day', 7, addDays(TODAY_KEY, -30), TODAY_KEY),
    ).toEqual(daily);
  });

  it('should work for Week cadence', () => {
    const markers = ['-20', '-17', '-14', '-11', '-8', '-5', '-2'].map(o =>
      mark(addDays(TODAY_KEY, Number(o))),
    );
    const state = rebuildFreezeState(
      markers,
      'Week',
      3,
      addDays(TODAY_KEY, -20),
      TODAY_KEY,
    );

    expect([state.available, state.earnedAtStreak]).toEqual([2, 6]);
  });

  // The single pass must equal opening the app every day, for every cadence
  describe.each(['Day', 'Week', 'Month', 'Year'] as const)(
    'against the daily loop (%s)',
    cadence => {
      it.each([1, 2, 3, 4, 5, 6])('should match random history %i', seed => {
        let x = seed * 7919;
        const rand = () => {
          x = (x * 16807) % 2147483647;
          return x / 2147483647;
        };
        const span = cadence === 'Year' ? 900 : cadence === 'Month' ? 400 : 150;
        const density = { Day: 0.8, Week: 0.4, Month: 0.12, Year: 0.02 }[
          cadence
        ];
        const markers = [];
        for (let i = -span; i <= 0; i++) {
          if (rand() < density) markers.push(mark(addDays(TODAY_KEY, i)));
        }
        const interval = 1 + Math.floor(rand() * 5);
        let daily = NO_FREEZE;
        for (let i = -span; i <= 0; i++) {
          const day = addDays(TODAY_KEY, i);
          const before = markers.filter(m => m.date < day);
          daily = applyFreezes(daily, before, cadence, day);
          const upTo = markers.filter(m => m.date <= day);
          daily = earnFreezes(
            daily,
            getStreak(upTo, cadence, day, daily.frozenDates),
            interval,
          );
        }

        expect(
          rebuildFreezeState(
            markers,
            cadence,
            interval,
            addDays(TODAY_KEY, -span),
            TODAY_KEY,
          ),
        ).toEqual(daily);
      });
    },
  );

  it('should rebuild three years of daily marks quickly', () => {
    const markers = days(-1095, 0).filter((_, i) => i % 9 !== 0);
    const started = Date.now();
    rebuildFreezeState(markers, 'Day', 7, addDays(TODAY_KEY, -1095), TODAY_KEY);

    expect(Date.now() - started).toBeLessThan(100);
  });
});
