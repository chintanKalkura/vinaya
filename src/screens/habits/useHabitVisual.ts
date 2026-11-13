import { Habit } from '../../types/habit';
import { CadenceStatus, getCadenceStatus } from '../../utils/cadence';
import { getHoursToday, habitMarkers } from '../../utils/hours';

export interface HoursVisualState {
  hoursToday: number;
}

export interface HabitVisual {
  status: CadenceStatus;
  hours: HoursVisualState | null;
}

export function useHabitVisual(habit: Habit, todayKey: string): HabitVisual {
  const isHours = habit.type === 'Hours';
  const status = getCadenceStatus(
    habitMarkers(habit),
    habit.cadence,
    habit.target,
    todayKey,
    habit.streakFreeze,
  );
  const hours = isHours ? { hoursToday: getHoursToday(habit, todayKey) } : null;

  return { status, hours };
}
