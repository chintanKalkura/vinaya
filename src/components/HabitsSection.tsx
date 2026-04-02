import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {HabitDefinition, HabitState} from '../types';
import {colors, fonts} from '../theme';
import {FREEZE_UNLOCK_DAY} from '../config/challenge';

interface Props {
  habits: HabitDefinition[];
  habitStates: Record<string, HabitState>;
  allLogs: Record<string, Record<string, HabitState>>;
  dayNum: number;
  totalDays: number;
  onToggle: (habitId: string) => void;
  onFreeze: (habitId: string) => void;
}

function getDoneCount(
  habitId: string,
  allLogs: Record<string, Record<string, HabitState>>,
): number {
  return Object.values(allLogs).filter(
    h => h[habitId] === 'done' || h[habitId] === 'frozen',
  ).length;
}

function isFreezeUsed(
  habitId: string,
  allLogs: Record<string, Record<string, HabitState>>,
): boolean {
  return Object.values(allLogs).some(h => h[habitId] === 'frozen');
}

export default function HabitsSection({
  habits,
  habitStates,
  allLogs,
  dayNum,
  totalDays,
  onToggle,
  onFreeze,
}: Props) {
  const freezeUnlocked = dayNum > FREEZE_UNLOCK_DAY;

  // Extract only the habit maps from allLogs
  const habitLogs: Record<string, Record<string, HabitState>> = {};
  Object.entries(allLogs).forEach(([date, log]) => {
    habitLogs[date] = log;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habits</Text>
      {habits.map(habit => {
        const state = habitStates[habit.id] ?? 'none';
        const done = getDoneCount(habit.id, habitLogs);
        const freezeUsed = isFreezeUsed(habit.id, habitLogs);
        const canFreeze = freezeUnlocked && !freezeUsed;

        return (
          <Pressable
            key={habit.id}
            onPress={() => onToggle(habit.id)}
            style={[styles.row, habit.isKeystone && styles.keystoneRow]}>
            <View
              style={[
                styles.check,
                state === 'done' && styles.checkDone,
                state === 'frozen' && styles.checkFrozen,
              ]}>
              {state === 'done' && <Text style={styles.checkMark}>✓</Text>}
              {state === 'frozen' && <Text style={styles.checkMark}>❄</Text>}
            </View>
            <Text
              style={[
                styles.name,
                habit.isKeystone && styles.keystoneName,
                state === 'done' && styles.nameDone,
                state === 'frozen' && styles.nameFrozen,
              ]}>
              {habit.isKeystone ? '★ ' : ''}
              {habit.name}
            </Text>
            <Text style={[styles.count, state === 'done' && styles.countDone]}>
              {done}/{totalDays}
            </Text>
            {(canFreeze || state === 'frozen') && (
              <Pressable
                onPress={e => {
                  e.stopPropagation?.();
                  onFreeze(habit.id);
                }}
                style={styles.freezeBtn}
                hitSlop={8}>
                <Text
                  style={[
                    styles.freezeBtnText,
                    state === 'frozen' && styles.freezeBtnActive,
                  ]}>
                  ❄
                </Text>
              </Pressable>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 28},
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  keystoneRow: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkDone: {backgroundColor: colors.done, borderColor: colors.done},
  checkFrozen: {backgroundColor: colors.freeze, borderColor: colors.freeze},
  checkMark: {fontSize: 10, color: '#fff'},
  name: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  keystoneName: {fontFamily: fonts.bodyMedium},
  nameDone: {color: colors.done},
  nameFrozen: {color: colors.freeze, fontFamily: fonts.bodyItalic},
  count: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
    minWidth: 36,
    textAlign: 'right',
  },
  countDone: {color: colors.done},
  freezeBtn: {paddingHorizontal: 6},
  freezeBtnText: {fontSize: 14, color: colors.line},
  freezeBtnActive: {color: colors.freeze},
});
