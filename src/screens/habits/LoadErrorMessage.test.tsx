import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import LoadErrorMessage from './LoadErrorMessage';
import { colors } from '../../theme';

describe('LoadErrorMessage', () => {
  it('should show the title and reassurance text', () => {
    const { getByText } = render(<LoadErrorMessage onRetry={() => {}} />);

    expect([
      getByText("Couldn't load your habits"),
      getByText('Your data is safe. Click Retry to try again.'),
    ]).toHaveLength(2);
  });

  it('should call onRetry when Retry is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<LoadErrorMessage onRetry={onRetry} />);

    fireEvent.press(getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should draw Retry with a thick red border and no fill', () => {
    const { getByTestId } = render(<LoadErrorMessage onRetry={() => {}} />);

    expect(
      StyleSheet.flatten(getByTestId('load-error-retry').props.style),
    ).toMatchObject({
      borderWidth: 3,
      borderColor: colors.v2Red,
      backgroundColor: 'transparent',
    });
  });
});
