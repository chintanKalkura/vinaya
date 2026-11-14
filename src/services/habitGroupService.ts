import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import {
  loadHabitGroups,
  loadHabits,
  saveHabitGroup,
  saveHabitGroups,
  saveHabits,
} from '../storage/habitStorage';
import { CadenceStatus, getCadenceStatus } from '../utils/cadence';
import { isGroupComplete } from '../utils/groupCompletion';
import { habitMarkers } from '../utils/hours';
import { withAppliedFreezes, withEarnedFreezes } from '../utils/streakFreeze';
import { toDateKey } from '../utils/dates';
import {
  NewHabitGroupDraft,
  buildHabitGroup,
  canTakeHabit,
  isGroupDraftValid,
} from '../utils/newHabitGroup';

export class InvalidHabitGroupError extends Error {}

function newGroupId(createdAt: number): string {
  return `group-${createdAt.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// Saves a new group last in sort order, then counts today if its members
// already complete it
export async function createHabitGroup(
  draft: NewHabitGroupDraft,
  todayKey: string = toDateKey(new Date()),
): Promise<HabitGroup> {
  if (!isGroupDraftValid(draft)) {
    throw new InvalidHabitGroupError(
      'A group needs a name, at least one habit and, for Required, a required habit',
    );
  }
  const [groups, habits] = await Promise.all([loadHabitGroups(), loadHabits()]);
  for (const habitId of draft.habitIds) {
    const habit = habits[habitId];
    if (!habit) throw new InvalidHabitGroupError(`Habit not found: ${habitId}`);
    if (!canTakeHabit(draft.groupType, habit.type)) {
      throw new InvalidHabitGroupError(
        `A ${draft.groupType} group cannot take the ${habit.type} habit ${habit.name}`,
      );
    }
  }

  const createdAt = Date.now();
  const sortOrder =
    Math.max(-1, ...Object.values(groups).map(g => g.sortOrder)) + 1;
  const group = buildHabitGroup(
    draft,
    newGroupId(createdAt),
    sortOrder,
    createdAt,
  );
  await saveHabitGroup(group);
  return (await syncGroupCompletion(group.id, todayKey)) ?? group;
}

// The group log holds one marker per day the group-type rule was met
export function getGroupStatus(
  group: HabitGroup,
  todayKey: string,
): CadenceStatus {
  return getCadenceStatus(
    group.history,
    group.cadence,
    group.target,
    todayKey,
    group.streakFreeze,
  );
}

export async function syncGroupCompletion(
  groupId: string,
  todayKey: string,
): Promise<HabitGroup | undefined> {
  const [groups, habits] = await Promise.all([loadHabitGroups(), loadHabits()]);
  const group = groups[groupId];
  if (!group) return group;

  const members = group.habitIds
    .map(id => habits[id])
    .filter((habit): habit is Habit => habit !== undefined);
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

  updated = withEarnedFreezes(updated, updated.history, todayKey);
  await saveHabitGroup(updated);
  return updated;
}

// Removes only the group; its habits are kept
export async function deleteHabitGroup(groupId: string): Promise<void> {
  const groups = await loadHabitGroups();
  delete groups[groupId];
  await saveHabitGroups(groups);
}

// Uses freezes on every habit and group whose streak would break today.
// Runs once when the Habits screen loads; saves only what changed.
export async function applyStreakFreezes(todayKey: string): Promise<void> {
  const [groups, habits] = await Promise.all([loadHabitGroups(), loadHabits()]);
  let habitsChanged = false;
  let groupsChanged = false;

  for (const habit of Object.values(habits)) {
    const next = withAppliedFreezes(habit, habitMarkers(habit), todayKey);
    if (next !== habit) {
      habits[habit.id] = next;
      habitsChanged = true;
    }
  }
  for (const group of Object.values(groups)) {
    const next = withAppliedFreezes(group, group.history, todayKey);
    if (next !== group) {
      groups[group.id] = next;
      groupsChanged = true;
    }
  }

  if (habitsChanged) await saveHabits(habits);
  if (groupsChanged) await saveHabitGroups(groups);
}
