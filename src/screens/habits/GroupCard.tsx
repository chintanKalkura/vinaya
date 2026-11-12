import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { colors } from '../../theme';
import HabitPill from './HabitPill';

interface GroupCardProps {
  group: HabitGroup;
  habits: Habit[];
  todayKey: string;
  onToggle: (habitId: string) => void;
}

export default function GroupCard({
  group,
  habits,
  todayKey,
  onToggle,
}: GroupCardProps): React.JSX.Element {
  return (
    <View testID={`group-card-${group.id}`} style={styles.card}>
      <Text style={styles.title}>{group.name}</Text>
      <View style={styles.pillRow}>
        {habits.map(habit => (
          <HabitPill
            key={habit.id}
            habit={habit}
            todayKey={todayKey}
            onPress={onToggle}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 16,
    backgroundColor: colors.v2CardBackground,
    padding: 14,
  },
  title: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
