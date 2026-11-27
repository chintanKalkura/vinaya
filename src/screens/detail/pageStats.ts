import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { LogEntry } from '../../types/log';
import { WeekStart } from '../../types/settings';
import { toDateKey } from '../../utils/dates';
import { habitMarkers } from '../../utils/hours';
import {
  CompletionRate,
  HeatSlot,
  StreakSummary,
  TrendPoint,
  completionRate,
  completionUnits,
  heatSteps,
  heatmap,
  streakSummary,
  trendAxis,
  trendPoints,
} from '../../utils/history';
import { Rating, ratingOf } from '../../utils/rating';

// Everything the habit and group page shows, from one item's log:
// docs/feature-development/release-1-readiness/habit-group-detail-page.md
export interface PageStats {
  markers: LogEntry[]; // one per done day (Hours: days that met the target)
  frozenDates: string[];
  createdKey: string;
  streaks: StreakSummary;
  rate: CompletionRate;
  rating: Rating; // the five goal-based stars
  trend: TrendPoint[];
  trendStep: number;
  heat: HeatSlot[];
  heatSteps: number[];
}

export function pageStats(
  item: Habit | HabitGroup,
  isHabit: boolean,
  todayKey: string,
  weekStart: WeekStart,
): PageStats {
  const markers = isHabit ? habitMarkers(item as Habit) : item.history;
  const frozenDates = item.streakFreeze?.frozenDates ?? [];
  const createdKey = toDateKey(new Date(item.createdAt));
  const units = completionUnits(
    markers,
    item.cadence,
    item.target,
    createdKey,
    todayKey,
    weekStart,
  );
  const rate = completionRate(units);
  const heat = heatmap(markers, item.cadence, createdKey, todayKey, weekStart);
  return {
    markers,
    frozenDates,
    createdKey,
    streaks: streakSummary(markers, item.cadence, todayKey, frozenDates),
    rate,
    rating: ratingOf(item, todayKey),
    trend: trendPoints(units, item.cadence),
    trendStep: trendAxis(item.cadence, units.length).step,
    heat,
    heatSteps: heatSteps(heat, item.cadence),
  };
}

// "40%", or a dash before anything counts
export function percentText(rate: number | null): string {
  return rate === null ? '—' : `${Math.round(rate * 100)}%`;
}
