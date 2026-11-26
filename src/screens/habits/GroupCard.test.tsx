import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
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

function makeHabit(id: string, name: string): Habit {
  return {
    id,
    name,
    cadence: 'Day',
    type: 'Checkmark',
    streakFreezeInterval: 7,
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

  it('shows a round status for Required and All groups and a square one for Any', () => {
    const selectorRadius = (groupType: 'Required' | 'All' | 'Any') =>
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

    expect((['Required', 'All', 'Any'] as const).map(selectorRadius)).toEqual([
      5, 5, 2,
    ]);
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

    it('shows the status as a solid grey shape with no outline when not complete', () => {
      const style = StyleSheet.flatten(
        renderCard(false, 'Required').getByTestId('group-selector-group-1')
          .props.style,
      );

      expect([style.backgroundColor, style.borderWidth]).toEqual([
        colors.v2GreyOutline,
        undefined,
      ]);
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

    it('shows the status orange while its window meets the target', () => {
      expect(
        StyleSheet.flatten(
          renderWeek(['2024-06-13', '2024-06-11']).getByTestId(
            'group-selector-group-1',
          ).props.style,
        ).backgroundColor,
      ).toBe(colors.v2Orange);
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

describe('GroupCard streak freeze', () => {
  const frozenGroup = (overrides: Partial<HabitGroup> = {}) =>
    makeGroup({
      recentLog: [{ date: '2024-06-13', kind: 'marker', value: 1 }],
      streakFreeze: {
        available: 1,
        earnedAtStreak: 0,
        frozenDates: ['2024-06-14'],
        lastUsedOn: TODAY,
      },
      ...overrides,
    });

  const renderCard = (group: HabitGroup) =>
    render(
      <GroupCard
        group={group}
        habits={[]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

  it('shows "1 freeze left" and keeps the streak when frozen today', () => {
    const { getByTestId } = renderCard(frozenGroup());

    expect([
      getByTestId('group-freeze-group-1').props.children,
      getByTestId('group-number-group-1').props.children,
    ]).toEqual(['1 freeze left', 1]);
  });

  it('swaps the selector for the Snowflake and turns the card icy', () => {
    const { getByTestId, queryByTestId } = renderCard(frozenGroup());

    expect([
      !!getByTestId('group-frozen-group-1', { includeHiddenElements: true }),
      queryByTestId('group-selector-group-1'),
      StyleSheet.flatten(getByTestId('group-card-group-1').props.style)
        .borderColor,
    ]).toEqual([true, null, colors.v2Ice]);
  });

  it('swaps the Hours chart icon for the Snowflake and turns the bar icy', () => {
    const { getByTestId, queryByTestId } = renderCard(
      frozenGroup({ groupType: 'Hours', targetHours: 2 }),
    );

    expect([
      !!getByTestId('group-frozen-group-1', { includeHiddenElements: true }),
      queryByTestId('group-hours-icon-group-1'),
      StyleSheet.flatten(getByTestId('group-progress-group-1').props.style)
        .backgroundColor,
    ]).toEqual([true, null, colors.v2Ice]);
  });

  it('shows no freeze label when not frozen today', () => {
    const { queryByTestId } = renderCard(
      frozenGroup({
        streakFreeze: {
          available: 1,
          earnedAtStreak: 0,
          frozenDates: [],
        },
      }),
    );

    expect(queryByTestId('group-freeze-group-1')).toBeNull();
  });
});

describe('GroupCard menu', () => {
  it('deletes the group after confirming', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup()}
        habits={[]}
        todayKey={TODAY}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.press(getByTestId('group-menu-group-1'));
    fireEvent.press(getByTestId('group-menu-group-1-delete'));
    fireEvent.press(getByTestId('group-menu-group-1-confirm-delete'));

    expect(onDelete).toHaveBeenCalledWith('group-1');
  });

  it('shows no menu on the Hours cells inside the card', () => {
    const study: Habit = {
      ...makeHabit('study', 'Study'),
      type: 'Hours',
      targetHours: 1,
    };
    const { queryByTestId } = render(
      <GroupCard
        group={makeGroup({
          groupType: 'Hours',
          targetHours: 2,
          habitIds: ['study'],
        })}
        habits={[study]}
        todayKey={TODAY}
        onToggle={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(queryByTestId('habit-row-menu-study')).toBeNull();
  });
});

describe('GroupCard status icon and label', () => {
  const renderGroup = (overrides: Partial<HabitGroup> = {}) =>
    render(
      <GroupCard
        group={makeGroup({ name: 'Fitness', ...overrides })}
        habits={[]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );

  it('should not make the status icon a control', () => {
    const icon = renderGroup().getByTestId('group-selector-group-1');

    expect([
      icon.props.onPress,
      icon.props.accessibilityRole,
      icon.props.accessible,
    ]).toEqual([undefined, undefined, undefined]);
  });

  it('should label the header with name, type, completion and streak', () => {
    expect(
      renderGroup({ groupType: 'Any' }).getByTestId('group-header-group-1')
        .props.accessibilityLabel,
    ).toBe('Fitness, Any group, not complete, 0 day streak');
  });
});

// docs/feature-development/release-1-readiness/hours-habits-in-any-group.md
describe('GroupCard with Hours habits in a Checkmark-style group', () => {
  const hoursHabit = (id: string, hours: number): Habit => ({
    ...makeHabit(id, id),
    type: 'Hours',
    targetHours: 2,
    recentLog: [{ date: TODAY, kind: 'hours', value: hours }],
  });
  const habits = [
    makeHabit('c1', 'Meditate'),
    hoursHabit('r1', 1),
    makeHabit('c2', 'Stretch'),
  ];
  const renderMixed = (
    overrides: Partial<HabitGroup> = {},
    onToggle = jest.fn(),
  ) =>
    render(
      <GroupCard
        group={makeGroup({ groupType: 'Any', ...overrides })}
        habits={habits}
        todayKey={TODAY}
        onToggle={onToggle}
      />,
    );

  it('should show Checkmark habits as pills and the Hours habit as a cell with its bar', () => {
    const { getByTestId, queryByTestId } = renderMixed();

    expect([
      !!getByTestId('habit-pill-c1'),
      !!getByTestId('habit-pill-c2'),
      queryByTestId('habit-pill-r1'),
      !!getByTestId('group-hours-cell-r1'),
      !!getByTestId('habit-row-progress-r1'),
    ]).toEqual([true, true, null, true, true]);
  });

  it('should draw the pills before the Hours cells', () => {
    const json = JSON.stringify(renderMixed().toJSON());

    expect(json.indexOf('habit-pill-c2')).toBeLessThan(
      json.indexOf('group-hours-cell-r1'),
    );
  });

  it('should pass the Hours habit to onToggle when its bar is tapped', () => {
    const onToggle = jest.fn();
    const { getByTestId } = renderMixed({}, onToggle);

    fireEvent.press(getByTestId('habit-row-hours-r1'));

    expect(onToggle).toHaveBeenCalledWith('r1');
  });

  it('should show no group progress bar outside Hours groups', () => {
    expect(renderMixed().queryByTestId('group-progress-group-1')).toBeNull();
  });

  it('should give a required Hours habit the blue border', () => {
    const { getByTestId } = renderMixed({
      groupType: 'Required',
      requiredHabitIds: ['r1'],
    });
    const border = (testID: string) =>
      StyleSheet.flatten(getByTestId(testID).props.style).borderColor;

    expect([border('habit-row-r1'), border('habit-pill-c1')]).toEqual([
      colors.v2Blue,
      colors.v2Border,
    ]);
  });
});

// docs/feature-development/release-1-readiness/banner-colours.md
describe('GroupCard completion colour', () => {
  it("should colour the card, status and pills with the group's colour", () => {
    const habit: Habit = {
      ...makeHabit('h1', 'Stretch'),
      colour: 'red',
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
      history: [{ date: TODAY, kind: 'marker', value: 1 }],
    };
    const { getByTestId } = render(
      <GroupCard
        group={completeGroup(true, {
          groupType: 'Any',
          habitIds: ['h1'],
          colour: 'blue',
        })}
        habits={[habit]}
        todayKey={TODAY}
        onToggle={jest.fn()}
      />,
    );
    const style = (id: string) =>
      StyleSheet.flatten(getByTestId(id).props.style);
    const blue = colors.completion.blue.accent;

    expect([
      style('group-card-group-1').borderColor,
      style('group-selector-group-1').backgroundColor,
      style('habit-pill-icon-h1').backgroundColor,
    ]).toEqual([blue, blue, blue]);
  });
});

// docs/feature-development/release-1-readiness/habit-group-detail-page.md
describe('GroupCard opening pages', () => {
  it('should open the group from the card and a habit from its pill or cell', () => {
    const onOpen = jest.fn();
    const onOpenHabit = jest.fn();
    const onToggle = jest.fn();
    const hours: Habit = {
      ...makeHabit('h2', 'Read'),
      type: 'Hours',
      targetHours: 1,
    };
    const { getByTestId } = render(
      <GroupCard
        group={makeGroup({ groupType: 'Any' })}
        habits={[makeHabit('h1', 'Stretch'), hours]}
        todayKey={TODAY}
        onToggle={onToggle}
        onOpen={onOpen}
        onOpenHabit={onOpenHabit}
      />,
    );

    fireEvent.press(getByTestId('group-card-group-1'));
    fireEvent.press(getByTestId('group-header-group-1'));
    fireEvent.press(getByTestId('habit-pill-open-h1'));
    fireEvent.press(getByTestId('habit-row-open-h2'));
    fireEvent.press(getByTestId('habit-pill-check-h1'));

    expect([
      onOpen.mock.calls,
      onOpenHabit.mock.calls,
      onToggle.mock.calls,
    ]).toEqual([[['group-1'], ['group-1']], [['h1'], ['h2']], [['h1']]]);
  });
});
