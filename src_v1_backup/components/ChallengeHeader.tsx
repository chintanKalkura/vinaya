import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';

interface Props {
  title: string;
  metaText: string;
  progress: number; // 0–1
}

export default function ChallengeHeader({title, metaText, progress}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, {width: `${Math.min(100, progress * 100)}%`}]} />
      </View>
      <Text style={styles.meta}>{metaText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 20},
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.line,
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  meta: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
  },
});
