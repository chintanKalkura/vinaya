import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HabitsScreen from './HabitsScreen';
import { saveHabitGroups, saveHabits } from '../storage/habitStorage';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';

jest.mock('../utils/dates', () => {
  const actual = jest.requireActual('../utils/dates');
  return { ...actual, toDateKey: () => '2024-06-15' };
});

const TODAY = '2024-06-15';

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'no-killing',
    name: 'No Killing',
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    groupId: 'precepts',
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

function makeGroup(overrides: Partial<HabitGroup> = {}): HabitGroup {
  return {
    id: 'precepts',
    name: '8 Precepts',
    cadence: 'Day',
    groupType: 'Required',
    habitIds: ['no-killing'],
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

async function seed(
  habits: Record<string, Habit>,
  groups: Record<string, HabitGroup> = {},
) {
  await saveHabits(habits);
  await saveHabitGroups(groups);
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('HabitsScreen', () => {
  it('renders group view by default with seeded habits visible', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByText, findByTestId } = render(<HabitsScreen />);

    expect(await findByText('8 Precepts')).toBeTruthy();
    expect(await findByTestId('habit-pill-no-killing')).toBeTruthy();
  });

  it('marks an unmarked Day/Checkmark habit on tap', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-no-killing');

    fireEvent.press(pill);

    await waitFor(() => {
      expect(pill.props.accessibilityState.checked).toBe(true);
    });
  });

  it('unmarks a marked habit on a second tap', async () => {
    await seed(
      {
        'no-killing': makeHabit({
          recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
        }),
      },
      { precepts: makeGroup() },
    );

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-no-killing');
    await waitFor(() =>
      expect(pill.props.accessibilityState.checked).toBe(true),
    );

    fireEvent.press(pill);

    await waitFor(() => {
      expect(pill.props.accessibilityState.checked).toBe(false);
    });
  });

  it('does not mark a non-Day/non-Checkmark habit on tap', async () => {
    await seed(
      {
        study: makeHabit({
          id: 'study',
          name: 'Study',
          type: 'Hours',
          groupId: undefined,
        }),
      },
      {},
    );

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-study');

    fireEvent.press(pill);

    await waitFor(() => {
      expect(pill.props.accessibilityState.disabled).toBe(true);
    });
    expect(pill.props.accessibilityState.checked).toBe(false);
  });

  it('switches layout when the view-mode toggle is pressed', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId, queryByTestId } = render(
      <HabitsScreen />,
    );
    await findByTestId('habit-pill-no-killing');
    expect(queryByTestId('group-card-precepts')).toBeTruthy();

    fireEvent.press(getByTestId('view-mode-toggle-list'));

    await waitFor(() => {
      expect(queryByTestId('group-card-precepts')).toBeNull();
      expect(getByTestId('habit-row-no-killing')).toBeTruthy();
    });
  });

  it('reflects a mark made in group view when switched to list view', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-no-killing');
    fireEvent.press(pill);
    await waitFor(() =>
      expect(pill.props.accessibilityState.checked).toBe(true),
    );

    fireEvent.press(getByTestId('view-mode-toggle-list'));

    await waitFor(() => {
      const row = getByTestId('habit-row-no-killing');
      expect(row.props.accessibilityState.checked).toBe(true);
    });
  });

  it('persists marks across a remount against the same storage', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const first = render(<HabitsScreen />);
    const pill = await first.findByTestId('habit-pill-no-killing');
    fireEvent.press(pill);
    await waitFor(() =>
      expect(pill.props.accessibilityState.checked).toBe(true),
    );
    first.unmount();

    const second = render(<HabitsScreen />);
    const reloadedPill = await second.findByTestId('habit-pill-no-killing');

    await waitFor(() => {
      expect(reloadedPill.props.accessibilityState.checked).toBe(true);
    });
  });
});
