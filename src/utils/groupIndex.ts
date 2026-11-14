import { HabitGroup } from '../types/habitGroup';

// Group membership is stored only in HabitGroup.habitIds. This index is
// built from the groups when they load and is never stored.
export function groupIdsByHabit(
  groups: HabitGroup[] | Record<string, HabitGroup>,
): Record<string, string[]> {
  const list = Array.isArray(groups) ? groups : Object.values(groups);
  const index: Record<string, string[]> = {};
  [...list]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach(group => {
      group.habitIds.forEach(habitId => {
        (index[habitId] ??= []).push(group.id);
      });
    });
  return index;
}
