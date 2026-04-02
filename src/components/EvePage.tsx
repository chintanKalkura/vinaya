import React, {useRef, useState} from 'react';
import {View, Text, Pressable, StyleSheet, Animated} from 'react-native';
import IntentionsSection from './IntentionsSection';
import {colors, fonts} from '../theme';

interface Props {
  intentions: [string, string, string];
  onIntentionChange: (index: number, text: string) => void;
  onSave: () => void;
}

export default function EvePage({intentions, onIntentionChange, onSave}: Props) {
  const [saved, setSaved] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  function handleSave() {
    onSave();
    setSaved(true);
    Animated.sequence([
      Animated.timing(opacity, {toValue: 1, duration: 200, useNativeDriver: true}),
      Animated.delay(1600),
      Animated.timing(opacity, {toValue: 0, duration: 300, useNativeDriver: true}),
    ]).start(() => setSaved(false));
  }

  return (
    <View>
      <Text style={styles.intro}>
        Tomorrow begins the 21 days. No quarter. Write three intentions for Day
        1 — what past-you is committing to.
      </Text>
      <IntentionsSection
        intentions={intentions}
        onChange={onIntentionChange}
        title="Three intentions for Day 1"
        placeholders={[
          'First intention...',
          'Second intention...',
          'Third intention...',
        ]}
      />
      <View style={styles.saveRow}>
        <Animated.Text style={[styles.savedMsg, {opacity}]}>Saved.</Animated.Text>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
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
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  savedMsg: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.done,
  },
  saveBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  saveBtnText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.paper,
    letterSpacing: 0.5,
  },
});
