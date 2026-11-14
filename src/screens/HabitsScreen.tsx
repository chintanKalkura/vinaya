import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';
import { toDateKey } from '../utils/dates';
import { loadHabits, loadHabitGroups } from '../storage/habitStorage';
import { seedDevFixturesIfNeeded } from '../storage/devSeed';
import {
  createHabit,
  deleteHabit,
  markHabitDone,
  setHabitHours,
  unmarkHabitDone,
} from '../services/habitService';
import {
  applyStreakFreezes,
  createHabitGroup,
  deleteHabitGroup,
  getGroupStatus,
} from '../services/habitGroupService';
import { getHoursToday, habitMarkers } from '../utils/hours';
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
import HoursEntryModal from './habits/HoursEntryModal';
import HabitListRow from './habits/HabitListRow';
import HabitsHeader, { HabitsViewMode } from './habits/HabitsHeader';
import { CadenceFilterValue } from './habits/CadenceFilter';
import BottomMenu from './habits/BottomMenu';
import CreateChoiceSheet from './habits/CreateChoiceSheet';
import NewHabitForm, { PendingGroup } from './habits/NewHabitForm';
import NewHabitGroupForm, { PendingHabit } from './habits/NewHabitGroupForm';
import { NewHabitDraft, PENDING_GROUP_ID } from '../utils/newHabit';
import { NewHabitGroupDraft, PENDING_HABIT_ID } from '../utils/newHabitGroup';

// The + flow from docs/navigation/02-habit-creation.md and 03-group-creation.md
type CreateStep = 'none' | 'choice' | 'habit' | 'group';

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function HabitsScreen(): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [hoursHabitId, setHoursHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HabitsViewMode>('list');
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilterValue>('All');
  const [createStep, setCreateStep] = useState<CreateStep>('none');
  // Session only: docs/feature-development/sort-filter-delete-habit.md
  const [sortFilter, setSortFilter] =
    useState<SortFilterState>(DEFAULT_SORT_FILTER);
  const [sortOpen, setSortOpen] = useState(false);
  // Habit form → "+ Create Group": the group is saved with the habit
  const [groupForHabit, setGroupForHabit] = useState<PendingHabit | null>(null);
  const [pendingGroupDraft, setPendingGroupDraft] =
    useState<NewHabitGroupDraft | null>(null);
  // Group form → Create Habit: the habit is saved, then assigned
  const [habitForGroup, setHabitForGroup] = useState(false);
  const [groupNewHabitId, setGroupNewHabitId] = useState<string | undefined>(
    undefined,
  );
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

  const reload = useCallback(async () => {
    const [h, g] = await Promise.all([loadHabits(), loadHabitGroups()]);
    setHabits(h);
    setGroups(g);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateStep('none');
    setPendingGroupDraft(null);
    setGroupNewHabitId(undefined);
  }, []);

  // Returns to the view the + was tapped from; viewMode is left unchanged.
  // A group made with "+ Create Group" is saved after the habit, with it.
  const handleCreateHabit = useCallback(
    async (draft: NewHabitDraft) => {
      if (draft.groupId === PENDING_GROUP_ID && pendingGroupDraft) {
        const habit = await createHabit(
          { ...draft, groupId: undefined },
          todayKey,
        );
        const withHabit = (ids: string[]) =>
          ids.map(id => (id === PENDING_HABIT_ID ? habit.id : id));
        await createHabitGroup(
          {
            ...pendingGroupDraft,
            habitIds: withHabit(pendingGroupDraft.habitIds),
            requiredHabitIds: withHabit(pendingGroupDraft.requiredHabitIds),
          },
          todayKey,
        );
      } else {
        await createHabit(draft, todayKey);
      }
      await reload();
      closeCreate();
    },
    [pendingGroupDraft, todayKey, reload, closeCreate],
  );

  const handleCreateGroup = useCallback(
    async (draft: NewHabitGroupDraft) => {
      await createHabitGroup(draft, todayKey);
      await reload();
      closeCreate();
    },
    [todayKey, reload, closeCreate],
  );

  const handleCreateHabitForGroup = useCallback(
    async (draft: NewHabitDraft) => {
      const habit = await createHabit(
        { ...draft, groupId: undefined },
        todayKey,
      );
      await reload();
      setGroupNewHabitId(habit.id);
      setHabitForGroup(false);
    },
    [todayKey, reload],
  );

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      await deleteHabit(habitId, todayKey);
      await reload();
    },
    [todayKey, reload],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      await deleteHabitGroup(groupId);
      await reload();
    },
    [reload],
  );

  const pendingGroup = useMemo<PendingGroup | undefined>(
    () =>
      pendingGroupDraft
        ? {
            name: pendingGroupDraft.name.trim(),
            groupType: pendingGroupDraft.groupType,
          }
        : undefined,
    [pendingGroupDraft],
  );

  const hoursHabit = hoursHabitId ? habits[hoursHabitId] : undefined;
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
  const joinableGroups = bySortOrder(Object.values(groups)).filter(
    group => group.status === 'active',
  );
  const assignableHabits = allHabits.filter(habit => habit.status === 'active');

  return (
    <View style={styles.screen}>
      <HabitsHeader
        cadenceFilter={cadenceFilter}
        onChangeCadenceFilter={setCadenceFilter}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenSort={() => setSortOpen(true)}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {viewMode === 'list'
          ? listHabits.map(habit => (
              <HabitListRow
                key={habit.id}
                habit={habit}
                groupName={groupNamesByHabit[habit.id]}
                todayKey={todayKey}
                onPress={handleToggleHabit}
                colorKind="banner"
                onDelete={handleDeleteHabit}
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
                  onToggle={handleToggleHabit}
                  onDelete={handleDeleteGroup}
                />
              );
            })}
      </ScrollView>

      <Pressable
        testID="fab"
        onPress={() => setCreateStep('choice')}
        style={styles.fab}
      >
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
      <SortFilterSheet
        visible={sortOpen}
        value={sortFilter}
        onApply={value => {
          setSortFilter(value);
          setSortOpen(false);
        }}
        onClose={() => setSortOpen(false)}
      />
      <CreateChoiceSheet
        visible={createStep === 'choice'}
        onNewHabit={() => setCreateStep('habit')}
        onNewGroup={() => setCreateStep('group')}
        onClose={closeCreate}
      />
      <NewHabitForm
        visible={createStep === 'habit'}
        groups={joinableGroups}
        onBack={() => {
          setPendingGroupDraft(null);
          setCreateStep('choice');
        }}
        onCreate={handleCreateHabit}
        onCreateGroup={draft =>
          setGroupForHabit({ name: draft.name, type: draft.type })
        }
        pendingGroup={pendingGroup}
      />
      <NewHabitGroupForm
        visible={groupForHabit !== null}
        habits={assignableHabits}
        pendingHabit={groupForHabit ?? undefined}
        allowCreateHabit={false}
        onBack={() => setGroupForHabit(null)}
        onCreate={draft => {
          setPendingGroupDraft(draft);
          setGroupForHabit(null);
        }}
      />
      <NewHabitGroupForm
        visible={createStep === 'group'}
        habits={assignableHabits}
        newHabitId={groupNewHabitId}
        onBack={() => {
          setGroupNewHabitId(undefined);
          setCreateStep('choice');
        }}
        onCreate={handleCreateGroup}
        onCreateHabit={() => setHabitForGroup(true)}
      />
      <NewHabitForm
        visible={habitForGroup}
        groups={[]}
        hideGroupRow
        onBack={() => setHabitForGroup(false)}
        onCreate={handleCreateHabitForGroup}
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
