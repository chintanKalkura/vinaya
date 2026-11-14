import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SegmentedControl from './SegmentedControl';

describe('SegmentedControl', () => {
  const renderControl = (onChange = jest.fn()) => ({
    ...render(
      <SegmentedControl
        options={['Day', 'Week'] as const}
        value="Day"
        onChange={onChange}
        testID="c"
      />,
    ),
    onChange,
  });

  it('should mark the selected option', () => {
    const { getByTestId } = renderControl();

    expect([
      getByTestId('c-Day').props.accessibilityState.selected,
      getByTestId('c-Week').props.accessibilityState.selected,
    ]).toEqual([true, false]);
  });

  it('should report the tapped option', () => {
    const { getByTestId, onChange } = renderControl();

    fireEvent.press(getByTestId('c-Week'));

    expect(onChange).toHaveBeenCalledWith('Week');
  });
});
