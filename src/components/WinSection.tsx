import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {WinState} from '../types';
import {colors, fonts} from '../theme';

interface Props {
  win: WinState;
  onSelect: (value: WinState) => void;
}

export default function WinSection({win, onSelect}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Did I win the day?</Text>
      <View style={styles.row}>
        <WinButton
          label="★ Won it"
          value="won"
          current={win}
          activeStyle={styles.wonActive}
          onSelect={onSelect}
        />
        <WinButton
          label="✗ Lost it"
          value="lost"
          current={win}
          activeStyle={styles.lostActive}
          onSelect={onSelect}
        />
        <WinButton
          label="— Fought hard"
          value="fought"
          current={win}
          activeStyle={styles.foughtActive}
          onSelect={onSelect}
        />
      </View>
    </View>
  );
}

function WinButton({
  label,
  value,
  current,
  activeStyle,
  onSelect,
}: {
  label: string;
  value: WinState;
  current: WinState;
  activeStyle: object;
  onSelect: (v: WinState) => void;
}) {
  const active = current === value;
  return (
    <Pressable
      style={[styles.btn, active && activeStyle]}
      onPress={() => onSelect(active ? null : value)}>
      <Text style={[styles.btnText, active && styles.btnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 24},
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 12,
  },
  row: {flexDirection: 'row', gap: 8},
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  btnTextActive: {color: '#fff'},
  wonActive: {backgroundColor: colors.done, borderColor: colors.done},
  lostActive: {backgroundColor: colors.accent, borderColor: colors.accent},
  foughtActive: {backgroundColor: colors.ink, borderColor: colors.ink},
});
