import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { HabitCadence, HabitType } from '../../types/habit';
import { HabitGroup, HabitGroupType } from '../../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../../types/habitConfig';
import { colors } from '../../theme';
import { clampCadenceTarget } from '../../utils/cadence';
import {
  DEFAULT_DRAFT,
  HABIT_NAME_MAX,
  NewHabitDraft,
  PENDING_GROUP_ID,
  isDraftValid,
} from '../../utils/newHabit';
import { canTakeHabit } from '../../utils/newHabitGroup';
import CadenceTargetField from './CadenceTargetField';
import FormScreen from './FormScreen';
import SegmentedControl from './SegmentedControl';
import Stepper from './Stepper';
import StreakFreezeField from './StreakFreezeField';
import { formStyles } from './formStyles';

// Screens 06-10: docs/feature-development/create-habit.md
const CADENCES: readonly HabitCadence[] = ['Day', 'Week', 'Month', 'Year'];
const TYPES: readonly HabitType[] = ['Checkmark', 'Hours'];

export interface PendingGroup {
  name: string;
  groupType: HabitGroupType;
}

interface NewHabitFormProps {
  visible: boolean;
  groups: HabitGroup[]; // shown in this order
  onBack: () => void;
  onCreate: (draft: NewHabitDraft) => void;
  onCreateGroup?: (draft: NewHabitDraft) => void;
  pendingGroup?: PendingGroup; // made with "+ Create Group", saved with the habit
  hideGroupRow?: boolean; // opened from the group form
}

export default function NewHabitForm({
  visible,
  groups,
  onBack,
  onCreate,
  onCreateGroup,
  pendingGroup,
  hideGroupRow = false,
}: NewHabitFormProps): React.JSX.Element {
  const [draft, setDraft] = useState<NewHabitDraft>(DEFAULT_DRAFT);

  // Every opening starts from a fresh draft
  useEffect(() => {
    if (visible) setDraft(DEFAULT_DRAFT);
  }, [visible]);

  // A group made with "+ Create Group" comes back selected
  useEffect(() => {
    if (!pendingGroup) return;
    setDraft(prev =>
      canTakeHabit(pendingGroup.groupType, prev.type)
        ? { ...prev, groupId: PENDING_GROUP_ID }
        : prev,
    );
  }, [pendingGroup]);

  const update = (changes: Partial<NewHabitDraft>) =>
    setDraft(prev => ({ ...prev, ...changes }));

  const groupTypeOf = (groupId: string | undefined) =>
    groupId === PENDING_GROUP_ID
      ? pendingGroup?.groupType
      : groups.find(g => g.id === groupId)?.groupType;

  const changeCadence = (cadence: HabitCadence) =>
    setDraft(prev => ({
      ...prev,
      cadence,
      target:
        cadence === 'Day'
          ? prev.target
          : clampCadenceTarget(cadence, prev.target),
    }));

  // A group the new type can't join is cleared
  const changeType = (type: HabitType) =>
    setDraft(prev => {
      const groupType = groupTypeOf(prev.groupId);
      const keep = groupType !== undefined && canTakeHabit(groupType, type);
      return { ...prev, type, groupId: keep ? prev.groupId : undefined };
    });

  const toggleGroup = (groupId: string) =>
    update({ groupId: draft.groupId === groupId ? undefined : groupId });

  const groupChips = [
    ...(pendingGroup
      ? [
          {
            id: PENDING_GROUP_ID,
            name: pendingGroup.name,
            groupType: pendingGroup.groupType,
          },
        ]
      : []),
    ...groups,
  ];
  const valid = isDraftValid(draft);

  return (
    <FormScreen
      visible={visible}
      title="New Habit"
      testID="new-habit-form"
      backTestID="new-habit-back"
      onBack={onBack}
    >
      <Text style={formStyles.label}>NAME</Text>
      <TextInput
        testID="new-habit-name"
        value={draft.name}
        onChangeText={name => update({ name })}
        maxLength={HABIT_NAME_MAX}
        placeholder="Habit name"
        placeholderTextColor={colors.v2GreyText}
        style={formStyles.nameInput}
      />

      <Text style={formStyles.label}>CADENCE</Text>
      <SegmentedControl
        options={CADENCES}
        value={draft.cadence}
        onChange={changeCadence}
        testID="new-habit-cadence"
      />

      <Text style={formStyles.label}>TARGET</Text>
      <CadenceTargetField
        cadence={draft.cadence}
        value={draft.target}
        onChange={target => update({ target })}
        testID="new-habit-target"
      />

      <Text style={formStyles.label}>STREAK FREEZE</Text>
      <StreakFreezeField
        value={draft.streakFreezeInterval}
        onChange={streakFreezeInterval => update({ streakFreezeInterval })}
        testID="new-habit-freeze"
      />

      <Text style={formStyles.label}>TYPE</Text>
      <SegmentedControl
        options={TYPES}
        value={draft.type}
        onChange={changeType}
        testID="new-habit-type"
      />

      {draft.type === 'Hours' ? (
        <>
          <Text style={formStyles.label}>DAILY TARGET HOURS</Text>
          <View style={formStyles.card}>
            <Stepper
              value={draft.targetHours}
              min={1}
              max={DEFAULT_HABIT_LIMITS.hoursTargetMax}
              onChange={targetHours => update({ targetHours })}
              testID="new-habit-hours"
            />
          </View>
        </>
      ) : null}

      {hideGroupRow ? null : (
        <>
          <Text style={formStyles.label}>HABIT GROUP</Text>
          <View style={styles.groupRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Pressable
                testID="new-habit-create-group"
                accessibilityRole="button"
                onPress={() => onCreateGroup?.(draft)}
                style={formStyles.chip}
              >
                <Text style={formStyles.chipLabel}>+ Create Group</Text>
              </Pressable>
              {groupChips.map(group => {
                const enabled = canTakeHabit(group.groupType, draft.type);
                const selected = draft.groupId === group.id;
                return (
                  <Pressable
                    key={group.id}
                    testID={`new-habit-group-${group.id}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: !enabled }}
                    disabled={!enabled}
                    onPress={() => toggleGroup(group.id)}
                    style={[
                      formStyles.chip,
                      selected && formStyles.chipSelected,
                      !enabled && formStyles.chipDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        formStyles.chipLabel,
                        selected && formStyles.chipLabelSelected,
                      ]}
                    >
                      {group.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <ChevronRight color={colors.v2White} size={18} />
          </View>
        </>
      )}

      <Pressable
        testID="new-habit-create"
        accessibilityRole="button"
        accessibilityState={{ disabled: !valid }}
        disabled={!valid}
        onPress={() => onCreate(draft)}
        style={[formStyles.createButton, !valid && formStyles.createDisabled]}
      >
        <Text style={formStyles.createLabel}>Create Habit</Text>
      </Pressable>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chips: {
    gap: 8,
  },
});
