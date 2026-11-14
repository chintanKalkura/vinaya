import {
  DEFAULT_DRAFT,
  NewHabitDraft,
  buildHabit,
  canJoinGroup,
  isDraftValid,
} from './newHabit';
import { HabitGroup, HabitGroupType } from '../types/habitGroup';

function draft(overrides: Partial<NewHabitDraft> = {}): NewHabitDraft {
  return { ...DEFAULT_DRAFT, name: 'Morning run', ...overrides };
}

function group(groupType: HabitGroupType): HabitGroup {
  return {
    id: 'g',
    name: 'G',
    cadence: 'Day',
    groupType,
    habitIds: [],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };
}

describe('DEFAULT_DRAFT', () => {
  it('should default to a Day Checkmark habit with target 1, freeze 7 and 1 hour', () => {
    expect(DEFAULT_DRAFT).toEqual({
      name: '',
      cadence: 'Day',
      target: 1,
      streakFreezeInterval: 7,
      type: 'Checkmark',
      targetHours: 1,
    });
  });
});

describe('isDraftValid', () => {
  it.each([
    ['', false],
    ['   ', false],
    ['Run', true],
    ['  Run  ', true],
    ['x'.repeat(40), true],
    ['x'.repeat(41), false],
  ])('should treat "%s" as valid=%s', (name, valid) => {
    expect(isDraftValid(draft({ name }))).toBe(valid);
  });
});

describe('canJoinGroup', () => {
  it.each([
    ['Checkmark', 'Required', true],
    ['Checkmark', 'Any', true],
    ['Checkmark', 'All', true],
    ['Checkmark', 'Hours', false],
    ['Hours', 'Required', false],
    ['Hours', 'Any', false],
    ['Hours', 'All', false],
    ['Hours', 'Hours', true],
  ] as const)('should let a %s habit join a %s group: %s', (type, gt, ok) => {
    expect(canJoinGroup(type, group(gt))).toBe(ok);
  });
});

describe('buildHabit', () => {
  it('should trim the name and start with empty logs', () => {
    expect(buildHabit(draft({ name: '  Run ' }), 'id', 3, 100)).toEqual({
      id: 'id',
      name: 'Run',
      cadence: 'Day',
      type: 'Checkmark',
      streakFreezeInterval: 7,
      status: 'active',
      sortOrder: 3,
      createdAt: 100,
      recentLog: [],
      history: [],
    });
  });

  it('should store no target for Day', () => {
    expect(buildHabit(draft({ target: 4 }), 'id', 0, 0).target).toBeUndefined();
  });

  it.each([
    ['Week', 9, 6],
    ['Month', 25, 20],
    ['Year', 150, 100],
    ['Week', 0, 1],
  ] as const)('should clamp a %s target of %i to %i', (cadence, t, out) => {
    expect(buildHabit(draft({ cadence, target: t }), 'id', 0, 0).target).toBe(
      out,
    );
  });

  it('should store target hours only for Hours, clamped to 1-24', () => {
    expect([
      buildHabit(draft({ targetHours: 5 }), 'id', 0, 0).targetHours,
      buildHabit(draft({ type: 'Hours', targetHours: 30 }), 'id', 0, 0)
        .targetHours,
      buildHabit(draft({ type: 'Hours', targetHours: 0 }), 'id', 0, 0)
        .targetHours,
    ]).toEqual([undefined, 24, 1]);
  });

  it('should clamp the streak freeze interval to 100', () => {
    expect(
      buildHabit(draft({ streakFreezeInterval: 500 }), 'id', 0, 0)
        .streakFreezeInterval,
    ).toBe(100);
  });

  it('should keep the group id', () => {
    expect(buildHabit(draft({ groupId: 'g' }), 'id', 0, 0).groupId).toBe('g');
  });
});
