import { Habit } from '../../types/habit';
import { getHoursToday, targetMetLog } from '../../utils/hours';
import { deriveHabitVisualState, HabitVisualState } from '../../utils/streak';

export interface HoursVisualState {
  hoursToday: number;
}

export interface HabitVisual {
  interactive: boolean;
  visual: HabitVisualState | null;
  hours: HoursVisualState | null;
}

export function useHabitVisual(habit: Habit, todayKey: string): HabitVisual {
  const isDay = habit.cadence === 'Day';
  const isCheckmark = isDay && habit.type === 'Checkmark';
  const isHours = isDay && habit.type === 'Hours';
  const markerLog = isHours ? targetMetLog(habit) : habit.recentLog;
  const visual =
    isCheckmark || isHours ? deriveHabitVisualState(markerLog, todayKey) : null;
  const hours = isHours ? { hoursToday: getHoursToday(habit, todayKey) } : null;

  return { interactive: isCheckmark || isHours, visual, hours };
}
