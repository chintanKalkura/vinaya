import {
  cadenceText,
  freezesHeldText,
  groupFactText,
  habitFactText,
} from './subtitleText';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';

const habit = (overrides: Partial<Habit>): Habit => ({
  id: 'h',
  name: 'Run',
  cadence: 'Day',
  type: 'Checkmark',
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: 0,
  recentLog: [],
  history: [],
  ...overrides,
});

const group = (overrides: Partial<HabitGroup>): HabitGroup => ({
  id: 'g',
  name: 'Wind-down',
  cadence: 'Day',
  groupType: 'Any',
  habitIds: [],
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: 0,
  recentLog: [],
  history: [],
  ...overrides,
});

describe('subtitle text', () => {
  it.each([
    ['Day', undefined, 'Daily'],
    ['Week', 3, '3 days a week'],
    ['Week', 1, 'Once a week'],
    ['Month', 10, '10 days a month'],
    ['Year', 50, '50 days a year'],
  ] as const)(
    'should describe %s with target %p as "%s"',
    (cadence, target, text) => {
      expect(cadenceText(cadence, target)).toBe(text);
    },
  );

  it('should add the daily hours for an Hours habit', () => {
    expect(habitFactText(habit({ type: 'Hours', targetHours: 2 }))).toBe(
      'Daily · 2h a day',
    );
  });

  it('should name the group type', () => {
    expect([
      groupFactText(group({ cadence: 'Week', target: 2, groupType: 'All' })),
      groupFactText(group({ groupType: 'Hours', targetHours: 8 })),
    ]).toEqual(['2 days a week · All group', 'Daily · Hours group, 8h a day']);
  });

  it.each([
    [0, '0 freezes held'],
    [1, '1 freeze held'],
    [3, '3 freezes held'],
  ])('should say %i as "%s"', (n, text) => {
    expect(freezesHeldText(n)).toBe(text);
  });
});
