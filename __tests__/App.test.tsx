/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Unmount so the midnight timer and listeners don't keep Jest running
  await ReactTestRenderer.act(() => renderer?.unmount());
});

describe('App tabs', () => {
  const { BackHandler } = require('react-native');
  const { act, fireEvent, render } = require('@testing-library/react-native');

  it('opens Profile from the bottom menu and highlights it', async () => {
    const utils = render(<App />);
    await utils.findByTestId('fab');

    fireEvent.press(utils.getByTestId('bottom-menu-Profile'));

    expect(
      (await utils.findByTestId('profile-screen')) &&
        utils.getByTestId('bottom-menu-Profile').props.accessibilityState
          .selected,
    ).toBe(true);
  });

  it('returns to Habits on Android back', async () => {
    const addListener = jest.spyOn(BackHandler, 'addEventListener');
    const utils = render(<App />);
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('bottom-menu-Profile'));
    await utils.findByTestId('profile-screen');

    const handler = addListener.mock.calls[
      addListener.mock.calls.length - 1
    ][1] as () => boolean;
    act(() => {
      handler();
    });

    expect(utils.queryByTestId('profile-screen')).toBeNull();
    addListener.mockRestore();
  });

  it('keeps the Habits view after visiting Profile', async () => {
    const utils = render(<App />);
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('view-mode-toggle-group'));

    fireEvent.press(utils.getByTestId('bottom-menu-Profile'));
    await utils.findByTestId('profile-screen');
    fireEvent.press(utils.getAllByTestId('bottom-menu-Habits').pop());

    expect(
      utils.getByTestId('view-mode-toggle-group').props.accessibilityState
        .selected,
    ).toBe(true);
  });
});
