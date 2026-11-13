import { addDays } from './dates';
import { calculateStreak, deriveHabitVisualState } from './streak';
import { LogEntry } from '../types/log';

const TODAY = '2024-06-15';
const D1 = addDays(TODAY, -1);
const D2 = addDays(TODAY, -2);

function marker(date: string): LogEntry {
  return { date, kind: 'marker', value: 1 };
}

describe('calculateStreak', () => {
  it('returns 0 when no days are marked', () => {
    expect(calculateStreak([], TODAY)).toBe(0);
  });

  it('returns 1 when only today is marked', () => {
    expect(calculateStreak([marker(TODAY)], TODAY)).toBe(1);
  });

  it('returns 1 when only yesterday is marked and today is not', () => {
    expect(calculateStreak([marker(D1)], TODAY)).toBe(1);
  });

  it('returns 3 for three consecutive marked days ending today', () => {
    expect(
      calculateStreak([marker(TODAY), marker(D1), marker(D2)], TODAY),
    ).toBe(3);
  });

  it('returns 2 for two consecutive marked days ending yesterday', () => {
    expect(calculateStreak([marker(D1), marker(D2)], TODAY)).toBe(2);
  });

  it('returns 0 when the marked day is not today or yesterday', () => {
    expect(calculateStreak([marker(D2)], TODAY)).toBe(0);
  });

  it('returns 1 when today is marked but yesterday has a gap', () => {
    expect(calculateStreak([marker(TODAY), marker(D2)], TODAY)).toBe(1);
  });

  it('returns 2 after marking and unmarking today, preserving the prior streak', () => {
    expect(calculateStreak([marker(D1), marker(D2)], TODAY)).toBe(2);
  });

  it('de-dupes duplicate entries for the same date', () => {
    expect(calculateStreak([marker(TODAY), marker(TODAY)], TODAY)).toBe(1);
  });

  it('ignores entries with kind "hours"', () => {
    const log: LogEntry[] = [{ date: TODAY, kind: 'hours', value: 3 }];
    expect(calculateStreak(log, TODAY)).toBe(0);
  });
});

describe('deriveHabitVisualState', () => {
  it('today marked: habit marked with its streak', () => {
    expect(deriveHabitVisualState([marker(TODAY), marker(D1)], TODAY)).toEqual({
      habitColorState: 'marked',
      streakValue: 2,
    });
  });

  it('today unmarked, yesterday marked: habit unmarked, streak kept', () => {
    expect(deriveHabitVisualState([marker(D1), marker(D2)], TODAY)).toEqual({
      habitColorState: 'unmarked',
      streakValue: 2,
    });
  });

  it('today and yesterday both unmarked: habit unmarked, streak broken', () => {
    expect(deriveHabitVisualState([marker(D2)], TODAY)).toEqual({
      habitColorState: 'unmarked',
      streakValue: 0,
    });
  });
});
