import React, {useRef, useState} from 'react';
import {View, Text, Pressable, StyleSheet, Animated} from 'react-native';
import IntentionsSection from './IntentionsSection';
import {saveStyles} from '../styles/shared';
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
        Tomorrow begins the 21 days. No quarter. Write down three intentions for Day
        1.
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
      <View style={saveStyles.saveRow}>
        <Animated.Text style={[saveStyles.savedMsg, {opacity}]}>Saved.</Animated.Text>
        <Pressable style={saveStyles.saveBtn} onPress={handleSave}>
          <Text style={saveStyles.saveBtnText}>Save</Text>
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
