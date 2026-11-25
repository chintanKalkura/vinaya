import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '../theme';
import { useThemedStyles } from '../theming';

// Journal and Level-Up until they're built:
// docs/style-choices/tabs/coming-soon.md
export const COMING_SOON = {
  Journal: {
    title: 'Vinaya - Journal',
    message:
      'Journal is coming soon. It will be a private place to write down your thoughts each day or whenever you need, with topics for each entry and short guides on why journaling helps and what to write.',
  },
  'Level-Up': {
    title: 'Vinaya - Level-Up',
    message:
      'Level-Up is coming soon. It will help you build discipline step by step: choose a habit and a goal, like running 5 km, and follow a plan that raises it a little each week until you get there, with suggested plans to help you start.',
  },
};

interface ComingSoonScreenProps {
  section: keyof typeof COMING_SOON;
}

export default function ComingSoonScreen({
  section,
}: ComingSoonScreenProps): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { title, message } = COMING_SOON[section];

  return (
    <View
      testID={`coming-soon-${section}`}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    // Same title look as the Habits header
    title: {
      color: colors.v2White,
      fontFamily: 'serif',
      fontStyle: 'italic',
      fontWeight: '600',
      fontSize: 20,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    message: {
      color: colors.v2GreyText,
      fontSize: 16,
      lineHeight: 24,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  });
