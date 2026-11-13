import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroupStatus, syncGroupCompletion } from './habitGroupService';
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

  it('should add a marker when an Hours group meets its target', async () => {
    await seed(
      [
        makeHabit('a', {
          type: 'Hours',
          recentLog: [{ date: TODAY, kind: 'hours', value: 3 }],
        }),
      ],
      makeGroup('Hours', { targetHours: 3 }),
    );

    const updated = await syncGroupCompletion('g', TODAY);

    expect(updated?.recentLog).toEqual([marker(TODAY)]);
  });

  it('should remove the marker when an Hours group drops below its target', async () => {
    await seed(
      [
        makeHabit('a', {
          type: 'Hours',
          recentLog: [{ date: TODAY, kind: 'hours', value: 2 }],
        }),
      ],
      makeGroup('Hours', {
        targetHours: 3,
        recentLog: [marker(TODAY)],
        history: [marker(TODAY)],
      }),
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

describe('getGroupStatus', () => {
  const dayGroup = (log: LogEntry[]) =>
    makeGroup('Any', { recentLog: log, history: log });
  const weekGroup = (daysAgo: number[]) => {
    const log = daysAgo.map(d => marker(addDays(TODAY, -d)));
    return makeGroup('Any', {
      cadence: 'Week',
      target: 2,
      recentLog: log,
      history: log,
    });
  };

  it('should count consecutive complete days ending today for a Day group', () => {
    const group = dayGroup([
      marker(TODAY),
      marker(addDays(TODAY, -1)),
      marker(addDays(TODAY, -2)),
    ]);

    expect(getGroupStatus(group, TODAY).streak).toBe(3);
  });

  it('should keep a Day group streak alive through yesterday', () => {
    expect(
      getGroupStatus(dayGroup([marker(addDays(TODAY, -1))]), TODAY).streak,
    ).toBe(1);
  });

  it('should break a Day group streak when yesterday and today are missing', () => {
    expect(
      getGroupStatus(dayGroup([marker(addDays(TODAY, -2))]), TODAY).streak,
    ).toBe(0);
  });

  it('should complete a Week group when its complete days in the window meet the target', () => {
    expect(getGroupStatus(weekGroup([1, 5]), TODAY).complete).toBe(true);
  });

  it('should not complete a Week group below its target', () => {
    expect(getGroupStatus(weekGroup([1, 8]), TODAY).complete).toBe(false);
  });

  it('should count every complete day in the run as the Week group streak', () => {
    expect(getGroupStatus(weekGroup([1, 5, 9]), TODAY).streak).toBe(3);
  });
});
