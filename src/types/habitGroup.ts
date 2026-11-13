import { LogEntry } from './log';
import { HabitCadence, HabitStatus } from './habit';

export type HabitGroupType = 'Required' | 'Any' | 'All' | 'Hours';

export interface HabitGroup {
  id: string;
  name: string;
  cadence: HabitCadence; // independent of member habits' cadence
  groupType: HabitGroupType;
  habitIds: string[]; // assigned habits, kept in sync by the service layer
  target?: number; // Week/Month/Year cadence — complete days per window, max cadenceTargetMax
  requiredHabitIds?: string[]; // Required type only — subset of habitIds
  targetHours?: number; // Hours type only — daily aggregate target across assigned habits, max hoursTargetMax
  status: HabitStatus;
  sortOrder: number;
  createdAt: number;
  recentLog: LogEntry[]; // capped rolling window, newest-first
  history: LogEntry[]; // oldest -> newest, unbounded; today's entry is removed when the group stops being complete
}
