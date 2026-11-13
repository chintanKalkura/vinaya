import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HoursEntryModal from './HoursEntryModal';

function renderModal(initialHours = 0) {
  const onDone = jest.fn();
  const onClose = jest.fn();
  const utils = render(
    <HoursEntryModal
      visible
      habitName="Job Hunt"
      initialHours={initialHours}
      onDone={onDone}
      onClose={onClose}
    />,
  );
  return { ...utils, onDone, onClose };
}

describe('HoursEntryModal', () => {
  it('should show the habit name and subtitle', () => {
    const { getByText } = renderModal();

    expect([
      !!getByText('Job Hunt'),
      !!getByText('Hours logged today'),
    ]).toEqual([true, true]);
  });

  it('should start at the hours already logged today', () => {
    const { getByTestId } = renderModal(3);

    expect(getByTestId('hours-modal-input').props.value).toBe('3');
  });

  it('should open the number keyboard when the field is tapped', () => {
    const { getByTestId } = renderModal();

    expect(getByTestId('hours-modal-input').props.keyboardType).toBe(
      'number-pad',
    );
  });

  it('should increase the value with +', () => {
    const { getByTestId } = renderModal(3);

    fireEvent.press(getByTestId('hours-modal-increment'));

    expect(getByTestId('hours-modal-input').props.value).toBe('4');
  });

  it('should not go below 0 with −', () => {
    const { getByTestId } = renderModal(0);

    fireEvent.press(getByTestId('hours-modal-decrement'));

    expect(getByTestId('hours-modal-input').props.value).toBe('0');
  });

  it('should not go above 24 with +', () => {
    const { getByTestId } = renderModal(24);

    fireEvent.press(getByTestId('hours-modal-increment'));

    expect(getByTestId('hours-modal-input').props.value).toBe('24');
  });

  it('should cap a typed value at 24', () => {
    const { getByTestId } = renderModal();

    fireEvent.changeText(getByTestId('hours-modal-input'), '30');

    expect(getByTestId('hours-modal-input').props.value).toBe('24');
  });

  it('should call onDone with the typed value', () => {
    const { getByTestId, onDone } = renderModal();

    fireEvent.changeText(getByTestId('hours-modal-input'), '6');
    fireEvent.press(getByTestId('hours-modal-done'));

    expect(onDone).toHaveBeenCalledWith(6);
  });

  it('should close without saving when × is pressed', () => {
    const { getByTestId, onDone, onClose } = renderModal(3);

    fireEvent.press(getByTestId('hours-modal-close'));

    expect([onClose.mock.calls.length, onDone.mock.calls.length]).toEqual([
      1, 0,
    ]);
  });
});
