import {LogEntry} from './log';
import {HabitCadence, HabitStatus} from './habit';

export type HabitGroupType = 'Required' | 'Any' | 'All' | 'Hours';

export interface HabitGroup {
  id: string;
  name: string;
  cadence: HabitCadence; // independent of member habits' cadence
  groupType: HabitGroupType;
  habitIds: string[]; // assigned habits, kept in sync by the service layer
  requiredHabitIds?: string[]; // Required type only — subset of habitIds
  hoursTarget?: number; // Hours type only — aggregate target across assigned habits
  streakPlaceholder?: number; // static banner number until group streaks are specified
  status: HabitStatus;
  sortOrder: number;
  createdAt: number;
  recentLog: LogEntry[]; // capped rolling window, newest-first
  history: LogEntry[]; // append-only, oldest -> newest, unbounded
}
