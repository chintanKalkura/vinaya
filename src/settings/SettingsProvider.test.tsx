import React from 'react';
import { Text } from 'react-native';
import * as RN from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import { SettingsProvider, useSettings } from './SettingsProvider';
import { useIsDark, usePalette } from '../theming';
import { darkColors, lightColors } from '../theme';
import { loadSettings, saveSettings } from '../storage/settingsStorage';

let update: ReturnType<typeof useSettings>['updateSettings'] = () => {};

function Probe() {
  const { settings, updateSettings } = useSettings();
  const colors = usePalette();
  update = updateSettings;
  return (
    <Text testID="probe">
      {[
        settings.theme,
        useIsDark() ? 'dark' : 'light',
        colors.v2Background,
      ].join(' ')}
    </Text>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SettingsProvider', () => {
  it('should use the dark palette by default', async () => {
    const { findByTestId } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );

    expect((await findByTestId('probe')).props.children).toBe(
      `dark dark ${darkColors.v2Background}`,
    );
  });

  it('should switch to the light palette at once and save it', async () => {
    const { findByTestId } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );
    await findByTestId('probe');

    await act(async () => update({ theme: 'light' }));

    expect([
      (await findByTestId('probe')).props.children,
      (await loadSettings()).theme,
    ]).toEqual([`light light ${lightColors.v2Background}`, 'light']);
  });

  it('should follow the phone when set to System', async () => {
    jest.spyOn(RN, 'useColorScheme').mockReturnValue('light');
    await saveSettings({ theme: 'system' });
    const { findByTestId } = render(
      <SettingsProvider>
        <Probe />
      </SettingsProvider>,
    );

    expect((await findByTestId('probe')).props.children).toBe(
      `system light ${lightColors.v2Background}`,
    );
  });

  it('should reload settings after a restore', async () => {
    const { findByTestId, rerender } = render(
      <SettingsProvider reloadKey={0}>
        <Probe />
      </SettingsProvider>,
    );
    await findByTestId('probe');
    await saveSettings({ theme: 'light' });

    rerender(
      <SettingsProvider reloadKey={1}>
        <Probe />
      </SettingsProvider>,
    );

    expect((await findByTestId('probe')).props.children).toBe(
      `light light ${lightColors.v2Background}`,
    );
  });
});
