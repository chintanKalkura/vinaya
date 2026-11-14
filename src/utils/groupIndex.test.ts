import { groupIdsByHabit } from './groupIndex';
import { HabitGroup } from '../types/habitGroup';

function group(id: string, sortOrder: number, habitIds: string[]): HabitGroup {
  return {
    id,
    name: id,
    cadence: 'Day',
    groupType: 'Any',
    habitIds,
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder,
    createdAt: 0,
    recentLog: [],
    history: [],
  };
}

describe('groupIdsByHabit', () => {
  const groups = [
    group('wind-down', 2, ['read', 'meditate']),
    group('precepts', 1, ['read', 'no-killing']),
  ];

  it('should list every group a habit is in, in group sort order', () => {
    expect(groupIdsByHabit(groups).read).toEqual(['precepts', 'wind-down']);
  });

  it('should list one group for a habit in one group', () => {
    expect(groupIdsByHabit(groups).meditate).toEqual(['wind-down']);
  });

  it('should leave out a habit in no group', () => {
    expect(groupIdsByHabit(groups).swim).toBeUndefined();
  });

  it('should accept groups keyed by id', () => {
    expect(
      groupIdsByHabit(Object.fromEntries(groups.map(g => [g.id, g]))).read,
    ).toEqual(['precepts', 'wind-down']);
  });
});
