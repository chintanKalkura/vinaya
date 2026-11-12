import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroupStreak, syncGroupCompletion } from './habitGroupService';
import { markHabitDone, unmarkHabitDone } from './habitService';
import {
  loadHabitGroups,
  saveHabitGroups,
  saveHabits,
} from '../storage/habitStorage';
import { Habit } from '../types/habit';
import { HabitGroup, HabitGroupType } from '../types/habitGroup';
import { LogEntry } from '../types/log';
import { addDays } from '../utils/dates';

const TODAY = '2024-06-15';

function marker(date: string): LogEntry {
  return { date, kind: 'marker', value: 1 };
}

function makeHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  return {
    id,
    name: id,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    groupId: 'g',
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
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

async function seed(habits: Habit[], group: HabitGroup) {
  await saveHabits(Object.fromEntries(habits.map(h => [h.id, h])));
  await saveHabitGroups({ [group.id]: group });
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('syncGroupCompletion', () => {
  it('should add today to the group log when the group becomes complete', async () => {
    await seed(
      [makeHabit('a', { recentLog: [marker(TODAY)] }), makeHabit('b')],
      makeGroup('Any'),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([marker(TODAY)]);
    expect(updated?.history).toEqual([marker(TODAY)]);
  });

  it('should not write a duplicate when the group is already logged today', async () => {
    await seed(
      [makeHabit('a', { recentLog: [marker(TODAY)] }), makeHabit('b')],
      makeGroup('Any', {
        recentLog: [marker(TODAY)],
        history: [marker(TODAY)],
      }),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toHaveLength(1);
    expect(updated?.history).toHaveLength(1);
  });

  it("should remove today's entry from the log and history when the group is no longer complete", async () => {
    await seed(
      [makeHabit('a'), makeHabit('b')],
      makeGroup('Any', {
        recentLog: [marker(TODAY)],
        history: [marker(TODAY)],
      }),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([]);
    expect(updated?.history).toEqual([]);
  });

  it('should keep past days when removing today', async () => {
    const yesterday = marker(addDays(TODAY, -1));
    await seed(
      [makeHabit('a'), makeHabit('b')],
      makeGroup('Any', {
        recentLog: [marker(TODAY), yesterday],
        history: [yesterday, marker(TODAY)],
      }),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([yesterday]);
    expect(updated?.history).toEqual([yesterday]);
  });

  it('should not complete a Required group with no required habits', async () => {
    await seed(
      [
        makeHabit('a', { recentLog: [marker(TODAY)] }),
        makeHabit('b', { recentLog: [marker(TODAY)] }),
      ],
      makeGroup('Required', { requiredHabitIds: [] }),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([]);
  });

  it('should not sync Hours groups', async () => {
    await seed(
      [makeHabit('a', { recentLog: [marker(TODAY)] })],
      makeGroup('Hours'),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([]);
  });

  it('should return undefined for an unknown group', async () => {
    await seed([makeHabit('a')], makeGroup('Any'));

    expect(await syncGroupCompletion('missing', TODAY)).toBeUndefined();
  });

  it('should persist the updated group', async () => {
    await seed(
      [makeHabit('a', { recentLog: [marker(TODAY)] }), makeHabit('b')],
      makeGroup('Any'),
    );

    await syncGroupCompletion('g', TODAY);

    expect((await loadHabitGroups()).g.recentLog).toEqual([marker(TODAY)]);
  });
});

describe('marking habits syncs the group log', () => {
  it('should complete a Required group when its last required habit is marked and undo it on unmark', async () => {
    await seed(
      [makeHabit('a'), makeHabit('b')],
      makeGroup('Required', { requiredHabitIds: ['a', 'b'] }),
    );

    await markHabitDone('a', TODAY);
    expect((await loadHabitGroups()).g.recentLog).toEqual([]);

    await markHabitDone('b', TODAY);
    expect((await loadHabitGroups()).g.recentLog).toEqual([marker(TODAY)]);

    await unmarkHabitDone('b', TODAY);
    expect((await loadHabitGroups()).g.recentLog).toEqual([]);
  });

  it('should leave one entry for today after mark, unmark, mark', async () => {
    await seed([makeHabit('a'), makeHabit('b')], makeGroup('Any'));

    await markHabitDone('a', TODAY);
    await unmarkHabitDone('a', TODAY);
    const habit = await markHabitDone('a', TODAY);
    const group = (await loadHabitGroups()).g;

    expect(habit.history).toEqual([marker(TODAY)]);
    expect(group.history).toEqual([marker(TODAY)]);
  });

  it('should not touch groups for a habit with no group', async () => {
    await seed(
      [makeHabit('a', { groupId: undefined })],
      makeGroup('Any', { habitIds: [] }),
    );

    await markHabitDone('a', TODAY);

    expect((await loadHabitGroups()).g.recentLog).toEqual([]);
  });
});

describe('getGroupStreak', () => {
  it('should count consecutive complete days ending today', () => {
    const group = makeGroup('Any', {
      recentLog: [
        marker(TODAY),
        marker(addDays(TODAY, -1)),
        marker(addDays(TODAY, -2)),
      ],
    });

    expect(getGroupStreak(group, TODAY)).toBe(3);
  });

  it('should keep the streak alive through yesterday when today is not complete', () => {
    const group = makeGroup('Any', { recentLog: [marker(addDays(TODAY, -1))] });

    expect(getGroupStreak(group, TODAY)).toBe(1);
  });

  it('should be 0 when yesterday and today are both missing', () => {
    const group = makeGroup('Any', { recentLog: [marker(addDays(TODAY, -2))] });

    expect(getGroupStreak(group, TODAY)).toBe(0);
  });
});
