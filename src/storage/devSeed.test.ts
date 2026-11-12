import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedDevFixturesIfEmpty } from './devSeed';
import { loadHabits, loadHabitGroups, saveHabits } from './habitStorage';
import { calculateStreak } from '../utils/streak';
import { toDateKey } from '../utils/dates';
import { isGroupComplete } from '../utils/groupCompletion';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('seedDevFixturesIfEmpty', () => {
  it('seeds habits and groups when storage is empty', async () => {
    await seedDevFixturesIfEmpty();

    const habits = await loadHabits();
    const groups = await loadHabitGroups();

    expect(Object.keys(habits).length).toBeGreaterThan(0);
    expect(Object.keys(groups)).toEqual(
      expect.arrayContaining(['precepts', 'eat-healthy', 'stay-productive']),
    );
  });

  it('does not overwrite existing habits', async () => {
    await saveHabits({
      custom: {
        id: 'custom',
        name: 'Custom Habit',
        cadence: 'Day',
        type: 'Checkmark',
        streakFreezeInterval: 7,
        status: 'active',
        sortOrder: 0,
        createdAt: 0,
        recentLog: [],
        history: [],
      },
    });

    await seedDevFixturesIfEmpty();

    const habits = await loadHabits();
    expect(Object.keys(habits)).toEqual(['custom']);
  });

  it('seeded Day/Checkmark habits produce sane streak values', async () => {
    await seedDevFixturesIfEmpty();

    const habits = await loadHabits();
    const today = toDateKey(new Date());

    expect(calculateStreak(habits['no-killing'].recentLog, today)).toBe(12);
    expect(calculateStreak(habits.cook.recentLog, today)).toBe(3);
    expect(calculateStreak(habits['right-speech'].recentLog, today)).toBe(0);
  });

  it('seeds 8 Precepts as a complete Required group and Eat Healthy as incomplete', async () => {
    await seedDevFixturesIfEmpty();

    const habits = await loadHabits();
    const groups = await loadHabitGroups();
    const today = toDateKey(new Date());
    const members = (groupId: string) =>
      Object.values(habits).filter(h => h.groupId === groupId);

    expect(isGroupComplete(groups.precepts, members('precepts'), today)).toBe(
      true,
    );
    expect(
      isGroupComplete(groups['eat-healthy'], members('eat-healthy'), today),
    ).toBe(false);
  });

  it('seeds Hours-type habits that carry no marker log entries', async () => {
    await seedDevFixturesIfEmpty();

    const habits = await loadHabits();

    expect(habits['job-hunt'].type).toBe('Hours');
    expect(habits['job-hunt'].recentLog).toEqual([]);
    expect(habits.study.type).toBe('Hours');
  });
});
