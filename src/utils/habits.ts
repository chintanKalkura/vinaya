import {HabitDefinition, HabitState} from '../types';

export function getSubHabitHours(state: HabitState): number {
  return typeof state === 'number' ? state : 0;
}

export function getHoursSum(
  habit: HabitDefinition,
  habitStates: Record<string, HabitState>,
): number {
  return (habit.subHabits ?? []).reduce(
    (sum, sh) => sum + getSubHabitHours(habitStates[sh.id] ?? 'none'),
    0,
  );
}

export function getEffectiveHabitState(
  habit: HabitDefinition,
  habitStates: Record<string, HabitState>,
): HabitState {
  if (!habit.subHabits || !habit.compositeRule) {
    return habitStates[habit.id] ?? 'none';
  }

  const {subHabits, compositeRule} = habit;

  switch (compositeRule.type) {
    case 'any':
      return subHabits.some(sh => habitStates[sh.id] === 'done') ? 'done' : 'none';
    case 'all':
      return subHabits.every(sh => habitStates[sh.id] === 'done') ? 'done' : 'none';
    case 'required':
      return compositeRule.ids.every(id => habitStates[id] === 'done') ? 'done' : 'none';
    case 'hours':
      return getHoursSum(habit, habitStates) >= compositeRule.threshold ? 'done' : 'none';
  }
}

export function getHabitsDoneCount(
  habits: HabitDefinition[],
  habitStates: Record<string, HabitState>,
): number {
  return habits.filter(h => getEffectiveHabitState(h, habitStates) === 'done').length;
}
