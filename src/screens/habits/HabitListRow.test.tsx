import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { ReactTestInstance } from 'react-test-renderer';
import HabitListRow from './HabitListRow';
import { Habit } from '../../types/habit';
import { colors } from '../../theme';
import { ColorKind } from './colorRules';

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
    ...overrides,
    // history mirrors the marks, as in real data
    history: overrides.history ?? overrides.recentLog ?? [],
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
        colorKind="banner"
      />,
    );

    expect(getByText('Eat Healthy')).toBeTruthy();
  });

  it('omits the subtitle entirely for an ungrouped habit', () => {
    const { queryByText } = render(
      <HabitListRow
        habit={makeHabit()}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
      />,
    );

    expect(queryByText('Eat Healthy')).toBeNull();
  });

  it('renders marked state as checked', () => {
    const habit = makeHabit({
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitListRow
        habit={habit}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
      />,
    );

    expect(getByTestId('habit-row-habit-1').props.accessibilityState).toEqual({
      checked: true,
    });
  });

  it('renders unmarked-but-streak-alive state as unchecked with streak shown', () => {
    const habit = makeHabit({
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByTestId, getByText } = render(
      <HabitListRow
        habit={habit}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
      />,
    );

    expect(getByTestId('habit-row-habit-1').props.accessibilityState).toEqual({
      checked: false,
    });
    expect(getByText('1')).toBeTruthy();
  });

  it('calls onPress with the habit id when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HabitListRow
        habit={makeHabit()}
        todayKey={TODAY}
        onPress={onPress}
        colorKind="banner"
      />,
    );

    fireEvent.press(getByTestId('habit-row-habit-1'));

    expect(onPress).toHaveBeenCalledWith('habit-1');
  });

  it('can be pressed for a Week habit', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <HabitListRow
        habit={makeHabit({ cadence: 'Week', target: 2 })}
        todayKey={TODAY}
        onPress={onPress}
        colorKind="banner"
      />,
    );

    fireEvent.press(getByTestId('habit-row-habit-1'));

    expect(onPress).toHaveBeenCalledWith('habit-1');
  });

  it('shows a Week banner orange with an empty check when its window meets the target without a mark today', () => {
    const habit = makeHabit({
      cadence: 'Week',
      target: 1,
      recentLog: [{ date: D1, kind: 'marker', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitListRow
        habit={habit}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
      />,
    );
    const row = getByTestId('habit-row-habit-1');

    expect([
      row.props.accessibilityState.checked,
      StyleSheet.flatten(row.props.style).borderColor,
    ]).toEqual([false, colors.v2Orange]);
  });

  it('shows a round orange check icon when marked', () => {
    const habit = makeHabit({
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
    });
    const { getByTestId } = render(
      <HabitListRow
        habit={habit}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
      />,
    );
    const icon = StyleSheet.flatten(
      getByTestId('habit-row-icon-habit-1').props.style,
    );

    expect([icon.borderRadius, icon.backgroundColor]).toEqual([
      10,
      colors.v2Orange,
    ]);
  });

  describe('Hours habit', () => {
    const hoursHabit = (hours: number) =>
      makeHabit({
        name: 'Job Hunt',
        type: 'Hours',
        targetHours: 2,
        recentLog: [{ date: TODAY, kind: 'hours', value: hours }],
      });
    const renderHours = (hours: number, onPress = jest.fn()) =>
      render(
        <HabitListRow
          habit={hoursHabit(hours)}
          groupName="Stay Productive"
          todayKey={TODAY}
          onPress={onPress}
          colorKind="pill"
        />,
      );
    const nameColor = (hours: number) =>
      StyleSheet.flatten(renderHours(hours).getByText('Job Hunt').props.style)
        .color;

    it('shows the streak of days the target was met', () => {
      const habit = makeHabit({
        type: 'Hours',
        targetHours: 2,
        recentLog: [
          { date: TODAY, kind: 'hours', value: 2 },
          { date: D1, kind: 'hours', value: 3 },
          { date: '2024-06-13', kind: 'hours', value: 1 },
        ],
      });
      const { getByTestId } = render(
        <HabitListRow
          habit={habit}
          todayKey={TODAY}
          onPress={jest.fn()}
          colorKind="banner"
        />,
      );

      expect(getByTestId('habit-row-streak-habit-1').props.children).toBe(2);
    });

    it('shows the streak grey when the target was met yesterday but not yet today', () => {
      const habit = makeHabit({
        type: 'Hours',
        targetHours: 2,
        recentLog: [{ date: D1, kind: 'hours', value: 2 }],
      });
      const { getByTestId } = render(
        <HabitListRow
          habit={habit}
          todayKey={TODAY}
          onPress={jest.fn()}
          colorKind="banner"
        />,
      );

      expect(
        StyleSheet.flatten(getByTestId('habit-row-streak-habit-1').props.style)
          .color,
      ).toBe(colors.v2GreyText);
    });

    it('does not show hours logged as {n}h', () => {
      expect(renderHours(3).queryByText('3h')).toBeNull();
    });

    it('shows no check icon', () => {
      expect(renderHours(3).queryByTestId('habit-row-icon-habit-1')).toBeNull();
    });

    it('shows the hours label against its target', () => {
      expect(renderHours(1).getByText('1/2h')).toBeTruthy();
    });

    it('fills the progress bar against its target', () => {
      expect(
        StyleSheet.flatten(
          renderHours(1).getByTestId('habit-row-progress-habit-1').props.style,
        ).width,
      ).toBe('50%');
    });

    it('shows the title orange as a pill when hours today meet its target', () => {
      expect(nameColor(2)).toBe(colors.v2Orange);
    });

    it('shows the title grey as a pill when hours today are below its target', () => {
      expect(nameColor(1)).toBe(colors.v2GreyText);
    });

    it('calls onPress with the habit id when tapped', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderHours(1, onPress);

      fireEvent.press(getByTestId('habit-row-habit-1'));

      expect(onPress).toHaveBeenCalledWith('habit-1');
    });
  });

  describe('banner and pill coloring', () => {
    const rowStyle = (habit: Habit, colorKind: ColorKind) =>
      StyleSheet.flatten(
        render(
          <HabitListRow
            habit={habit}
            todayKey={TODAY}
            onPress={jest.fn()}
            colorKind={colorKind}
          />,
        ).getByTestId('habit-row-habit-1').props.style,
      );
    const marked = makeHabit({
      recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
    });

    it('shows an orange border and background when marked', () => {
      const style = rowStyle(marked, 'banner');

      expect([style.borderColor, style.backgroundColor]).toEqual([
        colors.v2Orange,
        colors.v2OrangeCardBackground,
      ]);
    });

    it('stays grey when not marked', () => {
      expect(rowStyle(makeHabit(), 'banner').borderColor).toBe(colors.v2Border);
    });

    it('keeps the grey card as a pill even when marked', () => {
      expect(rowStyle(marked, 'pill').borderColor).toBe(colors.v2Border);
    });

    it('shows the orange banner for an Hours habit that met its target', () => {
      const hours = makeHabit({
        type: 'Hours',
        targetHours: 2,
        recentLog: [{ date: TODAY, kind: 'hours', value: 2 }],
      });

      expect(rowStyle(hours, 'banner').borderColor).toBe(colors.v2Orange);
    });

    it('stays grey for an Hours habit below its target', () => {
      const hours = makeHabit({
        type: 'Hours',
        targetHours: 2,
        recentLog: [{ date: TODAY, kind: 'hours', value: 1 }],
      });

      expect(rowStyle(hours, 'banner').borderColor).toBe(colors.v2Border);
    });
  });

  describe('banner title and number', () => {
    const renderBanner = (habit: Habit) =>
      render(
        <HabitListRow
          habit={habit}
          todayKey={TODAY}
          onPress={jest.fn()}
          colorKind="banner"
        />,
      );
    const color = (node: ReactTestInstance) =>
      StyleSheet.flatten(node.props.style).color;

    it('keeps the title white when marked', () => {
      const habit = makeHabit({
        recentLog: [{ date: TODAY, kind: 'marker', value: 1 }],
      });

      expect(color(renderBanner(habit).getByText('Cook'))).toBe(colors.v2White);
    });

    it('keeps the title white when not marked', () => {
      expect(color(renderBanner(makeHabit()).getByText('Cook'))).toBe(
        colors.v2White,
      );
    });

    it('shows the streak number grey when not marked today but the streak is alive', () => {
      const habit = makeHabit({
        recentLog: [{ date: D1, kind: 'marker', value: 1 }],
      });

      expect(color(renderBanner(habit).getByText('1'))).toBe(colors.v2GreyText);
    });

    it('shows the streak number orange when marked today', () => {
      const habit = makeHabit({
        recentLog: [
          { date: TODAY, kind: 'marker', value: 1 },
          { date: D1, kind: 'marker', value: 1 },
        ],
      });

      expect(color(renderBanner(habit).getByText('2'))).toBe(colors.v2Orange);
    });
  });

  describe('banner layout (list view)', () => {
    const renderAs = (colorKind: ColorKind, overrides: Partial<Habit> = {}) =>
      render(
        <HabitListRow
          habit={makeHabit({ cadence: 'Week', target: 2, ...overrides })}
          todayKey={TODAY}
          onPress={jest.fn()}
          colorKind={colorKind}
        />,
      );
    const streakMargin = (colorKind: ColorKind, overrides?: Partial<Habit>) =>
      StyleSheet.flatten(
        renderAs(colorKind, overrides).getByTestId('habit-row-streak-habit-1')
          .props.style,
      ).marginLeft;

    it('right-aligns the streak on a banner', () => {
      expect(streakMargin('banner')).toBe('auto');
    });

    it('right-aligns the streak on an Hours banner', () => {
      expect(streakMargin('banner', { type: 'Hours', targetHours: 1 })).toBe(
        'auto',
      );
    });

    it('keeps the streak beside the name on a pill', () => {
      expect(streakMargin('pill', { type: 'Hours', targetHours: 1 })).toBe(
        undefined,
      );
    });

    it('shows the cadence label on a banner', () => {
      expect(renderAs('banner').getByText('Weekly')).toBeTruthy();
    });

    it('shows the cadence label on an Hours banner', () => {
      expect(
        renderAs('banner', { type: 'Hours', targetHours: 1 }).getByText(
          'Weekly',
        ),
      ).toBeTruthy();
    });

    it('shows no cadence label on a pill', () => {
      expect(
        renderAs('pill', { type: 'Hours', targetHours: 1 }).queryByText(
          'Weekly',
        ),
      ).toBeNull();
    });
  });
});

describe('HabitListRow streak freeze', () => {
  // Marked the 3 days before yesterday; a freeze covered yesterday today
  const frozenHabit = (overrides: Partial<Habit> = {}) =>
    makeHabit({
      recentLog: ['2024-06-13', '2024-06-12', '2024-06-11'].map(date => ({
        date,
        kind: 'marker' as const,
        value: 1,
      })),
      streakFreeze: {
        available: 2,
        earnedAtStreak: 0,
        frozenDates: [D1],
        lastUsedOn: TODAY,
      },
      ...overrides,
    });

  const renderRow = (habit: Habit, colorKind: ColorKind) =>
    render(
      <HabitListRow
        habit={habit}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind={colorKind}
      />,
    );

  it('shows "n freezes left" on a banner frozen today', () => {
    const { getByTestId } = renderRow(frozenHabit(), 'banner');

    expect(getByTestId('habit-row-freeze-habit-1').props.children).toBe(
      '2 freezes left',
    );
  });

  it('keeps the streak and shows the Snowflake on a frozen banner', () => {
    const { getByTestId, queryByTestId } = renderRow(frozenHabit(), 'banner');

    expect([
      getByTestId('habit-row-streak-habit-1').props.children,
      !!getByTestId('habit-row-frozen-habit-1', {
        includeHiddenElements: true,
      }),
      queryByTestId('habit-row-icon-habit-1'),
    ]).toEqual([3, true, null]);
  });

  it('gives a frozen banner the icy border and background', () => {
    const { getByTestId } = renderRow(frozenHabit(), 'banner');

    expect(
      StyleSheet.flatten(getByTestId('habit-row-habit-1').props.style),
    ).toMatchObject({
      borderColor: colors.v2Ice,
      backgroundColor: colors.v2IceCardBackground,
    });
  });

  it('never shows the freeze label on a pill', () => {
    const { queryByTestId } = renderRow(frozenHabit(), 'pill');

    expect(queryByTestId('habit-row-freeze-habit-1')).toBeNull();
  });

  it('hides the freeze label once marked today', () => {
    const habit = frozenHabit();
    const { queryByTestId } = renderRow(
      {
        ...habit,
        history: [...habit.history, { date: TODAY, kind: 'marker', value: 1 }],
      },
      'banner',
    );

    expect(queryByTestId('habit-row-freeze-habit-1')).toBeNull();
  });

  it('hides the freeze label on later days', () => {
    const { queryByTestId } = renderRow(
      frozenHabit({
        streakFreeze: {
          available: 2,
          earnedAtStreak: 0,
          frozenDates: [D1],
          lastUsedOn: D1,
        },
      }),
      'banner',
    );

    expect(queryByTestId('habit-row-freeze-habit-1')).toBeNull();
  });

  it('turns the Hours bar icy when frozen', () => {
    const { getByTestId } = renderRow(
      frozenHabit({
        type: 'Hours',
        targetHours: 1,
        recentLog: [
          { date: TODAY, kind: 'hours', value: 0 },
          ...['2024-06-13', '2024-06-12'].map(date => ({
            date,
            kind: 'hours' as const,
            value: 1,
          })),
        ],
      }),
      'banner',
    );

    expect(
      StyleSheet.flatten(getByTestId('habit-row-progress-habit-1').props.style)
        .backgroundColor,
    ).toBe(colors.v2Ice);
  });
});

describe('HabitListRow menu', () => {
  it('shows the menu right of the streak on a banner', () => {
    const { getByTestId } = render(
      <HabitListRow
        habit={makeHabit()}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
        onDelete={jest.fn()}
      />,
    );

    const nameRow = getByTestId('habit-row-streak-habit-1').parent?.parent;
    const ids = nameRow?.children.map(
      child => (child as ReactTestInstance).props.testID,
    );
    expect(ids?.slice(-2)).toEqual([
      'habit-row-streak-habit-1',
      'habit-row-menu-habit-1',
    ]);
  });

  it('never shows the menu on a pill', () => {
    const { queryByTestId } = render(
      <HabitListRow
        habit={makeHabit()}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="pill"
        onDelete={jest.fn()}
      />,
    );

    expect(queryByTestId('habit-row-menu-habit-1')).toBeNull();
  });

  it('deletes the habit after confirming', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <HabitListRow
        habit={makeHabit()}
        todayKey={TODAY}
        onPress={jest.fn()}
        colorKind="banner"
        onDelete={onDelete}
      />,
    );

    fireEvent.press(getByTestId('habit-row-menu-habit-1'));
    fireEvent.press(getByTestId('habit-row-menu-habit-1-delete'));
    fireEvent.press(getByTestId('habit-row-menu-habit-1-confirm-delete'));

    expect(onDelete).toHaveBeenCalledWith('habit-1');
  });
});
