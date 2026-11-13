import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import HabitPill from './HabitPill';
import { Habit } from '../../types/habit';
import { colors } from '../../theme';

const TODAY = '2024-06-15';
const D1 = '2024-06-14';
const D2 = '2024-06-13';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'No Killing',
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    ...overrides,
    // history mirrors the marks, as in real data
    history: overrides.history ?? overrides.recentLog ?? [],
  };
}

describe('HabitPill', () => {
  it('renders marked state: checked and streak visible when today is marked', () => {
    const habit = makeHabit({
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-pill-habit-1').props.accessibilityState).toEqual({
      checked: true,
    });
  });

  it('renders unmarked-but-streak-alive state: unchecked, streak still shown', () => {
    const habit = makeHabit({
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByTestId, getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-pill-habit-1').props.accessibilityState).toEqual({
      checked: false,
    });
    expect(getByText('1')).toBeTruthy();
  });

  it('renders broken-streak state: unchecked, streak zero', () => {
    const habit = makeHabit({
      recentLog: [{ date: D2, kind: 'marker', value: 1 }],
    });
    const { getByTestId, getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-pill-habit-1').props.accessibilityState).toEqual({
      checked: false,
    });
    expect(getByText('0')).toBeTruthy();
  });

  it('calls onPress with the habit id when an interactive habit is tapped', () => {
    const habit = makeHabit();
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={onPress} />,
    );

    fireEvent.press(getByTestId('habit-pill-habit-1'));

    expect(onPress).toHaveBeenCalledWith('habit-1');
  });

  it('can be pressed and shows the streak for a Week habit', () => {
    const onPress = jest.fn();
    const habit = makeHabit({
      cadence: 'Week',
      target: 2,
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByTestId, getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={onPress} />,
    );

    fireEvent.press(getByTestId('habit-pill-habit-1'));

    expect([onPress.mock.calls.length, !!getByText('1')]).toEqual([1, true]);
  });

  it('shows a Week habit orange but unchecked when its window meets the target without a mark today', () => {
    const habit = makeHabit({
      cadence: 'Week',
      target: 2,
      recentLog: [
        { date: D1, kind: 'marker', value: 1 },
        { date: D2, kind: 'marker', value: 1 },
      ],
    });
    const { getByTestId, getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect([
      getByTestId('habit-pill-habit-1').props.accessibilityState.checked,
      StyleSheet.flatten(getByText('No Killing').props.style).color,
    ]).toEqual([false, colors.v2Orange]);
  });

  it('shows the title and streak number orange when marked today', () => {
    const habit = makeHabit({
      recentLog: [
        { date: TODAY, kind: 'marker', value: 1 },
        { date: D1, kind: 'marker', value: 1 },
      ],
    });
    const { getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );
    const color = (text: string) =>
      StyleSheet.flatten(getByText(text).props.style).color;

    expect([color('No Killing'), color('2')]).toEqual([
      colors.v2Orange,
      colors.v2Orange,
    ]);
  });

  it('shows the title and streak number grey when not marked today but the streak is alive', () => {
    const habit = makeHabit({
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );
    const color = (text: string) =>
      StyleSheet.flatten(getByText(text).props.style).color;

    expect([color('No Killing'), color('1')]).toEqual([
      colors.v2GreyText,
      colors.v2GreyText,
    ]);
  });
});
