import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function JournalSection({value, onChange}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Journal</Text>
      <View style={styles.inputWrap}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 8, marginBottom: 24},
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 4,
  },
  inputWrap: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 6,
  },
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
