/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
// Imported at the top so its automatic unmount runs after every test here
import { act, fireEvent, render } from '@testing-library/react-native';
import { BackHandler, StyleSheet } from 'react-native';
import { lightColors } from '../src/theme';
import { COMING_SOON } from '../src/screens/ComingSoonScreen';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Unmount so the midnight timer and listeners don't keep Jest running
  await ReactTestRenderer.act(() => renderer?.unmount());
});

describe('App tabs', () => {
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
    fireEvent.press(utils.getByTestId('bottom-menu-Habits'));

    expect(
      utils.getByTestId('view-mode-toggle-group').props.accessibilityState
        .selected,
    ).toBe(true);
  });
});

describe('App coming-soon tabs', () => {
  it.each(['Journal', 'Level-Up'] as const)(
    'opens %s with its coming-soon text and highlights it',
    async tab => {
      const utils = render(<App />);
      await utils.findByTestId('fab');

      fireEvent.press(utils.getByTestId(`bottom-menu-${tab}`));

      expect([
        !!(await utils.findByText(COMING_SOON[tab].message)),
        utils.getByTestId(`bottom-menu-${tab}`).props.accessibilityState
          .selected,
      ]).toEqual([true, true]);
    },
  );

  it('shows the + only on Habits', async () => {
    const utils = render(<App />);
    await utils.findByTestId('fab');

    fireEvent.press(utils.getByTestId('bottom-menu-Journal'));
    await utils.findByTestId('coming-soon-Journal');

    expect(utils.queryByTestId('fab')).toBeNull();
  });
});

describe('App Profile stack', () => {
  it('opens About from Profile and goes back to the menu', async () => {
    const utils = render(<App />);
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('bottom-menu-Profile'));

    fireEvent.press(await utils.findByTestId('profile-about'));
    await utils.findByTestId('about-screen');
    fireEvent.press(utils.getByTestId('about-back'));

    expect(!!(await utils.findByTestId('profile-screen'))).toBe(true);
  });
});

describe('App display settings', () => {
  it('opens Display settings from Profile and recolours the app in Light', async () => {
    const utils = render(<App />);
    await utils.findByTestId('fab');
    fireEvent.press(utils.getByTestId('bottom-menu-Profile'));

    fireEvent.press(await utils.findByTestId('profile-display-settings'));
    fireEvent.press(await utils.findByTestId('setting-theme-Light'));

    expect(
      StyleSheet.flatten(
        (await utils.findByTestId('display-settings-screen')).props.style,
      ).backgroundColor,
    ).toBe(lightColors.v2Background);
  });
});
