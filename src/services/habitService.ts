import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { toDateKey } from '../utils/dates';
import { clampHours, habitMarkers } from '../utils/hours';
import { rebuildFreezeState, withEarnedFreezes } from '../utils/streakFreeze';
import { editableRange, isInRange } from '../utils/pastDays';
import { withLogEntry } from '../utils/logs';
import { groupIdsByHabit } from '../utils/groupIndex';
import {
  loadHabitGroups,
  loadHabits,
  saveHabit,
  saveHabitGroup,
  saveHabitGroups,
  saveHabits,
  recordTombstone,
  withStorageQueue,
} from '../storage/habitStorage';
import {
  NewHabitDraft,
  buildHabit,
  canJoinGroup,
  clampTargetHours,
  isDraftValid,
} from '../utils/newHabit';
import { clampCadenceTarget } from '../utils/cadence';
import { clampFreezeInterval } from '../utils/streakFreeze';
import {
  syncGroupCompletionInQueue,
  syncGroupPastDaysInQueue,
} from './habitGroupService';

export class InvalidMarkError extends Error {}
export class InvalidHabitError extends Error {}

function newHabitId(createdAt: number): string {
  return `habit-${createdAt.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// Saves a new habit last in sort order and joins it to its group, if any
export function createHabit(
  draft: NewHabitDraft,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
    if (!isDraftValid(draft)) {
      throw new InvalidHabitError('A habit needs a name of 1-40 characters');
    }
    const [habits, groups] = await Promise.all([
      loadHabits(),
      loadHabitGroups(),
    ]);
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
    const habit = buildHabit(
      draft,
      newHabitId(createdAt),
      sortOrder,
      createdAt,
    );

    await saveHabit(habit);
    if (group) {
      await saveHabitGroup({
        ...group,
        habitIds: [...group.habitIds, habit.id],
      });
      await syncGroupCompletionInQueue(group.id, todayKey);
    }
    return habit;
  });
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
    await syncGroupCompletionInQueue(groupId, todayKey);
  }
  return updated;
}

export function markHabitDone(
  habitId: string,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
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
  });
}

export function unmarkHabitDone(
  habitId: string,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
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
  });
}

export function setHabitHours(
  habitId: string,
  hours: number,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
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
  });
}

// One day in Edit past days: Checkmark 1 (marked) or 0 (not), Hours the
// hours logged (0 clears the day)
export interface PastDayChange {
  date: string;
  value: number;
}

// Edit past days: docs/feature-development/release-1-readiness/habit-group-detail-page.md
// Writes every change in one go, rebuilds the habit's freezes from its new
// history, then re-checks each of its groups on the changed dates.
export function setPastDays(
  habitId: string,
  changes: PastDayChange[],
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
    const habits = await loadHabits();
    const habit = habits[habitId];
    if (!habit) throw new InvalidMarkError(`Habit not found: ${habitId}`);
    if (changes.length === 0) return habit;

    const range = editableRange(habit.cadence, habit.createdAt, todayKey);
    for (const { date } of changes) {
      if (!range || !isInRange(date, range)) {
        throw new InvalidMarkError(`${date} can't be edited`);
      }
    }

    let updated = habit;
    for (const { date, value } of changes) {
      const kept =
        habit.type === 'Hours' ? clampHours(value) : value > 0 ? 1 : 0;
      const entry: LogEntry | undefined =
        kept > 0
          ? {
              date,
              kind: habit.type === 'Hours' ? 'hours' : 'marker',
              value: kept,
            }
          : undefined;
      updated = withLogEntry(updated, date, entry);
    }
    updated = {
      ...updated,
      streakFreeze: rebuildFreezeState(
        habitMarkers(updated),
        habit.cadence,
        habit.streakFreezeInterval,
        todayKey,
      ),
    };
    await saveHabit(updated);

    const dates = changes.map(change => change.date);
    const groupIds = groupIdsByHabit(await loadHabitGroups())[habitId] ?? [];
    for (const groupId of groupIds) {
      await syncGroupPastDaysInQueue(groupId, dates, todayKey);
    }
    return updated;
  });
}

// Saves edited fields; the log, type and freezes held are kept. Only a new
// daily target can change a group result (an Hours habit counts as done at
// its target), so groups are re-checked when it changes.
export function updateHabit(
  habitId: string,
  draft: NewHabitDraft,
  todayKey: string = toDateKey(new Date()),
): Promise<Habit> {
  return withStorageQueue(async () => {
    const habits = await loadHabits();
    const habit = habits[habitId];
    if (!habit) throw new InvalidHabitError(`Habit not found: ${habitId}`);
    if (!isDraftValid(draft)) {
      throw new InvalidHabitError('A habit needs a name of 1-40 characters');
    }
    if (draft.type !== habit.type) {
      throw new InvalidHabitError("A habit's type can't be changed");
    }

    const updated: Habit = {
      ...habit,
      name: draft.name.trim(),
      cadence: draft.cadence,
      streakFreezeInterval: clampFreezeInterval(draft.streakFreezeInterval),
    };
    if (draft.cadence === 'Day') delete updated.target;
    else updated.target = clampCadenceTarget(draft.cadence, draft.target);
    if (habit.type === 'Hours') {
      updated.targetHours = clampTargetHours(draft.targetHours);
    }
    if (draft.colour === 'orange') delete updated.colour;
    else updated.colour = draft.colour;

    await saveHabit(updated);
    if (updated.targetHours !== habit.targetHours) {
      const groupIds =
        groupIdsByHabit(await loadHabitGroups())[updated.id] ?? [];
      for (const groupId of groupIds) {
        await syncGroupCompletionInQueue(groupId, todayKey);
      }
    }
    return updated;
  });
}

// Removes the habit and every assignment of it, then re-checks those groups.
// Groups left with no habits stay; they can't complete until habits are added.
export function deleteHabit(
  habitId: string,
  todayKey: string = toDateKey(new Date()),
): Promise<void> {
  return withStorageQueue(async () => {
    const [habits, groups] = await Promise.all([
      loadHabits(),
      loadHabitGroups(),
    ]);
    const groupIds = groupIdsByHabit(groups)[habitId] ?? [];

    delete habits[habitId];
    for (const groupId of groupIds) {
      const group = groups[groupId];
      groups[groupId] = {
        ...group,
        habitIds: group.habitIds.filter(id => id !== habitId),
        ...(group.requiredHabitIds
          ? {
              requiredHabitIds: group.requiredHabitIds.filter(
                id => id !== habitId,
              ),
            }
          : {}),
      };
    }

    await saveHabits(habits);
    await saveHabitGroups(groups);
    await recordTombstone(habitId, 'habit');
    for (const groupId of groupIds) {
      await syncGroupCompletionInQueue(groupId, todayKey);
    }
  });
}
