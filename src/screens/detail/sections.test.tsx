import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import MonthGrid, { DayInfo } from './MonthGrid';
import RatingStars from './RatingStars';
import HeatmapSection from './HeatmapSection';
import { sliceText } from './CompletionRateSection';
import {
  dayLabel,
  dayStateOf,
  hoursBars,
  monthsBetween,
} from './HistorySection';
import { colors } from '../../theme';

describe('MonthGrid', () => {
  const info = (state: DayInfo['state'], inRange = true): DayInfo => ({
    state,
    inRange,
    label: 'x',
  });
  const states: Record<string, DayInfo> = {
    '2026-11-02': info('done'),
    '2026-11-03': info('partial'),
    '2026-11-04': info('frozen'),
    '2026-11-05': info('none', false),
  };
  const renderGrid = (
    onPressDay?: (key: string) => void,
    weekStart: 'monday' | 'sunday' = 'monday',
  ) =>
    render(
      <MonthGrid
        year={2026}
        month={10}
        weekStart={weekStart}
        color="#123456"
        dayInfo={key => states[key] ?? info('none')}
        onPressDay={onPressDay}
      />,
    );

  it('should title the month and order the weekday letters by the week start', () => {
    const letters = (weekStart: 'monday' | 'sunday') =>
      renderGrid(undefined, weekStart)
        .getAllByText(/^[SMTWF]$/)
        .map(t => t.props.children);

    expect([
      !!renderGrid().getByText('November 2026'),
      letters('monday'),
      letters('sunday'),
    ]).toEqual([
      true,
      ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    ]);
  });

  it('should dim days outside the range and only let days in range be tapped', () => {
    const onPressDay = jest.fn();
    const { getByTestId } = renderGrid(onPressDay);
    fireEvent.press(getByTestId('day-2026-11-05'));
    fireEvent.press(getByTestId('day-2026-11-02'));

    expect([
      StyleSheet.flatten(getByTestId('day-2026-11-05').props.style).opacity,
      onPressDay.mock.calls,
    ]).toEqual([0.3, [['2026-11-02']]]);
  });

  it('should not be tappable without onPressDay', () => {
    expect(
      renderGrid().getByTestId('day-2026-11-02').props.accessibilityRole,
    ).toBeUndefined();
  });
});

describe('RatingStars', () => {
  const rating = {
    stars: 3,
    items: [
      {
        goal: 'Keep your streak going',
        state: 'earned' as const,
        status: 'Earned',
      },
      {
        goal: 'Most days this week',
        state: 'earned' as const,
        status: 'Earned',
      },
      {
        goal: 'Every day this week',
        state: 'todo' as const,
        status: '1 day missed',
      },
      {
        goal: 'Most days for 2 weeks',
        state: 'earned' as const,
        status: 'Earned',
      },
      {
        goal: 'Steady for 3 weeks',
        state: 'locked' as const,
        status: 'Opens 14 Dec',
      },
    ],
  };

  it('should fill the earned stars', () => {
    const { getByTestId, toJSON } = render(
      <RatingStars rating={rating} color="#123456" />,
    );
    // The stars are SVG views, which the queries skip; count them in the tree
    const json = JSON.stringify(toJSON());
    const count = (id: string) => json.split(`"testID":"${id}"`).length - 1;

    expect([
      count('detail-rating-filled'),
      count('detail-rating-empty'),
      getByTestId('detail-rating').props.accessibilityLabel,
    ]).toEqual([3, 2, '3 of 5 stars']);
  });

  it('should open the goals from How to earn, and close them again', () => {
    const utils = render(<RatingStars rating={rating} color="#123456" />);
    const closed = utils.queryByTestId('rating-rules');
    fireEvent.press(utils.getByTestId('rating-help'));
    const goals = [1, 2, 3, 4, 5].map(
      i => utils.getByTestId(`rating-goal-${i}`).props.accessibilityLabel,
    );
    fireEvent.press(utils.getByTestId('rating-rules-close'));

    expect([closed, goals, utils.queryByTestId('rating-rules')]).toEqual([
      null,
      [
        'Keep your streak going, Earned',
        'Most days this week, Earned',
        'Every day this week, 1 day missed',
        'Most days for 2 weeks, Earned',
        'Steady for 3 weeks, Opens 14 Dec',
      ],
      null,
    ]);
  });
});

describe('HeatmapSection', () => {
  it('should shade cells by step and show the share under each', () => {
    const { getByTestId, getByText } = render(
      <HeatmapSection
        slots={[
          { label: 'Mon', share: 1 },
          { label: 'Tue', share: 0 },
        ]}
        steps={[4, 0]}
        color="#ff0000"
      />,
    );
    const bg = (id: string) =>
      StyleSheet.flatten(getByTestId(id).props.style).backgroundColor;

    expect([
      bg('detail-heat-Mon'),
      bg('detail-heat-Tue'),
      !!getByText('100%'),
    ]).toEqual(['#ff0000', colors.v2CardBackgroundInset, true]);
  });

  it('should say there is not enough data yet', () => {
    const { getByTestId } = render(
      <HeatmapSection
        slots={[{ label: 'Mon', share: null }]}
        steps={[0]}
        color="#ff0000"
      />,
    );

    expect(getByTestId('detail-heatmap-empty')).toBeTruthy();
  });
});

describe('history helpers', () => {
  it('should mark a day done, part done, frozen or not done', () => {
    const done = new Set(['a']);
    const frozen = new Set(['c']);
    const hours = new Map([['b', 1]]);

    expect(
      ['a', 'b', 'c', 'd'].map(d => dayStateOf(d, done, frozen, hours)),
    ).toEqual(['done', 'partial', 'frozen', 'none']);
  });

  it('should label a day for TalkBack', () => {
    expect(dayLabel('2026-11-24', 'frozen')).toBe('Tue 24 Nov, frozen');
  });

  it('should list the months a range touches', () => {
    expect(monthsBetween('2025-11-27', '2026-01-03')).toEqual([
      [2025, 10],
      [2025, 11],
      [2026, 0],
    ]);
  });

  it('should give a bar a day up to a month, then the weekly average', () => {
    const hours = new Map([
      ['2026-11-26', 2],
      ['2026-11-25', 1],
    ]);
    const short = hoursBars(hours, '2026-11-20', '2026-11-26');
    const long = hoursBars(hours, '2026-08-27', '2026-11-26');

    expect([
      short,
      long.weekly,
      long.values.slice(-1)[0],
      long.values.length,
    ]).toEqual([
      { values: [0, 0, 0, 0, 0, 1, 2], weekly: false },
      true,
      3 / 7,
      14,
    ]);
  });

  it('should describe the trend slices', () => {
    expect([
      sliceText(1, 'Day'),
      sliceText(40, 'Day'),
      sliceText(2, 'Week'),
    ]).toEqual([
      'Each point is 1 day, most recent first',
      'Each point is 40 days, most recent first',
      'Each point is 2 weeks, most recent first',
    ]);
  });
});
