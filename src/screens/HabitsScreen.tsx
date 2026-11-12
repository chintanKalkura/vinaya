import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';
import { toDateKey } from '../utils/dates';
import { isGroupComplete } from '../utils/groupCompletion';
import { loadHabits, loadHabitGroups } from '../storage/habitStorage';
import { seedDevFixturesIfEmpty } from '../storage/devSeed';
import { markHabitDone, unmarkHabitDone } from '../services/habitService';
import GroupCard from './habits/GroupCard';
import HabitsHeader from './habits/HabitsHeader';
import BottomMenu from './habits/BottomMenu';

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function HabitsScreen(): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    let mounted = true;
    seedDevFixturesIfEmpty()
      .then(() => Promise.all([loadHabits(), loadHabitGroups()]))
      .then(([h, g]) => {
        if (!mounted) return;
        setHabits(h);
        setGroups(g);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      const habit = habits[habitId];
      if (!habit) return;
      if (habit.cadence !== 'Day' || habit.type !== 'Checkmark') return;

      const isMarked = habit.recentLog.some(entry => entry.date === todayKey);
      const updated = isMarked
        ? await unmarkHabitDone(habitId, todayKey)
        : await markHabitDone(habitId, todayKey);

      setHabits(prev => ({ ...prev, [habitId]: updated }));
      setGroups(await loadHabitGroups());
    },
    [habits, todayKey],
  );

  const sortedGroups = bySortOrder(Object.values(groups)).filter(
    group => group.groupType !== 'Hours',
  );
  const allHabits = bySortOrder(Object.values(habits));

  return (
    <View style={styles.screen}>
      <HabitsHeader />

      <ScrollView contentContainerStyle={styles.content}>
        {sortedGroups.map(group => {
          const groupHabits = allHabits.filter(h => h.groupId === group.id);
          return (
            <GroupCard
              key={group.id}
              group={group}
              habits={groupHabits}
              todayKey={todayKey}
              complete={isGroupComplete(group, groupHabits, todayKey)}
              onToggle={handleToggleHabit}
            />
          );
        })}
      </ScrollView>

      <Pressable testID="fab" onPress={() => {}} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    color: colors.v2Background,
    fontSize: 30,
    lineHeight: 34,
  },
});
