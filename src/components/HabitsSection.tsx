import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {HabitDefinition, HabitState} from '../types';
import {colors, fonts} from '../theme';
import {sectionTitle} from '../styles/shared';

interface Props {
  habits: HabitDefinition[];
  habitStates: Record<string, HabitState>;
  allLogs: Record<string, Record<string, HabitState>>;
  onToggle: (habitId: string) => void;
}

function getDoneCount(
  habitId: string,
  allLogs: Record<string, Record<string, HabitState>>,
): number {
  return Object.values(allLogs).filter(h => h[habitId] === 'done').length;
}

export default function HabitsSection({
  habits,
  habitStates,
  allLogs,
  onToggle,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habits</Text>
      {habits.map(habit => {
        const state = habitStates[habit.id] ?? 'none';
        const done = getDoneCount(habit.id, allLogs);

        return (
          <Pressable
            key={habit.id}
            onPress={() => onToggle(habit.id)}
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
