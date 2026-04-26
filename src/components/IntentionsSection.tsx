import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';
import {sectionTitle as baseSectionTitle} from '../styles/shared';

interface Props {
  intentions: [string, string, string];
  onChange: (index: number, text: string) => void;
  onFocus?: () => void;
  title?: string;
  placeholders?: [string, string, string];
}

export default function IntentionsSection({
  intentions,
  onChange,
  onFocus,
  title = 'Three intentions for tomorrow',
  placeholders = [
    'First intention for tomorrow...',
    'Second intention for tomorrow...',
    'Third intention for tomorrow...',
  ],
}: Props) {
  const [local, setLocal] = useState<[string, string, string]>(intentions);

  useEffect(() => {
    setLocal(intentions);
  }, [intentions]);

  function handleChange(idx: 0 | 1 | 2, text: string) {
    const next: [string, string, string] = [...local] as [string, string, string];
    next[idx] = text;
    setLocal(next);
    onChange(idx, text);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {([0, 1, 2] as const).map(idx => (
        <View key={idx} style={styles.row}>
          <Text style={styles.num}>{idx + 1}.</Text>
          <TextInput
            style={styles.input}
            value={local[idx]}
            onChangeText={text => handleChange(idx, text)}
            onFocus={onFocus}
            placeholder={placeholders[idx]}
            placeholderTextColor={colors.line}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 24},
  sectionTitle: {...baseSectionTitle, marginBottom: 4},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 6,
  },
  num: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.accent,
    minWidth: 20,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 28,
    padding: 0,
  },
});
