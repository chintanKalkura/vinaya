import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {ChallengeDefinition} from '../types';
import {colors, fonts} from '../theme';

interface Props {
  challenges: ChallengeDefinition[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function ChallengeNav({challenges, currentIndex, onPrev, onNext}: Props) {
  const challenge = challenges[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < challenges.length - 1;

  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} disabled={!canGoPrev} style={styles.arrow}>
        <Text style={[styles.arrowText, !canGoPrev && styles.arrowDisabled]}>←</Text>
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.title}>{challenge.config.title}</Text>
        <Text style={styles.meta}>
          {currentIndex + 1} of {challenges.length}
        </Text>
      </View>
      <Pressable onPress={onNext} disabled={!canGoNext} style={styles.arrow}>
        <Text style={[styles.arrowText, !canGoNext && styles.arrowDisabled]}>→</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  arrow: {padding: 8},
  arrowText: {fontSize: 18, color: colors.muted},
  arrowDisabled: {color: colors.line},
  center: {flex: 1, alignItems: 'center'},
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
