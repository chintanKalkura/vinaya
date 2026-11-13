import { Habit } from '../../types/habit';
import { CadenceStatus, getCadenceStatus } from '../../utils/cadence';
import { getHoursToday, targetMetLog } from '../../utils/hours';

export interface HoursVisualState {
  hoursToday: number;
}

export interface HabitVisual {
  status: CadenceStatus;
  hours: HoursVisualState | null;
}

export function useHabitVisual(habit: Habit, todayKey: string): HabitVisual {
  const isHours = habit.type === 'Hours';
  const markers = isHours ? targetMetLog(habit, habit.history) : habit.history;
  const status = getCadenceStatus(
    markers,
    habit.cadence,
    habit.target,
    todayKey,
  );
  const hours = isHours ? { hoursToday: getHoursToday(habit, todayKey) } : null;

  return { status, hours };
}
