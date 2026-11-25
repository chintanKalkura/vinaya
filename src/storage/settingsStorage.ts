import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, Settings } from '../types/settings';
import { StorageWriteError, withStorageQueue } from './habitStorage';

const SETTINGS_KEY = 'settings_v2';

const ALLOWED: { [K in keyof Settings]: readonly Settings[K][] } = {
  defaultView: ['list', 'group'],
  theme: ['dark', 'light', 'system'],
  weekStart: ['monday', 'sunday'],
};

// Keeps only known keys with known values, so an odd backup can't break the app
export function toSettings(value: unknown): Settings {
  const raw =
    typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const pick = <K extends keyof Settings>(key: K): Settings[K] =>
    (ALLOWED[key] as readonly unknown[]).includes(raw[key])
      ? (raw[key] as Settings[K])
      : DEFAULT_SETTINGS[key];
  return {
    defaultView: pick('defaultView'),
    theme: pick('theme'),
    weekStart: pick('weekStart'),
  };
}

// The saved settings, or null when nothing was ever changed (the key is
// missing) or the value can't be read; the app then uses the defaults.
// Call inside the storage queue.
export async function loadStoredSettings(): Promise<Settings | null> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw === null ? null : toSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

// Call inside the storage queue
export async function writeSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    throw new StorageWriteError(`Couldn't save ${SETTINGS_KEY}: ${String(e)}`);
  }
}

export async function loadSettings(): Promise<Settings> {
  return (
    (await withStorageQueue(loadStoredSettings)) ?? { ...DEFAULT_SETTINGS }
  );
}

export function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  return withStorageQueue(async () => {
    const next = {
      ...((await loadStoredSettings()) ?? DEFAULT_SETTINGS),
      ...patch,
    };
    await writeSettings(next);
    return next;
  });
}
