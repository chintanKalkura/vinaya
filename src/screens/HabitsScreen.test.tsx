import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import HabitsScreen from './HabitsScreen';
import { saveHabitGroups, saveHabits } from '../storage/habitStorage';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';

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
          groupId: 'precepts',
        }),
      },
      { precepts: makeGroup({ habitIds: ['study'] }) },
    );

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-study');

    fireEvent.press(pill);

    await waitFor(() => {
      expect(pill.props.accessibilityState.disabled).toBe(true);
    });
    expect(pill.props.accessibilityState.checked).toBe(false);
  });

  it('does not switch layout when the list toggle is pressed', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId, queryByTestId } = render(
      <HabitsScreen />,
    );
    await findByTestId('habit-pill-no-killing');

    fireEvent.press(getByTestId('view-mode-toggle-list'));

    expect(queryByTestId('group-card-precepts')).toBeTruthy();
    expect(queryByTestId('habit-row-no-killing')).toBeNull();
  });

  it('does not render habits that belong to no group', async () => {
    await seed(
      {
        'no-killing': makeHabit(),
        'drink-water': makeHabit({
          id: 'drink-water',
          name: 'Drink Water',
          groupId: undefined,
        }),
      },
      { precepts: makeGroup() },
    );

    const { findByTestId, queryByTestId } = render(<HabitsScreen />);
    await findByTestId('habit-pill-no-killing');

    expect(queryByTestId('habit-pill-drink-water')).toBeNull();
  });

  it('does not render Hours groups', async () => {
    await seed(
      {
        'no-killing': makeHabit(),
        study: makeHabit({ id: 'study', type: 'Hours', groupId: 'productive' }),
      },
      {
        precepts: makeGroup(),
        productive: makeGroup({
          id: 'productive',
          name: 'Stay Productive',
          groupType: 'Hours',
          habitIds: ['study'],
          sortOrder: 1,
        }),
      },
    );

    const { findByTestId, queryByTestId } = render(<HabitsScreen />);
    await findByTestId('group-card-precepts');

    expect(queryByTestId('group-card-productive')).toBeNull();
  });

  it('turns a Required group grey when a required habit is unmarked', async () => {
    await seed(
      {
        'no-killing': makeHabit({
          recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
        }),
      },
      { precepts: makeGroup({ requiredHabitIds: ['no-killing'] }) },
    );

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-no-killing');
    const card = await findByTestId('group-card-precepts');
    await waitFor(() =>
      expect(StyleSheet.flatten(card.props.style).borderColor).toBe(
        colors.v2Orange,
      ),
    );

    fireEvent.press(pill);

    await waitFor(() =>
      expect(StyleSheet.flatten(card.props.style).borderColor).toBe(
        colors.v2Border,
      ),
    );
  });

  it('turns an Any group orange when one of its habits is marked', async () => {
    await seed(
      { cook: makeHabit({ id: 'cook', name: 'Cook', groupId: 'eat' }) },
      {
        eat: makeGroup({
          id: 'eat',
          name: 'Eat Healthy',
          groupType: 'Any',
          habitIds: ['cook'],
        }),
      },
    );

    const { findByTestId } = render(<HabitsScreen />);
    const pill = await findByTestId('habit-pill-cook');
    const card = await findByTestId('group-card-eat');
    expect(StyleSheet.flatten(card.props.style).borderColor).toBe(
      colors.v2Border,
    );

    fireEvent.press(pill);

    await waitFor(() =>
      expect(StyleSheet.flatten(card.props.style).borderColor).toBe(
        colors.v2Orange,
      ),
    );
  });

  it('shows the FAB and the four bottom menu items', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId } = render(<HabitsScreen />);
    await findByTestId('habit-pill-no-killing');

    expect(getByTestId('fab')).toBeTruthy();
    ['Habits', 'Journal', 'Level-Up', 'Profile'].forEach(label => {
      expect(getByTestId(`bottom-menu-${label}`)).toBeTruthy();
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
