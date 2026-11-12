import React from 'react';
import { render } from '@testing-library/react-native';
import GroupCard from './GroupCard';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';

const TODAY = '2024-06-15';

function makeGroup(overrides: Partial<HabitGroup> = {}): HabitGroup {
  return {
    id: 'group-1',
    name: '8 Precepts',
    cadence: 'Day',
    groupType: 'Required',
    habitIds: [],
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
    ...overrides,
  };
}

function makeHabit(id: string, name: string): Habit {
  return {
    id,
    name,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
    groupId: 'group-1',
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };
}

describe('GroupCard', () => {
  it('renders the group name and one pill per habit, in order', () => {
    const habits = [
      makeHabit('h1', 'No Killing'),
      makeHabit('h2', 'No Stealing'),
    ];
    const { getByText, getByTestId } = render(
      <GroupCard
        group={makeGroup()}
        habits={habits}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

    expect(getByText('8 Precepts')).toBeTruthy();
    expect(getByTestId('habit-pill-h1')).toBeTruthy();
    expect(getByTestId('habit-pill-h2')).toBeTruthy();
  });

  it('renders with no pills when the group has no habits', () => {
    const { getByTestId, queryAllByTestId } = render(
      <GroupCard
        group={makeGroup()}
        habits={[]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-card-group-1')).toBeTruthy();
    expect(queryAllByTestId(/habit-pill-/)).toHaveLength(0);
  });
});
