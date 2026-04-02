import React from 'react';
import {View, TextInput, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function JournalSection({value, onChange}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Write freely. This is just for you."
        placeholderTextColor={colors.line}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 16, marginBottom: 24},
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 28,
    minHeight: 200,
    padding: 0,
    letterSpacing: 0.1,
  },
});
