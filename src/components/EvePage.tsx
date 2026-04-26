import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import IntentionsSection from './IntentionsSection';
import {saveStyles} from '../styles/shared';
import {colors, fonts} from '../theme';

interface Props {
  intentions: [string, string, string];
  onIntentionChange: (index: number, text: string) => void;
  onIntentionFocus?: () => void;
  onLogged: () => void;
  isLogged: boolean;
  totalDays: number;
}

export default function EvePage({
  intentions,
  onIntentionChange,
  onIntentionFocus,
  onLogged,
  isLogged,
  totalDays,
}: Props) {
  return (
    <View>
      <Text style={styles.intro}>
        Tomorrow begins the {totalDays} days. No quarter. Write down three intentions
        for Day 1.
      </Text>
      <IntentionsSection
        intentions={intentions}
        onChange={onIntentionChange}
        onFocus={onIntentionFocus}
        title="Three intentions for Day 1"
        placeholders={[
          'First intention...',
          'Second intention...',
          'Third intention...',
        ]}
      />
      <View style={saveStyles.saveRow}>
        <Pressable
          style={isLogged ? saveStyles.saveBtnLogged : saveStyles.saveBtn}
          onPress={onLogged}>
          <Text style={saveStyles.saveBtnText}>Logged</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: fonts.serifItalic,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 26,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
});
