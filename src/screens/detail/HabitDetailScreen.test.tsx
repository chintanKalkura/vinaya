import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import HabitDetailScreen, { DetailKind } from './HabitDetailScreen';
import { HabitsDataProvider } from '../habits/HabitsData';
import {
  loadHabits,
  saveHabitGroups,
  saveHabits,
} from '../../storage/habitStorage';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';

const habit: Habit = {
  id: 'run',
  name: 'Run',
  cadence: 'Week',
  target: 3,
  type: 'Checkmark',
  streakFreezeInterval: 7,
  streakFreeze: { available: 2, earnedAtStreak: 14, frozenDates: [] },
  status: 'active',
  sortOrder: 0,
  createdAt: 0,
  recentLog: [],
  history: [],
};

const group: HabitGroup = {
  id: 'fitness',
  name: 'Fitness',
  cadence: 'Day',
  groupType: 'Any',
  habitIds: ['run'],
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: 0,
  recentLog: [],
  history: [],
};

beforeEach(async () => {
  await AsyncStorage.clear();
  await saveHabits({ run: habit });
  await saveHabitGroups({ fitness: group });
});

function renderPage(kind: DetailKind, id: string) {
  const handlers = {
    onBack: jest.fn(),
    onOpenGroup: jest.fn(),
    onOpenHabit: jest.fn(),
    onGone: jest.fn(),
  };
  const utils = render(
    <HabitsDataProvider>
      <HabitDetailScreen kind={kind} id={id} {...handlers} />
    </HabitsDataProvider>,
  );
  return { ...utils, ...handlers };
}

describe('HabitDetailScreen', () => {
  it('should show the title, the facts and the freezes held', async () => {
    const utils = renderPage('habit', 'run');

    expect([
      (await utils.findByTestId('detail-title')).props.children,
      utils.getByTestId('detail-facts').props.children,
      utils.getByTestId('detail-freezes').props.children,
    ]).toEqual(['Run', '3 days a week', '2 freezes held']);
  });

  it("should open a group's page from its chip", async () => {
    const utils = renderPage('habit', 'run');

    fireEvent.press(await utils.findByTestId('detail-group-chip-fitness'));

    expect([
      utils.onOpenGroup.mock.calls,
      utils.getByTestId('detail-group-chip-fitness').props.accessibilityLabel,
    ]).toEqual([[['fitness']], 'Open Fitness group']);
  });

  it('should show the group type and no group chips on a group page', async () => {
    const utils = renderPage('group', 'fitness');

    expect([
      (await utils.findByTestId('detail-facts')).props.children,
      utils.queryByTestId('detail-group-chip-fitness'),
    ]).toEqual(['Daily · Any group', null]);
  });

  it('should open the edit form from the pencil and from the menu', async () => {
    const utils = renderPage('habit', 'run');

    fireEvent.press(await utils.findByTestId('detail-edit'));
    const fromPencil = !!(await utils.findByText('Edit Habit'));
    fireEvent.press(utils.getByTestId('new-habit-back'));
    fireEvent.press(utils.getByTestId('detail-menu'));
    fireEvent.press(utils.getByTestId('detail-menu-edit'));

    expect([fromPencil, !!(await utils.findByText('Edit Habit'))]).toEqual([
      true,
      true,
    ]);
  });

  it('should offer Edit and Delete habit in the menu', async () => {
    const utils = renderPage('habit', 'run');

    fireEvent.press(await utils.findByTestId('detail-menu'));

    expect([
      !!utils.getByText('Edit'),
      !!utils.getByText('Delete habit'),
    ]).toEqual([true, true]);
  });

  it('should delete after confirming, then leave the page', async () => {
    const utils = renderPage('habit', 'run');

    fireEvent.press(await utils.findByTestId('detail-menu'));
    fireEvent.press(utils.getByTestId('detail-menu-delete'));
    fireEvent.press(utils.getByTestId('detail-menu-confirm-delete'));

    await waitFor(() => expect(utils.onGone).toHaveBeenCalled());
    expect(await loadHabits()).toEqual({});
  });

  it('should delete from the edit form menu, then leave the page', async () => {
    const utils = renderPage('group', 'fitness');

    fireEvent.press(await utils.findByTestId('detail-edit'));
    fireEvent.press(await utils.findByTestId('edit-group-menu'));
    const items = [
      !!utils.getByText('Delete group'),
      utils.queryByText('Edit past days'),
    ];
    fireEvent.press(utils.getByTestId('edit-group-menu-delete'));
    fireEvent.press(utils.getByTestId('edit-group-menu-confirm-delete'));

    await waitFor(() => expect(utils.onGone).toHaveBeenCalled());
    expect(items).toEqual([true, null]);
  });

  it('should leave when the item no longer exists', async () => {
    const utils = renderPage('habit', 'gone');

    await waitFor(() => expect(utils.onGone).toHaveBeenCalled());
  });

  it('should go back from the arrow', async () => {
    const utils = renderPage('habit', 'run');

    fireEvent.press(await utils.findByTestId('detail-back'));

    expect(utils.onBack).toHaveBeenCalled();
  });
});

describe('HabitDetailScreen sections', () => {
  it('should show the stats sections, with History on last week for a Week habit', async () => {
    const utils = renderPage('habit', 'run');
    await utils.findByTestId('detail-title');

    expect([
      !!utils.getByTestId('detail-rating'),
      !!utils.getByTestId('detail-streaks'),
      !!utils.getByTestId('detail-completion'),
      !!utils.getByTestId('detail-heatmap'),
      utils.getByTestId('history-range-week').props.accessibilityState.selected,
      utils.queryByTestId('detail-hours'),
      utils.queryByTestId('detail-members'),
    ]).toEqual([true, true, true, true, true, null, null]);
  });

  it('should switch the History range', async () => {
    const utils = renderPage('habit', 'run');
    fireEvent.press(await utils.findByTestId('history-range-3m'));

    expect(
      utils.getByTestId('history-range-3m').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('should show hours per day under History for an Hours habit', async () => {
    await saveHabits({ run: { ...habit, type: 'Hours', targetHours: 2 } });
    const utils = renderPage('habit', 'run');

    expect(await utils.findByTestId('detail-hours')).toBeTruthy();
  });

  it("should list a group's members, opening their pages", async () => {
    const utils = renderPage('group', 'fitness');
    fireEvent.press(await utils.findByTestId('detail-member-run'));

    expect([
      utils.getByTestId('detail-member-rate-run').props.children,
      utils.onOpenHabit.mock.calls,
    ]).toEqual(['0%', [['run']]]);
  });
});

describe('Edit past days from the page and the edit form', () => {
  const recent = new Date();
  recent.setDate(recent.getDate() - 3);

  it('should be in a habit page menu, and not in a group page menu', async () => {
    const habitPage = renderPage('habit', 'run');
    fireEvent.press(await habitPage.findByTestId('detail-menu'));
    const onHabit = !!habitPage.getByText('Edit past days');
    habitPage.unmount();

    const groupPage = renderPage('group', 'fitness');
    fireEvent.press(await groupPage.findByTestId('detail-menu'));

    expect([onHabit, groupPage.queryByText('Edit past days')]).toEqual([
      true,
      null,
    ]);
  });

  it('should be greyed on the day the habit is created', async () => {
    await saveHabits({ run: { ...habit, createdAt: Date.now() } });
    const utils = renderPage('habit', 'run');
    fireEvent.press(await utils.findByTestId('detail-menu'));

    expect(
      utils.getByTestId('detail-menu-past-days').props.accessibilityState
        .disabled,
    ).toBe(true);
  });

  it('should save a past day from the page and update the habit', async () => {
    await saveHabits({
      run: {
        ...habit,
        cadence: 'Day',
        target: undefined,
        createdAt: recent.getTime(),
      },
    });
    const utils = renderPage('habit', 'run');
    fireEvent.press(await utils.findByTestId('detail-menu'));
    fireEvent.press(utils.getByTestId('detail-menu-past-days'));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = [
      yesterday.getFullYear(),
      String(yesterday.getMonth() + 1).padStart(2, '0'),
      String(yesterday.getDate()).padStart(2, '0'),
    ].join('-');
    const sheet = await utils.findByTestId('past-days-sheet');
    fireEvent.press(within(sheet).getByTestId(`day-${key}`));
    fireEvent.press(utils.getByTestId('past-days-save'));

    await waitFor(async () =>
      expect((await loadHabits()).run.history.map(e => e.date)).toEqual([key]),
    );
    await waitFor(() =>
      expect(utils.queryByTestId('past-days-sheet')).toBeNull(),
    );
  });

  it('should open from the Edit Habit menu, over the form', async () => {
    await saveHabits({ run: { ...habit, createdAt: recent.getTime() } });
    const utils = renderPage('habit', 'run');
    fireEvent.press(await utils.findByTestId('detail-edit'));
    fireEvent.press(await utils.findByTestId('edit-habit-menu'));
    const items = [
      !!utils.getByText('Edit past days'),
      !!utils.getByText('Delete habit'),
    ];
    fireEvent.press(utils.getByTestId('edit-habit-menu-past-days'));

    expect([
      items,
      !!(await utils.findByTestId('past-days-sheet')),
      !!utils.getByText('Edit Habit'),
    ]).toEqual([[true, true], true, true]);
  });
});
