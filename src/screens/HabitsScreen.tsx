import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit } from '../types/habit';
import { HabitGroup } from '../types/habitGroup';
import { colors } from '../theme';
import { useToday } from '../hooks/useToday';
import { loadHabitsAndGroups } from '../storage/habitStorage';
import { seedDevFixturesIfNeeded } from '../storage/devSeed';
import {
  createHabit,
  deleteHabit,
  updateHabit,
  markHabitDone,
  setHabitHours,
  unmarkHabitDone,
} from '../services/habitService';
import {
  applyStreakFreezes,
  createHabitGroup,
  deleteHabitGroup,
  getGroupStatus,
  updateHabitGroup,
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
import BottomMenu, { BOTTOM_MENU_HEIGHT } from './habits/BottomMenu';
import CreateChoiceSheet from './habits/CreateChoiceSheet';
import NewHabitForm, { PendingGroup } from './habits/NewHabitForm';
import NewHabitGroupForm, { PendingHabit } from './habits/NewHabitGroupForm';
import { NewHabitDraft, PENDING_GROUP_ID } from '../utils/newHabit';
import { NewHabitGroupDraft, PENDING_HABIT_ID } from '../utils/newHabitGroup';
import LoadErrorMessage from './habits/LoadErrorMessage';
import SaveErrorSnackbar from './habits/SaveErrorSnackbar';

// The + flow from docs/navigation/habits-section/02-habit-creation.md and 03-group-creation.md
type CreateStep = 'none' | 'choice' | 'habit' | 'group';

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

interface HabitsScreenProps {
  onOpenProfile?: () => void;
  dataVersion?: number; // bumped when a backup or restore changed the data
}

export default function HabitsScreen({
  onOpenProfile,
  dataVersion = 0,
}: HabitsScreenProps): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [hoursHabitId, setHoursHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HabitsViewMode>('list');
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilterValue>('All');
  const [createStep, setCreateStep] = useState<CreateStep>('none');
  // Session only: docs/feature-development/habits-section/sort-filter-delete-habit.md
  const [sortFilter, setSortFilter] =
    useState<SortFilterState>(DEFAULT_SORT_FILTER);
  const [sortOpen, setSortOpen] = useState(false);
  // Edit Habit / Edit Habit Group: docs/feature-development/habits-section/edit-habit-group.md
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  // Habit form → "+ Create Group": the group is saved with the habit
  const [groupForHabit, setGroupForHabit] = useState<PendingHabit | null>(null);
  const [pendingGroupDraft, setPendingGroupDraft] =
    useState<NewHabitGroupDraft | null>(null);
  // Group form → Create Habit: the habit is saved, then assigned
  const [habitForGroup, setHabitForGroup] = useState(false);
  const [groupNewHabitId, setGroupNewHabitId] = useState<string | undefined>(
    undefined,
  );
  // Storage errors: docs/feature-development/release-1-readiness/storage-write-safety.md
  const [loadError, setLoadError] = useState(false);
  // Counts failures so each one restarts the snackbar's timer
  const [saveErrorCount, setSaveErrorCount] = useState(0);
  const [saveErrorVisible, setSaveErrorVisible] = useState(false);
  // A day change reruns the screen load: freezes for the new day, then a reload
  const todayKey = useToday();
  // The app draws edge-to-edge, so the header clears the status bar here
  const insets = useSafeAreaInsets();
  // The bottom menu grows with the font size; the FAB and snackbar sit above it
  const [measuredMenuHeight, setMeasuredMenuHeight] = useState<number | null>(
    null,
  );
  const menuHeight = measuredMenuHeight ?? BOTTOM_MENU_HEIGHT + insets.bottom;

  const reload = useCallback(async () => {
    const [h, g] = await loadHabitsAndGroups();
    setHabits(h);
    setGroups(g);
  }, []);

  // Nothing is shown, so nothing can be saved, until the habits are read
  const loadScreen = useCallback(async () => {
    try {
      await seedDevFixturesIfNeeded();
      await applyStreakFreezes(todayKey);
      await reload();
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [todayKey, reload]);

  useEffect(() => {
    loadScreen();
  }, [loadScreen]);

  // A restore or backup merge changed the stored data while the screen stayed open
  useEffect(() => {
    if (dataVersion === 0) return;
    reload().catch(() => setLoadError(true));
  }, [dataVersion, reload]);

  // The screen shows what was saved: it reloads after a save, and on a failed
  // save keeps what it showed and says so. Returns whether the save worked.
  const runSave = useCallback(
    async (op: () => Promise<unknown>): Promise<boolean> => {
      try {
        await op();
      } catch {
        setSaveErrorCount(n => n + 1);
        setSaveErrorVisible(true);
        return false;
      }
      try {
        await reload();
      } catch {
        setLoadError(true);
      }
      return true;
    },
    [reload],
  );

  const dismissSaveError = useCallback(() => setSaveErrorVisible(false), []);

  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      const habit = habits[habitId];
      if (!habit) return;
      if (habit.type === 'Hours') {
        setHoursHabitId(habitId);
        return;
      }

      const isMarked = habit.recentLog.some(entry => entry.date === todayKey);
      await runSave(() =>
        isMarked
          ? unmarkHabitDone(habitId, todayKey)
          : markHabitDone(habitId, todayKey),
      );
    },
    [habits, todayKey, runSave],
  );

  const handleHoursDone = useCallback(
    async (hours: number) => {
      if (!hoursHabitId) return;
      const habitId = hoursHabitId;
      setHoursHabitId(null);
      await runSave(() => setHabitHours(habitId, hours, todayKey));
    },
    [hoursHabitId, todayKey, runSave],
  );

  const closeCreate = useCallback(() => {
    setCreateStep('none');
    setPendingGroupDraft(null);
    setGroupNewHabitId(undefined);
  }, []);

  // Returns to the view the + was tapped from; viewMode is left unchanged.
  // A group made with "+ Create Group" is saved after the habit, with it.
  // Forms close only once saved, so a failed save keeps what was typed.
  const handleCreateHabit = useCallback(
    async (draft: NewHabitDraft) => {
      const saved = await runSave(async () => {
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
      });
      if (saved) closeCreate();
    },
    [pendingGroupDraft, todayKey, runSave, closeCreate],
  );

  const handleCreateGroup = useCallback(
    async (draft: NewHabitGroupDraft) => {
      if (await runSave(() => createHabitGroup(draft, todayKey))) {
        closeCreate();
      }
    },
    [todayKey, runSave, closeCreate],
  );

  const handleCreateHabitForGroup = useCallback(
    async (draft: NewHabitDraft) => {
      let habitId: string | undefined;
      const saved = await runSave(async () => {
        habitId = (
          await createHabit({ ...draft, groupId: undefined }, todayKey)
        ).id;
      });
      if (!saved) return;
      setGroupNewHabitId(habitId);
      setHabitForGroup(false);
    },
    [todayKey, runSave],
  );

  const handleSaveHabit = useCallback(
    async (draft: NewHabitDraft) => {
      if (!editingHabitId) return;
      if (await runSave(() => updateHabit(editingHabitId, draft))) {
        setEditingHabitId(null);
      }
    },
    [editingHabitId, runSave],
  );

  const handleSaveGroup = useCallback(
    async (draft: NewHabitGroupDraft) => {
      if (!editingGroupId) return;
      const saved = await runSave(() =>
        updateHabitGroup(editingGroupId, draft, todayKey),
      );
      if (!saved) return;
      setEditingGroupId(null);
      setGroupNewHabitId(undefined);
    },
    [editingGroupId, todayKey, runSave],
  );

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      await runSave(() => deleteHabit(habitId, todayKey));
    },
    [todayKey, runSave],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      await runSave(() => deleteHabitGroup(groupId));
    },
    [runSave],
  );

  const saveErrorIn = (inForm: boolean) => (
    <SaveErrorSnackbar
      key={saveErrorCount}
      visible={saveErrorVisible}
      inForm={inForm}
      menuHeight={menuHeight}
      onDismiss={dismissSaveError}
    />
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
          {viewMode === 'list'
            ? listHabits.map(habit => (
                <HabitListRow
                  key={habit.id}
                  habit={habit}
                  groupName={groupNamesByHabit[habit.id]}
                  todayKey={todayKey}
                  onPress={handleToggleHabit}
                  colorKind="banner"
                  onEdit={setEditingHabitId}
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
                    onEdit={setEditingGroupId}
                    onDelete={handleDeleteGroup}
                  />
                );
              })}
        </ScrollView>
      )}

      {!loadError && (
        <Pressable
          testID="fab"
          onPress={() => setCreateStep('choice')}
          style={[styles.fab, { bottom: menuHeight + 16 }]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
      {saveErrorIn(false)}
      <BottomMenu
        onSelect={tab => {
          if (tab === 'Profile') onOpenProfile?.();
        }}
        onHeightChange={setMeasuredMenuHeight}
      />
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
        saveError={saveErrorIn(true)}
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
        saveError={saveErrorIn(true)}
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
        saveError={saveErrorIn(true)}
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
        saveError={saveErrorIn(true)}
        visible={editingHabitId !== null}
        groups={[]}
        editing={editingHabitId ? habits[editingHabitId] : undefined}
        onBack={() => setEditingHabitId(null)}
        onCreate={handleSaveHabit}
      />
      <NewHabitGroupForm
        saveError={saveErrorIn(true)}
        visible={editingGroupId !== null}
        habits={assignableHabits}
        editing={editingGroupId ? groups[editingGroupId] : undefined}
        newHabitId={groupNewHabitId}
        onBack={() => {
          setGroupNewHabitId(undefined);
          setEditingGroupId(null);
        }}
        onCreate={handleSaveGroup}
        onCreateHabit={() => setHabitForGroup(true)}
      />
      <NewHabitForm
        saveError={saveErrorIn(true)}
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
