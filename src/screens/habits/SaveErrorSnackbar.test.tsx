import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import SaveErrorSnackbar, { SAVE_ERROR_HIDE_MS } from './SaveErrorSnackbar';
import { BOTTOM_MENU_HEIGHT } from './BottomMenu';
import { colors } from '../../theme';

describe('SaveErrorSnackbar', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show the message when visible', () => {
    const { getByText } = render(
      <SaveErrorSnackbar visible onDismiss={() => {}} />,
    );

    expect(getByText("Couldn't save. Try again.")).toBeTruthy();
  });

  it('should render nothing when not visible', () => {
    const { queryByTestId } = render(
      <SaveErrorSnackbar visible={false} onDismiss={() => {}} />,
    );

    expect(queryByTestId('save-error')).toBeNull();
  });

  it('should dismiss when tapped', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <SaveErrorSnackbar visible onDismiss={onDismiss} />,
    );

    fireEvent.press(getByTestId('save-error'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should dismiss itself after 4 seconds', () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();
    render(<SaveErrorSnackbar visible onDismiss={onDismiss} />);

    act(() => {
      jest.advanceTimersByTime(SAVE_ERROR_HIDE_MS);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should sit above the FAB on a dark card with a red left edge', () => {
    const { getByTestId } = render(
      <SaveErrorSnackbar visible onDismiss={() => {}} />,
    );

    expect(
      StyleSheet.flatten(getByTestId('save-error').props.style),
    ).toMatchObject({
      bottom: BOTTOM_MENU_HEIGHT + 16 + 56 + 12,
      borderLeftColor: colors.v2Red,
      backgroundColor: colors.v2CardBackground,
    });
  });
});
