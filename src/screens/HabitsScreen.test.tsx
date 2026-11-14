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
import {
  loadHabitGroups,
  loadHabits,
  saveHabitGroups,
  saveHabits,
} from '../storage/habitStorage';
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
      { cook: makeHabit({ id: 'cook', name: 'Cook' }) },
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
    });
    const dayInWeekGroup = makeHabit({
      id: 'stretch',
      name: 'Stretch',
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

describe('HabitsScreen streak freeze', () => {
  it('uses a freeze on load for a habit that missed yesterday', async () => {
    await seed({
      'no-killing': makeHabit({
        recentLog: ['2024-06-13', '2024-06-12'].map(date => ({
          date,
          kind: 'marker' as const,
          value: 1,
        })),
        streakFreeze: { available: 1, earnedAtStreak: 0, frozenDates: [] },
      }),
    });

    const { findByTestId } = render(<HabitsScreen />);

    expect(
      (await findByTestId('habit-row-freeze-no-killing')).props.children,
    ).toBe('0 freezes left');
  });
});

describe('HabitsScreen create habit', () => {
  async function openForm(utils: ReturnType<typeof render>) {
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('fab'));
    fireEvent.press(await utils.findByTestId('choice-sheet-habit'));
    return utils.findByTestId('new-habit-form');
  }

  it('opens the choice sheet from +, and the form from New Habit', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);

    expect(!!(await openForm(utils))).toBe(true);
  });

  it('goes back from the form to the choice sheet', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);
    await openForm(utils);

    fireEvent.press(utils.getByTestId('new-habit-back'));

    expect([
      !!(await utils.findByTestId('choice-sheet')),
      utils.queryByTestId('new-habit-form'),
    ]).toEqual([true, null]);
  });

  it('creates a Week habit and shows it in list view', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);
    await openForm(utils);

    fireEvent.changeText(utils.getByTestId('new-habit-name'), 'Morning run');
    fireEvent.press(utils.getByTestId('new-habit-cadence-Week'));
    fireEvent.press(utils.getByTestId('new-habit-create'));

    expect([
      !!(await utils.findByText('Morning run')),
      utils.queryByTestId('new-habit-form'),
      utils.getByTestId('view-mode-toggle-list').props.accessibilityState
        .selected,
    ]).toEqual([true, null, true]);
  });

  it('stays in group view and shows the habit in its chosen group', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = renderInGroupView();
    await openForm(utils);

    fireEvent.changeText(utils.getByTestId('new-habit-name'), 'Meditate');
    fireEvent.press(utils.getByTestId('new-habit-group-precepts'));
    fireEvent.press(utils.getByTestId('new-habit-create'));

    const card = await utils.findByTestId('group-card-precepts');
    expect([
      !!within(card).getByText('Meditate'),
      utils.getByTestId('view-mode-toggle-group').props.accessibilityState
        .selected,
    ]).toEqual([true, true]);
  });
});

describe('HabitsScreen habits in several groups', () => {
  it('shows every group name in list view, in group order', async () => {
    await seed(
      { 'no-killing': makeHabit() },
      {
        precepts: makeGroup({ sortOrder: 0 }),
        mind: makeGroup({
          id: 'mind',
          name: 'Mind',
          groupType: 'Any',
          sortOrder: 1,
          habitIds: ['no-killing'],
        }),
      },
    );

    const { findByText } = render(<HabitsScreen />);

    expect(!!(await findByText('8 Precepts, Mind'))).toBe(true);
  });
});

describe('HabitsScreen create habit group', () => {
  async function openGroupForm(utils: ReturnType<typeof render>) {
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('fab'));
    fireEvent.press(await utils.findByTestId('choice-sheet-group'));
    return utils.findByTestId('new-group-form');
  }

  async function assign(utils: ReturnType<typeof render>, ids: string[]) {
    fireEvent.press(utils.getByTestId('new-group-assign'));
    ids.forEach(id =>
      fireEvent.press(utils.getByTestId(`assign-sheet-item-${id}`)),
    );
    fireEvent.press(utils.getByTestId('assign-sheet-done'));
  }

  it('creates an Any group and shows it in group view', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = renderInGroupView();
    await openGroupForm(utils);

    fireEvent.changeText(utils.getByTestId('new-group-name'), 'Mornings');
    await assign(utils, ['no-killing']);
    fireEvent.press(utils.getByTestId('new-group-create'));

    expect(!!(await utils.findByText('Mornings'))).toBe(true);
  });

  it('goes back from the group form to the choice sheet', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);
    await openGroupForm(utils);

    fireEvent.press(utils.getByTestId('new-group-back'));

    expect(!!(await utils.findByTestId('choice-sheet'))).toBe(true);
  });

  it('returns from Create Habit with the new habit assigned', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);
    await openGroupForm(utils);

    fireEvent.press(utils.getByTestId('new-group-create-habit'));
    fireEvent.changeText(
      await utils.findByTestId('new-habit-name'),
      'Meditate',
    );
    fireEvent.press(utils.getByTestId('new-habit-create'));

    await waitFor(() =>
      expect(utils.queryByTestId('new-habit-form')).toBeNull(),
    );
    const assigned = within(utils.getByTestId('new-group-assigned'));
    expect(!!assigned.getByText('Meditate')).toBe(true);
  });

  it('creates the habit and its new group together from + Create Group', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = renderInGroupView();
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('fab'));
    fireEvent.press(await utils.findByTestId('choice-sheet-habit'));
    fireEvent.changeText(
      await utils.findByTestId('new-habit-name'),
      'Morning run',
    );

    fireEvent.press(utils.getByTestId('new-habit-create-group'));
    fireEvent.changeText(
      await utils.findByTestId('new-group-name'),
      'Mornings',
    );
    fireEvent.press(utils.getByTestId('new-group-create'));
    await waitFor(() =>
      expect(
        utils.getByTestId('new-habit-group-pending-group').props
          .accessibilityState.selected,
      ).toBe(true),
    );
    fireEvent.press(utils.getByTestId('new-habit-create'));

    const groups = Object.values(
      await waitFor(async () => {
        const g = await loadHabitGroups();
        expect(Object.keys(g)).toHaveLength(2);
        return g;
      }),
    );
    const habits = await loadHabits();
    const mornings = groups.find(g => g.name === 'Mornings');
    expect(mornings?.habitIds.map(id => habits[id].name)).toEqual([
      'Morning run',
    ]);
  });
});

describe('HabitsScreen sort and filter', () => {
  const today = { date: TODAY, kind: 'marker' as const, value: 1 };
  const fixtures = () =>
    seed(
      {
        'no-killing': makeHabit({ createdAt: 1 }),
        apple: makeHabit({
          id: 'apple',
          name: 'apple',
          createdAt: 2,
          recentLog: [today],
        }),
        // Week habit complete for its window but not marked today
        call: makeHabit({
          id: 'call',
          name: 'Call Family',
          cadence: 'Week',
          target: 1,
          createdAt: 3,
          recentLog: [{ date: '2024-06-13', kind: 'marker', value: 1 }],
        }),
      },
      {
        precepts: makeGroup({ createdAt: 1 }),
        eat: makeGroup({
          id: 'eat',
          name: 'Eat Healthy',
          groupType: 'Any',
          habitIds: ['apple'],
          createdAt: 2,
          recentLog: [today],
        }),
      },
    );

  const rowOrder = (utils: ReturnType<typeof render>) =>
    utils
      .getAllByTestId(/^habit-row-(no-killing|apple|call)$/)
      .map(node => node.props.testID.replace('habit-row-', ''));

  async function apply(utils: ReturnType<typeof render>, pick: () => void) {
    fireEvent.press(utils.getByTestId('sort-button'));
    await utils.findByTestId('sort-sheet');
    pick();
    fireEvent.press(utils.getByTestId('sort-sheet-apply'));
  }

  it('lists oldest first by default', async () => {
    await fixtures();
    const utils = render(<HabitsScreen />);
    await utils.findByTestId('habit-row-call');

    expect(rowOrder(utils)).toEqual(['no-killing', 'apple', 'call']);
  });

  it('applies Recent from the sheet', async () => {
    await fixtures();
    const utils = render(<HabitsScreen />);
    await utils.findByTestId('habit-row-call');

    await apply(utils, () =>
      fireEvent.press(utils.getByTestId('sort-option-Recent')),
    );

    expect(rowOrder(utils)).toEqual(['call', 'apple', 'no-killing']);
  });

  it('applies A–Z ignoring case', async () => {
    await fixtures();
    const utils = render(<HabitsScreen />);
    await utils.findByTestId('habit-row-call');

    await apply(utils, () =>
      fireEvent.press(utils.getByTestId('sort-option-A–Z')),
    );

    expect(rowOrder(utils)).toEqual(['apple', 'call', 'no-killing']);
  });

  it('shows only completed habits, including a complete Week habit', async () => {
    await fixtures();
    const utils = render(<HabitsScreen />);
    await utils.findByTestId('habit-row-call');

    await apply(utils, () =>
      fireEvent.press(utils.getByTestId('show-option-Completed')),
    );

    expect(rowOrder(utils)).toEqual(['apple', 'call']);
  });

  it('shows only completed groups in group view', async () => {
    await fixtures();
    const utils = renderInGroupView();
    await utils.findByTestId('group-card-eat');

    await apply(utils, () =>
      fireEvent.press(utils.getByTestId('show-option-Completed')),
    );

    expect([
      utils.queryByTestId('group-card-precepts'),
      !!utils.getByTestId('group-card-eat'),
    ]).toEqual([null, true]);
  });
});

describe('HabitsScreen delete', () => {
  async function confirmDelete(utils: ReturnType<typeof render>, id: string) {
    fireEvent.press(await utils.findByTestId(id));
    fireEvent.press(utils.getByTestId(`${id}-delete`));
    fireEvent.press(utils.getByTestId(`${id}-confirm-delete`));
  }

  it('deletes a habit from list view and its group card loses the pill', async () => {
    await seed(
      {
        'no-killing': makeHabit(),
        'no-stealing': makeHabit({ id: 'no-stealing', name: 'No Stealing' }),
      },
      { precepts: makeGroup({ habitIds: ['no-killing', 'no-stealing'] }) },
    );
    const utils = render(<HabitsScreen />);

    await confirmDelete(utils, 'habit-row-menu-no-killing');
    await waitFor(() =>
      expect(utils.queryByTestId('habit-row-no-killing')).toBeNull(),
    );
    fireEvent.press(utils.getByTestId('view-mode-toggle-group'));

    expect([
      utils.queryByTestId('habit-pill-no-killing'),
      !!(await utils.findByTestId('habit-pill-no-stealing')),
    ]).toEqual([null, true]);
  });

  it('deletes a group from group view and keeps its habits', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = renderInGroupView();

    await confirmDelete(utils, 'group-menu-precepts');
    await waitFor(() =>
      expect(utils.queryByTestId('group-card-precepts')).toBeNull(),
    );
    fireEvent.press(utils.getByTestId('view-mode-toggle-list'));

    expect(!!(await utils.findByTestId('habit-row-no-killing'))).toBe(true);
  });
});

describe('HabitsScreen safe area', () => {
  it('pads the top of the screen by the status bar inset', async () => {
    const safeArea = require('react-native-safe-area-context');
    const spy = jest
      .spyOn(safeArea, 'useSafeAreaInsets')
      .mockReturnValue({ top: 40, right: 0, bottom: 0, left: 0 });
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId } = render(<HabitsScreen />);

    const screen = await findByTestId('habits-screen');
    expect(StyleSheet.flatten(screen.props.style).paddingTop).toBe(40);
    spy.mockRestore();
  });
});

describe('HabitsScreen bottom menu', () => {
  it('keeps the + button above the flush menu and its inset', async () => {
    const safeArea = require('react-native-safe-area-context');
    const spy = jest
      .spyOn(safeArea, 'useSafeAreaInsets')
      .mockReturnValue({ top: 0, right: 0, bottom: 24, left: 0 });
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });

    const { findByTestId } = render(<HabitsScreen />);

    const fab = await findByTestId('fab');
    expect(StyleSheet.flatten(fab.props.style).bottom).toBe(60 + 16 + 24);
    spy.mockRestore();
  });
});

describe('HabitsScreen edit', () => {
  async function openEdit(utils: ReturnType<typeof render>, menuId: string) {
    fireEvent.press(await utils.findByTestId(menuId));
    fireEvent.press(utils.getByTestId(`${menuId}-edit`));
  }

  it('opens Edit Habit with the values and saves a rename', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);

    await openEdit(utils, 'habit-row-menu-no-killing');
    const name = await utils.findByTestId('new-habit-name');
    const loaded = name.props.value;
    fireEvent.changeText(name, 'Do No Harm');
    fireEvent.press(utils.getByTestId('new-habit-create'));

    expect([loaded, !!(await utils.findByText('Do No Harm'))]).toEqual([
      'No Killing',
      true,
    ]);
  });

  it('goes back to the Habits screen without saving', async () => {
    await seed({ 'no-killing': makeHabit() }, { precepts: makeGroup() });
    const utils = render(<HabitsScreen />);

    await openEdit(utils, 'habit-row-menu-no-killing');
    fireEvent.changeText(await utils.findByTestId('new-habit-name'), 'Changed');
    fireEvent.press(utils.getByTestId('new-habit-back'));

    await waitFor(() =>
      expect(utils.queryByTestId('new-habit-form')).toBeNull(),
    );
    expect([
      utils.queryByTestId('choice-sheet'),
      !!utils.getByText('No Killing'),
    ]).toEqual([null, true]);
  });

  it('edits a group name from group view', async () => {
    await seed(
      { 'no-killing': makeHabit() },
      { precepts: makeGroup({ requiredHabitIds: ['no-killing'] }) },
    );
    const utils = renderInGroupView();

    await openEdit(utils, 'group-menu-precepts');
    fireEvent.changeText(
      await utils.findByTestId('new-group-name'),
      'Precepts',
    );
    fireEvent.press(utils.getByTestId('new-group-create'));

    expect(!!(await utils.findByText('Precepts'))).toBe(true);
  });
});
