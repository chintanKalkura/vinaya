import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import CreateChoiceSheet from './CreateChoiceSheet';

function renderSheet() {
  const onNewHabit = jest.fn();
  const onClose = jest.fn();
  const utils = render(
    <CreateChoiceSheet visible onNewHabit={onNewHabit} onClose={onClose} />,
  );
  return { ...utils, onNewHabit, onClose };
}

describe('CreateChoiceSheet', () => {
  it('should offer New Habit and New Habit Group', () => {
    const { getByText } = renderSheet();

    expect([
      !!getByText('What would you like to add?'),
      !!getByText('Track a single behaviour'),
      !!getByText('Combine habits under one goal'),
    ]).toEqual([true, true, true]);
  });

  it('should open the New Habit form', () => {
    const { getByTestId, onNewHabit } = renderSheet();

    fireEvent.press(getByTestId('choice-sheet-habit'));

    expect(onNewHabit).toHaveBeenCalled();
  });

  it('should do nothing for New Habit Group', () => {
    const { getByTestId, onNewHabit, onClose } = renderSheet();

    fireEvent.press(getByTestId('choice-sheet-group'));

    expect([onNewHabit, onClose].map(f => f.mock.calls.length)).toEqual([0, 0]);
  });

  it('should close when the backdrop is tapped', () => {
    const { getByTestId, onClose } = renderSheet();

    fireEvent.press(getByTestId('choice-sheet-backdrop'));

    expect(onClose).toHaveBeenCalled();
  });
});
