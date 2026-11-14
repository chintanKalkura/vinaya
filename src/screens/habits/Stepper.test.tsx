import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Stepper from './Stepper';

function renderStepper(value: number, onChange = jest.fn()) {
  const utils = render(
    <Stepper
      value={value}
      min={1}
      max={6}
      onChange={onChange}
      testID="s"
      suffix="of 6 max"
    />,
  );
  return { ...utils, onChange };
}

describe('Stepper', () => {
  it('should step up and down by one', () => {
    const { getByTestId, onChange } = renderStepper(3);

    fireEvent.press(getByTestId('s-increment'));
    fireEvent.press(getByTestId('s-decrement'));

    expect(onChange.mock.calls).toEqual([[4], [2]]);
  });

  it('should not step past min or max', () => {
    const atMax = renderStepper(6);
    fireEvent.press(atMax.getByTestId('s-increment'));
    const atMin = renderStepper(1);
    fireEvent.press(atMin.getByTestId('s-decrement'));

    expect([atMax.onChange.mock.calls, atMin.onChange.mock.calls]).toEqual([
      [[6]],
      [[1]],
    ]);
  });

  it('should clamp a typed value', () => {
    const { getByTestId, onChange } = renderStepper(3);

    fireEvent.changeText(getByTestId('s-input'), '9');

    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('should ignore a cleared field until a number is typed', () => {
    const { getByTestId, onChange } = renderStepper(3);

    fireEvent.changeText(getByTestId('s-input'), '');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should show the max suffix', () => {
    expect(renderStepper(3).getByText('of 6 max')).toBeTruthy();
  });
});
