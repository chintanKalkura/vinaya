import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import HoursProgress from './HoursProgress';

function fillWidth(total: number, target: number) {
  const { getByTestId } = render(
    <HoursProgress total={total} target={target} testID="progress" />,
  );
  return StyleSheet.flatten(getByTestId('progress').props.style).width;
}

describe('HoursProgress', () => {
  it('should fill in proportion to the target', () => {
    expect(fillWidth(2, 8)).toBe('25%');
  });

  it('should cap the fill at full', () => {
    expect(fillWidth(12, 8)).toBe('100%');
  });

  it('should show an empty bar when the target is 0', () => {
    expect(fillWidth(3, 0)).toBe('0%');
  });

  it('should show a short hours label beside the bar', () => {
    const { getByText } = render(
      <HoursProgress total={5} target={8} testID="progress" />,
    );

    expect(getByText('5/8h')).toBeTruthy();
  });

  it('should not show the long caption', () => {
    const { queryByText } = render(
      <HoursProgress total={5} target={8} testID="progress" />,
    );

    expect(queryByText('5 / 8 hrs today')).toBeNull();
  });
});
