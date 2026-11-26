import { HabitCadence } from '../types/habit';
import { addDays, toDateKey } from './dates';

// Edit past days: docs/feature-development/release-1-readiness/habit-group-detail-page.md
// Past days only (never today), back to n days by cadence, never before the
// day the habit was created.
export const PAST_DAYS_BY_CADENCE: Record<HabitCadence, number> = {
  Day: 7,
  Week: 15,
  Month: 60,
  Year: 180,
};

export interface DayRange {
  from: string; // oldest editable day
  to: string; // newest editable day (yesterday)
}

// Undefined when there's nothing to edit yet (created today)
export function editableRange(
  cadence: HabitCadence,
  createdAt: number,
  todayKey: string,
): DayRange | undefined {
  const created = toDateKey(new Date(createdAt));
  const oldest = addDays(todayKey, -PAST_DAYS_BY_CADENCE[cadence]);
  const from = created > oldest ? created : oldest;
  const to = addDays(todayKey, -1);
  return from <= to ? { from, to } : undefined;
}

export function isInRange(dateKey: string, range: DayRange): boolean {
  return dateKey >= range.from && dateKey <= range.to;
}
