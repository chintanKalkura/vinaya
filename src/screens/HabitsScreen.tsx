import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Habit, HabitCadence } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';
import { toDateKey } from '../utils/dates';
import { loadHabits, loadHabitGroups } from '../storage/habitStorage';
import { seedDevFixturesIfEmpty } from '../storage/devSeed';
import { markHabitDone, unmarkHabitDone } from '../services/habitService';
import GroupCard from './habits/GroupCard';
import HabitPill from './habits/HabitPill';
import HabitListRow from './habits/HabitListRow';

type ViewMode = 'group' | 'list';

const CADENCES: HabitCadence[] = ['Day', 'Week', 'Month', 'Year'];

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function HabitsScreen(): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('group');
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
    },
    [habits, todayKey],
  );

  const sortedGroups = bySortOrder(Object.values(groups));
  const allHabits = bySortOrder(Object.values(habits));
  const ungroupedHabits = allHabits.filter(h => !h.groupId);

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        {CADENCES.map(cadence => (
          <View
            key={cadence}
            testID={`cadence-pill-${cadence}`}
            style={[
              styles.cadencePill,
              cadence === 'Day' && styles.cadencePillActive,
            ]}
          >
            <Text
              style={[
                styles.cadenceLabel,
                cadence === 'Day' && styles.cadenceLabelActive,
              ]}
            >
              {cadence}
            </Text>
          </View>
        ))}
        <Pressable
          testID="view-mode-toggle-group"
          onPress={() => setViewMode('group')}
          style={styles.viewToggleButton}
        >
          <Text
            style={
              viewMode === 'group'
                ? styles.viewToggleActive
                : styles.viewToggleInactive
            }
          >
            ▦
          </Text>
        </Pressable>
        <Pressable
          testID="view-mode-toggle-list"
          onPress={() => setViewMode('list')}
          style={styles.viewToggleButton}
        >
          <Text
            style={
              viewMode === 'list'
                ? styles.viewToggleActive
                : styles.viewToggleInactive
            }
          >
            ☰
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {viewMode === 'group' ? (
          <>
            {sortedGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                habits={bySortOrder(
                  allHabits.filter(h => h.groupId === group.id),
                )}
                todayKey={todayKey}
                onToggle={handleToggleHabit}
              />
            ))}
            {ungroupedHabits.length > 0 ? (
              <View style={styles.ungroupedRow}>
                {ungroupedHabits.map(habit => (
                  <HabitPill
                    key={habit.id}
                    habit={habit}
                    todayKey={todayKey}
                    onPress={handleToggleHabit}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          allHabits
            .slice()
            .sort((a, b) => {
              const groupA = a.groupId
                ? groups[a.groupId]?.sortOrder
                : undefined;
              const groupB = b.groupId
                ? groups[b.groupId]?.sortOrder
                : undefined;
              const orderA = groupA ?? Infinity;
              const orderB = groupB ?? Infinity;
              if (orderA !== orderB) return orderA - orderB;
              return a.sortOrder - b.sortOrder;
            })
            .map(habit => (
              <HabitListRow
                key={habit.id}
                habit={habit}
                groupName={
                  habit.groupId ? groups[habit.groupId]?.name : undefined
                }
                todayKey={todayKey}
                onPress={handleToggleHabit}
              />
            ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  cadencePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  cadencePillActive: {
    backgroundColor: colors.v2Orange,
  },
  cadenceLabel: {
    color: colors.v2GreyText,
    fontWeight: '600',
  },
  cadenceLabelActive: {
    color: colors.v2Background,
  },
  viewToggleButton: {
    marginLeft: 4,
    paddingHorizontal: 6,
  },
  viewToggleActive: {
    color: colors.v2Orange,
    fontSize: 18,
  },
  viewToggleInactive: {
    color: colors.v2GreyText,
    fontSize: 18,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  ungroupedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
