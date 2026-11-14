import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

// Pill row with the selected option in orange (Cadence and Type)
interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  testID: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <View testID={testID} style={styles.row}>
      {options.map(option => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            testID={`${testID}-${option}`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: colors.v2CardBackground,
    padding: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 17,
  },
  selected: {
    backgroundColor: colors.v2Orange,
  },
  label: {
    color: colors.v2GreyText,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.v2Background,
    fontWeight: '700',
  },
});
