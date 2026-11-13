import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
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
    ...overrides,
    // history mirrors the marks, as in real data
    history: overrides.history ?? overrides.recentLog ?? [],
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
    ...overrides,
    // history mirrors the marks, as in real data
    history: overrides.history ?? overrides.recentLog ?? [],
  };
}

function hoursFixture(
  targetHours: number,
): [Record<string, Habit>, Record<string, HabitGroup>] {
  return [
    {
      study: makeHabit({
        id: 'study',
        name: 'Study',
        type: 'Hours',
        targetHours: 1,
        groupId: 'productive',
      }),
    },
    {
      productive: makeGroup({
        id: 'productive',
        name: 'Stay Productive',
        groupType: 'Hours',
        habitIds: ['study'],
        targetHours,
      }),
    },
  ];
}

// List view is the default; most tests here exercise group view
function renderInGroupView() {
  const utils = render(<HabitsScreen />);
  fireEvent.press(utils.getByTestId('view-mode-toggle-group'));
  return utils;
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
  it('renders list view by default with seeded habits visible', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, queryByTestId } = render(<HabitsScreen />);

    expect([
      !!(await findByTestId('habit-row-no-killing')),
      queryByTestId('group-card-precepts'),
    ]).toEqual([true, null]);
  });

  it('shows the list toggle as selected by default', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId } = render(<HabitsScreen />);
    await findByTestId('habit-row-no-killing');

    expect(
      getByTestId('view-mode-toggle-list').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('marks an unmarked Day/Checkmark habit on tap', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId } = renderInGroupView();
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

    const { findByTestId } = renderInGroupView();
    const pill = await findByTestId('habit-pill-no-killing');
    await waitFor(() =>
      expect(pill.props.accessibilityState.checked).toBe(true),
    );

    fireEvent.press(pill);

    await waitFor(() => {
      expect(pill.props.accessibilityState.checked).toBe(false);
    });
  });

  it('opens the Hours Entry Modal when an Hours habit is tapped', async () => {
    await seed(...hoursFixture(4));

    const { findByTestId, queryByTestId } = renderInGroupView();
    expect(queryByTestId('hours-modal')).toBeNull();

    fireEvent.press(await findByTestId('habit-row-study'));

    expect(await findByTestId('hours-modal')).toBeTruthy();
  });

  it('updates the habit hours when Done is pressed in the modal', async () => {
    await seed(...hoursFixture(4));

    const { findByTestId, findByText, getByTestId } = renderInGroupView();
    fireEvent.press(await findByTestId('habit-row-study'));
    fireEvent.changeText(await findByTestId('hours-modal-input'), '2');
    fireEvent.press(getByTestId('hours-modal-done'));

    expect(await findByText('2/1h')).toBeTruthy();
  });

  it('turns an Hours group orange when Done brings it to its target', async () => {
    await seed(...hoursFixture(4));

    const { findByTestId, getByTestId } = renderInGroupView();
    const card = await findByTestId('group-card-productive');
    fireEvent.press(await findByTestId('habit-row-study'));
    fireEvent.changeText(await findByTestId('hours-modal-input'), '4');
    fireEvent.press(getByTestId('hours-modal-done'));

    await waitFor(() =>
      expect(StyleSheet.flatten(card.props.style).borderColor).toBe(
        colors.v2Orange,
      ),
    );
  });

  it('does not save hours when the modal is closed with ×', async () => {
    await seed(...hoursFixture(4));

    const { findByTestId, getByTestId, getByText } = renderInGroupView();
    fireEvent.press(await findByTestId('habit-row-study'));
    fireEvent.changeText(await findByTestId('hours-modal-input'), '4');
    fireEvent.press(getByTestId('hours-modal-close'));

    await waitFor(() => expect(getByText('0/1h')).toBeTruthy());
  });

  it('switches to group view when the group toggle is pressed', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId, queryByTestId } = render(
      <HabitsScreen />,
    );
    await findByTestId('habit-row-no-killing');

    fireEvent.press(getByTestId('view-mode-toggle-group'));

    expect([
      !!queryByTestId('group-card-precepts'),
      queryByTestId('habit-row-no-killing'),
    ]).toEqual([true, null]);
  });

  it('switches back to list view when the list toggle is pressed', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId, queryByTestId } = render(
      <HabitsScreen />,
    );
    await findByTestId('habit-row-no-killing');
    fireEvent.press(getByTestId('view-mode-toggle-group'));

    fireEvent.press(getByTestId('view-mode-toggle-list'));

    expect([
      !!queryByTestId('habit-row-no-killing'),
      queryByTestId('group-card-precepts'),
    ]).toEqual([true, null]);
  });

  it('shows the group name under a habit in list view', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId, getByTestId, findByText } = renderInGroupView();
    await findByTestId('habit-pill-no-killing');
    fireEvent.press(getByTestId('view-mode-toggle-list'));

    expect(await findByText('8 Precepts')).toBeTruthy();
  });

  it('shows ungrouped habits in list view with no group name', async () => {
    await seed(
      {
        'drink-water': makeHabit({
          id: 'drink-water',
          name: 'Drink Water',
          groupId: undefined,
        }),
      },
      {},
    );

    const { getByTestId, findByTestId } = renderInGroupView();
    fireEvent.press(getByTestId('view-mode-toggle-list'));
    const row = await findByTestId('habit-row-drink-water');

    const texts = within(row)
      .getAllByText(/.+/)
      .map(node => node.props.children);

    expect(texts).toEqual(['Drink Water', 0, 'Daily']);
  });

  it('marks a habit when its list row is tapped', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { getByTestId, findByTestId } = renderInGroupView();
    fireEvent.press(getByTestId('view-mode-toggle-list'));
    const row = await findByTestId('habit-row-no-killing');

    fireEvent.press(row);

    await waitFor(() =>
      expect(row.props.accessibilityState.checked).toBe(true),
    );
  });

  it('turns a list row orange when its habit is marked', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { getByTestId, findByTestId } = renderInGroupView();
    fireEvent.press(getByTestId('view-mode-toggle-list'));
    const row = await findByTestId('habit-row-no-killing');

    fireEvent.press(row);

    await waitFor(() =>
      expect(StyleSheet.flatten(row.props.style).backgroundColor).toBe(
        colors.v2OrangeCardBackground,
      ),
    );
  });

  it('opens the Hours Entry Modal when an Hours row is tapped', async () => {
    await seed(...hoursFixture(4));

    const { getByTestId, findByTestId } = renderInGroupView();
    fireEvent.press(getByTestId('view-mode-toggle-list'));

    fireEvent.press(await findByTestId('habit-row-study'));

    expect(await findByTestId('hours-modal')).toBeTruthy();
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

    const { findByTestId, queryByTestId } = renderInGroupView();
    await findByTestId('habit-pill-no-killing');

    expect(queryByTestId('habit-pill-drink-water')).toBeNull();
  });

  it('renders Hours groups', async () => {
    await seed(...hoursFixture(4));

    const { findByTestId } = renderInGroupView();

    expect(await findByTestId('group-card-productive')).toBeTruthy();
  });

  it('turns a Required group grey when a required habit is unmarked', async () => {
    await seed(
      {
        'no-killing': makeHabit({
          recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
        }),
      },
      {
        precepts: makeGroup({
          requiredHabitIds: ['no-killing'],
          recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
          history: [{ date: TODAY, kind: 'marker', value: 1 }],
        }),
      },
    );

    const { findByTestId } = renderInGroupView();
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

  it('updates the group streak number when a habit completes the group', async () => {
    await seed(
      { 'no-killing': makeHabit() },
      {
        precepts: makeGroup({
          requiredHabitIds: ['no-killing'],
          recentLog: [{ date: '2024-06-14', kind: 'marker', value: 1 }],
          history: [{ date: '2024-06-14', kind: 'marker', value: 1 }],
        }),
      },
    );

    const { findByTestId } = renderInGroupView();
    const pill = await findByTestId('habit-pill-no-killing');
    const number = await findByTestId('group-number-precepts');
    await waitFor(() => expect(number.props.children).toBe(1));

    fireEvent.press(pill);

    await waitFor(() => expect(number.props.children).toBe(2));
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

    const { findByTestId } = renderInGroupView();
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

    const { findByTestId, getByTestId } = renderInGroupView();
    await findByTestId('habit-pill-no-killing');

    expect(getByTestId('fab')).toBeTruthy();
    ['Habits', 'Journal', 'Level-Up', 'Profile'].forEach(label => {
      expect(getByTestId(`bottom-menu-${label}`)).toBeTruthy();
    });
  });

  it('persists marks across a remount against the same storage', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const first = renderInGroupView();
    const pill = await first.findByTestId('habit-pill-no-killing');
    fireEvent.press(pill);
    await waitFor(() =>
      expect(pill.props.accessibilityState.checked).toBe(true),
    );
    first.unmount();

    const second = renderInGroupView();
    const reloadedPill = await second.findByTestId('habit-pill-no-killing');

    await waitFor(() => {
      expect(reloadedPill.props.accessibilityState.checked).toBe(true);
    });
  });

  describe('cadence filter', () => {
    const weekHabit = makeHabit({
      id: 'run',
      name: 'Run',
      cadence: 'Week',
      target: 2,
      groupId: 'fitness',
    });
    const dayInWeekGroup = makeHabit({
      id: 'stretch',
      name: 'Stretch',
      groupId: 'fitness',
    });
    const fixtures = () =>
      seed(
        { 'no-killing': makeHabit(), run: weekHabit, stretch: dayInWeekGroup },
        {
          precepts: makeGroup(),
          fitness: makeGroup({
            id: 'fitness',
            name: 'Fitness',
            cadence: 'Week',
            groupType: 'Any',
            target: 2,
            habitIds: ['run', 'stretch'],
            sortOrder: 1,
          }),
        },
      );
    const choose = async (utils: ReturnType<typeof render>, option: string) => {
      fireEvent.press(await utils.findByTestId('cadence-filter'));
      fireEvent.press(utils.getByTestId(`cadence-option-${option}`));
    };

    it('shows All by default with every group', async () => {
      await fixtures();

      const utils = renderInGroupView();

      expect([
        !!(await utils.findByTestId('group-card-precepts')),
        !!utils.getByTestId('group-card-fitness'),
      ]).toEqual([true, true]);
    });

    it('shows only Week groups in group view when Week is chosen', async () => {
      await fixtures();
      const utils = renderInGroupView();
      await utils.findByTestId('group-card-precepts');

      await choose(utils, 'Week');

      expect([
        utils.queryByTestId('group-card-precepts'),
        !!utils.getByTestId('group-card-fitness'),
      ]).toEqual([null, true]);
    });

    it('still shows Day habits inside a Week group', async () => {
      await fixtures();
      const utils = renderInGroupView();
      await utils.findByTestId('group-card-precepts');

      await choose(utils, 'Week');

      expect(utils.getByTestId('habit-pill-stretch')).toBeTruthy();
    });

    it('shows only Week habits in list view when Week is chosen', async () => {
      await fixtures();
      const utils = renderInGroupView();
      await utils.findByTestId('group-card-precepts');
      fireEvent.press(utils.getByTestId('view-mode-toggle-list'));

      await choose(utils, 'Week');

      expect([
        !!utils.getByTestId('habit-row-run'),
        utils.queryByTestId('habit-row-stretch'),
        utils.queryByTestId('habit-row-no-killing'),
      ]).toEqual([true, null, null]);
    });

    it('marks a Week habit when tapped', async () => {
      await fixtures();
      const utils = renderInGroupView();
      const pill = await utils.findByTestId('habit-pill-run');

      fireEvent.press(pill);

      await waitFor(() =>
        expect(pill.props.accessibilityState.checked).toBe(true),
      );
    });
  });
});
