import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Habit, HabitCadence, HabitType } from '../../types/habit';
import { HabitGroup, HabitGroupType } from '../../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../../types/habitConfig';
import { colors } from '../../theme';
import { clampCadenceTarget } from '../../utils/cadence';
import { HABIT_NAME_MAX } from '../../utils/newHabit';
import {
  DEFAULT_GROUP_DRAFT,
  GROUP_TYPE_DESCRIPTIONS,
  NewHabitGroupDraft,
  PENDING_HABIT_ID,
  assignHabits,
  canTakeHabit,
  changeGroupType,
  draftFromGroup,
  isGroupDraftChanged,
  isGroupDraftValid,
} from '../../utils/newHabitGroup';
import CadenceTargetField from './CadenceTargetField';
import FormScreen from './FormScreen';
import HabitPickerSheet, { PickerItem } from './HabitPickerSheet';
import SegmentedControl from './SegmentedControl';
import Stepper from './Stepper';
import StreakFreezeField from './StreakFreezeField';
import { formStyles } from './formStyles';

// Screens 11-15: docs/feature-development/create-habit-group.md
const CADENCES: readonly HabitCadence[] = ['Day', 'Week', 'Month', 'Year'];
const GROUP_TYPES: readonly HabitGroupType[] = [
  'Required',
  'Any',
  'All',
  'Hours',
];

export interface PendingHabit {
  name: string;
  type: HabitType;
}

type OpenSheet = 'none' | 'assign' | 'required';

interface NewHabitGroupFormProps {
  visible: boolean;
  habits: Habit[]; // assignable habits, in this order
  onBack: () => void;
  onCreate: (draft: NewHabitGroupDraft) => void;
  onCreateHabit?: () => void;
  allowCreateHabit?: boolean;
  newHabitId?: string; // made with Create Habit; assigned when it returns
  pendingHabit?: PendingHabit; // the habit whose "+ Create Group" opened this
  editing?: HabitGroup; // Edit Habit Group: docs/feature-development/edit-habit-group.md
}

function initialDraft(
  pendingHabit?: PendingHabit,
  editing?: HabitGroup,
): NewHabitGroupDraft {
  if (editing) return draftFromGroup(editing);
  if (!pendingHabit) return DEFAULT_GROUP_DRAFT;
  return {
    ...DEFAULT_GROUP_DRAFT,
    groupType: pendingHabit.type === 'Hours' ? 'Hours' : 'Any',
    habitIds: [PENDING_HABIT_ID],
  };
}

export default function NewHabitGroupForm({
  visible,
  habits,
  onBack,
  onCreate,
  onCreateHabit,
  allowCreateHabit = true,
  newHabitId,
  pendingHabit,
  editing,
}: NewHabitGroupFormProps): React.JSX.Element {
  const [draft, setDraft] = useState<NewHabitGroupDraft>(
    initialDraft(pendingHabit, editing),
  );
  const [sheet, setSheet] = useState<OpenSheet>('none');
  const handledHabitId = useRef<string | undefined>(undefined);

  // Every opening starts from a fresh draft
  useEffect(() => {
    if (!visible) return;
    setDraft(initialDraft(pendingHabit, editing));
    setSheet('none');
    // Only reset when the form opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const habitTypes: Record<string, HabitType> = Object.fromEntries(
    habits.map(h => [h.id, h.type]),
  );
  if (pendingHabit) habitTypes[PENDING_HABIT_ID] = pendingHabit.type;
  const nameOf = (id: string) =>
    id === PENDING_HABIT_ID
      ? pendingHabit?.name.trim() || 'This habit'
      : habits.find(h => h.id === id)?.name ?? '';

  // A habit made with Create Habit comes back assigned, if the type takes it
  useEffect(() => {
    if (!newHabitId || handledHabitId.current === newHabitId) return;
    const habit = habits.find(h => h.id === newHabitId);
    if (!habit) return;
    handledHabitId.current = newHabitId;
    setDraft(prev =>
      canTakeHabit(prev.groupType, habit.type) &&
      !prev.habitIds.includes(habit.id)
        ? { ...prev, habitIds: [...prev.habitIds, habit.id] }
        : prev,
    );
  }, [newHabitId, habits]);

  const update = (changes: Partial<NewHabitGroupDraft>) =>
    setDraft(prev => ({ ...prev, ...changes }));

  const changeCadence = (cadence: HabitCadence) =>
    setDraft(prev => ({
      ...prev,
      cadence,
      target:
        cadence === 'Day'
          ? prev.target
          : clampCadenceTarget(cadence, prev.target),
    }));

  const isRequired = draft.groupType === 'Required';
  const isHours = draft.groupType === 'Hours';
  // Editing locks the type; a pending habit rules out types it can't join
  const disabledTypes = editing
    ? GROUP_TYPES.filter(type => type !== editing.groupType)
    : pendingHabit
    ? GROUP_TYPES.filter(type => !canTakeHabit(type, pendingHabit.type))
    : [];

  const assignItems: PickerItem[] = [
    ...(pendingHabit
      ? [{ id: PENDING_HABIT_ID, name: nameOf(PENDING_HABIT_ID), locked: true }]
      : []),
    ...habits.map(h => ({
      id: h.id,
      name: h.name,
      disabled: !canTakeHabit(draft.groupType, h.type),
    })),
  ];
  const requiredItems: PickerItem[] = draft.habitIds.map(id => ({
    id,
    name: nameOf(id),
  }));
  const valid =
    isGroupDraftValid(draft) &&
    (!editing || isGroupDraftChanged(draftFromGroup(editing), draft));

  return (
    <FormScreen
      visible={visible}
      title={editing ? 'Edit Habit Group' : 'New Habit Group'}
      testID="new-group-form"
      backTestID="new-group-back"
      onBack={onBack}
    >
      <Text style={formStyles.label}>NAME</Text>
      <TextInput
        testID="new-group-name"
        value={draft.name}
        onChangeText={name => update({ name })}
        maxLength={HABIT_NAME_MAX}
        placeholder="Group name"
        placeholderTextColor={colors.v2GreyText}
        style={formStyles.nameInput}
      />

      <Text style={formStyles.label}>CADENCE</Text>
      <SegmentedControl
        options={CADENCES}
        value={draft.cadence}
        onChange={changeCadence}
        testID="new-group-cadence"
      />

      <Text style={formStyles.label}>TARGET</Text>
      <CadenceTargetField
        cadence={draft.cadence}
        value={draft.target}
        onChange={target => update({ target })}
        testID="new-group-target"
      />

      <Text style={formStyles.label}>STREAK FREEZE</Text>
      <StreakFreezeField
        value={draft.streakFreezeInterval}
        onChange={streakFreezeInterval => update({ streakFreezeInterval })}
        testID="new-group-freeze"
      />

      <Text style={formStyles.label}>GROUP TYPE</Text>
      <SegmentedControl
        options={GROUP_TYPES}
        value={draft.groupType}
        onChange={type =>
          setDraft(prev => changeGroupType(prev, type, habitTypes))
        }
        disabledOptions={disabledTypes}
        testID="new-group-type"
      />
      <View style={[formStyles.card, styles.description]}>
        <Text testID="new-group-description" style={formStyles.readOnly}>
          {GROUP_TYPE_DESCRIPTIONS[draft.groupType]}
        </Text>
      </View>

      <Text style={formStyles.label}>ASSIGNED HABITS</Text>
      <View
        testID="new-group-assigned"
        style={[formStyles.card, styles.assigned]}
      >
        {draft.habitIds.length === 0 ? (
          <Text style={formStyles.readOnly}>No habits assigned yet</Text>
        ) : (
          draft.habitIds.map(id => {
            const required = isRequired && draft.requiredHabitIds.includes(id);
            return (
              <View
                key={id}
                testID={`new-group-assigned-${id}`}
                accessibilityState={{ selected: required }}
                style={[styles.assignedChip, required && styles.requiredChip]}
              >
                <Text style={styles.assignedLabel}>{nameOf(id)}</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          testID="new-group-assign"
          accessibilityRole="button"
          onPress={() => setSheet('assign')}
          style={styles.actionButton}
        >
          <Text style={styles.actionLabel}>Assign Habits</Text>
        </Pressable>
        {allowCreateHabit ? (
          <Pressable
            testID="new-group-create-habit"
            accessibilityRole="button"
            onPress={() => onCreateHabit?.()}
            style={styles.actionButton}
          >
            <Text style={styles.actionLabel}>Create Habit</Text>
          </Pressable>
        ) : null}
      </View>

      {isRequired ? (
        <>
          <Text style={formStyles.label}>REQUIRED HABITS</Text>
          <View style={styles.requiredRow}>
            <Star color={colors.v2Orange} size={20} />
            <Text style={styles.requiredText}>Select Required Habits</Text>
            <Pressable
              testID="new-group-edit-required"
              accessibilityRole="button"
              onPress={() => setSheet('required')}
              style={styles.editButton}
            >
              <Text style={styles.editLabel}>Edit</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {isHours ? (
        <>
          <Text style={formStyles.label}>HOURS TARGET</Text>
          <View style={formStyles.card}>
            <Stepper
              value={draft.targetHours}
              min={1}
              max={DEFAULT_HABIT_LIMITS.hoursTargetMax}
              onChange={targetHours => update({ targetHours })}
              testID="new-group-hours"
              suffix={`of ${DEFAULT_HABIT_LIMITS.hoursTargetMax} max`}
            />
          </View>
        </>
      ) : null}

      <Pressable
        testID="new-group-create"
        accessibilityRole="button"
        accessibilityState={{ disabled: !valid }}
        disabled={!valid}
        onPress={() => onCreate(draft)}
        style={[formStyles.createButton, !valid && formStyles.createDisabled]}
      >
        <Text style={formStyles.createLabel}>
          {editing ? 'Save' : 'Create Habit Group'}
        </Text>
      </Pressable>
      {draft.habitIds.length === 0 ? (
        <Text style={styles.helper}>
          Add at least 1 habit to create a group
        </Text>
      ) : null}

      <HabitPickerSheet
        visible={sheet === 'assign'}
        title="Assign Habits"
        subtitle={`${draft.groupType} · tap to select`}
        items={assignItems}
        selectedIds={draft.habitIds}
        doneLabel={count => `Done (${count} selected)`}
        onDone={ids => {
          setDraft(prev => assignHabits(prev, ids));
          setSheet('none');
        }}
        onClose={() => setSheet('none')}
        testID="assign-sheet"
      />
      <HabitPickerSheet
        visible={sheet === 'required'}
        title="Select Required Habits"
        subtitle="These must be done to complete the group"
        items={requiredItems}
        selectedIds={draft.requiredHabitIds}
        doneLabel={count => `Done (${count} required)`}
        onDone={ids => {
          update({ requiredHabitIds: ids });
          setSheet('none');
        }}
        onClose={() => setSheet('none')}
        testID="required-sheet"
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: 12,
  },
  assigned: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 52,
  },
  assignedChip: {
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
    borderRadius: 14,
    backgroundColor: colors.v2Border,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  requiredChip: {
    borderWidth: 2,
    borderColor: colors.v2Blue,
  },
  assignedLabel: {
    color: colors.v2White,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 15,
  },
  requiredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.v2Orange,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackgroundInset,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  requiredText: {
    flex: 1,
    color: colors.v2White,
    fontSize: 15,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.v2Orange,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
  },
  editLabel: {
    color: colors.v2Orange,
    fontWeight: '700',
  },
  helper: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
