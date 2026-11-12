import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HabitsHeader from './HabitsHeader';

describe('HabitsHeader', () => {
  it('should show the four cadence values', () => {
    const { getByText } = render(<HabitsHeader />);

    ['Day', 'Week', 'Month', 'Year'].forEach(label => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('should show the view toggle and sort button', () => {
    const { getByTestId } = render(<HabitsHeader />);

    expect(getByTestId('view-mode-toggle-group')).toBeTruthy();
    expect(getByTestId('view-mode-toggle-list')).toBeTruthy();
    expect(getByTestId('sort-button')).toBeTruthy();
  });

  it('should not change anything when a cadence is pressed', () => {
    const { getByTestId, toJSON } = render(<HabitsHeader />);
    const before = JSON.stringify(toJSON());

    fireEvent.press(getByTestId('cadence-pill-Week'));

    expect(JSON.stringify(toJSON())).toBe(before);
  });
});
