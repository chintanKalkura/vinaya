import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import TouchTarget from './TouchTarget';

describe('TouchTarget', () => {
  it('should be at least 48dp in each direction', () => {
    const { getByTestId } = render(
      <TouchTarget testID="target">
        <Text>+</Text>
      </TouchTarget>,
    );

    expect(StyleSheet.flatten(getByTestId('target').props.style)).toMatchObject(
      { minWidth: 48, minHeight: 48 },
    );
  });

  it('should call onPress', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <TouchTarget testID="target" onPress={onPress}>
        <Text>+</Text>
      </TouchTarget>,
    );

    fireEvent.press(getByTestId('target'));

    expect(onPress).toHaveBeenCalled();
  });
});
