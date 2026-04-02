import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';

interface Props {
  dateLabel: string;
  dayLabel: string;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export default function DateNav({
  dateLabel,
  dayLabel,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} disabled={!canGoPrev} style={styles.arrow}>
        <Text style={[styles.arrowText, !canGoPrev && styles.arrowDisabled]}>
          ←
        </Text>
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.dateDisplay}>{dateLabel}</Text>
        <Text style={styles.dayNumber}>{dayLabel}</Text>
      </View>
      <Pressable onPress={onNext} disabled={!canGoNext} style={styles.arrow}>
        <Text style={[styles.arrowText, !canGoNext && styles.arrowDisabled]}>
          →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  arrow: {padding: 8},
  arrowText: {fontSize: 20, color: colors.muted},
  arrowDisabled: {color: colors.line},
  center: {flex: 1},
  dateDisplay: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: colors.accent,
  },
  dayNumber: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
});
