import { Habit, HabitCadence, HabitType } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { clampCadenceTarget } from './cadence';
import { clampFreezeInterval } from './streakFreeze';
import { canTakeHabit } from './newHabitGroup';

// Create Habit rules: docs/feature-development/habits-section/create-habit.md

export const HABIT_NAME_MAX = 40;

// Stands for a group made with "+ Create Group" that is saved with the habit
export const PENDING_GROUP_ID = 'pending-group';

export interface NewHabitDraft {
  name: string;
  cadence: HabitCadence;
  target: number; // Week/Month/Year only
  streakFreezeInterval: number;
  type: HabitType;
  targetHours: number; // Hours only
  groupId?: string; // the group to join; membership is stored on the group
}

export const DEFAULT_DRAFT: NewHabitDraft = {
  name: '',
  cadence: 'Day',
  target: 1,
  streakFreezeInterval: DEFAULT_HABIT_LIMITS.streakFreezeIntervalDefault,
  type: 'Checkmark',
  targetHours: 1,
};

export function isDraftValid(draft: NewHabitDraft): boolean {
  const name = draft.name.trim();
  return name.length > 0 && name.length <= HABIT_NAME_MAX;
}

export function canJoinGroup(type: HabitType, group: HabitGroup): boolean {
  return canTakeHabit(group.groupType, type);
}

export function clampTargetHours(value: number): number {
  const whole = Number.isFinite(value) ? Math.round(value) : 1;
  return Math.min(DEFAULT_HABIT_LIMITS.hoursTargetMax, Math.max(1, whole));
}

export function buildHabit(
  draft: NewHabitDraft,
  id: string,
  sortOrder: number,
  createdAt: number,
): Habit {
  const habit: Habit = {
    id,
    name: draft.name.trim(),
    cadence: draft.cadence,
    type: draft.type,
    streakFreezeInterval: clampFreezeInterval(draft.streakFreezeInterval),
    status: 'active',
    sortOrder,
    createdAt,
    recentLog: [],
    history: [],
  };
  if (draft.cadence !== 'Day') {
    habit.target = clampCadenceTarget(draft.cadence, draft.target);
  }
  if (draft.type === 'Hours') {
    habit.targetHours = clampTargetHours(draft.targetHours);
  }
  return habit;
}

// Edit Habit: docs/feature-development/habits-section/edit-habit-group.md
export function draftFromHabit(habit: Habit): NewHabitDraft {
  return {
    name: habit.name,
    cadence: habit.cadence,
    target: habit.target ?? 1,
    streakFreezeInterval: habit.streakFreezeInterval,
    type: habit.type,
    targetHours: habit.targetHours ?? 1,
  };
}

// Only the fields that apply to the draft's cadence and type count
export function isDraftChanged(
  saved: NewHabitDraft,
  draft: NewHabitDraft,
): boolean {
  return (
    saved.name.trim() !== draft.name.trim() ||
    saved.cadence !== draft.cadence ||
    (draft.cadence !== 'Day' && saved.target !== draft.target) ||
    saved.streakFreezeInterval !== draft.streakFreezeInterval ||
    saved.type !== draft.type ||
    (draft.type === 'Hours' && saved.targetHours !== draft.targetHours)
  );
}
