import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SortFilterSheet from './SortFilterSheet';
import { DEFAULT_SORT_FILTER, SortFilterState } from '../../utils/sortFilter';

function renderSheet(value: SortFilterState = DEFAULT_SORT_FILTER) {
  const onApply = jest.fn();
  const onClose = jest.fn();
  const utils = render(
    <SortFilterSheet
      visible
      value={value}
      onApply={onApply}
      onClose={onClose}
    />,
  );
  return { ...utils, onApply, onClose };
}

const selected = (
  utils: ReturnType<typeof renderSheet>,
  testID: string,
): boolean => utils.getByTestId(testID).props.accessibilityState.selected;

describe('SortFilterSheet', () => {
  it('should offer Streak, A–Z and Recent with none selected by default', () => {
    const utils = renderSheet();

    expect(
      ['Streak', 'A–Z', 'Recent'].map(s => selected(utils, `sort-option-${s}`)),
    ).toEqual([false, false, false]);
  });

  it('should not offer Manual', () => {
    expect(renderSheet().queryByText('Manual')).toBeNull();
  });

  it('should apply the picked sort', () => {
    const utils = renderSheet();

    fireEvent.press(utils.getByTestId('sort-option-Recent'));
    fireEvent.press(utils.getByTestId('sort-sheet-apply'));

    expect(utils.onApply).toHaveBeenCalledWith({
      sort: 'Recent',
      completedOnly: false,
    });
  });

  it('should return to the default when the selected chip is tapped again', () => {
    const utils = renderSheet({ sort: 'Streak', completedOnly: false });

    fireEvent.press(utils.getByTestId('sort-option-Streak'));
    fireEvent.press(utils.getByTestId('sort-sheet-apply'));

    expect(utils.onApply.mock.calls[0][0].sort).toBeUndefined();
  });

  it('should toggle Completed', () => {
    const utils = renderSheet();

    fireEvent.press(utils.getByTestId('show-option-Completed'));
    fireEvent.press(utils.getByTestId('sort-sheet-apply'));

    expect(utils.onApply.mock.calls[0][0].completedOnly).toBe(true);
  });

  it('should keep Active on and Paused and Archived disabled', () => {
    const utils = renderSheet();
    const state = (key: string) =>
      utils.getByTestId(`show-option-${key}`).props.accessibilityState;

    expect([state('Active'), state('Paused'), state('Archived')]).toEqual([
      { checked: true, disabled: true },
      { checked: false, disabled: true },
      { checked: false, disabled: true },
    ]);
  });

  it('should discard changes when the backdrop is tapped', () => {
    const utils = renderSheet();

    fireEvent.press(utils.getByTestId('sort-option-A–Z'));
    fireEvent.press(utils.getByTestId('sort-sheet-backdrop'));

    expect([
      utils.onClose.mock.calls.length,
      utils.onApply.mock.calls.length,
    ]).toEqual([1, 0]);
  });
});
