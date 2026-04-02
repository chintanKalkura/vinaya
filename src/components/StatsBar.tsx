import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fonts} from '../theme';

interface Props {
  done: number;
  total: number;
  dayNum: number;
}

export default function StatsBar({done, total, dayNum}: Props) {
  return (
    <View style={styles.bar}>
      <Stat label="Done" value={done} />
      <Stat label="Total" value={total} />
      <Stat label="Day #" value={dayNum} />
    </View>
  );
}

function Stat({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.num}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    marginBottom: 24,
  },
  stat: {flex: 1, alignItems: 'center'},
  num: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: colors.accent,
    lineHeight: 26,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
});
