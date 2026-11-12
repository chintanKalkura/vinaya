import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import GroupCard from './GroupCard';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { colors } from '../../theme';

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
        complete={false}
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
        complete={false}
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-card-group-1')).toBeTruthy();
    expect(queryAllByTestId(/habit-pill-/)).toHaveLength(0);
  });

  it('shows the group streak calculated from the group log', () => {
    const log = [
      { date: TODAY, kind: 'marker' as const, value: 1 },
      { date: '2024-06-14', kind: 'marker' as const, value: 1 },
    ];
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup({ recentLog: log, history: log })}
        habits={[]}
        todayKey={TODAY}
        complete={true}
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-number-group-1').props.children).toBe(2);
  });

  it('shows 0 when the group log is empty', () => {
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup()}
        habits={[]}
        todayKey={TODAY}
        complete={false}
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-number-group-1').props.children).toBe(0);
  });

  it('uses an orange border when complete and a grey border otherwise', () => {
    const renderCard = (complete: boolean) =>
      render(
        <GroupCard
          group={makeGroup()}
          habits={[]}
          todayKey={TODAY}
          complete={complete}
          onToggle={jest.fn()}
        />,
      ).getByTestId('group-card-group-1');

    expect(StyleSheet.flatten(renderCard(true).props.style).borderColor).toBe(
      colors.v2Orange,
    );
    expect(StyleSheet.flatten(renderCard(false).props.style).borderColor).toBe(
      colors.v2Border,
    );
  });

  it('shows a round selector for Required groups and a square one for Any', () => {
    const selectorRadius = (groupType: 'Required' | 'Any') =>
      StyleSheet.flatten(
        render(
          <GroupCard
            group={makeGroup({ groupType })}
            habits={[]}
            todayKey={TODAY}
            complete={false}
            onToggle={jest.fn()}
          />,
        ).getByTestId('group-selector-group-1').props.style,
      ).borderRadius;

    expect(selectorRadius('Required')).toBe(11);
    expect(selectorRadius('Any')).toBe(3);
  });

  it('gives a blue border only to habits in requiredHabitIds', () => {
    const habits = [makeHabit('h1', 'No Killing'), makeHabit('h2', 'Speech')];
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup({ requiredHabitIds: ['h1'] })}
        habits={habits}
        todayKey={TODAY}
        complete={false}
        onToggle={jest.fn()}
      />,
    );
    const border = (id: string) =>
      StyleSheet.flatten(getByTestId(`habit-pill-${id}`).props.style)
        .borderColor;

    expect(border('h1')).toBe(colors.v2Blue);
    expect(border('h2')).toBe(colors.v2Border);
  });
});
