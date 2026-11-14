import { HabitCadence, HabitType } from '../types/habit';
import { HabitGroup, HabitGroupType } from '../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { clampCadenceTarget } from './cadence';
import { clampFreezeInterval } from './streakFreeze';
import { HABIT_NAME_MAX, clampTargetHours } from './newHabit';

// Create Habit Group rules: docs/feature-development/habits-section/create-habit-group.md

// Stands for the habit being created when a group is made from its form
export const PENDING_HABIT_ID = 'pending-habit';

export interface NewHabitGroupDraft {
  name: string;
  cadence: HabitCadence;
  target: number; // Week/Month/Year only
  streakFreezeInterval: number;
  groupType: HabitGroupType;
  habitIds: string[];
  requiredHabitIds: string[]; // Required only, a subset of habitIds
  targetHours: number; // Hours only
}

export const DEFAULT_GROUP_DRAFT: NewHabitGroupDraft = {
  name: '',
  cadence: 'Day',
  target: 1,
  streakFreezeInterval: DEFAULT_HABIT_LIMITS.streakFreezeIntervalDefault,
  groupType: 'Any',
  habitIds: [],
  requiredHabitIds: [],
  targetHours: 1,
};

export const GROUP_TYPE_DESCRIPTIONS: Record<HabitGroupType, string> = {
  Required: 'Some habits must be done to complete the group',
  Any: 'Any one habit marks the group complete',
  All: 'Every habit must be done to complete the group',
  Hours: 'Total hours across habits must meet target',
};

// Required/Any/All groups take Checkmark habits; Hours groups take Hours habits
export function canTakeHabit(
  groupType: HabitGroupType,
  habitType: HabitType,
): boolean {
  return (groupType === 'Hours') === (habitType === 'Hours');
}

// Drops habits the new type can't take; leaving Required clears the required list
export function changeGroupType(
  draft: NewHabitGroupDraft,
  groupType: HabitGroupType,
  habitTypes: Record<string, HabitType>,
): NewHabitGroupDraft {
  const habitIds = draft.habitIds.filter(
    id =>
      habitTypes[id] !== undefined && canTakeHabit(groupType, habitTypes[id]),
  );
  const requiredHabitIds =
    groupType === 'Required'
      ? draft.requiredHabitIds.filter(id => habitIds.includes(id))
      : [];
  return { ...draft, groupType, habitIds, requiredHabitIds };
}

// Unassigning a habit also takes it off the required list
export function assignHabits(
  draft: NewHabitGroupDraft,
  habitIds: string[],
): NewHabitGroupDraft {
  return {
    ...draft,
    habitIds,
    requiredHabitIds: draft.requiredHabitIds.filter(id =>
      habitIds.includes(id),
    ),
  };
}

export function isGroupDraftValid(draft: NewHabitGroupDraft): boolean {
  const name = draft.name.trim();
  if (name.length === 0 || name.length > HABIT_NAME_MAX) return false;
  if (draft.habitIds.length === 0) return false;
  if (draft.groupType === 'Required') {
    return (
      draft.requiredHabitIds.length > 0 &&
      draft.requiredHabitIds.every(id => draft.habitIds.includes(id))
    );
  }
  return true;
}

export function buildHabitGroup(
  draft: NewHabitGroupDraft,
  id: string,
  sortOrder: number,
  createdAt: number,
): HabitGroup {
  const group: HabitGroup = {
    id,
    name: draft.name.trim(),
    cadence: draft.cadence,
    groupType: draft.groupType,
    habitIds: [...draft.habitIds],
    streakFreezeInterval: clampFreezeInterval(draft.streakFreezeInterval),
    status: 'active',
    sortOrder,
    createdAt,
    recentLog: [],
    history: [],
  };
  if (draft.cadence !== 'Day') {
    group.target = clampCadenceTarget(draft.cadence, draft.target);
  }
  if (draft.groupType === 'Required') {
    group.requiredHabitIds = [...draft.requiredHabitIds];
  }
  if (draft.groupType === 'Hours') {
    group.targetHours = clampTargetHours(draft.targetHours);
  }
  return group;
}

// Edit Habit Group: docs/feature-development/habits-section/edit-habit-group.md
export function draftFromGroup(group: HabitGroup): NewHabitGroupDraft {
  return {
    name: group.name,
    cadence: group.cadence,
    target: group.target ?? 1,
    streakFreezeInterval: group.streakFreezeInterval,
    groupType: group.groupType,
    habitIds: [...group.habitIds],
    requiredHabitIds: [...(group.requiredHabitIds ?? [])],
    targetHours: group.targetHours ?? 1,
  };
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every(id => b.includes(id));
}

// Only the fields that apply to the draft's cadence and type count
export function isGroupDraftChanged(
  saved: NewHabitGroupDraft,
  draft: NewHabitGroupDraft,
): boolean {
  return (
    saved.name.trim() !== draft.name.trim() ||
    saved.cadence !== draft.cadence ||
    (draft.cadence !== 'Day' && saved.target !== draft.target) ||
    saved.streakFreezeInterval !== draft.streakFreezeInterval ||
    saved.groupType !== draft.groupType ||
    !sameSet(saved.habitIds, draft.habitIds) ||
    (draft.groupType === 'Required' &&
      !sameSet(saved.requiredHabitIds, draft.requiredHabitIds)) ||
    (draft.groupType === 'Hours' && saved.targetHours !== draft.targetHours)
  );
}
