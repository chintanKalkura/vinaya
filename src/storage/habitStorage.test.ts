import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StorageReadError,
  StorageWriteError,
  loadHabitGroups,
  loadHabits,
  saveHabits,
  withStorageQueue,
} from './habitStorage';

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe('loadHabits', () => {
  it('should return an empty store when nothing is saved', async () => {
    expect(await loadHabits()).toEqual({});
  });

  it('should throw StorageReadError when the read fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('io'));

    await expect(loadHabits()).rejects.toBeInstanceOf(StorageReadError);
  });

  it('should throw StorageReadError when the data is not valid JSON', async () => {
    await AsyncStorage.setItem('habits_v2', '{not json');

    await expect(loadHabits()).rejects.toBeInstanceOf(StorageReadError);
  });

  it('should copy unparseable data to a backup key before throwing', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123);
    await AsyncStorage.setItem('habits_v2', '{not json');

    await loadHabits().catch(() => {});

    expect(await AsyncStorage.getItem('habits_v2_corrupt_123')).toBe(
      '{not json',
    );
  });
});

describe('loadHabitGroups', () => {
  it('should throw StorageReadError when the data is not valid JSON', async () => {
    await AsyncStorage.setItem('habit_groups_v2', '[');

    await expect(loadHabitGroups()).rejects.toBeInstanceOf(StorageReadError);
  });
});

describe('saveHabits', () => {
  it('should throw StorageWriteError when the write fails', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('io'));

    await expect(saveHabits({})).rejects.toBeInstanceOf(StorageWriteError);
  });
});

describe('withStorageQueue', () => {
  it('should run operations one at a time in order', async () => {
    const events: string[] = [];
    const op = (name: string) => async () => {
      events.push(`${name} start`);
      await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
      events.push(`${name} end`);
    };

    await Promise.all([withStorageQueue(op('a')), withStorageQueue(op('b'))]);

    expect(events).toEqual(['a start', 'a end', 'b start', 'b end']);
  });

  it('should keep running operations after one fails', async () => {
    const failed = withStorageQueue(() => Promise.reject(new Error('x')));
    const next = withStorageQueue(() => Promise.resolve('ok'));

    await expect(failed).rejects.toThrow('x');
    expect(await next).toBe('ok');
  });
});
