export type HabitState = 'none' | 'done' | 'frozen';
export type IntentionResult = 'no' | 'yes' | 'partial';
export type WinState = 'won' | 'lost' | 'fought' | null;
export type MoodGroup = 'viriya' | 'samadhi' | 'vedana' | 'sampajanna';

export interface HabitDefinition {
  id: string;
  name: string;
  isKeystone?: boolean;
}

export interface ChallengeConfig {
  title: string;
  startDate: string; // YYYY-MM-DD — Day 1
  totalDays: number;
}

export interface DayLog {
  habits: Record<string, HabitState>;
  moods: Partial<Record<MoodGroup, string>>;
  journal: string;
  win: WinState;
  intentions: [string, string, string];
  intentionResults: [IntentionResult, IntentionResult, IntentionResult];
}
