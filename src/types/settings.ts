// Display settings: docs/feature-development/release-1-readiness/display-settings.md
export type DefaultView = 'list' | 'group';
export type ThemeSetting = 'dark' | 'light' | 'system';
export type WeekStart = 'monday' | 'sunday'; // weekly stats, heatmap and calendar grids

export interface Settings {
  defaultView: DefaultView;
  theme: ThemeSetting;
  weekStart: WeekStart;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultView: 'list',
  theme: 'dark',
  weekStart: 'monday',
};
