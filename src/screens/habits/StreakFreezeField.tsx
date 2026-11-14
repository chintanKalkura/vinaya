import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { clampFreezeInterval } from '../../utils/streakFreeze';
import { formStyles } from './formStyles';

// "1 skip per [N] streaks", typed in, 1-100
interface StreakFreezeFieldProps {
  value: number;
  onChange: (value: number) => void;
  testID: string;
}

export default function StreakFreezeField({
  value,
  onChange,
  testID,
}: StreakFreezeFieldProps): React.JSX.Element {
  const [text, setText] = useState(String(value));

  useEffect(() => setText(String(value)), [value]);

  const handleChangeText = (input: string) => {
    const digits = input.replace(/[^0-9]/g, '');
    setText(digits);
    if (digits !== '') onChange(clampFreezeInterval(Number(digits)));
  };

  return (
    <View style={[formStyles.card, styles.row]}>
      <Text style={styles.text}>1 skip per</Text>
      <TextInput
        testID={testID}
        value={text}
        onChangeText={handleChangeText}
        onBlur={() => setText(String(value))}
        keyboardType="number-pad"
        selectTextOnFocus
        maxLength={3}
        style={styles.input}
      />
      <Text style={styles.text}>streaks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    color: colors.v2GreyText,
    fontSize: 15,
  },
  input: {
    width: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Background,
    color: colors.v2Orange,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
});
