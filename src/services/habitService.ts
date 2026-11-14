import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { toDateKey } from '../utils/dates';
import { clampHours, habitMarkers } from '../utils/hours';
import { withEarnedFreezes } from '../utils/streakFreeze';
import { groupIdsByHabit } from '../utils/groupIndex';
import {
  loadHabitGroups,
  loadHabits,
  saveHabit,
  saveHabitGroup,
} from '../storage/habitStorage';
import {
  NewHabitDraft,
  buildHabit,
  canJoinGroup,
  isDraftValid,
} from '../utils/newHabit';
import { syncGroupCompletion } from './habitGroupService';

export class InvalidMarkError extends Error {}
export class InvalidHabitError extends Error {}

function newHabitId(createdAt: number): string {
  return `habit-${createdAt.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// Saves a new habit last in sort order and joins it to its group, if any
export async function createHabit(
  draft: NewHabitDraft,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  if (!isDraftValid(draft)) {
    throw new InvalidHabitError('A habit needs a name of 1-40 characters');
  }
  const [habits, groups] = await Promise.all([loadHabits(), loadHabitGroups()]);
  let group: HabitGroup | undefined;
  if (draft.groupId) {
    group = groups[draft.groupId];
    if (!group)
      throw new InvalidHabitError(`Group not found: ${draft.groupId}`);
    if (!canJoinGroup(draft.type, group)) {
      throw new InvalidHabitError(
        `A ${draft.type} habit cannot join a ${group.groupType} group`,
      );
    }
  }

  const createdAt = Date.now();
  const sortOrder =
    Math.max(-1, ...Object.values(habits).map(h => h.sortOrder)) + 1;
  const habit = buildHabit(draft, newHabitId(createdAt), sortOrder, createdAt);

  await saveHabit(habit);
  if (group) {
    await saveHabitGroup({ ...group, habitIds: [...group.habitIds, habit.id] });
    await syncGroupCompletion(group.id, todayKey);
  }
  return habit;
}

function loadMarkableHabit(
  habits: Record<string, Habit>,
  habitId: string,
): Habit {
  const habit = habits[habitId];
  if (!habit) throw new InvalidMarkError(`Habit not found: ${habitId}`);
  if (habit.type !== 'Checkmark') {
    throw new InvalidMarkError(
      'Only Checkmark habits can be marked or unmarked',
    );
  }
  return habit;
}

// Earns any freeze the new streak reached, then re-checks every group the
// habit is in
async function saveAndSync(habit: Habit, todayKey: string): Promise<Habit> {
  const updated = withEarnedFreezes(habit, habitMarkers(habit), todayKey);
  await saveHabit(updated);
  const groupIds = groupIdsByHabit(await loadHabitGroups())[updated.id] ?? [];
  for (const groupId of groupIds) {
    await syncGroupCompletion(groupId, todayKey);
  }
  return updated;
}

export async function markHabitDone(
  habitId: string,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  const habits = await loadHabits();
  const habit = loadMarkableHabit(habits, habitId);

  if (habit.recentLog.some(entry => entry.date === todayKey)) {
    return habit;
  }

  const entry: LogEntry = { date: todayKey, kind: 'marker', value: 1 };
  const updated: Habit = {
    ...habit,
    recentLog: [entry, ...habit.recentLog].slice(
      0,
      DEFAULT_HABIT_LIMITS.recentLogSize,
    ),
    history: [...habit.history, entry],
  };

  return saveAndSync(updated, todayKey);
}

export async function unmarkHabitDone(
  habitId: string,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  const habits = await loadHabits();
  const habit = loadMarkableHabit(habits, habitId);

  if (!habit.recentLog.some(entry => entry.date === todayKey)) {
    return habit;
  }

  const updated: Habit = {
    ...habit,
    recentLog: habit.recentLog.filter(entry => entry.date !== todayKey),
    history: habit.history.filter(entry => entry.date !== todayKey),
  };

  return saveAndSync(updated, todayKey);
}

export async function setHabitHours(
  habitId: string,
  hours: number,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  const habits = await loadHabits();
  const habit = habits[habitId];
  if (!habit) throw new InvalidMarkError(`Habit not found: ${habitId}`);
  if (habit.type !== 'Hours') {
    throw new InvalidMarkError('Only Hours habits can log hours');
  }

  const value = clampHours(hours);
  const recentLog = habit.recentLog.filter(entry => entry.date !== todayKey);
  const history = habit.history.filter(entry => entry.date !== todayKey);

  let updated: Habit;
  if (value > 0) {
    const entry: LogEntry = { date: todayKey, kind: 'hours', value };
    updated = {
      ...habit,
      recentLog: [entry, ...recentLog].slice(
        0,
        DEFAULT_HABIT_LIMITS.recentLogSize,
      ),
      history: [...history, entry],
    };
  } else {
    updated = { ...habit, recentLog, history };
  }

  return saveAndSync(updated, todayKey);
}

export async function assignHabitToGroup(
  _habitId: string,
  _groupId: string,
): Promise<void> {
  throw new Error('not implemented');
}

export async function removeHabitFromGroup(_habitId: string): Promise<void> {
  throw new Error('not implemented');
}

export async function setRequiredHabits(
  _groupId: string,
  _habitIds: string[],
): Promise<void> {
  throw new Error('not implemented');
}
