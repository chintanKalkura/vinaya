import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';
import FreezeLabel from './FreezeLabel';
import { colors } from '../../theme';

describe('FreezeLabel', () => {
  it.each([
    [0, '0 freezes left'],
    [1, '1 freeze left'],
    [2, '2 freezes left'],
  ])('should show %i as "%s"', (freezesLeft, text) => {
    const { getByText } = render(
      <FreezeLabel freezesLeft={freezesLeft} testID="label" />,
    );

    expect(getByText(text)).toBeTruthy();
  });

  it('should sit at the bottom centre in icy blue', () => {
    const { getByTestId } = render(
      <FreezeLabel freezesLeft={1} testID="label" />,
    );

    expect(StyleSheet.flatten(getByTestId('label').props.style)).toMatchObject({
      position: 'absolute',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: colors.v2Ice,
    });
  });
});
