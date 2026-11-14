import {
  DEFAULT_GROUP_DRAFT,
  GROUP_TYPE_DESCRIPTIONS,
  NewHabitGroupDraft,
  assignHabits,
  buildHabitGroup,
  canTakeHabit,
  changeGroupType,
  isGroupDraftValid,
} from './newHabitGroup';
import { HabitType } from '../types/habit';

function draft(
  overrides: Partial<NewHabitGroupDraft> = {},
): NewHabitGroupDraft {
  return {
    ...DEFAULT_GROUP_DRAFT,
    name: 'Morning Routine',
    habitIds: ['run'],
    ...overrides,
  };
}

const TYPES: Record<string, HabitType> = {
  run: 'Checkmark',
  read: 'Checkmark',
  study: 'Hours',
};

describe('DEFAULT_GROUP_DRAFT', () => {
  it('should default to a Day Any group with target 1, freeze 7 and 1 hour', () => {
    expect(DEFAULT_GROUP_DRAFT).toEqual({
      name: '',
      cadence: 'Day',
      target: 1,
      streakFreezeInterval: 7,
      groupType: 'Any',
      habitIds: [],
      requiredHabitIds: [],
      targetHours: 1,
    });
  });
});

describe('GROUP_TYPE_DESCRIPTIONS', () => {
  it('should describe every group type', () => {
    expect(GROUP_TYPE_DESCRIPTIONS).toEqual({
      Required: 'Some habits must be done to complete the group',
      Any: 'Any one habit marks the group complete',
      All: 'Every habit must be done to complete the group',
      Hours: 'Total hours across habits must meet target',
    });
  });
});

describe('canTakeHabit', () => {
  it.each([
    ['Required', 'Checkmark', true],
    ['Any', 'Checkmark', true],
    ['All', 'Checkmark', true],
    ['Hours', 'Checkmark', false],
    ['Required', 'Hours', false],
    ['Hours', 'Hours', true],
  ] as const)('should let a %s group take a %s habit: %s', (g, h, ok) => {
    expect(canTakeHabit(g, h)).toBe(ok);
  });
});

describe('changeGroupType', () => {
  it('should drop habits the new type cannot take', () => {
    expect(
      changeGroupType(draft({ habitIds: ['run', 'study'] }), 'Hours', TYPES)
        .habitIds,
    ).toEqual(['study']);
  });

  it('should clear the required list when leaving Required', () => {
    const required = draft({
      groupType: 'Required',
      habitIds: ['run', 'read'],
      requiredHabitIds: ['run'],
    });

    expect(changeGroupType(required, 'All', TYPES).requiredHabitIds).toEqual(
      [],
    );
  });
});

describe('assignHabits', () => {
  it('should take an unassigned habit off the required list', () => {
    const required = draft({
      groupType: 'Required',
      habitIds: ['run', 'read'],
      requiredHabitIds: ['run', 'read'],
    });

    expect(assignHabits(required, ['read']).requiredHabitIds).toEqual(['read']);
  });
});

describe('isGroupDraftValid', () => {
  it.each([
    ['a valid draft', {}, true],
    ['an empty name', { name: '  ' }, false],
    ['a name over 40 characters', { name: 'x'.repeat(41) }, false],
    ['no habits', { habitIds: [] }, false],
    ['Required with none required', { groupType: 'Required' }, false],
    [
      'Required with one required',
      { groupType: 'Required', requiredHabitIds: ['run'] },
      true,
    ],
    [
      'Required with an unassigned required habit',
      { groupType: 'Required', requiredHabitIds: ['read'] },
      false,
    ],
  ] as const)('should treat %s as valid=%s', (_label, overrides, valid) => {
    expect(
      isGroupDraftValid(draft(overrides as Partial<NewHabitGroupDraft>)),
    ).toBe(valid);
  });
});

describe('buildHabitGroup', () => {
  it('should build a Day Any group with empty logs', () => {
    expect(buildHabitGroup(draft({ name: ' Routine ' }), 'id', 2, 100)).toEqual(
      {
        id: 'id',
        name: 'Routine',
        cadence: 'Day',
        groupType: 'Any',
        habitIds: ['run'],
        streakFreezeInterval: 7,
        status: 'active',
        sortOrder: 2,
        createdAt: 100,
        recentLog: [],
        history: [],
      },
    );
  });

  it.each([
    ['Week', 9, 6],
    ['Month', 25, 20],
    ['Year', 150, 100],
  ] as const)('should clamp a %s target of %i to %i', (cadence, t, out) => {
    expect(
      buildHabitGroup(draft({ cadence, target: t }), 'id', 0, 0).target,
    ).toBe(out);
  });

  it('should store required habits only for Required', () => {
    expect([
      buildHabitGroup(draft({ requiredHabitIds: ['run'] }), 'id', 0, 0)
        .requiredHabitIds,
      buildHabitGroup(
        draft({ groupType: 'Required', requiredHabitIds: ['run'] }),
        'id',
        0,
        0,
      ).requiredHabitIds,
    ]).toEqual([undefined, ['run']]);
  });

  it('should store target hours only for Hours, clamped to 1-24', () => {
    expect([
      buildHabitGroup(draft({ targetHours: 5 }), 'id', 0, 0).targetHours,
      buildHabitGroup(
        draft({ groupType: 'Hours', targetHours: 30 }),
        'id',
        0,
        0,
      ).targetHours,
    ]).toEqual([undefined, 24]);
  });

  it('should clamp the streak freeze interval to 100', () => {
    expect(
      buildHabitGroup(draft({ streakFreezeInterval: 300 }), 'id', 0, 0)
        .streakFreezeInterval,
    ).toBe(100);
  });
});
