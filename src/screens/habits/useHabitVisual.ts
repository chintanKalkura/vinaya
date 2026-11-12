import { Habit } from '../../types/habit';
import { deriveHabitVisualState, HabitVisualState } from '../../utils/streak';

export interface HabitVisual {
  interactive: boolean;
  visual: HabitVisualState | null;
}

export function useHabitVisual(habit: Habit, todayKey: string): HabitVisual {
  const interactive = habit.cadence === 'Day' && habit.type === 'Checkmark';
  const visual = interactive
    ? deriveHabitVisualState(habit.recentLog, todayKey)
    : null;

  return { interactive, visual };
}
