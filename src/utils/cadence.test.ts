import { clampCadenceTarget, getCadenceStatus, windowLength } from './cadence';
import { LogEntry } from '../types/log';
import { addDays } from './dates';

const DAY_1 = '2024-06-01';

// Day n of the worked examples, day 1 = DAY_1
function day(n: number): string {
  return addDays(DAY_1, n - 1);
}

function markers(...days: number[]): LogEntry[] {
  return days.map(n => ({ date: day(n), kind: 'marker', value: 1 }));
}

function weekStatus(marked: number[], today: number, target = 4) {
  return getCadenceStatus(markers(...marked), 'Week', target, day(today));
}

describe('windowLength', () => {
  it('should be 1 day for Day', () => {
    expect(windowLength('Day', '2024-06-15')).toBe(1);
  });

  it('should be 7 days for Week', () => {
    expect(windowLength('Week', '2024-06-15')).toBe(7);
  });

  it.each([
    ['2027-02-10', 28],
    ['2028-02-10', 29],
    ['2024-06-15', 30],
    ['2024-03-10', 31],
  ])('should be the length of the month of %s for Month', (key, days) => {
    expect(windowLength('Month', key)).toBe(days);
  });

  it('should be 365 days for Year in a common year', () => {
    expect(windowLength('Year', '2027-06-15')).toBe(365);
  });

  it('should be 366 days for Year in a leap year', () => {
    expect(windowLength('Year', '2028-06-15')).toBe(366);
  });
});

describe('clampCadenceTarget', () => {
  it('should always be 1 for Day', () => {
    expect(clampCadenceTarget('Day', 5)).toBe(1);
  });

  it.each([
    ['Week', 6],
    ['Month', 20],
    ['Year', 100],
  ] as const)('should cap %s at %i', (cadence, max) => {
    expect(clampCadenceTarget(cadence, 500)).toBe(max);
  });

  it('should raise a missing or low target to 1', () => {
    expect([
      clampCadenceTarget('Week', undefined),
      clampCadenceTarget('Week', 0),
    ]).toEqual([1, 1]);
  });
});

describe('getCadenceStatus', () => {
  describe('complete status (target 4 per week, marked on days 1–4)', () => {
    it.each([4, 5, 6, 7])('should be complete on day %i', today => {
      expect(weekStatus([1, 2, 3, 4], today).complete).toBe(true);
    });

    it('should be incomplete on day 3, before the target is reached', () => {
      expect(weekStatus([1, 2, 3], 3).complete).toBe(false);
    });

    it.each([8, 9, 10, 11])(
      'should be incomplete on day %i once day 1 leaves the window',
      today => {
        const marked = [1, 2, 3, 4, 9, 10, 11].filter(n => n <= today);
        expect(weekStatus(marked, today).complete).toBe(false);
      },
    );

    it('should be complete again on day 12 after marking days 9–12', () => {
      expect(weekStatus([1, 2, 3, 4, 9, 10, 11, 12], 12).complete).toBe(true);
    });
  });

  describe('streak', () => {
    it('should count every marked day in the run (days 1–4 and 9–12 give 8)', () => {
      expect(weekStatus([1, 2, 3, 4, 9, 10, 11, 12], 12).streak).toBe(8);
    });

    it('should stay alive while the latest mark is inside the window', () => {
      expect(weekStatus([1, 2, 3, 4], 10).streak).toBe(4);
    });

    it('should stay alive through the day one window after the latest mark', () => {
      expect(weekStatus([1, 2, 3, 4], 11).streak).toBe(4);
    });

    it('should be 0 the day after that, once a full window passes with no mark', () => {
      expect(weekStatus([1, 2, 3, 4], 12).streak).toBe(0);
    });

    it('should keep a run marked on 1 June alive until 8 June ends', () => {
      const status = (today: string) =>
        getCadenceStatus(markers(1), 'Week', 1, today).streak;

      expect([status('2024-06-08'), status('2024-06-09')]).toEqual([1, 0]);
    });

    it('should break the run at a gap longer than the window', () => {
      expect(weekStatus([1, 2, 10, 12], 12).streak).toBe(2);
    });

    it('should keep the run across a gap of exactly the window length', () => {
      expect(weekStatus([1, 8], 8).streak).toBe(2);
    });

    it('should ignore duplicate marks on the same day', () => {
      expect(weekStatus([3, 3, 4], 4).streak).toBe(2);
    });
  });

  it('should report whether today is marked', () => {
    expect([
      weekStatus([1, 2, 3, 4], 4).markedToday,
      weekStatus([1, 2, 3, 4], 5).markedToday,
    ]).toEqual([true, false]);
  });

  it('should use the month length as the Month window', () => {
    const marks: LogEntry[] = [
      { date: '2024-06-01', kind: 'marker', value: 1 },
      { date: '2024-06-30', kind: 'marker', value: 1 },
    ];

    expect(getCadenceStatus(marks, 'Month', 2, '2024-06-30').complete).toBe(
      true,
    );
  });

  it('should drop a mark older than the Month window', () => {
    const marks: LogEntry[] = [
      { date: '2024-05-31', kind: 'marker', value: 1 },
      { date: '2024-06-30', kind: 'marker', value: 1 },
    ];

    expect(getCadenceStatus(marks, 'Month', 2, '2024-06-30').complete).toBe(
      false,
    );
  });

  describe('Day cadence (unchanged)', () => {
    it('should be complete only when marked today', () => {
      expect([
        getCadenceStatus(markers(5), 'Day', undefined, day(5)).complete,
        getCadenceStatus(markers(4), 'Day', undefined, day(5)).complete,
      ]).toEqual([true, false]);
    });

    it('should keep a streak that ends yesterday', () => {
      expect(
        getCadenceStatus(markers(3, 4), 'Day', undefined, day(5)).streak,
      ).toBe(2);
    });
  });
});

describe('getCadenceStatus with streak freezes', () => {
  const frozen = (dates: string[], lastUsedOn?: string) => ({
    available: 1,
    earnedAtStreak: 0,
    frozenDates: dates,
    lastUsedOn,
  });

  it('should bridge a frozen Day without adding it to the streak', () => {
    const status = getCadenceStatus(
      markers(1, 2, 3, 5),
      'Day',
      undefined,
      day(5),
      frozen([day(4)]),
    );

    expect(status.streak).toBe(4);
  });

  it('should keep a Day streak alive through a frozen yesterday', () => {
    const status = getCadenceStatus(
      markers(1, 2, 3),
      'Day',
      undefined,
      day(5),
      frozen([day(4)]),
    );

    expect(status.streak).toBe(3);
  });

  it('should give a Week run one more day for each frozen day', () => {
    const marked = markers(1, 2, 3, 4);

    expect([
      getCadenceStatus(marked, 'Week', 4, day(12)).streak,
      getCadenceStatus(marked, 'Week', 4, day(12), frozen([day(11)])).streak,
      getCadenceStatus(marked, 'Week', 4, day(13), frozen([day(11)])).streak,
    ]).toEqual([0, 4, 0]);
  });

  it('should bridge a Week gap one day longer than the window', () => {
    const status = getCadenceStatus(
      markers(1, 9),
      'Week',
      4,
      day(9),
      frozen([day(8)]),
    );

    expect(status.streak).toBe(2);
  });

  it('should not count frozen days toward the target', () => {
    const status = getCadenceStatus(
      markers(1, 2, 3),
      'Week',
      4,
      day(5),
      frozen([day(4)]),
    );

    expect(status.complete).toBe(false);
  });

  it('should be frozen today only on the day a freeze was used', () => {
    const state = frozen([day(4)], day(5));

    expect([
      getCadenceStatus(markers(1, 2, 3), 'Day', undefined, day(5), state)
        .frozenToday,
      getCadenceStatus(markers(1, 2, 3, 5), 'Day', undefined, day(6), state)
        .frozenToday,
    ]).toEqual([true, false]);
  });

  it('should not be frozen today when the streak still broke', () => {
    const status = getCadenceStatus(
      markers(1, 2),
      'Day',
      undefined,
      day(5),
      frozen([day(3)], day(5)),
    );

    expect(status.frozenToday).toBe(false);
  });

  it('should report the freezes held', () => {
    expect(
      getCadenceStatus([], 'Day', undefined, day(1), frozen([])).freezesLeft,
    ).toBe(1);
  });
});
