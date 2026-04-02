import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {IntentionResult} from '../types';
import {colors, fonts} from '../theme';

interface Props {
  intentions: [string, string, string];
  results: [IntentionResult, IntentionResult, IntentionResult];
  onResultChange: (index: number, result: IntentionResult) => void;
}

const CYCLE: IntentionResult[] = ['no', 'yes', 'partial'];

function nextResult(current: IntentionResult): IntentionResult {
  const idx = CYCLE.indexOf(current);
  return CYCLE[(idx + 1) % CYCLE.length];
}

function resultLabel(r: IntentionResult): string {
  if (r === 'yes') return '✅';
  if (r === 'partial') return '＊';
  return '○';
}

export default function YesterdayIntentions({
  intentions,
  results,
  onResultChange,
}: Props) {
  const hasAny = intentions.some(i => i.trim().length > 0);
  if (!hasAny) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>What I promised myself yesterday</Text>
      <View style={styles.box}>
        {intentions.map((intention, idx) => {
          if (!intention.trim()) return null;
          return (
            <View key={idx} style={styles.row}>
              <Text style={styles.num}>{idx + 1}.</Text>
              <Text style={styles.text}>{intention}</Text>
              <Pressable
                onPress={() => onResultChange(idx, nextResult(results[idx]))}
                style={styles.toggle}>
                <Text style={[styles.toggleText, results[idx] !== 'no' && styles.toggleActive]}>
                  {resultLabel(results[idx])}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
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
    marginBottom: 10,
  },
  box: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(139,58,15,0.04)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  num: {
    fontFamily: fonts.serifBold,
    fontSize: 13,
    color: colors.accent,
    minWidth: 20,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.ink,
  },
  toggle: {padding: 8},
  toggleText: {
    fontSize: 16,
    color: colors.line,
  },
  toggleActive: {
    color: colors.accent,
  },
});
