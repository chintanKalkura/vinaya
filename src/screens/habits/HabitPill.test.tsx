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
    history: [],
    ...overrides,
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
      disabled: false,
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
      disabled: false,
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
      disabled: false,
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

  it('shows hours logged today for an Hours habit', () => {
    const habit = makeHabit({
      type: 'Hours',
      targetHours: 2,
      recentLog: [{ date: TODAY, kind: 'hours', value: 3 }],
    });
    const { getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByText('3h')).toBeTruthy();
  });

  it('shows an Hours habit orange when hours today meet its target', () => {
    const habit = makeHabit({
      type: 'Hours',
      targetHours: 2,
      recentLog: [{ date: TODAY, kind: 'hours', value: 2 }],
    });
    const { getByTestId } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(
      StyleSheet.flatten(getByTestId('habit-hours-habit-1').props.style).color,
    ).toBe(colors.v2Orange);
  });

  it('shows an Hours habit grey when hours today are below its target', () => {
    const habit = makeHabit({
      type: 'Hours',
      targetHours: 2,
      recentLog: [{ date: TODAY, kind: 'hours', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(
      StyleSheet.flatten(getByTestId('habit-hours-habit-1').props.style).color,
    ).toBe(colors.v2GreyText);
  });

  it('calls onPress with the habit id when an Hours habit is pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HabitPill
        habit={makeHabit({ type: 'Hours', targetHours: 1 })}
        todayKey={TODAY}
        onPress={onPress}
      />,
    );

    fireEvent.press(getByTestId('habit-pill-habit-1'));

    expect(onPress).toHaveBeenCalledWith('habit-1');
  });

  it('is disabled and shows a dash for a non-Day habit', () => {
    const habit = makeHabit({ cadence: 'Week' });
    const { getByTestId, getByText } = render(
      <HabitPill habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-pill-habit-1').props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
    expect(getByText('–')).toBeTruthy();
  });
});
