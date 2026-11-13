import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import CadenceLabel from './CadenceLabel';

describe('CadenceLabel', () => {
  it.each([
    ['Day', 'Daily'],
    ['Week', 'Weekly'],
    ['Month', 'Monthly'],
    ['Year', 'Yearly'],
  ] as const)('should show %s as %s', (cadence, label) => {
    const { getByText } = render(
      <CadenceLabel cadence={cadence} testID="label" />,
    );

    expect(getByText(label)).toBeTruthy();
  });

  it('should show the repeating calendar icon', () => {
    const { getByTestId } = render(
      <CadenceLabel cadence="Week" testID="label" />,
    );

    expect(getByTestId('label').children).toHaveLength(2);
  });

  it('should sit in the bottom-right corner', () => {
    const { getByTestId } = render(
      <CadenceLabel cadence="Week" testID="label" />,
    );
    const style = StyleSheet.flatten(getByTestId('label').props.style);

    expect([style.position, style.right, style.bottom]).toEqual([
      'absolute',
      12,
      7,
    ]);
  });
});
