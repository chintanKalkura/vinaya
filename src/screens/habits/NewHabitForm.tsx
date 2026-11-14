import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HabitCadence, HabitType } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { DEFAULT_HABIT_LIMITS } from '../../types/habitConfig';
import { colors } from '../../theme';
import { clampCadenceTarget } from '../../utils/cadence';
import { clampFreezeInterval } from '../../utils/streakFreeze';
import {
  DEFAULT_DRAFT,
  HABIT_NAME_MAX,
  NewHabitDraft,
  canJoinGroup,
  isDraftValid,
} from '../../utils/newHabit';
import SegmentedControl from './SegmentedControl';
import Stepper from './Stepper';

// Screens 06-10: docs/feature-development/create-habit.md
const CADENCES: readonly HabitCadence[] = ['Day', 'Week', 'Month', 'Year'];
const TYPES: readonly HabitType[] = ['Checkmark', 'Hours'];

interface NewHabitFormProps {
  visible: boolean;
  groups: HabitGroup[]; // shown in this order
  onBack: () => void;
  onCreate: (draft: NewHabitDraft) => void;
}

export default function NewHabitForm({
  visible,
  groups,
  onBack,
  onCreate,
}: NewHabitFormProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<NewHabitDraft>(DEFAULT_DRAFT);
  const [freezeText, setFreezeText] = useState(
    String(DEFAULT_DRAFT.streakFreezeInterval),
  );

  // Every opening starts from a fresh draft
  useEffect(() => {
    if (!visible) return;
    setDraft(DEFAULT_DRAFT);
    setFreezeText(String(DEFAULT_DRAFT.streakFreezeInterval));
  }, [visible]);

  const update = (changes: Partial<NewHabitDraft>) =>
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

  // A group the new type can't join is cleared
  const changeType = (type: HabitType) =>
    setDraft(prev => {
      const group = groups.find(g => g.id === prev.groupId);
      const keep = group !== undefined && canJoinGroup(type, group);
      return { ...prev, type, groupId: keep ? prev.groupId : undefined };
    });

  const changeFreezeText = (input: string) => {
    const digits = input.replace(/[^0-9]/g, '');
    setFreezeText(digits);
    if (digits !== '') {
      update({ streakFreezeInterval: clampFreezeInterval(Number(digits)) });
    }
  };

  const toggleGroup = (groupId: string) =>
    update({ groupId: draft.groupId === groupId ? undefined : groupId });

  const valid = isDraftValid(draft);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onBack}
    >
      <View
        testID="new-habit-form"
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            testID="new-habit-back"
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={onBack}
          >
            <ChevronLeft color={colors.v2White} size={26} />
          </Pressable>
          <Text style={styles.heading}>New Habit</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>NAME</Text>
          <TextInput
            testID="new-habit-name"
            value={draft.name}
            onChangeText={name => update({ name })}
            maxLength={HABIT_NAME_MAX}
            placeholder="Habit name"
            placeholderTextColor={colors.v2GreyText}
            style={styles.nameInput}
          />

          <Text style={styles.label}>CADENCE</Text>
          <SegmentedControl
            options={CADENCES}
            value={draft.cadence}
            onChange={changeCadence}
            testID="new-habit-cadence"
          />

          <Text style={styles.label}>TARGET</Text>
          <View style={styles.card}>
            {draft.cadence === 'Day' ? (
              <Text testID="new-habit-target-day" style={styles.readOnly}>
                Repeats every day, no target needed
              </Text>
            ) : (
              <Stepper
                value={draft.target}
                min={1}
                max={DEFAULT_HABIT_LIMITS.cadenceTargetMax[draft.cadence]}
                onChange={target => update({ target })}
                testID="new-habit-target"
                suffix={`of ${
                  DEFAULT_HABIT_LIMITS.cadenceTargetMax[draft.cadence]
                } max`}
              />
            )}
          </View>

          <Text style={styles.label}>STREAK FREEZE</Text>
          <View style={[styles.card, styles.freezeRow]}>
            <Text style={styles.freezeText}>1 skip per</Text>
            <TextInput
              testID="new-habit-freeze"
              value={freezeText}
              onChangeText={changeFreezeText}
              onBlur={() => setFreezeText(String(draft.streakFreezeInterval))}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={3}
              style={styles.freezeInput}
            />
            <Text style={styles.freezeText}>streaks</Text>
          </View>

          <Text style={styles.label}>TYPE</Text>
          <SegmentedControl
            options={TYPES}
            value={draft.type}
            onChange={changeType}
            testID="new-habit-type"
          />

          {draft.type === 'Hours' ? (
            <>
              <Text style={styles.label}>DAILY TARGET HOURS</Text>
              <View style={styles.card}>
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

          <Text style={styles.label}>HABIT GROUP</Text>
          <View style={styles.groupRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {/* Group creation is not built yet; tapping does nothing */}
              <Pressable
                testID="new-habit-create-group"
                accessibilityRole="button"
                onPress={() => {}}
                style={styles.chip}
              >
                <Text style={styles.chipLabel}>+ Create Group</Text>
              </Pressable>
              {groups.map(group => {
                const enabled = canJoinGroup(draft.type, group);
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
                      styles.chip,
                      selected && styles.chipSelected,
                      !enabled && styles.chipDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipLabel,
                        selected && styles.chipLabelSelected,
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

          <Pressable
            testID="new-habit-create"
            accessibilityRole="button"
            accessibilityState={{ disabled: !valid }}
            disabled={!valid}
            onPress={() => onCreate(draft)}
            style={[styles.createButton, !valid && styles.createDisabled]}
          >
            <Text style={styles.createLabel}>Create Habit</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  heading: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  label: {
    color: colors.v2GreyText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackground,
    color: colors.v2White,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnly: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  freezeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  freezeText: {
    color: colors.v2GreyText,
    fontSize: 15,
  },
  freezeInput: {
    width: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Background,
    color: colors.v2Orange,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chips: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 18,
    backgroundColor: colors.v2CardBackground,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: {
    color: colors.v2White,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.v2Orange,
  },
  createButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  createDisabled: {
    opacity: 0.4,
  },
  createLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 17,
  },
});
