import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../theme';
import { useThemedStyles } from '../../theming';

// A titled card on the habit and group page: docs/style-choices/detail/detail-page.md
interface SectionProps {
  title: string;
  testID: string;
  children: React.ReactNode;
}

export default function Section({
  title,
  testID,
  children,
}: SectionProps): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
  return (
    <View testID={testID} style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 16,
      backgroundColor: colors.v2CardBackground,
      padding: 14,
      gap: 10,
    },
    title: {
      color: colors.v2GreyText,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
  });

// Grey small print under a chart, and the empty state
export const makeNoteStyles = (colors: Palette) =>
  StyleSheet.create({
    note: {
      color: colors.v2GreyText,
      fontSize: 12,
    },
    empty: {
      color: colors.v2GreyText,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 16,
    },
  });

export const NOT_ENOUGH_DAYS = 'Not enough days yet.';
