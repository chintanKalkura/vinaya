export type HabitState = 'none' | 'done';
export type IntentionResult = 'no' | 'yes' | 'partial';
export type WinState = 'won' | 'lost' | 'fought' | null;
export type MoodGroup = 'viriya' | 'samadhi' | 'vedana' | 'sampajanna';

export interface SubHabit {
  id: string;
  name: string;
}

export type CompositeRule =
  | {type: 'any'}
  | {type: 'all'}
  | {type: 'required'; ids: string[]};

export interface HabitDefinition {
  id: string;
  name: string;
  isKeystone?: boolean;
  maxCount: number;
  subHabits?: SubHabit[];
  compositeRule?: CompositeRule;
}

export interface ChallengeConfig {
  title: string;
  startDate: string; // YYYY-MM-DD — Day 1
  totalDays: number;
}

export interface ChallengeDefinition {
  config: ChallengeConfig;
  habits: HabitDefinition[];
}

export interface DayLog {
  habits: Record<string, HabitState>;
  moods: Partial<Record<MoodGroup, string>>;
  journal: string;
  win: WinState;
  intentions: [string, string, string];
  intentionResults: [IntentionResult, IntentionResult, IntentionResult];
  logged?: boolean;
}
