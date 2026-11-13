import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';
import { toDateKey } from '../utils/dates';
import { loadHabits, loadHabitGroups } from '../storage/habitStorage';
import { seedDevFixturesIfNeeded } from '../storage/devSeed';
import {
  markHabitDone,
  setHabitHours,
  unmarkHabitDone,
} from '../services/habitService';
import { applyStreakFreezes } from '../services/habitGroupService';
import { getHoursToday } from '../utils/hours';
import GroupCard from './habits/GroupCard';
import HoursEntryModal from './habits/HoursEntryModal';
import HabitListRow from './habits/HabitListRow';
import HabitsHeader, { HabitsViewMode } from './habits/HabitsHeader';
import { CadenceFilterValue } from './habits/CadenceFilter';
import BottomMenu from './habits/BottomMenu';

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function HabitsScreen(): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [hoursHabitId, setHoursHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HabitsViewMode>('list');
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilterValue>('All');
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  useEffect(() => {
    let mounted = true;
    seedDevFixturesIfNeeded()
      .then(() => applyStreakFreezes(todayKey))
      .then(() => Promise.all([loadHabits(), loadHabitGroups()]))
      .then(([h, g]) => {
        if (!mounted) return;
        setHabits(h);
        setGroups(g);
      });
    return () => {
      mounted = false;
    };
  }, [todayKey]);

  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      const habit = habits[habitId];
      if (!habit) return;
      if (habit.type === 'Hours') {
        setHoursHabitId(habitId);
        return;
      }

      const isMarked = habit.recentLog.some(entry => entry.date === todayKey);
      const updated = isMarked
        ? await unmarkHabitDone(habitId, todayKey)
        : await markHabitDone(habitId, todayKey);

      setHabits(prev => ({ ...prev, [habitId]: updated }));
      setGroups(await loadHabitGroups());
    },
    [habits, todayKey],
  );

  const handleHoursDone = useCallback(
    async (hours: number) => {
      if (!hoursHabitId) return;
      const habitId = hoursHabitId;
      setHoursHabitId(null);
      const updated = await setHabitHours(habitId, hours, todayKey);
      setHabits(prev => ({ ...prev, [habitId]: updated }));
      setGroups(await loadHabitGroups());
    },
    [hoursHabitId, todayKey],
  );

  const hoursHabit = hoursHabitId ? habits[hoursHabitId] : undefined;
  const matchesFilter = (item: { cadence: string }) =>
    cadenceFilter === 'All' || item.cadence === cadenceFilter;
  const sortedGroups = bySortOrder(Object.values(groups)).filter(matchesFilter);
  const allHabits = bySortOrder(Object.values(habits));
  const listHabits = allHabits.filter(matchesFilter);

  return (
    <View style={styles.screen}>
      <HabitsHeader
        cadenceFilter={cadenceFilter}
        onChangeCadenceFilter={setCadenceFilter}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {viewMode === 'list'
          ? listHabits.map(habit => (
              <HabitListRow
                key={habit.id}
                habit={habit}
                groupName={
                  habit.groupId ? groups[habit.groupId]?.name : undefined
                }
                todayKey={todayKey}
                onPress={handleToggleHabit}
                colorKind="banner"
              />
            ))
          : sortedGroups.map(group => {
              const groupHabits = allHabits.filter(h => h.groupId === group.id);
              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  habits={groupHabits}
                  todayKey={todayKey}
                  onToggle={handleToggleHabit}
                />
              );
            })}
      </ScrollView>

      <Pressable testID="fab" onPress={() => {}} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
      <BottomMenu />
      <HoursEntryModal
        visible={hoursHabit !== undefined}
        habitName={hoursHabit?.name ?? ''}
        initialHours={hoursHabit ? getHoursToday(hoursHabit, todayKey) : 0}
        onDone={handleHoursDone}
        onClose={() => setHoursHabitId(null)}
      />
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
