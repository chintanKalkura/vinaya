export interface HabitLimitsConfig {
  cadenceTargetMax: {
    Week: number;
    Month: number;
    Year: number;
  };
  hoursTargetMax: number;
  streakFreezeIntervalDefault: number;
  recentLogSize: number;
}

export const DEFAULT_HABIT_LIMITS: HabitLimitsConfig = {
  cadenceTargetMax: {Week: 6, Month: 20, Year: 100},
  hoursTargetMax: 24,
  streakFreezeIntervalDefault: 7,
  recentLogSize: 90,
};
