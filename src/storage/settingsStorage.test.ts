import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSettings, saveSettings, toSettings } from './settingsStorage';
import { DEFAULT_SETTINGS } from '../types/settings';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('settingsStorage', () => {
  it('should load the defaults when nothing is saved', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('should save a change and load it back', async () => {
    await saveSettings({ defaultView: 'group' });
    await saveSettings({ theme: 'system' });

    expect(await loadSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      defaultView: 'group',
      theme: 'system',
    });
  });

  it('should use the defaults when the saved value is unreadable', async () => {
    await AsyncStorage.setItem('settings_v2', '{not json');

    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('should drop unknown values', () => {
    expect(toSettings({ theme: 'sepia', defaultView: 'group', x: 1 })).toEqual({
      ...DEFAULT_SETTINGS,
      defaultView: 'group',
    });
  });
});
