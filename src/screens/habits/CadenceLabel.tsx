import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarSync } from 'lucide-react-native';
import { HabitCadence } from '../../types/habit';
import { colors } from '../../theme';

// Bottom-right cadence label on banners: docs/style-choices/habits-section/cadence-label.md
const LABELS: Record<HabitCadence, string> = {
  Day: 'Daily',
  Week: 'Weekly',
  Month: 'Monthly',
  Year: 'Yearly',
};

// Space a banner keeps free at its bottom so the label never overlaps content
export const CADENCE_LABEL_SPACE = 18;

interface CadenceLabelProps {
  cadence: HabitCadence;
  testID: string;
}

export default function CadenceLabel({
  cadence,
  testID,
}: CadenceLabelProps): React.JSX.Element {
  return (
    <View testID={testID} style={styles.label}>
      <CalendarSync color={colors.v2GreyText} size={12} strokeWidth={2} />
      <Text style={styles.text}>{LABELS[cadence]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    right: 12,
    bottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
  },
  text: {
    color: colors.v2GreyText,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
