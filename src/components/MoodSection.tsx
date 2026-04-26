import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {MoodGroup} from '../types';
import {MOOD_LABELS, MOOD_OPTIONS} from '../config/challenge';
import {colors, fonts} from '../theme';
import {sectionTitle} from '../styles/shared';

const GROUPS: MoodGroup[] = ['viriya', 'samadhi', 'vedana', 'sampajanna'];

interface Props {
  moods: Partial<Record<MoodGroup, string>>;
  onMoodChange: (group: MoodGroup, value: string) => void;
  readOnly?: boolean;
}

export default function MoodSection({moods, onMoodChange, readOnly = false}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>How am I feeling</Text>
      {GROUPS.map(group => (
        <View key={group} style={styles.group}>
          <Text style={styles.groupLabel}>{MOOD_LABELS[group]}</Text>
          <View style={styles.pills}>
            {MOOD_OPTIONS[group].map(option => {
              const active = moods[group] === option.toLowerCase();
              return (
                <Pressable
                  key={option}
                  onPress={() =>
                    !readOnly &&
                    onMoodChange(group, active ? '' : option.toLowerCase())
                  }
                  style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 8},
  sectionTitle,
  group: {marginBottom: 14},
  groupLabel: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  pill: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillActive: {backgroundColor: colors.ink, borderColor: colors.ink},
  pillText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  pillTextActive: {color: colors.paper},
});
