import { Habit } from '../../types/habit';
import { isHabitMarkedToday } from '../../utils/groupCompletion';
import { getHoursToday } from '../../utils/hours';
import { deriveHabitVisualState, HabitVisualState } from '../../utils/streak';

export interface HoursVisualState {
  hoursToday: number;
  isMarked: boolean;
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
  const visual = isCheckmark
    ? deriveHabitVisualState(habit.recentLog, todayKey)
    : null;
  const hours = isHours
    ? {
        hoursToday: getHoursToday(habit, todayKey),
        isMarked: isHabitMarkedToday(habit, todayKey),
      }
    : null;

  return { interactive: isCheckmark || isHours, visual, hours };
}
