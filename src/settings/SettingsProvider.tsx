import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../theme';
import { ThemeProvider } from '../theming';
import { loadSettings, saveSettings } from '../storage/settingsStorage';
import { DEFAULT_SETTINGS, Settings } from '../types/settings';

// Display settings for the whole app, and the palette they pick:
// docs/feature-development/release-1-readiness/display-settings.md
interface SettingsValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function useSettings(): SettingsValue {
  return useContext(SettingsContext);
}

interface SettingsProviderProps {
  reloadKey?: number; // bumped after a restore, which may bring settings
  children: React.ReactNode;
}

export function SettingsProvider({
  reloadKey = 0,
  children,
}: SettingsProviderProps): React.JSX.Element | null {
  const [settings, setSettings] = useState<Settings | null>(null);
  const phoneScheme = useColorScheme();

  useEffect(() => {
    let current = true;
    loadSettings().then(loaded => {
      if (current) setSettings(loaded);
    });
    return () => {
      current = false;
    };
  }, [reloadKey]);

  // Applies at once; if the save fails the change still holds until restart
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...(prev ?? DEFAULT_SETTINGS), ...patch }));
    saveSettings(patch).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ settings: settings ?? DEFAULT_SETTINGS, updateSettings }),
    [settings, updateSettings],
  );

  // Nothing is drawn until the settings are read, so the first frame is
  // already in the right theme and view
  if (!settings) return null;

  const isDark =
    settings.theme === 'system'
      ? phoneScheme !== 'light'
      : settings.theme === 'dark';

  return (
    <SettingsContext.Provider value={value}>
      <ThemeProvider colors={isDark ? darkColors : lightColors} isDark={isDark}>
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}
