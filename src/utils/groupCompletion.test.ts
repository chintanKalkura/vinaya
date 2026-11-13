import { isGroupComplete, isHabitMarkedToday } from './groupCompletion';
import { Habit } from '../types/habit';
import { HabitGroup, HabitGroupType } from '../types/habitGroup';

const TODAY = '2024-06-15';
const YESTERDAY = '2024-06-14';

function makeHabit(id: string, markedDate?: string): Habit {
  const recentLog = markedDate
    ? [{ date: markedDate, kind: 'marker' as const, value: 1 }]
    : [];
  return {
    id,
    name: id,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog,
    history: recentLog,
  };
}

function makeHoursHabit(
  id: string,
  hours: number,
  date: string = TODAY,
  targetHours: number | undefined = 1,
): Habit {
  const recentLog = [{ date, kind: 'hours' as const, value: hours }];
  return {
    ...makeHabit(id),
    type: 'Hours',
    targetHours,
    recentLog,
    history: recentLog,
  };
}

function makeGroup(
  groupType: HabitGroupType,
  overrides: Partial<HabitGroup> = {},
): HabitGroup {
  return {
    id: 'g',
    name: 'G',
    cadence: 'Day',
    groupType,
    habitIds: ['a', 'b'],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

describe('isGroupComplete', () => {
  it('should be complete for Required when every required habit is marked', () => {
    const group = makeGroup('Required', { requiredHabitIds: ['a'] });
    const habits = [makeHabit('a', TODAY), makeHabit('b')];

    expect(isGroupComplete(group, habits, TODAY)).toBe(true);
  });

  it('should not be complete for Required when a required habit is unmarked', () => {
    const group = makeGroup('Required', { requiredHabitIds: ['a', 'b'] });
    const habits = [makeHabit('a', TODAY), makeHabit('b')];

    expect(isGroupComplete(group, habits, TODAY)).toBe(false);
  });

  it('should not be complete for Required when no habits are required', () => {
    const group = makeGroup('Required', { requiredHabitIds: [] });
    const habits = [makeHabit('a', TODAY), makeHabit('b', TODAY)];

    expect(isGroupComplete(group, habits, TODAY)).toBe(false);
  });

  it('should be complete for Any when one habit is marked today', () => {
    const habits = [makeHabit('a', TODAY), makeHabit('b')];

    expect(isGroupComplete(makeGroup('Any'), habits, TODAY)).toBe(true);
  });

  it('should not be complete for Any when marks are only from yesterday', () => {
    const habits = [makeHabit('a', YESTERDAY), makeHabit('b')];

    expect(isGroupComplete(makeGroup('Any'), habits, TODAY)).toBe(false);
  });

  it('should be complete for All only when every habit is marked', () => {
    const all = [makeHabit('a', TODAY), makeHabit('b', TODAY)];
    const some = [makeHabit('a', TODAY), makeHabit('b')];

    expect(isGroupComplete(makeGroup('All'), all, TODAY)).toBe(true);
    expect(isGroupComplete(makeGroup('All'), some, TODAY)).toBe(false);
  });

  it('should not be complete when the group has no habits', () => {
    expect(isGroupComplete(makeGroup('Any'), [], TODAY)).toBe(false);
  });

  it('should be complete for Hours when total hours today meet the target', () => {
    const habits = [makeHoursHabit('a', 3), makeHoursHabit('b', 2)];
    const group = makeGroup('Hours', { targetHours: 5 });

    expect(isGroupComplete(group, habits, TODAY)).toBe(true);
  });

  it('should not be complete for Hours when total hours today are below the target', () => {
    const habits = [makeHoursHabit('a', 3), makeHoursHabit('b', 1)];
    const group = makeGroup('Hours', { targetHours: 5 });

    expect(isGroupComplete(group, habits, TODAY)).toBe(false);
  });

  it('should not count hours logged on earlier days', () => {
    const habits = [makeHoursHabit('a', 5, YESTERDAY)];
    const group = makeGroup('Hours', { targetHours: 5 });

    expect(isGroupComplete(group, habits, TODAY)).toBe(false);
  });

  it('should not be complete for Hours when the target is 0', () => {
    const habits = [makeHoursHabit('a', 3)];
    const group = makeGroup('Hours', { targetHours: 0 });

    expect(isGroupComplete(group, habits, TODAY)).toBe(false);
  });
});

describe('isHabitMarkedToday', () => {
  it('should mark an Hours habit when hours today meet its target', () => {
    expect(isHabitMarkedToday(makeHoursHabit('a', 2, TODAY, 2), TODAY)).toBe(
      true,
    );
  });

  it('should not mark an Hours habit when hours today are below its target', () => {
    expect(isHabitMarkedToday(makeHoursHabit('a', 1, TODAY, 2), TODAY)).toBe(
      false,
    );
  });

  it('should not mark an Hours habit with no target', () => {
    const habit = { ...makeHoursHabit('a', 1), targetHours: undefined };

    expect(isHabitMarkedToday(habit, TODAY)).toBe(false);
  });
});
