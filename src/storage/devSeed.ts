import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { LogEntry } from '../types/log';
import { addDays, toDateKey } from '../utils/dates';
import { loadHabits, saveHabitGroups, saveHabits } from './habitStorage';

function marker(date: string): LogEntry {
  return { date, kind: 'marker', value: 1 };
}

export async function seedDevFixturesIfEmpty(): Promise<void> {
  const existing = await loadHabits();
  if (Object.keys(existing).length > 0) return;

  const today = toDateKey(new Date());
  const yesterday = addDays(today, -1);

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

  function hoursHabit(id: string, name: string, groupId: string): Habit {
    return {
      id,
      name,
      cadence: 'Day',
      type: 'Hours',
      targetHours: 2,
      streakFreezeInterval: 7,
      groupId,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [],
      history: [],
    };
  }

  const habits: Habit[] = [
    checkmarkHabit('no-killing', 'No Killing', 'precepts', [marker(today)]),
    checkmarkHabit('no-stealing', 'No Stealing', 'precepts', [
      marker(yesterday),
    ]),
    checkmarkHabit('celibacy', 'Celibacy', 'precepts', [marker(today)]),
    checkmarkHabit('right-speech', 'Right Speech', 'precepts', []),
    checkmarkHabit('no-intoxication', 'No Intoxication', 'precepts', [
      marker(today),
    ]),
    checkmarkHabit('no-dinner', 'No Dinner', 'precepts', [marker(today)]),
    checkmarkHabit('no-entertainment', 'No Entertainment', 'precepts', [
      marker(today),
    ]),
    checkmarkHabit('sleep-on-floor', 'Sleep On Floor', 'precepts', []),
    checkmarkHabit('cook', 'Cook', 'eat-healthy', [marker(today)]),
    checkmarkHabit('restaurant', 'Restaurant', 'eat-healthy', []),
    checkmarkHabit('drink-water', 'Drink Water', undefined, [marker(today)]),
    hoursHabit('job-hunt', 'Job Hunt', 'stay-productive'),
    hoursHabit('study', 'Study', 'stay-productive'),
  ];

  const groups: HabitGroup[] = [
    {
      id: 'precepts',
      name: '8 Precepts',
      cadence: 'Day',
      groupType: 'Required',
      habitIds: habits.filter(h => h.groupId === 'precepts').map(h => h.id),
      requiredHabitIds: [],
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [],
      history: [],
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
      hoursTarget: 4,
      status: 'active',
      sortOrder: nextSortOrder(),
      createdAt,
      recentLog: [],
      history: [],
    },
  ];

  await saveHabits(Object.fromEntries(habits.map(h => [h.id, h])));
  await saveHabitGroups(Object.fromEntries(groups.map(g => [g.id, g])));
}
