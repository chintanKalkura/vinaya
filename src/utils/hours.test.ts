import { clampHours, getHoursToday } from './hours';
import { Habit } from '../types/habit';

const TODAY = '2024-06-15';
const YESTERDAY = '2024-06-14';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'study',
    name: 'Study',
    cadence: 'Day',
    type: 'Hours',
    targetHours: 1,
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

describe('clampHours', () => {
  it('should keep values within 0 and 24', () => {
    expect(clampHours(5)).toBe(5);
  });

  it('should cap values above 24 at 24', () => {
    expect(clampHours(30)).toBe(24);
  });

  it('should raise negative values to 0', () => {
    expect(clampHours(-2)).toBe(0);
  });

  it('should round to a whole number', () => {
    expect(clampHours(2.6)).toBe(3);
  });

  it('should treat non-numbers as 0', () => {
    expect(clampHours(NaN)).toBe(0);
  });
});

describe('getHoursToday', () => {
  it("should return today's logged hours", () => {
    const habit = makeHabit({
      recentLog: [{ date: TODAY, kind: 'hours', value: 3 }],
    });

    expect(getHoursToday(habit, TODAY)).toBe(3);
  });

  it('should return 0 when only earlier days are logged', () => {
    const habit = makeHabit({
      recentLog: [{ date: YESTERDAY, kind: 'hours', value: 3 }],
    });

    expect(getHoursToday(habit, TODAY)).toBe(0);
  });
});
