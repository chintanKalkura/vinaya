import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitCadence, HabitType } from '../types/habit';
import { HabitGroup, HabitGroupType } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { addDays, toDateKey } from '../utils/dates';
import { isGroupComplete } from '../utils/groupCompletion';
import { getAppLastUpdateTime } from './appInfo';
import { loadHabits, saveHabitGroups, saveHabits } from './habitStorage';

function marker(date: string): LogEntry {
  return { date, kind: 'marker', value: 1 };
}

// `days` consecutive markers, newest-first, starting `startOffset` days before today
function streakLog(today: string, days: number, startOffset = 0): LogEntry[] {
  return Array.from({ length: days }, (_, i) =>
    marker(addDays(today, -(startOffset + i))),
  );
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let n = from; n <= to; n += step) out.push(n);
  return out;
}

const SEEDED_UPDATE_TIME_KEY = 'dev_seed_app_update_time';

// Seeds on a fresh install and reseeds (replacing all habits and groups)
// whenever the app is updated. Falls back to seeding empty storage only.
export async function seedDevFixturesIfNeeded(): Promise<void> {
  const updateTime = await getAppLastUpdateTime();
  if (updateTime === null) {
    const existing = await loadHabits();
    if (Object.keys(existing).length > 0) return;
  } else {
    const seededAt = await AsyncStorage.getItem(SEEDED_UPDATE_TIME_KEY);
    if (seededAt === String(updateTime)) return;
  }

  const today = toDateKey(new Date());

  let sortOrder = 0;
  const nextSortOrder = () => sortOrder++;
  const createdAt = Date.now();

  function checkmarkHabit(
    id: string,
    name: string,
    groupId: string | undefined,
    recentLog: LogEntry[],
  ): Habit {
    return {
      id,
      name,
      cadence: 'Day',
      type: 'Checkmark',
      streakFreezeInterval: 7,
      groupId,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog,
      history: recentLog,
    };
  }

  function hoursHabit(
    id: string,
    name: string,
    groupId: string,
    hoursToday: number,
  ): Habit {
    const log: LogEntry[] =
      hoursToday > 0 ? [{ date: today, kind: 'hours', value: hoursToday }] : [];
    return {
      id,
      name,
      cadence: 'Day',
      type: 'Hours',
      targetHours: 1,
      streakFreezeInterval: 7,
      groupId,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: log,
      history: log,
    };
  }

  // Week/Month/Year habit; `days` maps days-ago to hours (Hours) or 1 (Checkmark)
  function periodHabit(
    id: string,
    name: string,
    cadence: HabitCadence,
    type: HabitType,
    groupId: string | undefined,
    target: number,
    days: [number, number][],
    targetHours?: number,
  ): Habit {
    const history: LogEntry[] = [...days]
      .sort(([a], [b]) => b - a)
      .map(([daysAgo, value]) => ({
        date: addDays(today, -daysAgo),
        kind: type === 'Hours' ? 'hours' : 'marker',
        value,
      }));
    return {
      id,
      name,
      cadence,
      type,
      target,
      targetHours,
      streakFreezeInterval: 7,
      groupId,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [...history]
        .reverse()
        .slice(0, DEFAULT_HABIT_LIMITS.recentLogSize),
      history,
    };
  }

  const marks = (daysAgo: number[]): [number, number][] =>
    daysAgo.map(d => [d, 1]);
  const hours = (daysAgo: number[], value: number): [number, number][] =>
    daysAgo.map(d => [d, value]);

  const habits: Habit[] = [
    checkmarkHabit(
      'no-killing',
      'No Killing',
      'precepts',
      streakLog(today, 12),
    ),
    checkmarkHabit(
      'no-stealing',
      'No Stealing',
      'precepts',
      streakLog(today, 12),
    ),
    checkmarkHabit('celibacy', 'Celibacy', 'precepts', streakLog(today, 8)),
    checkmarkHabit('right-speech', 'Right Speech', 'precepts', []),
    checkmarkHabit(
      'no-intoxication',
      'No Intoxication',
      'precepts',
      streakLog(today, 12),
    ),
    checkmarkHabit('no-dinner', 'No Dinner', 'precepts', streakLog(today, 5)),
    checkmarkHabit(
      'no-entertainment',
      'No Entertainment',
      'precepts',
      streakLog(today, 12),
    ),
    checkmarkHabit('sleep-on-floor', 'Sleep On Floor', 'precepts', [
      marker(today),
    ]),
    // Not marked today; streak still alive through yesterday
    checkmarkHabit('cook', 'Cook', 'eat-healthy', streakLog(today, 3, 1)),
    checkmarkHabit('restaurant', 'Restaurant', 'eat-healthy', []),
    // Stay Productive totals 8 of 8 hours today
    hoursHabit('job-hunt', 'Job Hunt', 'stay-productive', 4),
    hoursHabit('study', 'Study', 'stay-productive', 2),
    hoursHabit('build', 'Build', 'stay-productive', 0),
    hoursHabit('write', 'Write', 'stay-productive', 0),
    hoursHabit('sit', 'Sit', 'stay-productive', 1),
    hoursHabit('errands', 'Errands', 'stay-productive', 0),
    hoursHabit('read', 'Read', 'stay-productive', 1),
    hoursHabit('create', 'Create', 'stay-productive', 0),
    // Fitness: Run complete; Gym alive but incomplete
    periodHabit(
      'run',
      'Run',
      'Week',
      'Checkmark',
      'fitness',
      3,
      marks([0, 2, 4, 8, 10, 12]),
    ),
    periodHabit('gym', 'Gym', 'Week', 'Checkmark', 'fitness', 2, marks([3, 9])),
    // Deep Work: Write Book complete (15 met days); Piano incomplete
    periodHabit(
      'write-book',
      'Write Book',
      'Month',
      'Hours',
      'deep-work',
      15,
      [
        ...hours(
          range(0, 16, 1).filter(d => d !== 5 && d !== 11),
          2,
        ),
        [5, 1],
      ],
      2,
    ),
    periodHabit(
      'piano',
      'Piano',
      'Month',
      'Hours',
      'deep-work',
      10,
      hours([1, 3, 6, 9, 13, 20], 1),
      1,
    ),
    // Yearly Goals: Read Paper complete; Volunteer incomplete
    periodHabit(
      'read-paper',
      'Read Paper',
      'Year',
      'Checkmark',
      'yearly-goals',
      50,
      marks(range(0, 177, 3)),
    ),
    periodHabit(
      'volunteer',
      'Volunteer',
      'Year',
      'Checkmark',
      'yearly-goals',
      20,
      marks(range(7, 203, 14)),
    ),
    // Complete for the week but not marked today
    periodHabit(
      'call-family',
      'Call Family',
      'Week',
      'Checkmark',
      undefined,
      2,
      marks([1, 5]),
    ),
    checkmarkHabit(
      'drink-water',
      'Drink Water',
      undefined,
      streakLog(today, 4),
    ),
  ];

  // Group log derived from member marks for the past year, so the two agree
  function periodGroup(
    id: string,
    name: string,
    cadence: HabitCadence,
    groupType: HabitGroupType,
    target: number,
    targetHours?: number,
  ): HabitGroup {
    const members = habits
      .filter(h => h.groupId === id)
      .map(h => ({ ...h, recentLog: h.history }));
    const group: HabitGroup = {
      id,
      name,
      cadence,
      groupType,
      target,
      targetHours,
      habitIds: members.map(h => h.id),
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [],
      history: [],
    };
    const history = range(0, 366, 1)
      .reverse()
      .map(daysAgo => addDays(today, -daysAgo))
      .filter(date => isGroupComplete(group, members, date))
      .map(marker);
    return {
      ...group,
      recentLog: [...history]
        .reverse()
        .slice(0, DEFAULT_HABIT_LIMITS.recentLogSize),
      history,
    };
  }

  const groups: HabitGroup[] = [
    {
      id: 'precepts',
      name: '8 Precepts',
      cadence: 'Day',
      groupType: 'Required',
      habitIds: habits.filter(h => h.groupId === 'precepts').map(h => h.id),
      requiredHabitIds: [
        'no-killing',
        'no-stealing',
        'celibacy',
        'no-intoxication',
        'no-dinner',
        'sleep-on-floor',
      ],
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: streakLog(today, 12),
      history: streakLog(today, 12).reverse(),
    },
    {
      id: 'eat-healthy',
      name: 'Eat Healthy',
      cadence: 'Day',
      groupType: 'Any',
      habitIds: habits.filter(h => h.groupId === 'eat-healthy').map(h => h.id),
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [],
      history: [],
    },
    {
      id: 'stay-productive',
      name: 'Stay Productive',
      cadence: 'Day',
      groupType: 'Hours',
      habitIds: habits
        .filter(h => h.groupId === 'stay-productive')
        .map(h => h.id),
      targetHours: 8,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: streakLog(today, 5),
      history: streakLog(today, 5).reverse(),
    },
    periodGroup('fitness', 'Fitness', 'Week', 'Any', 3),
    periodGroup('deep-work', 'Deep Work', 'Month', 'Hours', 12, 3),
    periodGroup('yearly-goals', 'Yearly Goals', 'Year', 'All', 40),
  ];

  await saveHabits(Object.fromEntries(habits.map(h => [h.id, h])));
  await saveHabitGroups(Object.fromEntries(groups.map(g => [g.id, g])));
  if (updateTime !== null) {
    await AsyncStorage.setItem(SEEDED_UPDATE_TIME_KEY, String(updateTime));
  }
}
