import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InvalidMarkError,
  markHabitDone,
  setHabitHours,
  unmarkHabitDone,
} from './habitService';
import {
  saveHabits,
  loadHabits,
  loadHabitGroups,
  saveHabitGroups,
} from '../storage/habitStorage';
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

  it.each(['Week', 'Month', 'Year'] as const)(
    'marks a %s-cadence habit for today',
    async cadence => {
      await saveHabits({ 'habit-1': makeHabit({ cadence, target: 2 }) });

      const updated = await markHabitDone('habit-1', TODAY);

      expect(updated.history).toEqual([
        { date: TODAY, kind: 'marker', value: 1 },
      ]);
    },
  );

  it('unmarks a Week-cadence habit', async () => {
    await saveHabits({ 'habit-1': makeHabit({ cadence: 'Week', target: 2 }) });

    await markHabitDone('habit-1', TODAY);
    const updated = await unmarkHabitDone('habit-1', TODAY);

    expect(updated.history).toEqual([]);
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
  it('removes the marker entry from both recentLog and history', async () => {
    const entry = { date: TODAY, kind: 'marker' as const, value: 1 };
    await saveHabits({
      'habit-1': makeHabit({ recentLog: [entry], history: [entry] }),
    });

    const updated = await unmarkHabitDone('habit-1', TODAY);

    expect(updated.recentLog).toEqual([]);
    expect(updated.history).toEqual([]);
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

  it('round trips with markHabitDone, leaving recentLog and history unchanged', async () => {
    const D1 = { date: '2024-06-14', kind: 'marker' as const, value: 1 };
    const D2 = { date: '2024-06-13', kind: 'marker' as const, value: 1 };
    await saveHabits({
      'habit-1': makeHabit({ recentLog: [D1, D2], history: [D2, D1] }),
    });

    await markHabitDone('habit-1', TODAY);
    const final = await unmarkHabitDone('habit-1', TODAY);

    expect(final.recentLog).toEqual([D1, D2]);
    expect(final.history).toEqual([D2, D1]);
  });
});

describe('setHabitHours', () => {
  const hoursHabit = (overrides: Partial<Habit> = {}) =>
    makeHabit({ type: 'Hours', targetHours: 1, ...overrides });

  it("should add today's hours entry to recentLog and history", async () => {
    await saveHabits({ 'habit-1': hoursHabit() });

    const updated = await setHabitHours('habit-1', 3, TODAY);

    expect(updated.history).toEqual([{ date: TODAY, kind: 'hours', value: 3 }]);
  });

  it("should replace today's entry when hours are logged again", async () => {
    await saveHabits({ 'habit-1': hoursHabit() });

    await setHabitHours('habit-1', 3, TODAY);
    const updated = await setHabitHours('habit-1', 5, TODAY);

    expect(updated.recentLog).toEqual([
      { date: TODAY, kind: 'hours', value: 5 },
    ]);
  });

  it("should remove today's entry when 0 hours are logged", async () => {
    await saveHabits({ 'habit-1': hoursHabit() });

    await setHabitHours('habit-1', 3, TODAY);
    const updated = await setHabitHours('habit-1', 0, TODAY);

    expect(updated.history).toEqual([]);
  });

  it('should keep earlier days when logging today', async () => {
    const earlier = {
      date: addDays(TODAY, -1),
      kind: 'hours' as const,
      value: 2,
    };
    await saveHabits({
      'habit-1': hoursHabit({ recentLog: [earlier], history: [earlier] }),
    });

    const updated = await setHabitHours('habit-1', 1, TODAY);

    expect(updated.recentLog).toEqual([
      { date: TODAY, kind: 'hours', value: 1 },
      earlier,
    ]);
  });

  it('should cap logged hours at 24', async () => {
    await saveHabits({ 'habit-1': hoursHabit() });

    const updated = await setHabitHours('habit-1', 30, TODAY);

    expect(updated.recentLog[0].value).toBe(24);
  });

  it('should persist the updated habit', async () => {
    await saveHabits({ 'habit-1': hoursHabit() });

    await setHabitHours('habit-1', 2, TODAY);

    expect((await loadHabits())['habit-1'].recentLog).toEqual([
      { date: TODAY, kind: 'hours', value: 2 },
    ]);
  });

  it.each(['Week', 'Month', 'Year'] as const)(
    'should log hours for a %s-cadence Hours habit',
    async cadence => {
      await saveHabits({ 'habit-1': hoursHabit({ cadence, target: 2 }) });

      const updated = await setHabitHours('habit-1', 3, TODAY);

      expect(updated.history).toEqual([
        { date: TODAY, kind: 'hours', value: 3 },
      ]);
    },
  );

  it('should throw InvalidMarkError for a Checkmark habit', async () => {
    await saveHabits({ 'habit-1': makeHabit() });

    await expect(setHabitHours('habit-1', 2, TODAY)).rejects.toBeInstanceOf(
      InvalidMarkError,
    );
  });

  it('should sync the group log when the group target is reached and lost', async () => {
    await saveHabits({ 'habit-1': hoursHabit({ groupId: 'g' }) });
    await saveHabitGroups({
      g: {
        id: 'g',
        name: 'Stay Productive',
        cadence: 'Day',
        groupType: 'Hours',
        habitIds: ['habit-1'],
        targetHours: 3,
        streakFreezeInterval: 7,
        status: 'active',
        sortOrder: 0,
        createdAt: 0,
        recentLog: [],
        history: [],
      },
    });

    await setHabitHours('habit-1', 3, TODAY);
    const reached = (await loadHabitGroups()).g.recentLog;
    await setHabitHours('habit-1', 2, TODAY);
    const lost = (await loadHabitGroups()).g.recentLog;

    expect([reached, lost]).toEqual([
      [{ date: TODAY, kind: 'marker', value: 1 }],
      [],
    ]);
  });
});

describe('streak freezes on marking', () => {
  // Marked on the `days` days before TODAY
  const daysBefore = (days: number) =>
    Array.from({ length: days }, (_, i) => ({
      date: addDays(TODAY, -(i + 1)),
      kind: 'marker' as const,
      value: 1,
    }));

  it('earns a freeze when marking reaches a multiple of N', async () => {
    const log = daysBefore(6);
    await saveHabits({
      'habit-1': makeHabit({ recentLog: log, history: [...log].reverse() }),
    });

    const updated = await markHabitDone('habit-1', TODAY);

    expect(updated.streakFreeze).toEqual({
      available: 1,
      earnedAtStreak: 7,
      frozenDates: [],
    });
  });

  it('undoes the freeze earned today when today is unmarked', async () => {
    const log = daysBefore(6);
    await saveHabits({
      'habit-1': makeHabit({ recentLog: log, history: [...log].reverse() }),
    });
    await markHabitDone('habit-1', TODAY);

    const updated = await unmarkHabitDone('habit-1', TODAY);

    expect(updated.streakFreeze?.available).toBe(0);
  });

  it('earns a freeze when logged hours reach a multiple of N', async () => {
    const log = Array.from({ length: 2 }, (_, i) => ({
      date: addDays(TODAY, -(i + 1)),
      kind: 'hours' as const,
      value: 2,
    }));
    await saveHabits({
      'habit-1': makeHabit({
        type: 'Hours',
        targetHours: 2,
        streakFreezeInterval: 3,
        recentLog: log,
        history: [...log].reverse(),
      }),
    });

    const updated = await setHabitHours('habit-1', 2, TODAY);

    expect(updated.streakFreeze?.available).toBe(1);
  });

  it('saves the earned freeze', async () => {
    const log = daysBefore(6);
    await saveHabits({
      'habit-1': makeHabit({ recentLog: log, history: [...log].reverse() }),
    });

    await markHabitDone('habit-1', TODAY);

    expect((await loadHabits())['habit-1'].streakFreeze?.available).toBe(1);
  });
});
