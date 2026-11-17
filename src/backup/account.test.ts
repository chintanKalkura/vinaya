import AsyncStorage from '@react-native-async-storage/async-storage';
import { autoBackup, deleteBackupAndSignOut, signIn, signOut } from './account';
import { loadBackupState, updateBackupState } from './backupState';
import { FakeBackupStore } from './fakeBackupStore';
import { toBackupFile } from './schema';
import {
  revokeGoogleAccess,
  signInWithGoogle,
  signOutOfGoogle,
} from './googleAccount';
import { loadHabits, saveHabits } from '../storage/habitStorage';
import { Habit } from '../types/habit';

jest.mock('./googleAccount', () => ({
  signInWithGoogle: jest.fn(),
  signOutOfGoogle: jest.fn().mockResolvedValue(undefined),
  revokeGoogleAccess: jest.fn().mockResolvedValue(undefined),
  getAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

const ACCOUNT = { name: 'Me', email: 'me@example.com' };

function makeHabit(id: string): Habit {
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
  };
}

function storeWithBackup() {
  const store = new FakeBackupStore();
  store.current = toBackupFile(
    { habits: { a: makeHabit('a') }, habitGroups: {}, tombstones: [] },
    { exportedAt: 0, appVersion: '1.0', deviceId: 'other' },
  );
  return store;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('signIn', () => {
  it('should save the account and restore the backup', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(ACCOUNT);

    const result = await signIn(storeWithBackup());

    expect([result, (await loadBackupState()).account]).toEqual([
      { account: ACCOUNT, added: { habits: 1, groups: 0 } },
      ACCOUNT,
    ]);
  });

  it('should return null and stay signed out when cancelled', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(null);

    expect([await signIn(storeWithBackup()), await loadBackupState()]).toEqual([
      null,
      {},
    ]);
  });

  it('should stay signed in when the restore fails', async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValueOnce(ACCOUNT);
    const store = new FakeBackupStore();
    store.readError = new Error('boom');

    expect(await signIn(store)).toEqual({ account: ACCOUNT, added: null });
  });
});

describe('signOut', () => {
  it('should forget the account and keep the phone data', async () => {
    await updateBackupState({ account: ACCOUNT, lastBackupAt: 1 });
    await saveHabits({ a: makeHabit('a') });

    await signOut();

    expect([await loadBackupState(), Object.keys(await loadHabits())]).toEqual([
      {},
      ['a'],
    ]);
  });
});

describe('deleteBackupAndSignOut', () => {
  it('should delete both files, revoke access and sign out', async () => {
    await updateBackupState({ account: ACCOUNT });
    const store = storeWithBackup();
    store.previous = store.current;

    await deleteBackupAndSignOut(store);

    expect([
      store.current,
      store.previous,
      (revokeGoogleAccess as jest.Mock).mock.calls,
      (signOutOfGoogle as jest.Mock).mock.calls.length,
      await loadBackupState(),
    ]).toEqual([null, null, [[ACCOUNT.email]], 1, {}]);
  });

  it('should keep the phone data', async () => {
    await updateBackupState({ account: ACCOUNT });
    await saveHabits({ a: makeHabit('a') });

    await deleteBackupAndSignOut(storeWithBackup());

    expect(Object.keys(await loadHabits())).toEqual(['a']);
  });
});

describe('autoBackup', () => {
  it('should not back up when signed out', async () => {
    expect(await autoBackup(new FakeBackupStore())).toBe(false);
  });

  it('should back up when signed in and never backed up', async () => {
    await updateBackupState({ account: ACCOUNT });

    expect(await autoBackup(new FakeBackupStore())).toBe(true);
  });
});
