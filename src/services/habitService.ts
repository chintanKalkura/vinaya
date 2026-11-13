import { Habit } from '../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { toDateKey } from '../utils/dates';
import { clampHours, habitMarkers } from '../utils/hours';
import { withEarnedFreezes } from '../utils/streakFreeze';
import { loadHabits, saveHabit } from '../storage/habitStorage';
import { syncGroupCompletion } from './habitGroupService';

export class InvalidMarkError extends Error {}

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

// Earns any freeze the new streak reached, then updates the habit's group
async function saveAndSync(habit: Habit, todayKey: string): Promise<Habit> {
  const updated = withEarnedFreezes(habit, habitMarkers(habit), todayKey);
  await saveHabit(updated);
  if (updated.groupId) await syncGroupCompletion(updated.groupId, todayKey);
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
