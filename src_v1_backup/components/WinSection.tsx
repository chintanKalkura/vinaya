import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {WinState} from '../types';
import {colors, fonts} from '../theme';
import {sectionTitle} from '../styles/shared';

interface Props {
  win: WinState;
  onSelect: (value: WinState) => void;
  readOnly?: boolean;
}

export default function WinSection({win, onSelect, readOnly = false}: Props) {
  const handler = readOnly ? () => {} : onSelect;
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Did I win the day?</Text>
      <View style={styles.row}>
        <WinButton label="★ Won it"     value="won"    current={win} activeStyle={styles.wonActive}    onSelect={handler} />
        <WinButton label="✗ Lost it"    value="lost"   current={win} activeStyle={styles.lostActive}   onSelect={handler} />
        <WinButton label="— Fought hard" value="fought" current={win} activeStyle={styles.foughtActive} onSelect={handler} />
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
  sectionTitle,
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
