import {
  DEFAULT_DRAFT,
  NewHabitDraft,
  buildHabit,
  canJoinGroup,
  draftFromHabit,
  isDraftChanged,
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
      colour: 'orange',
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
    ['Hours', 'Required', true],
    ['Hours', 'Any', true],
    ['Hours', 'All', true],
    ['Hours', 'Hours', true],
  ] as const)('should let a %s habit join a %s group: %s', (type, gt, ok) => {
    expect(canJoinGroup(type, group(gt))).toBe(ok);
  });
});

describe('completion colour', () => {
  it('should store a colour other than orange and load it back', () => {
    const built = buildHabit(draft({ colour: 'purple' }), 'p', 0, 0);

    expect([built.colour, draftFromHabit(built).colour]).toEqual([
      'purple',
      'purple',
    ]);
  });

  it('should store no colour for orange, and read a missing colour as orange', () => {
    const built = buildHabit(draft({ colour: 'orange' }), 'o', 0, 0);

    expect(['colour' in built, draftFromHabit(built).colour]).toEqual([
      false,
      'orange',
    ]);
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

  it('should not store the group on the habit', () => {
    expect(buildHabit(draft({ groupId: 'g' }), 'id', 0, 0)).not.toHaveProperty(
      'groupId',
    );
  });
});

describe('draftFromHabit and isDraftChanged', () => {
  const habit = buildHabit(
    draft({
      name: 'Run',
      cadence: 'Week',
      target: 3,
      type: 'Hours',
      targetHours: 2,
    }),
    'run',
    0,
    0,
  );

  it('should load a saved habit into a draft', () => {
    expect(draftFromHabit(habit)).toEqual({
      name: 'Run',
      cadence: 'Week',
      target: 3,
      streakFreezeInterval: 7,
      type: 'Hours',
      targetHours: 2,
      colour: 'orange',
    });
  });

  it('should default the target to 1 for a Day habit', () => {
    expect(draftFromHabit(buildHabit(draft(), 'd', 0, 0)).target).toBe(1);
  });

  it('should treat the loaded draft and a trimmed name as unchanged', () => {
    const saved = draftFromHabit(habit);

    expect([
      isDraftChanged(saved, saved),
      isDraftChanged(saved, { ...saved, name: ' Run ' }),
    ]).toEqual([false, false]);
  });

  it.each([
    ['name', { name: 'Swim' }],
    ['cadence', { cadence: 'Month' }],
    ['target', { target: 4 }],
    ['streak freeze', { streakFreezeInterval: 3 }],
    ['daily target hours', { targetHours: 5 }],
    ['colour', { colour: 'green' }],
  ] as const)('should notice a changed %s', (_label, change) => {
    const saved = draftFromHabit(habit);

    expect(isDraftChanged(saved, { ...saved, ...change })).toBe(true);
  });
});
