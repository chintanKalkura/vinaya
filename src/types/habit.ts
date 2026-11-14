import { LogEntry } from './log';

export type HabitCadence = 'Day' | 'Week' | 'Month' | 'Year';
export type HabitType = 'Checkmark' | 'Hours';
export type HabitStatus = 'active' | 'paused' | 'archived';

// Stored freeze state, updated on marking and once a day: docs/feature-development/habits-section/streak-freeze.md
export interface StreakFreezeState {
  available: number; // freezes held, kept after a streak breaks
  earnedAtStreak: number; // streak value of the last freeze earned in this run (0 at run start)
  frozenDates: string[]; // days covered by a used freeze
  lastUsedOn?: string; // day a freeze was last used, drives the frozen look
}

export interface Habit {
  id: string;
  name: string;
  cadence: HabitCadence;
  type: HabitType;
  target?: number; // Week/Month/Year cadence, any type — marked days per window, max cadenceTargetMax
  targetHours?: number; // Hours type, any cadence — daily target, max hoursTargetMax
  streakFreezeInterval: number; // the "N" in "1 skip per N streaks", max streakFreezeIntervalMax
  streakFreeze?: StreakFreezeState; // missing reads as nothing earned or used
  status: HabitStatus;
  sortOrder: number;
  createdAt: number;
  recentLog: LogEntry[]; // capped rolling window, newest-first
  history: LogEntry[]; // oldest -> newest, unbounded; today's entry is removed on unmark
}
