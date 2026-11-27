import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import HabitListRow from './HabitListRow';
import { Habit } from '../../types/habit';

const TODAY = '2024-06-15';
const marked = { date: TODAY, kind: 'marker' as const, value: 1 };

const habit = (done: boolean): Habit => ({
  id: 'h',
  name: 'Run',
  cadence: 'Day',
  type: 'Checkmark',
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: 0,
  recentLog: done ? [marked] : [],
  history: done ? [marked] : [],
});

const row = (done: boolean) => (
  <HabitListRow
    habit={habit(done)}
    todayKey={TODAY}
    onPress={jest.fn()}
    colorKind="banner"
  />
);
const burst = (utils: ReturnType<typeof render>) =>
  utils.queryByTestId('habit-row-burst-h', { includeHiddenElements: true });

describe('StarBurst on marking', () => {
  it('should play when a habit becomes done', () => {
    const utils = render(row(false));
    const before = burst(utils);
    utils.rerender(row(true));

    expect([before, !!burst(utils)]).toEqual([null, true]);
  });

  it('should not play for a habit already done when first shown', () => {
    expect(burst(render(row(true)))).toBeNull();
  });

  it('should not play when unmarked', () => {
    const utils = render(row(true));
    utils.rerender(row(false));

    expect(burst(utils)).toBeNull();
  });

  it("should not play with the phone's Remove animations setting on", async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    const utils = render(row(false));
    await act(async () => {});
    utils.rerender(row(true));

    await waitFor(() => expect(burst(utils)).toBeNull());
  });
});
