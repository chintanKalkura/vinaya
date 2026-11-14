import { LogEntry } from './log';
import { HabitCadence, HabitStatus, StreakFreezeState } from './habit';

export type HabitGroupType = 'Required' | 'Any' | 'All' | 'Hours';

export interface HabitGroup {
  id: string;
  name: string;
  cadence: HabitCadence; // independent of member habits' cadence
  groupType: HabitGroupType;
  habitIds: string[]; // assigned habits; the only stored membership, a habit may be in several groups
  target?: number; // Week/Month/Year cadence — complete days per window, max cadenceTargetMax
  requiredHabitIds?: string[]; // Required type only — subset of habitIds
  targetHours?: number; // Hours type only — daily aggregate target across assigned habits, max hoursTargetMax
  streakFreezeInterval: number; // the "N" in "1 skip per N streaks", on the group's own streak
  streakFreeze?: StreakFreezeState; // missing reads as nothing earned or used
  status: HabitStatus;
  sortOrder: number;
  createdAt: number;
  recentLog: LogEntry[]; // capped rolling window, newest-first
  history: LogEntry[]; // oldest -> newest, unbounded; today's entry is removed when the group stops being complete
}
