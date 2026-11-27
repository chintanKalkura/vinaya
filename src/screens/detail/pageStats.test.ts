import { pageStats, percentText } from './pageStats';
import { Habit } from '../../types/habit';
import { addDays } from '../../utils/dates';

const TODAY = '2026-11-26';
const created = new Date(2026, 10, 17, 9).getTime(); // 9 days before TODAY
const mark = (n: number) => ({
  date: addDays(TODAY, -n),
  kind: 'marker' as const,
  value: 1,
});
const hours = (n: number, value: number) => ({
  date: addDays(TODAY, -n),
  kind: 'hours' as const,
  value,
});

const habit = (overrides: Partial<Habit>): Habit => ({
  id: 'h',
  name: 'Run',
  cadence: 'Day',
  type: 'Checkmark',
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: created,
  recentLog: [],
  history: [],
  ...overrides,
});

describe('pageStats', () => {
  it('should gather streaks, rate, stars, trend and heatmap for a habit', () => {
    const history = [9, 8, 7, 3, 2, 1, 0].map(mark);
    const stats = pageStats(habit({ history }), true, TODAY, 'monday');

    expect([
      stats.streaks,
      stats.rate,
      stats.rating.stars,
      stats.trend.length,
      stats.heat.length,
    ]).toEqual([
      { current: 4, best: 4, previous: 3 },
      { done: 7, total: 10, rate: 0.7 },
      1, // streak only: 4 of the last 7 days, and ★4 and ★5 still locked
      10,
      7,
    ]);
  });

  it('should count only the days an Hours habit met its target', () => {
    const history = [hours(2, 1), hours(1, 2)];
    const stats = pageStats(
      habit({ type: 'Hours', targetHours: 2, history }),
      true,
      TODAY,
      'monday',
    );

    expect(stats.markers.map(m => m.date)).toEqual([addDays(TODAY, -1)]);
  });

  it('should leave the rate empty and give no stars before anything counts', () => {
    const stats = pageStats(
      habit({ createdAt: new Date(2026, 10, 26, 9).getTime() }),
      true,
      TODAY,
      'monday',
    );

    expect([stats.rate.rate, stats.rating.stars, stats.trend]).toEqual([null, 0, []]);
  });
});

describe('percentText', () => {
  it.each([
    [null, '—'],
    [0, '0%'],
    [0.844, '84%'],
    [1, '100%'],
  ])('should show %p as %s', (rate, text) => {
    expect(percentText(rate)).toBe(text);
  });
});
