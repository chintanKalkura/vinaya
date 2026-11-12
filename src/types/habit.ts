import {LogEntry} from './log';

export type HabitCadence = 'Day' | 'Week' | 'Month' | 'Year';
export type HabitType = 'Checkmark' | 'Hours';
export type HabitStatus = 'active' | 'paused' | 'archived';

export interface Habit {
  id: string;
  name: string;
  cadence: HabitCadence;
  type: HabitType;
  target?: number; // Checkmark type, Week/Month/Year cadence only
  targetHours?: number; // Hours type, any cadence
  streakFreezeInterval: number; // the "N" in "1 skip per N streaks"
  groupId?: string; // FK -> HabitGroup.id, kept in sync by the service layer
  status: HabitStatus;
  sortOrder: number;
  createdAt: number;
  recentLog: LogEntry[]; // capped rolling window, newest-first
  history: LogEntry[]; // oldest -> newest, unbounded; today's entry is removed on unmark
}
