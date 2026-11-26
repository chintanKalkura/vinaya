import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../theme';
import { useThemedStyles } from '../../theming';
import { useSettings } from '../../settings/SettingsProvider';
import { DefaultView, ThemeSetting } from '../../types/settings';
import SegmentedControl from '../habits/SegmentedControl';
import { useFormStyles } from '../habits/formStyles';
import ScreenHeader from './ScreenHeader';

// Profile → Display settings: docs/style-choices/profile/display-settings.md
const VIEWS = ['List', 'Group'] as const;
const THEMES = ['Dark', 'Light', 'System'] as const;

const toView = (label: (typeof VIEWS)[number]) =>
  label.toLowerCase() as DefaultView;
const toTheme = (label: (typeof THEMES)[number]) =>
  label.toLowerCase() as ThemeSetting;
const labelOf = <T extends string>(labels: readonly T[], value: string) =>
  labels.find(label => label.toLowerCase() === value) ?? labels[0];

interface DisplaySettingsScreenProps {
  onBack: () => void;
}

export default function DisplaySettingsScreen({
  onBack,
}: DisplaySettingsScreenProps): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
  const formStyles = useFormStyles();
  const { settings, updateSettings } = useSettings();

  return (
    <View testID="display-settings-screen" style={styles.screen}>
      <ScreenHeader
        title="Display settings"
        onBack={onBack}
        testID="display-settings"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={formStyles.label}>DEFAULT VIEW</Text>
        <SegmentedControl
          testID="setting-default-view"
          options={VIEWS}
          value={labelOf(VIEWS, settings.defaultView)}
          onChange={label => updateSettings({ defaultView: toView(label) })}
        />
        <Text style={formStyles.label}>THEME</Text>
        <SegmentedControl
          testID="setting-theme"
          options={THEMES}
          value={labelOf(THEMES, settings.theme)}
          onChange={label => updateSettings({ theme: toTheme(label) })}
        />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
  });
