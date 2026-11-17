import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  backupErrorText,
  backupNow,
  maybeAutoBackup,
  restoreFromBackup,
} from './backupService';
import { BackupStoreError } from './BackupStore';
import { FakeBackupStore } from './fakeBackupStore';
import { loadBackupState, updateBackupState } from './backupState';
import { BackupVersionError, toBackupFile } from './schema';
import {
  loadHabitGroups,
  loadHabits,
  saveHabitGroups,
  saveHabits,
} from '../storage/habitStorage';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { BackupData } from '../types/backup';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 10, 17, 12, 0).getTime();
const TODAY = '2026-11-17';

function makeHabit(id: string, overrides: Partial<Habit> = {}): Habit {
  return {
    id,
    name: id,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
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
    groupType: 'All',
    habitIds: [],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

function backupOf(data: Partial<BackupData>) {
  return toBackupFile(
    { habits: {}, habitGroups: {}, tombstones: [], ...data },
    { exportedAt: 0, appVersion: '1.0', deviceId: 'other-phone' },
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('backupNow', () => {
  it('should read, then write the merged data', async () => {
    const store = new FakeBackupStore();
    store.current = backupOf({ habits: { b: makeHabit('b') } });
    await saveHabits({ a: makeHabit('a') });

    await backupNow(store, NOW);

    expect([store.calls, Object.keys(store.current!.habits).sort()]).toEqual([
      ['read', 'write'],
      ['a', 'b'],
    ]);
  });

  it('should merge the backup into the phone as well', async () => {
    const store = new FakeBackupStore();
    store.current = backupOf({ habits: { b: makeHabit('b') } });
    await saveHabits({ a: makeHabit('a') });

    await backupNow(store, NOW);

    expect(Object.keys(await loadHabits()).sort()).toEqual(['a', 'b']);
  });

  it('should keep the previous backup', async () => {
    const store = new FakeBackupStore();
    const old = backupOf({});
    store.current = old;

    await backupNow(store, NOW);

    expect(store.previous).toBe(old);
  });

  it('should record the backup time and clear an old error', async () => {
    await updateBackupState({ lastError: 'old' });

    await backupNow(new FakeBackupStore(), NOW);

    expect(await loadBackupState()).toEqual({ lastBackupAt: NOW });
  });

  it('should re-check groups for today after merging', async () => {
    const store = new FakeBackupStore();
    store.current = backupOf({
      habits: {
        b: makeHabit('b', {
          history: [{ date: TODAY, kind: 'marker', value: 1 }],
          recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
        }),
      },
    });
    await saveHabitGroups({ g: makeGroup('g', { habitIds: ['b'] }) });

    await backupNow(store, NOW);

    expect((await loadHabitGroups()).g.history).toEqual([
      { date: TODAY, kind: 'marker', value: 1 },
    ]);
  });

  it('should leave the phone unchanged and record the error when the download fails', async () => {
    const store = new FakeBackupStore();
    store.readError = new BackupStoreError('offline', 'no network');
    await saveHabits({ a: makeHabit('a') });

    await expect(backupNow(store, NOW)).rejects.toThrow('no network');
    expect([
      Object.keys(await loadHabits()),
      (await loadBackupState()).lastError,
    ]).toEqual([
      ['a'],
      "Couldn't reach Google Drive. Will try again next time.",
    ]);
  });

  it('should not record a backup time when the upload fails', async () => {
    const store = new FakeBackupStore();
    store.writeError = new BackupStoreError('full', 'quota');

    await expect(backupNow(store, NOW)).rejects.toThrow('quota');
    expect(await loadBackupState()).toEqual({
      lastError: 'Your Google Drive is full.',
    });
  });
});

describe('maybeAutoBackup', () => {
  it('should back up when the last backup was 7 days ago', async () => {
    await updateBackupState({ lastBackupAt: NOW - 7 * DAY_MS });

    expect(await maybeAutoBackup(new FakeBackupStore(), true, NOW)).toBe(true);
  });

  it('should not back up when the last backup was 6 days ago', async () => {
    await updateBackupState({ lastBackupAt: NOW - 6 * DAY_MS });

    expect(await maybeAutoBackup(new FakeBackupStore(), true, NOW)).toBe(false);
  });

  it('should back up when there has never been a backup', async () => {
    expect(await maybeAutoBackup(new FakeBackupStore(), true, NOW)).toBe(true);
  });

  it('should not back up when signed out', async () => {
    expect(await maybeAutoBackup(new FakeBackupStore(), false, NOW)).toBe(
      false,
    );
  });

  it('should fail quietly and record the error', async () => {
    const store = new FakeBackupStore();
    store.readError = new Error('boom');

    await maybeAutoBackup(store, true, NOW);

    expect((await loadBackupState()).lastError).toBe(
      'Backup failed. Will try again next time.',
    );
  });
});

describe('restoreFromBackup', () => {
  it('should return null when there is no backup', async () => {
    expect(await restoreFromBackup(new FakeBackupStore(), NOW)).toBeNull();
  });

  it('should merge the backup and count what was added', async () => {
    const store = new FakeBackupStore();
    store.current = backupOf({
      habits: { a: makeHabit('a'), b: makeHabit('b') },
      habitGroups: { g: makeGroup('g', { habitIds: ['a'] }) },
    });

    expect(await restoreFromBackup(store, NOW)).toEqual({
      habits: 2,
      groups: 1,
    });
  });

  it('should not bring back a habit deleted on the phone', async () => {
    const store = new FakeBackupStore();
    store.current = backupOf({ habits: { a: makeHabit('a') } });
    await AsyncStorage.setItem(
      'tombstones_v2',
      JSON.stringify({ a: { id: 'a', kind: 'habit', deletedAt: NOW } }),
    );

    await restoreFromBackup(store, NOW);

    expect(await loadHabits()).toEqual({});
  });

  it('should change nothing on the phone when the download fails', async () => {
    const store = new FakeBackupStore();
    store.readError = new BackupStoreError('unauthorized', 'revoked');
    await saveHabits({ a: makeHabit('a') });

    await expect(restoreFromBackup(store, NOW)).rejects.toThrow('revoked');
    expect(Object.keys(await loadHabits())).toEqual(['a']);
  });
});

describe('backupErrorText', () => {
  it('should explain revoked access', () => {
    expect(backupErrorText(new BackupStoreError('unauthorized', 'x'))).toBe(
      'Vinaya no longer has access to your Google Drive. Sign in again.',
    );
  });

  it('should pass on the newer-version message', () => {
    expect(backupErrorText(new BackupVersionError('Update the app'))).toBe(
      'Update the app',
    );
  });
});
