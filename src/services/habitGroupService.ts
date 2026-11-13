import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import {
  loadHabitGroups,
  loadHabits,
  saveHabitGroup,
} from '../storage/habitStorage';
import { isGroupComplete } from '../utils/groupCompletion';
import { calculateStreak } from '../utils/streak';

export function getGroupStreak(group: HabitGroup, todayKey: string): number {
  return calculateStreak(group.recentLog, todayKey);
}

export async function syncGroupCompletion(
  groupId: string,
  todayKey: string,
): Promise<HabitGroup | undefined> {
  const [groups, habits] = await Promise.all([loadHabitGroups(), loadHabits()]);
  const group = groups[groupId];
  if (!group) return group;

  const members = Object.values(habits).filter(h => h.groupId === groupId);
  const complete = isGroupComplete(group, members, todayKey);
  const hasToday = group.recentLog.some(entry => entry.date === todayKey);

  if (complete === hasToday) return group;

  let updated: HabitGroup;
  if (complete) {
    const entry: LogEntry = { date: todayKey, kind: 'marker', value: 1 };
    updated = {
      ...group,
      recentLog: [entry, ...group.recentLog].slice(
        0,
        DEFAULT_HABIT_LIMITS.recentLogSize,
      ),
      history: [...group.history, entry],
    };
  } else {
    updated = {
      ...group,
      recentLog: group.recentLog.filter(entry => entry.date !== todayKey),
      history: group.history.filter(entry => entry.date !== todayKey),
    };
  }

  await saveHabitGroup(updated);
  return updated;
}
