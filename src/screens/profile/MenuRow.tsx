import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme';
import { MIN_TOUCH_SIZE } from '../habits/TouchTarget';

// One row of the Profile menu: docs/style-choices/profile/profile-menu.md
interface MenuRowProps {
  label: string;
  testID: string;
  onPress?: () => void; // no handler: shown but does nothing
  value?: string; // shown at the right, e.g. the version
  chevron?: boolean; // opens a screen
  danger?: boolean; // red, for Delete data
  disabled?: boolean;
  accessibilityRole?: 'button' | 'link' | 'text';
  right?: React.ReactNode;
}

export default function MenuRow({
  label,
  testID,
  onPress,
  value,
  chevron = false,
  danger = false,
  disabled = false,
  accessibilityRole = 'button',
  right,
}: MenuRowProps): React.JSX.Element {
  return (
    <Pressable
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || !onPress }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={styles.row}
    >
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {right}
        {chevron ? <ChevronRight color={colors.v2GreyText} size={18} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_SIZE + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.v2Border,
  },
  label: {
    flexShrink: 1,
    color: colors.v2White,
    fontSize: 16,
    fontWeight: '600',
  },
  danger: {
    color: colors.v2Red,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    color: colors.v2GreyText,
    fontSize: 15,
  },
});
