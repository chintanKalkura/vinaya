import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HabitPickerSheet, { PickerItem } from './HabitPickerSheet';

const ITEMS: PickerItem[] = [
  { id: 'a', name: 'No Killing' },
  { id: 'b', name: 'No Stealing' },
  { id: 'c', name: 'Job Hunt', disabled: true },
  { id: 'p', name: 'This habit', locked: true },
];

function renderSheet(selectedIds: string[] = ['p']) {
  const onDone = jest.fn();
  const onClose = jest.fn();
  const utils = render(
    <HabitPickerSheet
      visible
      title="Assign Habits"
      subtitle="Any · tap to select"
      items={ITEMS}
      selectedIds={selectedIds}
      doneLabel={n => `Done (${n} selected)`}
      onDone={onDone}
      onClose={onClose}
      testID="s"
    />,
  );
  return { ...utils, onDone, onClose };
}

describe('HabitPickerSheet', () => {
  it('should show the title, subtitle and selected count', () => {
    const { getByText } = renderSheet(['a', 'p']);

    expect([
      !!getByText('Assign Habits'),
      !!getByText('Any · tap to select'),
      !!getByText('Done (2 selected)'),
    ]).toEqual([true, true, true]);
  });

  it('should toggle habits and apply them in list order on Done', () => {
    const { getByTestId, onDone } = renderSheet();

    fireEvent.press(getByTestId('s-item-b'));
    fireEvent.press(getByTestId('s-item-a'));
    fireEvent.press(getByTestId('s-done'));

    expect(onDone).toHaveBeenCalledWith(['a', 'b', 'p']);
  });

  it('should not let a greyed-out or locked habit change', () => {
    const { getByTestId, onDone } = renderSheet();

    fireEvent.press(getByTestId('s-item-c'));
    fireEvent.press(getByTestId('s-item-p'));
    fireEvent.press(getByTestId('s-done'));

    expect(onDone).toHaveBeenCalledWith(['p']);
  });

  it('should discard the selection when the backdrop is tapped', () => {
    const { getByTestId, onDone, onClose } = renderSheet();

    fireEvent.press(getByTestId('s-item-a'));
    fireEvent.press(getByTestId('s-backdrop'));

    expect([onClose.mock.calls.length, onDone.mock.calls.length]).toEqual([
      1, 0,
    ]);
  });
});
