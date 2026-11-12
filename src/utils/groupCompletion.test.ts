import { isGroupComplete } from './groupCompletion';
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

  it('should not be complete for Hours groups', () => {
    const habits = [makeHabit('a', TODAY)];

    expect(isGroupComplete(makeGroup('Hours'), habits, TODAY)).toBe(false);
  });
});
