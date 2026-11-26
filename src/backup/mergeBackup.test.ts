import { mergeBackup } from './mergeBackup';
import { BackupData } from '../types/backup';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { LogEntry } from '../types/log';

const NOW = Date.UTC(2026, 10, 17);
const DAY_MS = 24 * 60 * 60 * 1000;

function marker(date: string): LogEntry {
  return { date, kind: 'marker', value: 1 };
}

function hours(date: string, value: number): LogEntry {
  return { date, kind: 'hours', value };
}

function makeHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  const history = overrides.history ?? [];
  return {
    id,
    name: id,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [...history].reverse(),
    ...overrides,
    history,
  };
}

function makeGroup(
  id: string,
  overrides: Partial<HabitGroup> = {},
): HabitGroup {
  return {
    id,
    name: id,
    cadence: 'Day',
    groupType: 'Required',
    habitIds: [],
    requiredHabitIds: [],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

function data(overrides: Partial<BackupData> = {}): BackupData {
  return { habits: {}, habitGroups: {}, tombstones: [], ...overrides };
}

describe('mergeBackup', () => {
  it('should keep an item that is only on the phone', () => {
    const local = data({ habits: { a: makeHabit('a') } });

    expect(mergeBackup(local, data(), NOW).data.habits).toEqual(local.habits);
  });

  it('should add an item that is only in the backup', () => {
    const remote = data({ habits: { a: makeHabit('a') } });

    expect(Object.keys(mergeBackup(data(), remote, NOW).data.habits)).toEqual([
      'a',
    ]);
  });

  it('should put added items after local items, in the backup order', () => {
    const local = data({ habits: { a: makeHabit('a', { sortOrder: 4 }) } });
    const remote = data({
      habits: {
        c: makeHabit('c', { sortOrder: 9 }),
        b: makeHabit('b', { sortOrder: 2 }),
      },
    });

    const { habits } = mergeBackup(local, remote, NOW).data;

    expect([habits.a, habits.b, habits.c].map(h => h.sortOrder)).toEqual([
      4, 5, 6,
    ]);
  });

  it("should keep the phone's fields for an item in both", () => {
    const local = data({ habits: { a: makeHabit('a', { name: 'Run' }) } });
    const remote = data({ habits: { a: makeHabit('a', { name: 'Walk' }) } });

    expect(mergeBackup(local, remote, NOW).data.habits.a.name).toBe('Run');
  });

  // A day unmarked on the phone has no entry there; the backup's entry for it
  // must not bring the mark back
  it('should keep a day unmarked on the phone unmarked', () => {
    const local = data({
      habits: { a: makeHabit('a', { history: [marker('2026-11-14')] }) },
    });
    const remote = data({
      habits: {
        a: makeHabit('a', {
          history: [marker('2026-11-14'), marker('2026-11-16')],
        }),
      },
    });

    expect(mergeBackup(local, remote, NOW).data.habits.a.history).toEqual([
      marker('2026-11-14'),
    ]);
  });

  it("should keep the phone's log, not combine it with the backup's", () => {
    const local = data({
      habits: { a: makeHabit('a', { history: [hours('2026-11-16', 3)] }) },
    });
    const remote = data({
      habits: {
        a: makeHabit('a', {
          history: [marker('2026-11-14'), hours('2026-11-16', 5)],
        }),
      },
    });

    expect(mergeBackup(local, remote, NOW).data.habits.a).toEqual(
      local.habits.a,
    );
  });

  it("should bring a backup-only item's full log", () => {
    const remote = data({
      habits: {
        a: makeHabit('a', {
          history: [marker('2026-11-14'), marker('2026-11-16')],
        }),
      },
    });

    expect(mergeBackup(data(), remote, NOW).data.habits.a.history).toEqual([
      marker('2026-11-14'),
      marker('2026-11-16'),
    ]);
  });

  // Two phones with the same habit: whichever backs up last decides the
  // backup's log, and each phone keeps its own
  it("should let the last phone's log win for a habit on two phones", () => {
    const phoneA = data({
      habits: { a: makeHabit('a', { history: [marker('2026-11-14')] }) },
    });
    const phoneB = data({
      habits: { a: makeHabit('a', { history: [marker('2026-11-15')] }) },
    });

    const afterA = mergeBackup(phoneA, data(), NOW).data;
    const afterB = mergeBackup(phoneB, afterA, NOW).data;

    expect([
      afterB.habits.a.history,
      mergeBackup(phoneA, afterB, NOW).data.habits.a.history,
    ]).toEqual([[marker('2026-11-15')], [marker('2026-11-14')]]);
  });

  it('should not add a backup item deleted on the phone', () => {
    const local = data({
      tombstones: [{ id: 'a', kind: 'habit', deletedAt: NOW }],
    });
    const remote = data({ habits: { a: makeHabit('a') } });

    expect(mergeBackup(local, remote, NOW).data.habits).toEqual({});
  });

  it('should remove a phone item deleted in the backup', () => {
    const local = data({ habitGroups: { g: makeGroup('g') } });
    const remote = data({
      tombstones: [{ id: 'g', kind: 'group', deletedAt: NOW }],
    });

    expect(mergeBackup(local, remote, NOW).data.habitGroups).toEqual({});
  });

  it('should combine tombstones from both sides and drop expired ones', () => {
    const local = data({
      tombstones: [{ id: 'a', kind: 'habit', deletedAt: NOW }],
    });
    const remote = data({
      tombstones: [
        { id: 'b', kind: 'group', deletedAt: NOW },
        { id: 'c', kind: 'habit', deletedAt: NOW - 200 * DAY_MS },
      ],
    });

    expect(
      mergeBackup(local, remote, NOW)
        .data.tombstones.map(t => t.id)
        .sort(),
    ).toEqual(['a', 'b']);
  });

  it('should drop a deleted habit from every group', () => {
    const local = data({
      habits: { a: makeHabit('a') },
      habitGroups: {
        g: makeGroup('g', { habitIds: ['a', 'b'], requiredHabitIds: ['b'] }),
      },
    });
    const remote = data({
      tombstones: [{ id: 'b', kind: 'habit', deletedAt: NOW }],
    });

    const { g } = mergeBackup(local, remote, NOW).data.habitGroups;

    expect([g.habitIds, g.requiredHabitIds]).toEqual([['a'], []]);
  });

  it("should use the phone's settings when it has them", () => {
    const local = data({ settings: { defaultView: 'group' } });
    const remote = data({ settings: { defaultView: 'list' } });

    expect(mergeBackup(local, remote, NOW).data.settings).toEqual({
      defaultView: 'group',
    });
  });

  it("should use the backup's settings when the phone has none", () => {
    const remote = data({ settings: { defaultView: 'list' } });

    expect(mergeBackup(data(), remote, NOW).data.settings).toEqual({
      defaultView: 'list',
    });
  });

  it('should count the habits and groups added from the backup', () => {
    const local = data({ habits: { a: makeHabit('a') } });
    const remote = data({
      habits: { a: makeHabit('a'), b: makeHabit('b'), c: makeHabit('c') },
      habitGroups: { g: makeGroup('g') },
    });

    expect(mergeBackup(local, remote, NOW).added).toEqual({
      habits: 2,
      groups: 1,
    });
  });

  it('should change nothing when the same backup is merged twice', () => {
    const local = data({
      habits: {
        a: makeHabit('a', { history: [marker('2026-11-16')], sortOrder: 1 }),
      },
      tombstones: [{ id: 'x', kind: 'habit', deletedAt: NOW }],
    });
    const remote = data({
      habits: {
        a: makeHabit('a', { history: [marker('2026-11-14')] }),
        b: makeHabit('b', { history: [marker('2026-11-15')] }),
      },
      habitGroups: { g: makeGroup('g', { habitIds: ['a', 'b'] }) },
    });

    const once = mergeBackup(local, remote, NOW).data;

    expect(mergeBackup(once, remote, NOW).data).toEqual(once);
  });
});
