import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HabitListRow from './HabitListRow';
import { Habit } from '../../types/habit';

const TODAY = '2024-06-15';
const D1 = '2024-06-14';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'habit-1',
    name: 'Cook',
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

describe('HabitListRow', () => {
  it('shows the group name subtitle when the habit belongs to a group', () => {
    const { getByText } = render(
      <HabitListRow
        habit={makeHabit()}
        groupName="Eat Healthy"
        todayKey={TODAY}
        onPress={jest.fn()}
      />,
    );

    expect(getByText('Eat Healthy')).toBeTruthy();
  });

  it('omits the subtitle entirely for an ungrouped habit', () => {
    const { queryByText } = render(
      <HabitListRow habit={makeHabit()} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(queryByText('Eat Healthy')).toBeNull();
  });

  it('renders marked state as checked', () => {
    const habit = makeHabit({
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitListRow habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-row-habit-1').props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });
  });

  it('renders unmarked-but-streak-alive state as unchecked with streak shown', () => {
    const habit = makeHabit({
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByTestId, getByText } = render(
      <HabitListRow habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-row-habit-1').props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(getByText('1')).toBeTruthy();
  });

  it('calls onPress with the habit id when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HabitListRow habit={makeHabit()} todayKey={TODAY} onPress={onPress} />,
    );

    fireEvent.press(getByTestId('habit-row-habit-1'));

    expect(onPress).toHaveBeenCalledWith('habit-1');
  });

  it('is disabled for a non-Day/non-Checkmark habit', () => {
    const habit = makeHabit({ cadence: 'Week' });
    const { getByTestId } = render(
      <HabitListRow habit={habit} todayKey={TODAY} onPress={jest.fn()} />,
    );

    expect(getByTestId('habit-row-habit-1').props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
  });
});
