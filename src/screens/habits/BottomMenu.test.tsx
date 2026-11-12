import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import BottomMenu from './BottomMenu';

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
