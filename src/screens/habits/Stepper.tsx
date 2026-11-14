import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '../../theme';

// − / value / + with tap-to-type; used by the New Habit form
interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  testID: string;
  suffix?: string;
}

export default function Stepper({
  value,
  min,
  max,
  onChange,
  testID,
  suffix,
}: StepperProps): React.JSX.Element {
  const [text, setText] = useState(String(value));

  useEffect(() => setText(String(value)), [value]);

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const handleChangeText = (input: string) => {
    const digits = input.replace(/[^0-9]/g, '');
    setText(digits);
    if (digits !== '') onChange(clamp(Number(digits)));
  };

  return (
    <View style={styles.row}>
      <Pressable
        testID={`${testID}-decrement`}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={() => onChange(clamp(value - 1))}
        style={styles.stepButton}
      >
        <Minus color={colors.v2White} size={18} strokeWidth={2.5} />
      </Pressable>
      <TextInput
        testID={`${testID}-input`}
        value={text}
        onChangeText={handleChangeText}
        onBlur={() => setText(String(value))}
        keyboardType="number-pad"
        selectTextOnFocus
        maxLength={String(max).length}
        style={styles.input}
      />
      <Pressable
        testID={`${testID}-increment`}
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={() => onChange(clamp(value + 1))}
        style={styles.stepButton}
      >
        <Plus color={colors.v2White} size={18} strokeWidth={2.5} />
      </Pressable>
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 46,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
    backgroundColor: colors.v2Border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Background,
    color: colors.v2Orange,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  suffix: {
    color: colors.v2GreyText,
    fontSize: 13,
  },
});
