import AsyncStorage from '@react-native-async-storage/async-storage';
import { seedDevFixturesIfNeeded } from './devSeed';
import { loadHabits, loadHabitGroups, saveHabits } from './habitStorage';
import { calculateStreak } from '../utils/streak';
import { toDateKey } from '../utils/dates';
import {
  applyStreakFreezes,
  getGroupStatus,
} from '../services/habitGroupService';
import { getCadenceStatus } from '../utils/cadence';
import { habitMarkers, targetMetLog } from '../utils/hours';
import { isGroupComplete, isHabitMarkedToday } from '../utils/groupCompletion';
import { getAppLastUpdateTime } from './appInfo';
import { Habit } from '../types/habit';

jest.mock('./appInfo', () => ({ getAppLastUpdateTime: jest.fn() }));

const mockLastUpdateTime = getAppLastUpdateTime as jest.MockedFunction<
  typeof getAppLastUpdateTime
>;

const customHabit: Habit = {
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
};

beforeEach(async () => {
  await AsyncStorage.clear();
  mockLastUpdateTime.mockResolvedValue(1000);
});

describe('seedDevFixturesIfNeeded install and update', () => {
  it('should reseed over existing data when the app has been updated', async () => {
    await seedDevFixturesIfNeeded();
    await saveHabits({ custom: customHabit });
    mockLastUpdateTime.mockResolvedValue(2000);

    await seedDevFixturesIfNeeded();

    expect(Object.keys(await loadHabits())).toContain('job-hunt');
  });

  it('should replace stale habits and groups when the app has been updated', async () => {
    await seedDevFixturesIfNeeded();
    await saveHabits({ custom: customHabit });
    mockLastUpdateTime.mockResolvedValue(2000);

    await seedDevFixturesIfNeeded();

    expect((await loadHabits()).custom).toBeUndefined();
  });

  it('should reseed data saved before install tracking existed', async () => {
    await saveHabits({ custom: customHabit });

    await seedDevFixturesIfNeeded();

    expect((await loadHabits()).custom).toBeUndefined();
  });

  it('should not reseed when the app has not been updated', async () => {
    await seedDevFixturesIfNeeded();
    await saveHabits({ custom: customHabit });

    await seedDevFixturesIfNeeded();

    expect(Object.keys(await loadHabits())).toEqual(['custom']);
  });

  it('should only seed empty storage when the install time is unavailable', async () => {
    mockLastUpdateTime.mockResolvedValue(null);
    await saveHabits({ custom: customHabit });

    await seedDevFixturesIfNeeded();

    expect(Object.keys(await loadHabits())).toEqual(['custom']);
  });
});

describe('seedDevFixturesIfNeeded', () => {
  it('seeds habits and groups when storage is empty', async () => {
    await seedDevFixturesIfNeeded();

    const habits = await loadHabits();
    const groups = await loadHabitGroups();

    expect(Object.keys(habits).length).toBeGreaterThan(0);
    expect(Object.keys(groups)).toEqual(
      expect.arrayContaining(['precepts', 'eat-healthy', 'stay-productive']),
    );
  });

  it('seeded Day/Checkmark habits produce sane streak values', async () => {
    await seedDevFixturesIfNeeded();

    const habits = await loadHabits();
    const today = toDateKey(new Date());

    expect(calculateStreak(habits['no-killing'].recentLog, today)).toBe(12);
    expect(calculateStreak(habits.cook.recentLog, today)).toBe(3);
    expect(calculateStreak(habits['right-speech'].recentLog, today)).toBe(0);
  });

  it('seeds 8 Precepts as a complete Required group and Eat Healthy as incomplete', async () => {
    await seedDevFixturesIfNeeded();

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

  it('seeds group logs so 8 Precepts has a 12-day streak and Eat Healthy has none', async () => {
    await seedDevFixturesIfNeeded();

    const groups = await loadHabitGroups();
    const today = toDateKey(new Date());

    expect(getGroupStatus(groups.precepts, today).streak).toBe(12);
    expect(getGroupStatus(groups['eat-healthy'], today).streak).toBe(0);
  });

  it('seeds Stay Productive as a complete Hours group at 8 / 8 hrs', async () => {
    await seedDevFixturesIfNeeded();

    const habits = await loadHabits();
    const groups = await loadHabitGroups();
    const today = toDateKey(new Date());
    const members = Object.values(habits).filter(
      h => h.groupId === 'stay-productive',
    );

    expect(isGroupComplete(groups['stay-productive'], members, today)).toBe(
      true,
    );
  });

  it('seeds Stay Productive with a 5-day group streak', async () => {
    await seedDevFixturesIfNeeded();

    const groups = await loadHabitGroups();
    const today = toDateKey(new Date());

    expect(getGroupStatus(groups['stay-productive'], today).streak).toBe(5);
  });

  it('seeds Stay Productive hours so only logged habits are marked', async () => {
    await seedDevFixturesIfNeeded();

    const habits = await loadHabits();
    const today = toDateKey(new Date());
    const marked = Object.values(habits)
      .filter(h => h.groupId === 'stay-productive')
      .filter(h => isHabitMarkedToday(h, today))
      .map(h => h.id);

    expect(marked).toEqual(['job-hunt', 'study', 'sit', 'read']);
  });

  it('seeds Drink Water ungrouped with a 4-day streak', async () => {
    await seedDevFixturesIfNeeded();

    const habits = await loadHabits();
    const today = toDateKey(new Date());

    expect([
      habits['drink-water'].groupId,
      calculateStreak(habits['drink-water'].recentLog, today),
    ]).toEqual([undefined, 4]);
  });

  it('seeds Drink Water as the last habit', async () => {
    await seedDevFixturesIfNeeded();

    const habits = Object.values(await loadHabits());
    const last = habits.reduce((a, b) => (b.sortOrder > a.sortOrder ? b : a));

    expect(last.id).toBe('drink-water');
  });

  describe('Week, Month and Year fixtures', () => {
    const today = toDateKey(new Date());
    const habitStatus = async (id: string) => {
      const habit = (await loadHabits())[id];
      const markers =
        habit.type === 'Hours'
          ? targetMetLog(habit, habit.history)
          : habit.history;
      return getCadenceStatus(markers, habit.cadence, habit.target, today);
    };
    const groupStatus = async (id: string) =>
      getGroupStatus((await loadHabitGroups())[id], today);

    beforeEach(async () => {
      await seedDevFixturesIfNeeded();
    });

    it.each([
      ['run', true, 6],
      ['gym', false, 2],
      ['write-book', true, 15],
      ['piano', false, 6],
      ['read-paper', true, 60],
      ['volunteer', false, 15],
      ['call-family', true, 2],
    ])(
      'seeds %s as complete=%s with streak %i',
      async (id, complete, streak) => {
        const status = await habitStatus(id);

        expect([status.complete, status.streak]).toEqual([complete, streak]);
      },
    );

    it('seeds Call Family complete but not marked today', async () => {
      expect((await habitStatus('call-family')).markedToday).toBe(false);
    });

    it.each([
      ['fitness', true],
      ['deep-work', false],
      ['yearly-goals', false],
    ])('seeds the %s group as complete=%s', async (id, complete) => {
      expect((await groupStatus(id)).complete).toBe(complete);
    });

    it('seeds one group per cadence for Week, Month and Year', async () => {
      const groups = await loadHabitGroups();

      expect(
        ['fitness', 'deep-work', 'yearly-goals'].map(id => groups[id].cadence),
      ).toEqual(['Week', 'Month', 'Year']);
    });

    it('derives group logs that match the member marks', async () => {
      const habits = await loadHabits();
      const group = (await loadHabitGroups()).fitness;
      const members = Object.values(habits)
        .filter(h => h.groupId === 'fitness')
        .map(h => ({ ...h, recentLog: h.history }));
      const expected = group.history.every(entry =>
        isGroupComplete(group, members, entry.date),
      );

      expect([expected, group.history.length]).toEqual([true, 8]);
    });
  });

  describe('streak freeze fixtures', () => {
    const today = toDateKey(new Date());
    const habitStatus = async (id: string) => {
      const habit = (await loadHabits())[id];
      return getCadenceStatus(
        habitMarkers(habit),
        habit.cadence,
        habit.target,
        today,
        habit.streakFreeze,
      );
    };
    const pick = (status: {
      complete: boolean;
      streak: number;
      frozenToday: boolean;
      freezesLeft: number;
    }) => [
      status.complete,
      status.streak,
      status.frozenToday,
      status.freezesLeft,
    ];

    beforeEach(async () => {
      await seedDevFixturesIfNeeded();
      await applyStreakFreezes(today);
    });

    it.each([
      ['meditate', false, 9, true, 0],
      ['stretch', true, 7, false, 2],
      ['swim', false, 3, true, 0],
      ['read-fiction', false, 8, true, 0],
      ['guitar', false, 8, true, 0],
      ['sketch', false, 8, true, 0],
      ['code', false, 8, true, 0],
    ])(
      'seeds %s as complete=%s, streak %i, frozen=%s, %i left',
      async (id, complete, streak, frozen, left) => {
        expect(pick(await habitStatus(id))).toEqual([
          complete,
          streak,
          frozen,
          left,
        ]);
      },
    );

    it('seeds the Wind-down group frozen with 1 freeze left', async () => {
      const group = (await loadHabitGroups())['wind-down'];

      expect(pick(getGroupStatus(group, today))).toEqual([false, 8, true, 1]);
    });

    it('seeds the Side Projects Hours group frozen with 0 freezes left', async () => {
      const group = (await loadHabitGroups())['side-projects'];

      expect([
        group.groupType,
        group.history.length,
        ...pick(getGroupStatus(group, today)),
      ]).toEqual(['Hours', 8, false, 8, true, 0]);
    });

    it('gives other fixtures the freezes their streak earned and uses none', async () => {
      const habits = await loadHabits();
      const groups = await loadHabitGroups();

      expect([
        habits['no-killing'].streakFreeze,
        groups.precepts.streakFreeze,
        habits['drink-water'].streakFreeze,
      ]).toEqual([
        { available: 1, earnedAtStreak: 7, frozenDates: [] },
        { available: 1, earnedAtStreak: 7, frozenDates: [] },
        undefined,
      ]);
    });

    it('gives every group a streak freeze interval of 7', async () => {
      const groups = Object.values(await loadHabitGroups());

      expect(groups.every(g => g.streakFreezeInterval === 7)).toBe(true);
    });
  });
});
