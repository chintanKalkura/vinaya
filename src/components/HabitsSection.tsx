import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {HabitDefinition, HabitState} from '../types';
import {getEffectiveHabitState} from '../utils/habits';
import {colors, fonts} from '../theme';
import {sectionTitle} from '../styles/shared';

interface Props {
  habits: HabitDefinition[];
  habitStates: Record<string, HabitState>;
  allLogs: Record<string, Record<string, HabitState>>;
  onToggle: (habitId: string) => void;
  readOnly?: boolean;
}

function getDoneCount(
  habit: HabitDefinition,
  allLogs: Record<string, Record<string, HabitState>>,
): number {
  return Object.values(allLogs).filter(
    dayStates => getEffectiveHabitState(habit, dayStates) === 'done',
  ).length;
}

export default function HabitsSection({
  habits,
  habitStates,
  allLogs,
  onToggle,
  readOnly = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habits</Text>
      {habits.map(habit => {
        const isComposite = !!(habit.subHabits && habit.compositeRule);
        const state = getEffectiveHabitState(habit, habitStates);
        const done = getDoneCount(habit, allLogs);

        return (
          <View key={habit.id}>
            {isComposite ? (
              <View style={[styles.row, habit.isKeystone && styles.keystoneRow]}>
                <View style={[styles.check, state === 'done' && styles.checkDone]}>
                  {state === 'done' && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.name,
                    habit.isKeystone && styles.keystoneName,
                    state === 'done' && styles.nameDone,
                  ]}>
                  {habit.isKeystone ? '★ ' : ''}
                  {habit.name}
                </Text>
                <Text style={[styles.count, state === 'done' && styles.countDone]}>
                  {done}/{habit.maxCount}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => !readOnly && onToggle(habit.id)}
                style={[styles.row, habit.isKeystone && styles.keystoneRow]}>
                <View style={[styles.check, state === 'done' && styles.checkDone]}>
                  {state === 'done' && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.name,
                    habit.isKeystone && styles.keystoneName,
                    state === 'done' && styles.nameDone,
                  ]}>
                  {habit.isKeystone ? '★ ' : ''}
                  {habit.name}
                </Text>
                <Text style={[styles.count, state === 'done' && styles.countDone]}>
                  {done}/{habit.maxCount}
                </Text>
              </Pressable>
            )}
            {isComposite &&
              habit.subHabits!.map(sub => {
                const subState = habitStates[sub.id] ?? 'none';
                return (
                  <Pressable
                    key={sub.id}
                    onPress={() => !readOnly && onToggle(sub.id)}
                    style={styles.subRow}>
                    <View style={[styles.check, subState === 'done' && styles.checkDone]}>
                      {subState === 'done' && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                    <Text style={[styles.subName, subState === 'done' && styles.nameDone]}>
                      {sub.name}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 28},
  sectionTitle,
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
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingLeft: 36,
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
  checkMark: {fontSize: 10, color: '#fff'},
  name: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  subName: {
    flex: 1,
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.muted,
  },
  keystoneName: {fontFamily: fonts.bodyMedium},
  nameDone: {color: colors.done},
  count: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
    minWidth: 36,
    textAlign: 'right',
  },
  countDone: {color: colors.done},
});
