import { Habit, HabitCadence } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { clampCadenceTarget } from '../../utils/cadence';

// The fact line under the page's title card: docs/feature-development/release-1-readiness/habit-group-detail-page.md
const PERIOD: Record<Exclude<HabitCadence, 'Day'>, string> = {
  Week: 'week',
  Month: 'month',
  Year: 'year',
};

export function cadenceText(
  cadence: HabitCadence,
  target: number | undefined,
): string {
  if (cadence === 'Day') return 'Daily';
  const n = clampCadenceTarget(cadence, target);
  const times = n === 1 ? 'Once' : `${n} days`;
  return `${times} a ${PERIOD[cadence]}`;
}

export function habitFactText(habit: Habit): string {
  const base = cadenceText(habit.cadence, habit.target);
  return habit.type === 'Hours'
    ? `${base} · ${habit.targetHours ?? 0}h a day`
    : base;
}

export function groupFactText(group: HabitGroup): string {
  const base = cadenceText(group.cadence, group.target);
  return group.groupType === 'Hours'
    ? `${base} · Hours group, ${group.targetHours ?? 0}h a day`
    : `${base} · ${group.groupType} group`;
}

export function freezesHeldText(available: number): string {
  return available === 1 ? '1 freeze held' : `${available} freezes held`;
}
