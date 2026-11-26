import React, { createContext, useContext, useMemo } from 'react';
import { Palette, darkColors } from './theme';

// The active palette. Without a provider (tests, previews) it's dark.
interface ThemeValue {
  colors: Palette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeValue>({
  colors: darkColors,
  isDark: true,
});

export function ThemeProvider({
  colors,
  isDark,
  children,
}: ThemeValue & { children: React.ReactNode }): React.JSX.Element {
  const value = useMemo(() => ({ colors, isDark }), [colors, isDark]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function usePalette(): Palette {
  return useContext(ThemeContext).colors;
}

export function useIsDark(): boolean {
  return useContext(ThemeContext).isDark;
}

// Styles built once per palette: `const styles = useThemedStyles(makeStyles)`
// with `const makeStyles = (colors: Palette) => StyleSheet.create({...})`
const cache = new WeakMap<Function, WeakMap<Palette, unknown>>();

export function themedStyles<T>(
  makeStyles: (colors: Palette) => T,
  colors: Palette,
): T {
  let byPalette = cache.get(makeStyles);
  if (!byPalette) {
    byPalette = new WeakMap();
    cache.set(makeStyles, byPalette);
  }
  if (!byPalette.has(colors)) byPalette.set(colors, makeStyles(colors));
  return byPalette.get(colors) as T;
}

export function useThemedStyles<T>(makeStyles: (colors: Palette) => T): T {
  return themedStyles(makeStyles, usePalette());
}
