import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';

export function isHabitMarkedToday(habit: Habit, todayKey: string): boolean {
  return habit.recentLog.some(
    entry => entry.kind === 'marker' && entry.date === todayKey,
  );
}

export function isGroupComplete(
  group: HabitGroup,
  habits: Habit[],
  todayKey: string,
): boolean {
  if (habits.length === 0) return false;

  switch (group.groupType) {
    case 'Required': {
      const requiredIds = group.requiredHabitIds ?? [];
      if (requiredIds.length === 0) return false;
      return requiredIds.every(id => {
        const habit = habits.find(h => h.id === id);
        return habit !== undefined && isHabitMarkedToday(habit, todayKey);
      });
    }
    case 'Any':
      return habits.some(h => isHabitMarkedToday(h, todayKey));
    case 'All':
      return habits.every(h => isHabitMarkedToday(h, todayKey));
    default:
      return false;
  }
}
