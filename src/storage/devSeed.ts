import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { LogEntry } from '../types/log';
import { addDays, toDateKey } from '../utils/dates';
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

export async function seedDevFixturesIfEmpty(): Promise<void> {
  const existing = await loadHabits();
  if (Object.keys(existing).length > 0) return;

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
    checkmarkHabit('drink-water', 'Drink Water', undefined, [marker(today)]),
    // Stay Productive totals 8 / 8 hrs today
    hoursHabit('job-hunt', 'Job Hunt', 'stay-productive', 4),
    hoursHabit('study', 'Study', 'stay-productive', 2),
    hoursHabit('build', 'Build', 'stay-productive', 0),
    hoursHabit('write', 'Write', 'stay-productive', 0),
    hoursHabit('sit', 'Sit', 'stay-productive', 1),
    hoursHabit('errands', 'Errands', 'stay-productive', 0),
    hoursHabit('read', 'Read', 'stay-productive', 1),
    hoursHabit('create', 'Create', 'stay-productive', 0),
  ];

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
  ];

  await saveHabits(Object.fromEntries(habits.map(h => [h.id, h])));
  await saveHabitGroups(Object.fromEntries(groups.map(g => [g.id, g])));
}
