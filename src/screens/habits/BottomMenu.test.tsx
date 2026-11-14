import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import BottomMenu from './BottomMenu';
import { colors } from '../../theme';

describe('BottomMenu', () => {
  it('should show Habits, Journal, Level-Up and Profile', () => {
    const { getByText } = render(<BottomMenu />);

    ['Habits', 'Journal', 'Level-Up', 'Profile'].forEach(label => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('should not change anything when an item is pressed', () => {
    const { getByTestId, toJSON } = render(<BottomMenu />);
    const before = JSON.stringify(toJSON());

    fireEvent.press(getByTestId('bottom-menu-Journal'));

    expect(JSON.stringify(toJSON())).toBe(before);
  });
});

describe('BottomMenu layout', () => {
  it('sits flush: full width, no rounded corners, a top border only', () => {
    const { getByTestId } = render(<BottomMenu />);
    const style = StyleSheet.flatten(getByTestId('bottom-menu').props.style);

    expect([
      style.marginHorizontal,
      style.marginBottom,
      style.borderRadius,
      style.borderTopWidth,
      style.backgroundColor,
    ]).toEqual([undefined, undefined, undefined, 1, colors.v2MenuBackground]);
  });

  it('pads the bottom by the bottom inset', () => {
    const safeArea = require('react-native-safe-area-context');
    const spy = jest
      .spyOn(safeArea, 'useSafeAreaInsets')
      .mockReturnValue({ top: 0, right: 0, bottom: 24, left: 0 });

    const { getByTestId } = render(<BottomMenu />);

    expect(
      StyleSheet.flatten(getByTestId('bottom-menu').props.style).paddingBottom,
    ).toBe(34);
    spy.mockRestore();
  });
});
