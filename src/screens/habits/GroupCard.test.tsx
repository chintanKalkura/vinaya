import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import GroupCard from './GroupCard';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { colors } from '../../theme';
import { ReactTestInstance } from 'react-test-renderer';

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
    ...overrides,
    // history mirrors the marks, as in real data
    history: overrides.history ?? overrides.recentLog ?? [],
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

// A group's state comes from its log: a marker today means complete today
function completeGroup(
  complete: boolean,
  overrides: Partial<HabitGroup> = {},
): HabitGroup {
  const log = complete
    ? [{ date: TODAY, kind: 'marker' as const, value: 1 }]
    : [];
  return makeGroup({ recentLog: log, history: log, ...overrides });
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
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-number-group-1').props.children).toBe(0);
  });

  it('uses an orange border when complete and a grey border otherwise', () => {
    const renderCard = (complete: boolean) =>
      render(
        <GroupCard
          group={completeGroup(complete)}
          habits={[]}
          todayKey={TODAY}
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
        onToggle={jest.fn()}
      />,
    );
    const border = (id: string) =>
      StyleSheet.flatten(getByTestId(`habit-pill-${id}`).props.style)
        .borderColor;

    expect(border('h1')).toBe(colors.v2Blue);
    expect(border('h2')).toBe(colors.v2Border);
  });

  describe('banner coloring', () => {
    const renderCard = (complete: boolean, groupType: 'Required' | 'Hours') =>
      render(
        <GroupCard
          group={completeGroup(complete, { groupType, targetHours: 8 })}
          habits={[]}
          todayKey={TODAY}
          onToggle={jest.fn()}
        />,
      );

    it('keeps the title white when complete', () => {
      expect(
        StyleSheet.flatten(
          renderCard(true, 'Required').getByText('8 Precepts').props.style,
        ).color,
      ).toBe(colors.v2White);
    });

    it('keeps the title white when not complete', () => {
      expect(
        StyleSheet.flatten(
          renderCard(false, 'Required').getByText('8 Precepts').props.style,
        ).color,
      ).toBe(colors.v2White);
    });

    it('shows the selector as a grey outline when not complete', () => {
      expect(
        StyleSheet.flatten(
          renderCard(false, 'Required').getByTestId('group-selector-group-1')
            .props.style,
        ).borderColor,
      ).toBe(colors.v2GreyOutline);
    });

    it('shows the Hours chart icon grey when not complete', () => {
      const icon = renderCard(false, 'Hours').getByTestId(
        'group-hours-icon-group-1',
      ).children[0] as ReactTestInstance;

      expect(icon.props.color).toBe(colors.v2GreyOutline);
    });

    it('shows the Hours chart icon orange when complete', () => {
      const icon = renderCard(true, 'Hours').getByTestId(
        'group-hours-icon-group-1',
      ).children[0] as ReactTestInstance;

      expect(icon.props.color).toBe(colors.v2Orange);
    });
  });

  describe('Hours group', () => {
    const hoursGroup = makeGroup({
      groupType: 'Hours',
      name: 'Stay Productive',
      targetHours: 8,
    });
    const hoursHabit = (id: string, hours: number): Habit => ({
      ...makeHabit(id, id),
      type: 'Hours',
      targetHours: 1,
      recentLog: [{ date: TODAY, kind: 'hours', value: hours }],
    });
    const renderHours = (habits: Habit[]) =>
      render(
        <GroupCard
          group={hoursGroup}
          habits={habits}
          todayKey={TODAY}
          onToggle={jest.fn()}
        />,
      );

    it('should show the hours icon instead of a selector', () => {
      const { getByTestId, queryByTestId } = renderHours([]);

      expect([
        !!getByTestId('group-hours-icon-group-1'),
        queryByTestId('group-selector-group-1'),
      ]).toEqual([true, null]);
    });

    it('should show total hours today against the target', () => {
      const { getByText } = renderHours([
        hoursHabit('h1', 3),
        hoursHabit('h2', 2),
      ]);

      expect(getByText('5/8h')).toBeTruthy();
    });

    it('should fill the progress bar in proportion to the target', () => {
      const { getByTestId } = renderHours([hoursHabit('h1', 2)]);

      expect(
        StyleSheet.flatten(getByTestId('group-progress-group-1').props.style)
          .width,
      ).toBe('25%');
    });

    it('should render Hours habits as list rows instead of pills', () => {
      const { getByTestId, queryByTestId } = renderHours([hoursHabit('h1', 3)]);

      expect([
        !!getByTestId('habit-row-h1'),
        queryByTestId('habit-pill-h1'),
      ]).toEqual([true, null]);
    });

    it('should not repeat the group name under each Hours habit', () => {
      const { getAllByText } = renderHours([hoursHabit('h1', 3)]);

      expect(getAllByText('Stay Productive')).toHaveLength(1);
    });

    it('should lay Hours habits out two per row', () => {
      const { getByTestId } = renderHours([hoursHabit('h1', 3)]);

      expect(
        StyleSheet.flatten(getByTestId('group-hours-cell-h1').props.style)
          .width,
      ).toBe('48.5%');
    });

    it('should keep Hours habits as pills without the orange banner when their target is met', () => {
      const { getByTestId } = renderHours([hoursHabit('h1', 3)]);

      expect(
        StyleSheet.flatten(getByTestId('habit-row-h1').props.style).borderColor,
      ).toBe(colors.v2Border);
    });

    it('should cap the progress bar at full', () => {
      const { getByTestId } = renderHours([hoursHabit('h1', 12)]);

      expect(
        StyleSheet.flatten(getByTestId('group-progress-group-1').props.style)
          .width,
      ).toBe('100%');
    });
  });

  describe('Week group', () => {
    const weekGroup = (days: string[]) => {
      const log = days.map(date => ({
        date,
        kind: 'marker' as const,
        value: 1,
      }));
      return makeGroup({
        cadence: 'Week',
        groupType: 'Any',
        target: 2,
        recentLog: log,
        history: log,
      });
    };
    const renderWeek = (days: string[]) =>
      render(
        <GroupCard
          group={weekGroup(days)}
          habits={[]}
          todayKey={TODAY}
          onToggle={jest.fn()}
        />,
      );

    it('is orange while its complete days in the window meet the target', () => {
      expect(
        StyleSheet.flatten(
          renderWeek(['2024-06-13', '2024-06-11']).getByTestId(
            'group-card-group-1',
          ).props.style,
        ).borderColor,
      ).toBe(colors.v2Orange);
    });

    it('leaves the selector empty when today is not complete', () => {
      expect(
        StyleSheet.flatten(
          renderWeek(['2024-06-13', '2024-06-11']).getByTestId(
            'group-selector-group-1',
          ).props.style,
        ).borderColor,
      ).toBe(colors.v2GreyOutline);
    });

    it('is grey below its target', () => {
      expect(
        StyleSheet.flatten(
          renderWeek(['2024-06-13']).getByTestId('group-card-group-1').props
            .style,
        ).borderColor,
      ).toBe(colors.v2Border);
    });

    it('shows the streak as the complete days in the run', () => {
      expect(
        renderWeek(['2024-06-13', '2024-06-11', '2024-06-05']).getByTestId(
          'group-number-group-1',
        ).props.children,
      ).toBe(3);
    });
  });

  it('shows the group cadence label in the bottom-right corner', () => {
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup({ cadence: 'Month' })}
        habits={[]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

    expect(getByTestId('group-cadence-group-1')).toHaveTextContent('Monthly');
  });

  it('shows no cadence label on the habit pills inside the card', () => {
    const { queryAllByText } = render(
      <GroupCard
        group={makeGroup({ cadence: 'Day' })}
        habits={[makeHabit('h1', 'No Killing')]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

    expect(queryAllByText('Daily')).toHaveLength(1);
  });
});
