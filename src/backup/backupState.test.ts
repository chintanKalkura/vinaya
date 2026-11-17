import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceId, loadBackupState, updateBackupState } from './backupState';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('backupState', () => {
  it('should read as empty before anything is saved', async () => {
    expect(await loadBackupState()).toEqual({});
  });

  it('should read as empty when the saved state is unreadable', async () => {
    await AsyncStorage.setItem('backup_state_v1', '{');

    expect(await loadBackupState()).toEqual({});
  });

  it('should merge updates and remove fields set to undefined', async () => {
    await updateBackupState({ lastBackupAt: 1, lastError: 'x' });
    await updateBackupState({ lastError: undefined });

    expect(await loadBackupState()).toEqual({ lastBackupAt: 1 });
  });
});

describe('getDeviceId', () => {
  it('should return the same id every time', async () => {
    const first = await getDeviceId();

    expect(await getDeviceId()).toBe(first);
  });
});
