import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { Palette } from '../theme';
import { useThemedStyles } from '../theming';
import { useSettings } from '../settings/SettingsProvider';
import { EMPTY_HABITS_TEXT } from '../content/howToUse';
import { getGroupStatus } from '../services/habitGroupService';
import { habitMarkers } from '../utils/hours';
import { getCadenceStatus } from '../utils/cadence';
import {
  DEFAULT_SORT_FILTER,
  SortFilterState,
  filterItems,
  sortItems,
} from '../utils/sortFilter';
import SortFilterSheet from './habits/SortFilterSheet';
import { groupIdsByHabit } from '../utils/groupIndex';
import GroupCard from './habits/GroupCard';
import HabitListRow from './habits/HabitListRow';
import HabitsHeader, { HabitsViewMode } from './habits/HabitsHeader';
import { CadenceFilterValue } from './habits/CadenceFilter';
import LoadErrorMessage from './habits/LoadErrorMessage';
import {
  HabitsDataProvider,
  bySortOrder,
  useHabitsData,
} from './habits/HabitsData';

interface HabitsListProps {
  // Open the habit or group page (habit-group-detail-page.md); without them
  // the banners only mark
  onOpenHabit?: (habitId: string) => void;
  onOpenGroup?: (groupId: string) => void;
}

// The Habits list (list and group view); data, saves and forms come from
// HabitsDataProvider
export function HabitsList({
  onOpenHabit,
  onOpenGroup,
}: HabitsListProps): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
  const {
    habits,
    groups,
    todayKey,
    loaded,
    loadError,
    loadScreen,
    toggleHabit,
    openChoice,
    editHabit,
    editGroup,
    removeHabit,
    removeGroup,
  } = useHabitsData();
  // Opens in the default view from Display settings, and follows it when it
  // changes; the header toggle still switches views for the session
  const { defaultView } = useSettings().settings;
  const [viewMode, setViewMode] = useState<HabitsViewMode>(defaultView);
  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView]);
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilterValue>('All');
  // Session only: docs/feature-development/habits-section/sort-filter-delete-habit.md
  const [sortFilter, setSortFilter] =
    useState<SortFilterState>(DEFAULT_SORT_FILTER);
  const [sortOpen, setSortOpen] = useState(false);
  // The app draws edge-to-edge, so the header clears the status bar here
  const insets = useSafeAreaInsets();

  const matchesFilter = (item: { cadence: string }) =>
    cadenceFilter === 'All' || item.cadence === cadenceFilter;
  const habitStatus = (habit: Habit) =>
    getCadenceStatus(
      habitMarkers(habit),
      habit.cadence,
      habit.target,
      todayKey,
      habit.streakFreeze,
    );
  const groupStatus = (group: HabitGroup) => getGroupStatus(group, todayKey);
  // Cadence filter first, then Show, then Sort
  const sortedGroups = sortItems(
    filterItems(
      Object.values(groups).filter(matchesFilter),
      sortFilter.completedOnly,
      groupStatus,
    ),
    sortFilter.sort,
    groupStatus,
  );
  const allHabits = bySortOrder(Object.values(habits));
  const listHabits = sortItems(
    filterItems(
      allHabits.filter(matchesFilter),
      sortFilter.completedOnly,
      habitStatus,
    ),
    sortFilter.sort,
    habitStatus,
  );
  // A habit may be in several groups: its list subtext names them all
  const groupNamesByHabit = useMemo(() => {
    const index = groupIdsByHabit(groups);
    return Object.fromEntries(
      Object.entries(index).map(([habitId, ids]) => [
        habitId,
        ids.map(id => groups[id].name).join(', '),
      ]),
    );
  }, [groups]);

  return (
    <View
      testID="habits-screen"
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <HabitsHeader
        cadenceFilter={cadenceFilter}
        onChangeCadenceFilter={setCadenceFilter}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenSort={() => setSortOpen(true)}
      />

      {loadError ? (
        <LoadErrorMessage onRetry={loadScreen} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Nothing stored yet: point to the + (how-to-use.md) */}
          {loaded &&
          Object.keys(habits).length === 0 &&
          Object.keys(groups).length === 0 ? (
            <Text testID="habits-empty" style={styles.empty}>
              {EMPTY_HABITS_TEXT}
            </Text>
          ) : null}
          {viewMode === 'list'
            ? listHabits.map(habit => (
                <HabitListRow
                  key={habit.id}
                  habit={habit}
                  groupName={groupNamesByHabit[habit.id]}
                  todayKey={todayKey}
                  onPress={toggleHabit}
                  onOpen={onOpenHabit}
                  colorKind="banner"
                  onEdit={editHabit}
                  onDelete={removeHabit}
                />
              ))
            : sortedGroups.map(group => {
                const groupHabits = allHabits.filter(h =>
                  group.habitIds.includes(h.id),
                );
                return (
                  <GroupCard
                    key={group.id}
                    group={group}
                    habits={groupHabits}
                    todayKey={todayKey}
                    onToggle={toggleHabit}
                    onOpen={onOpenGroup}
                    onOpenHabit={onOpenHabit}
                    onEdit={editGroup}
                    onDelete={removeGroup}
                  />
                );
              })}
        </ScrollView>
      )}

      {!loadError && (
        <Pressable testID="fab" onPress={openChoice} style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
      <SortFilterSheet
        visible={sortOpen}
        value={sortFilter}
        onApply={value => {
          setSortFilter(value);
          setSortOpen(false);
        }}
        onClose={() => setSortOpen(false)}
      />
    </View>
  );
}

interface HabitsScreenProps {
  dataVersion?: number; // bumped when a backup or restore changed the data
}

// The list with its own data provider, for use on its own (tests)
export default function HabitsScreen({
  dataVersion,
}: HabitsScreenProps): React.JSX.Element {
  return (
    <HabitsDataProvider dataVersion={dataVersion}>
      <HabitsList />
    </HabitsDataProvider>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    content: {
      padding: 16,
      gap: 12,
    },
    empty: {
      color: colors.v2GreyText,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 48,
    },
    fab: {
      position: 'absolute',
      right: 16,
      // The tab bar is below the screen, so this sits 16 above it
      bottom: 16,
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
