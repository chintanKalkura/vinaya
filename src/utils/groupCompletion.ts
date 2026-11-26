import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { getHoursOn, targetMetLog } from './hours';

// Read from the full history, so it holds for past dates too (recentLog is
// capped at DEFAULT_HABIT_LIMITS.recentLogSize entries)
export function isHabitMarkedToday(habit: Habit, todayKey: string): boolean {
  if (habit.type === 'Hours') {
    return targetMetLog(habit, habit.history).some(
      entry => entry.date === todayKey,
    );
  }
  return habit.history.some(
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
    case 'Hours': {
      const target = group.targetHours ?? 0;
      if (target <= 0) return false;
      const total = habits.reduce(
        (sum, h) => sum + getHoursOn(h, todayKey),
        0,
      );
      return total >= target;
    }
    default:
      return false;
  }
}
