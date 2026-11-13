import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HabitsHeader, { HabitsViewMode } from './HabitsHeader';

function renderHeader(
  viewMode: HabitsViewMode = 'group',
  onChangeViewMode = jest.fn(),
) {
  return render(
    <HabitsHeader viewMode={viewMode} onChangeViewMode={onChangeViewMode} />,
  );
}

describe('HabitsHeader', () => {
  it('should show the four cadence values', () => {
    const { getByText } = renderHeader();

    ['Day', 'Week', 'Month', 'Year'].forEach(label => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('should show the view toggle and sort button', () => {
    const { getByTestId } = renderHeader();

    expect(getByTestId('view-mode-toggle-group')).toBeTruthy();
    expect(getByTestId('view-mode-toggle-list')).toBeTruthy();
    expect(getByTestId('sort-button')).toBeTruthy();
  });

  it('should not change anything when a cadence is pressed', () => {
    const { getByTestId, toJSON } = renderHeader();
    const before = JSON.stringify(toJSON());

    fireEvent.press(getByTestId('cadence-pill-Week'));

    expect(JSON.stringify(toJSON())).toBe(before);
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
});
