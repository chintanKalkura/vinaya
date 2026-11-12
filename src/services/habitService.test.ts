import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InvalidMarkError,
  markHabitDone,
  unmarkHabitDone,
} from './habitService';
import { saveHabits, loadHabits } from '../storage/habitStorage';
import { Habit } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { addDays } from '../utils/dates';

const TODAY = '2024-06-15';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Drink Water',
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

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('markHabitDone', () => {
  it('adds a marker entry to recentLog and history', async () => {
    await saveHabits({ 'habit-1': makeHabit() });

    const updated = await markHabitDone('habit-1', TODAY);

    expect(updated.recentLog).toEqual([
      { date: TODAY, kind: 'marker', value: 1 },
    ]);
    expect(updated.history).toEqual([
      { date: TODAY, kind: 'marker', value: 1 },
    ]);
  });

  it('is idempotent when called twice for the same day', async () => {
    await saveHabits({ 'habit-1': makeHabit() });

    await markHabitDone('habit-1', TODAY);
    const updated = await markHabitDone('habit-1', TODAY);

    expect(updated.recentLog).toHaveLength(1);
    expect(updated.history).toHaveLength(1);
  });

  it('throws InvalidMarkError for a Week-cadence habit', async () => {
    await saveHabits({ 'habit-1': makeHabit({ cadence: 'Week' }) });

    await expect(markHabitDone('habit-1', TODAY)).rejects.toThrow(
      InvalidMarkError,
    );
  });

  it('throws InvalidMarkError for an Hours-type habit', async () => {
    await saveHabits({ 'habit-1': makeHabit({ type: 'Hours' }) });

    await expect(markHabitDone('habit-1', TODAY)).rejects.toThrow(
      InvalidMarkError,
    );
  });

  it('throws InvalidMarkError for an unknown habit id', async () => {
    await saveHabits({});

    await expect(markHabitDone('missing', TODAY)).rejects.toThrow(
      InvalidMarkError,
    );
  });

  it('persists the updated habit to storage', async () => {
    await saveHabits({ 'habit-1': makeHabit() });

    await markHabitDone('habit-1', TODAY);

    const habits = await loadHabits();
    expect(habits['habit-1'].recentLog).toEqual([
      { date: TODAY, kind: 'marker', value: 1 },
    ]);
  });

  it('caps recentLog at the configured limit, dropping the oldest entry', async () => {
    // newest-first: index 0 is yesterday, last index is the oldest entry
    const full = Array.from(
      { length: DEFAULT_HABIT_LIMITS.recentLogSize },
      (_, i) => ({
        date: addDays(TODAY, -(i + 1)),
        kind: 'marker' as const,
        value: 1,
      }),
    );
    const oldestDate = full[full.length - 1].date;
    await saveHabits({ 'habit-1': makeHabit({ recentLog: full }) });

    const updated = await markHabitDone('habit-1', TODAY);

    expect(updated.recentLog).toHaveLength(DEFAULT_HABIT_LIMITS.recentLogSize);
    expect(updated.recentLog[0].date).toBe(TODAY);
    expect(updated.recentLog.find(e => e.date === oldestDate)).toBeUndefined();
  });
});

describe('unmarkHabitDone', () => {
  it('removes the marker entry from recentLog but leaves history untouched', async () => {
    const entry = { date: TODAY, kind: 'marker' as const, value: 1 };
    await saveHabits({
      'habit-1': makeHabit({ recentLog: [entry], history: [entry] }),
    });

    const updated = await unmarkHabitDone('habit-1', TODAY);

    expect(updated.recentLog).toEqual([]);
    expect(updated.history).toEqual([entry]);
  });

  it('is a no-op when today is not marked', async () => {
    const habit = makeHabit();
    await saveHabits({ 'habit-1': habit });

    const updated = await unmarkHabitDone('habit-1', TODAY);

    expect(updated).toEqual(habit);
  });

  it('throws InvalidMarkError for a non-Day/non-Checkmark habit', async () => {
    await saveHabits({ 'habit-1': makeHabit({ type: 'Hours' }) });

    await expect(unmarkHabitDone('habit-1', TODAY)).rejects.toThrow(
      InvalidMarkError,
    );
  });

  it('round trips with markHabitDone, leaving recentLog unchanged and history with the transient entry', async () => {
    const D1 = { date: '2024-06-14', kind: 'marker' as const, value: 1 };
    const D2 = { date: '2024-06-13', kind: 'marker' as const, value: 1 };
    await saveHabits({
      'habit-1': makeHabit({ recentLog: [D1, D2], history: [D2, D1] }),
    });

    await markHabitDone('habit-1', TODAY);
    const final = await unmarkHabitDone('habit-1', TODAY);

    expect(final.recentLog).toEqual([D1, D2]);
    expect(final.history).toEqual([
      D2,
      D1,
      { date: TODAY, kind: 'marker', value: 1 },
    ]);
  });
});
