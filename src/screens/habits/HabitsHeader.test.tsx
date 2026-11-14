import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ReactTestInstance } from 'react-test-renderer';
import HabitsHeader, { HabitsViewMode } from './HabitsHeader';
import { colors } from '../../theme';

function renderHeader(
  viewMode: HabitsViewMode = 'group',
  onChangeViewMode = jest.fn(),
  onOpenSort = jest.fn(),
) {
  return render(
    <HabitsHeader
      cadenceFilter="All"
      onChangeCadenceFilter={jest.fn()}
      viewMode={viewMode}
      onChangeViewMode={onChangeViewMode}
      onOpenSort={onOpenSort}
    />,
  );
}

describe('HabitsHeader', () => {
  it('should show the cadence filter with the selected value', () => {
    const { getByTestId } = renderHeader();

    expect(getByTestId('cadence-filter')).toHaveTextContent('All');
  });

  it('should show the view toggle and sort button', () => {
    const { getByTestId } = renderHeader();

    expect(getByTestId('view-mode-toggle-group')).toBeTruthy();
    expect(getByTestId('view-mode-toggle-list')).toBeTruthy();
    expect(getByTestId('sort-button')).toBeTruthy();
  });

  it('should show group view as selected in group mode', () => {
    const { getByTestId } = renderHeader('group');

    expect(
      getByTestId('view-mode-toggle-group').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('should show list view as selected in list mode', () => {
    const { getByTestId } = renderHeader('list');

    expect(
      getByTestId('view-mode-toggle-list').props.accessibilityState.selected,
    ).toBe(true);
  });

  it('should request list mode when the list toggle is pressed', () => {
    const onChangeViewMode = jest.fn();
    const { getByTestId } = renderHeader('group', onChangeViewMode);

    fireEvent.press(getByTestId('view-mode-toggle-list'));

    expect(onChangeViewMode).toHaveBeenCalledWith('list');
  });

  it('should request group mode when the group toggle is pressed', () => {
    const onChangeViewMode = jest.fn();
    const { getByTestId } = renderHeader('list', onChangeViewMode);

    fireEvent.press(getByTestId('view-mode-toggle-group'));

    expect(onChangeViewMode).toHaveBeenCalledWith('group');
  });

  it('should open the Sort & Filter sheet from the sort button', () => {
    const onOpenSort = jest.fn();
    const { getByTestId } = renderHeader('group', jest.fn(), onOpenSort);

    fireEvent.press(getByTestId('sort-button'));

    expect(onOpenSort).toHaveBeenCalled();
  });

  it('should show the title in white serif italics', () => {
    const { getByTestId } = renderHeader();
    const title = getByTestId('habits-title');

    expect([
      title.props.children,
      StyleSheet.flatten(title.props.style),
    ]).toEqual([
      'Vinaya - Habits',
      expect.objectContaining({
        color: colors.v2White,
        fontFamily: 'serif',
        fontStyle: 'italic',
      }),
    ]);
  });

  it('should put the title first, then the cadence filter left of the toggle and sort', () => {
    const { UNSAFE_root } = renderHeader();
    const wanted = [
      'habits-title',
      'cadence-filter',
      'view-mode-toggle-group',
      'sort-button',
    ];
    const order = UNSAFE_root.findAll(
      (node: ReactTestInstance) =>
        typeof node.type === 'string' && wanted.includes(node.props.testID),
    ).map((node: ReactTestInstance) => node.props.testID);

    expect([...new Set(order)]).toEqual(wanted);
  });
});
