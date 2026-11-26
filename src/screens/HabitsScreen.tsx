import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
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
import CreateChoiceSheet from './habits/CreateChoiceSheet';
import NewHabitForm, { PendingGroup } from './habits/NewHabitForm';
import NewHabitGroupForm from './habits/NewHabitGroupForm';
import { NewHabitDraft, PENDING_GROUP_ID } from '../utils/newHabit';
import { NewHabitGroupDraft, PENDING_HABIT_ID } from '../utils/newHabitGroup';
import { INITIAL_FORM_FLOW, formFlowReducer } from './habits/formFlow';
import LoadErrorMessage from './habits/LoadErrorMessage';
import SaveErrorSnackbar from './habits/SaveErrorSnackbar';

function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

interface HabitsScreenProps {
  dataVersion?: number; // bumped when a backup or restore changed the data
}

export default function HabitsScreen({
  dataVersion = 0,
}: HabitsScreenProps): React.JSX.Element {
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [hoursHabitId, setHoursHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<HabitsViewMode>('list');
  const [cadenceFilter, setCadenceFilter] = useState<CadenceFilterValue>('All');
  const [flow, dispatch] = useReducer(formFlowReducer, INITIAL_FORM_FLOW);
  // Session only: docs/feature-development/habits-section/sort-filter-delete-habit.md
  const [sortFilter, setSortFilter] =
    useState<SortFilterState>(DEFAULT_SORT_FILTER);
  const [sortOpen, setSortOpen] = useState(false);
  // Storage errors: docs/feature-development/release-1-readiness/storage-write-safety.md
  const [loadError, setLoadError] = useState(false);
  // Counts failures so each one restarts the snackbar's timer
  const [saveErrorCount, setSaveErrorCount] = useState(0);
  const [saveErrorVisible, setSaveErrorVisible] = useState(false);
  // A day change reruns the screen load: freezes for the new day, then a reload
  const todayKey = useToday();
  // The app draws edge-to-edge, so the header clears the status bar here
  const insets = useSafeAreaInsets();

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

  const closeForms = useCallback(() => dispatch({ type: 'close' }), []);
  const { base, pendingGroupDraft, groupNewHabitId } = flow;
  const editingHabitId = base.kind === 'editHabit' ? base.habitId : null;
  const editingGroupId = base.kind === 'editGroup' ? base.groupId : null;

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
      if (saved) closeForms();
    },
    [pendingGroupDraft, todayKey, runSave, closeForms],
  );

  const handleCreateGroup = useCallback(
    async (draft: NewHabitGroupDraft) => {
      if (await runSave(() => createHabitGroup(draft, todayKey))) {
        closeForms();
      }
    },
    [todayKey, runSave, closeForms],
  );

  const handleCreateHabitForGroup = useCallback(
    async (draft: NewHabitDraft) => {
      let habitId: string | undefined;
      const saved = await runSave(async () => {
        habitId = (
          await createHabit({ ...draft, groupId: undefined }, todayKey)
        ).id;
      });
      if (saved && habitId) {
        dispatch({ type: 'habitCreatedForGroup', habitId });
      }
    },
    [todayKey, runSave],
  );

  const handleSaveHabit = useCallback(
    async (draft: NewHabitDraft) => {
      if (!editingHabitId) return;
      if (await runSave(() => updateHabit(editingHabitId, draft))) {
        closeForms();
      }
    },
    [editingHabitId, runSave, closeForms],
  );

  const handleSaveGroup = useCallback(
    async (draft: NewHabitGroupDraft) => {
      if (!editingGroupId) return;
      const saved = await runSave(() =>
        updateHabitGroup(editingGroupId, draft, todayKey),
      );
      if (saved) closeForms();
    },
    [editingGroupId, todayKey, runSave, closeForms],
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
                  onEdit={habitId => dispatch({ type: 'editHabit', habitId })}
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
                    onEdit={groupId => dispatch({ type: 'editGroup', groupId })}
                    onDelete={handleDeleteGroup}
                  />
                );
              })}
        </ScrollView>
      )}

      {!loadError && (
        <Pressable
          testID="fab"
          onPress={() => dispatch({ type: 'openChoice' })}
          style={styles.fab}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
      {saveErrorIn(false)}
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
        visible={base.kind === 'choice'}
        onNewHabit={() => dispatch({ type: 'chooseHabit' })}
        onNewGroup={() => dispatch({ type: 'chooseGroup' })}
        onClose={closeForms}
      />
      {/* Only the open forms are mounted: the base form and the one stacked on it */}
      {base.kind === 'newHabit' ? (
        <NewHabitForm
          saveError={saveErrorIn(true)}
          visible
          groups={joinableGroups}
          onBack={() => dispatch({ type: 'backToChoice' })}
          onCreate={handleCreateHabit}
          onCreateGroup={draft =>
            dispatch({
              type: 'openGroupForHabit',
              habit: { name: draft.name, type: draft.type },
            })
          }
          pendingGroup={pendingGroup}
        />
      ) : null}
      {flow.groupForHabit ? (
        <NewHabitGroupForm
          saveError={saveErrorIn(true)}
          visible
          habits={assignableHabits}
          pendingHabit={flow.groupForHabit}
          allowCreateHabit={false}
          onBack={() => dispatch({ type: 'closeGroupForHabit' })}
          onCreate={draft => dispatch({ type: 'saveGroupForHabit', draft })}
        />
      ) : null}
      {base.kind === 'newGroup' ? (
        <NewHabitGroupForm
          saveError={saveErrorIn(true)}
          visible
          habits={assignableHabits}
          newHabitId={groupNewHabitId}
          onBack={() => dispatch({ type: 'backToChoice' })}
          onCreate={handleCreateGroup}
          onCreateHabit={() => dispatch({ type: 'openHabitForGroup' })}
        />
      ) : null}
      {editingHabitId && habits[editingHabitId] ? (
        <NewHabitForm
          saveError={saveErrorIn(true)}
          visible
          groups={[]}
          editing={habits[editingHabitId]}
          onBack={closeForms}
          onCreate={handleSaveHabit}
        />
      ) : null}
      {editingGroupId && groups[editingGroupId] ? (
        <NewHabitGroupForm
          saveError={saveErrorIn(true)}
          visible
          habits={assignableHabits}
          editing={groups[editingGroupId]}
          newHabitId={groupNewHabitId}
          onBack={closeForms}
          onCreate={handleSaveGroup}
          onCreateHabit={() => dispatch({ type: 'openHabitForGroup' })}
        />
      ) : null}
      {flow.habitForGroup ? (
        <NewHabitForm
          saveError={saveErrorIn(true)}
          visible
          groups={[]}
          hideGroupRow
          onBack={() => dispatch({ type: 'closeHabitForGroup' })}
          onCreate={handleCreateHabitForGroup}
        />
      ) : null}
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
