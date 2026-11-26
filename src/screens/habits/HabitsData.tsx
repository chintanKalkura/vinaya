import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays, Trash2 } from 'lucide-react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { usePalette } from '../../theming';
import { useSettings } from '../../settings/SettingsProvider';
import { useToday } from '../../hooks/useToday';
import { loadHabitsAndGroups } from '../../storage/habitStorage';
import { seedDevFixturesIfNeeded } from '../../storage/devSeed';
import {
  createHabit,
  deleteHabit,
  updateHabit,
  markHabitDone,
  setHabitHours,
  setPastDays,
  unmarkHabitDone,
} from '../../services/habitService';
import { editableRange } from '../../utils/pastDays';
import EditPastDaysSheet from '../detail/EditPastDaysSheet';
import {
  applyStreakFreezes,
  createHabitGroup,
  deleteHabitGroup,
  updateHabitGroup,
} from '../../services/habitGroupService';
import { getHoursToday } from '../../utils/hours';
import { NewHabitDraft, PENDING_GROUP_ID } from '../../utils/newHabit';
import {
  NewHabitGroupDraft,
  PENDING_HABIT_ID,
} from '../../utils/newHabitGroup';
import { INITIAL_FORM_FLOW, formFlowReducer } from './formFlow';
import HoursEntryModal from './HoursEntryModal';
import CreateChoiceSheet from './CreateChoiceSheet';
import NewHabitForm, { PendingGroup } from './NewHabitForm';
import NewHabitGroupForm from './NewHabitGroupForm';
import SaveErrorSnackbar from './SaveErrorSnackbar';
import OptionsMenu from './OptionsMenu';

// The Habits tab's data, saves and forms, shared by the Habits list and the
// habit and group pages: docs/feature-development/release-1-readiness/habit-group-detail-page.md.
// The forms, the Hours modal and the save message are drawn once here, over
// whichever page is open.
export function bySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

interface HabitsData {
  habits: Record<string, Habit>;
  groups: Record<string, HabitGroup>;
  todayKey: string;
  loaded: boolean;
  loadError: boolean;
  loadScreen: () => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  openChoice: () => void;
  editHabit: (habitId: string) => void;
  editGroup: (groupId: string) => void;
  removeHabit: (habitId: string) => Promise<void>;
  removeGroup: (groupId: string) => Promise<void>;
  openPastDays: (habitId: string) => void;
  canEditPastDays: (habitId: string) => boolean; // false on the creation day
}

const HabitsDataContext = createContext<HabitsData | null>(null);

export function useHabitsData(): HabitsData {
  const value = useContext(HabitsDataContext);
  if (!value) throw new Error('useHabitsData needs a HabitsDataProvider');
  return value;
}

interface HabitsDataProviderProps {
  dataVersion?: number; // bumped when a backup or restore changed the data
  children: React.ReactNode;
}

export function HabitsDataProvider({
  dataVersion = 0,
  children,
}: HabitsDataProviderProps): React.JSX.Element {
  const colors = usePalette();
  const [habits, setHabits] = useState<Record<string, Habit>>({});
  const [groups, setGroups] = useState<Record<string, HabitGroup>>({});
  const [hoursHabitId, setHoursHabitId] = useState<string | null>(null);
  // Edit past days: docs/style-choices/detail/edit-past-days.md
  const [pastDaysHabitId, setPastDaysHabitId] = useState<string | null>(null);
  const { weekStart } = useSettings().settings;
  const [flow, dispatch] = useReducer(formFlowReducer, INITIAL_FORM_FLOW);
  // Storage errors: docs/feature-development/release-1-readiness/storage-write-safety.md
  const [loadError, setLoadError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Counts failures so each one restarts the snackbar's timer
  const [saveErrorCount, setSaveErrorCount] = useState(0);
  const [saveErrorVisible, setSaveErrorVisible] = useState(false);
  // A day change reruns the screen load: freezes for the new day, then a reload
  const todayKey = useToday();

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
      setLoaded(true);
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

  const toggleHabit = useCallback(
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

  const removeHabit = useCallback(
    async (habitId: string) => {
      await runSave(() => deleteHabit(habitId, todayKey));
    },
    [todayKey, runSave],
  );

  const removeGroup = useCallback(
    async (groupId: string) => {
      await runSave(() => deleteHabitGroup(groupId));
    },
    [runSave],
  );

  const canEditPastDays = useCallback(
    (habitId: string) => {
      const habit = habits[habitId];
      return (
        !!habit &&
        editableRange(habit.cadence, habit.createdAt, todayKey) !== undefined
      );
    },
    [habits, todayKey],
  );

  const savePastDays = useCallback(
    (changes: { date: string; value: number }[]) =>
      pastDaysHabitId
        ? runSave(() => setPastDays(pastDaysHabitId, changes, todayKey))
        : Promise.resolve(false),
    [pastDaysHabitId, todayKey, runSave],
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

  const value = useMemo<HabitsData>(
    () => ({
      habits,
      groups,
      todayKey,
      loaded,
      loadError,
      loadScreen,
      toggleHabit,
      openChoice: () => dispatch({ type: 'openChoice' }),
      editHabit: habitId => dispatch({ type: 'editHabit', habitId }),
      editGroup: groupId => dispatch({ type: 'editGroup', groupId }),
      removeHabit,
      removeGroup,
      openPastDays: habitId => setPastDaysHabitId(habitId),
      canEditPastDays,
    }),
    [
      canEditPastDays,
      habits,
      groups,
      todayKey,
      loaded,
      loadError,
      loadScreen,
      toggleHabit,
      removeHabit,
      removeGroup,
    ],
  );

  const hoursHabit = hoursHabitId ? habits[hoursHabitId] : undefined;
  const allHabits = bySortOrder(Object.values(habits));
  const joinableGroups = bySortOrder(Object.values(groups)).filter(
    group => group.status === 'active',
  );
  const assignableHabits = allHabits.filter(habit => habit.status === 'active');

  return (
    <HabitsDataContext.Provider value={value}>
      <View style={styles.fill}>
        {children}
        {saveErrorIn(false)}
        <HoursEntryModal
          visible={hoursHabit !== undefined}
          habitName={hoursHabit?.name ?? ''}
          initialHours={hoursHabit ? getHoursToday(hoursHabit, todayKey) : 0}
          onDone={handleHoursDone}
          onClose={() => setHoursHabitId(null)}
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
            headerMenu={
              <OptionsMenu
                kind="habit"
                testID="edit-habit-menu"
                iconColor={colors.v2White}
                iconSize={22}
                items={[
                  {
                    key: 'past-days',
                    label: 'Edit past days',
                    Icon: CalendarDays,
                    disabled: !canEditPastDays(editingHabitId),
                    onPress: () => setPastDaysHabitId(editingHabitId),
                  },
                  {
                    key: 'delete',
                    label: 'Delete habit',
                    Icon: Trash2,
                    danger: true,
                    onPress: () => {
                      closeForms();
                      removeHabit(editingHabitId);
                    },
                  },
                ]}
              />
            }
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
            headerMenu={
              <OptionsMenu
                kind="group"
                testID="edit-group-menu"
                iconColor={colors.v2White}
                iconSize={22}
                items={[
                  {
                    key: 'delete',
                    label: 'Delete group',
                    Icon: Trash2,
                    danger: true,
                    onPress: () => {
                      closeForms();
                      removeGroup(editingGroupId);
                    },
                  },
                ]}
              />
            }
          />
        ) : null}
        {/* Over the page or the Edit Habit form; saves on its own */}
        {pastDaysHabitId && habits[pastDaysHabitId] ? (
          <EditPastDaysSheet
            habit={habits[pastDaysHabitId]}
            todayKey={todayKey}
            weekStart={weekStart}
            onSave={savePastDays}
            onClose={() => setPastDaysHabitId(null)}
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
    </HabitsDataContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
