import { Habit, HabitCadence, HabitType } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { clampCadenceTarget } from './cadence';
import { clampFreezeInterval } from './streakFreeze';

// Create Habit rules: docs/feature-development/create-habit.md

export const HABIT_NAME_MAX = 40;

export interface NewHabitDraft {
  name: string;
  cadence: HabitCadence;
  target: number; // Week/Month/Year only
  streakFreezeInterval: number;
  type: HabitType;
  targetHours: number; // Hours only
  groupId?: string;
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

// Required/Any/All groups take Checkmark habits; Hours groups take Hours habits
export function canJoinGroup(type: HabitType, group: HabitGroup): boolean {
  return (group.groupType === 'Hours') === (type === 'Hours');
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
  if (draft.groupId) habit.groupId = draft.groupId;
  return habit;
}
