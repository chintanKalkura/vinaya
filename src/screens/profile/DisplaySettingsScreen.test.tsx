import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import DisplaySettingsScreen from './DisplaySettingsScreen';
import { SettingsProvider } from '../../settings/SettingsProvider';
import { loadSettings } from '../../storage/settingsStorage';
import { lightColors } from '../../theme';

function renderScreen(onBack = () => {}) {
  return render(
    <SettingsProvider>
      <DisplaySettingsScreen onBack={onBack} />
    </SettingsProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('DisplaySettingsScreen', () => {
  it('should show List and Dark selected by default', async () => {
    const { findByTestId, getByTestId } = renderScreen();
    await findByTestId('display-settings-screen');

    expect([
      getByTestId('setting-default-view-List').props.accessibilityState
        ?.selected,
      getByTestId('setting-theme-Dark').props.accessibilityState?.selected,
    ]).toEqual([true, true]);
  });

  it('should save the default view', async () => {
    const { findByTestId } = renderScreen();

    fireEvent.press(await findByTestId('setting-default-view-Group'));

    await waitFor(async () =>
      expect((await loadSettings()).defaultView).toBe('group'),
    );
  });

  it('should recolour the screen at once when Light is chosen', async () => {
    const { findByTestId } = renderScreen();

    fireEvent.press(await findByTestId('setting-theme-Light'));

    expect(
      (await findByTestId('display-settings-screen')).props.style
        .backgroundColor,
    ).toBe(lightColors.v2Background);
  });

  it('should go back from the header arrow', async () => {
    const onBack = jest.fn();
    const { findByTestId } = renderScreen(onBack);

    fireEvent.press(await findByTestId('display-settings-back'));

    expect(onBack).toHaveBeenCalled();
  });
});
