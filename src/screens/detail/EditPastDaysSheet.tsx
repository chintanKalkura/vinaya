import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit } from '../../types/habit';
import { DEFAULT_HABIT_LIMITS } from '../../types/habitConfig';
import { WeekStart } from '../../types/settings';
import { Palette, completionColour } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { daysBetween } from '../../utils/cadence';
import { parseDate } from '../../utils/dates';
import { PastDayChange } from '../../services/habitService';
import { editableRange } from '../../utils/pastDays';
import Stepper from '../habits/Stepper';
import MonthGrid, { DayInfo } from './MonthGrid';
import { dayLabel, dayStateOf, monthsBetween } from './HistorySection';

// Edit past days: docs/style-choices/detail/edit-past-days.md. Changes stay a
// draft until Save; Discard, back or a tap outside drop them.
interface EditPastDaysSheetProps {
  habit: Habit;
  todayKey: string;
  weekStart: WeekStart;
  onSave: (changes: PastDayChange[]) => Promise<boolean>; // true once saved
  onClose: () => void;
}

// The value a day holds: 1/0 for Checkmark, hours for Hours habits
function savedValues(habit: Habit): Map<string, number> {
  return new Map(habit.history.map(entry => [entry.date, entry.value]));
}

export default function EditPastDaysSheet({
  habit,
  todayKey,
  weekStart,
  onSave,
  onClose,
}: EditPastDaysSheetProps): React.JSX.Element | null {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const range = editableRange(habit.cadence, habit.createdAt, todayKey);
  const isHours = habit.type === 'Hours';
  const target = habit.targetHours ?? 0;
  const saved = useMemo(() => savedValues(habit), [habit]);
  const [draft, setDraft] = useState<Map<string, number>>(new Map());
  const [selected, setSelected] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    setDraft(new Map());
    setSelected(undefined);
  }, [habit.id]);

  if (!range) return null;
  const valueOf = (date: string) => draft.get(date) ?? saved.get(date) ?? 0;
  // A day set back to what's saved isn't a change
  const setDay = (date: string, value: number) =>
    setDraft(prev => {
      const next = new Map(prev);
      if (value === (saved.get(date) ?? 0)) next.delete(date);
      else next.set(date, value);
      return next;
    });
  const pressDay = (date: string) => {
    if (isHours) setSelected(date);
    else setDay(date, valueOf(date) > 0 ? 0 : 1);
  };

  const frozen = new Set(habit.streakFreeze?.frozenDates ?? []);
  const dayInfo = (date: string): DayInfo => {
    const value = valueOf(date);
    const done = new Set(
      (isHours ? value >= target && target > 0 : value > 0) ? [date] : [],
    );
    const hours = isHours ? new Map([[date, value]]) : undefined;
    const state = dayStateOf(date, done, frozen, hours);
    return {
      state,
      inRange: date >= range.from && date <= range.to,
      label: dayLabel(date, state),
    };
  };

  const changes = draft.size;
  const save = async () => {
    if (changes === 0) {
      onClose();
      return;
    }
    setSaving(true);
    const ok = await onSave(
      [...draft].map(([date, value]) => ({ date, value })),
    );
    setSaving(false);
    if (ok) onClose();
  };
  const days = daysBetween(range.from, range.to) + 1;
  const selectedLabel = selected
    ? parseDate(selected).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '';

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        testID="past-days-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        testID="past-days-sheet"
        style={[styles.sheet, { paddingBottom: 18 + insets.bottom }]}
      >
        <View style={styles.handle} />
        <Text style={styles.title} accessibilityRole="header">
          Edit past days
        </Text>
        <Text style={styles.subtitle}>
          {`${habit.name} · the last ${days} day${days === 1 ? '' : 's'}. `}
          {isHours
            ? 'Tap a day, then set its hours.'
            : 'Tap days to mark or unmark them.'}
        </Text>
        {/* Newest month at the bottom, opened scrolled to it */}
        <ScrollView
          ref={scroll}
          style={styles.months}
          contentContainerStyle={styles.monthsContent}
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: false })
          }
        >
          {monthsBetween(range.from, range.to).map(([year, month]) => (
            <MonthGrid
              key={`${year}-${month}`}
              year={year}
              month={month}
              weekStart={weekStart}
              color={completionColour(colors, habit.colour).accent}
              dayInfo={dayInfo}
              onPressDay={pressDay}
              selectedKey={selected}
            />
          ))}
        </ScrollView>
        {isHours ? (
          selected ? (
            <View testID="past-days-hours" style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{selectedLabel}</Text>
              <Stepper
                testID="past-days-stepper"
                value={valueOf(selected)}
                min={0}
                max={DEFAULT_HABIT_LIMITS.hoursTargetMax}
                onChange={value => setDay(selected, value)}
                suffix={`of ${target}h`}
              />
            </View>
          ) : (
            <Text style={styles.hint}>Tap a day to set its hours</Text>
          )
        ) : null}
        <View style={styles.buttons}>
          <Pressable
            testID="past-days-discard"
            accessibilityRole="button"
            onPress={onClose}
            style={[styles.button, styles.discard]}
          >
            <Text style={styles.discardLabel}>Discard</Text>
          </Pressable>
          <Pressable
            testID="past-days-save"
            accessibilityRole="button"
            accessibilityState={{ disabled: saving }}
            disabled={saving}
            onPress={save}
            style={[styles.button, styles.save, saving && styles.saving]}
          >
            <Text style={styles.saveLabel}>
              {saving
                ? 'Saving…'
                : changes > 0
                ? `Save ${changes} change${changes === 1 ? '' : 's'}`
                : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.v2Scrim,
    },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.v2CardBackground,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 18,
      paddingTop: 10,
      gap: 10,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.v2GreyOutline,
    },
    title: {
      color: colors.v2White,
      fontWeight: '700',
      fontSize: 18,
    },
    subtitle: {
      color: colors.v2GreyText,
      fontSize: 13,
      marginTop: -4,
    },
    months: {
      flexGrow: 0,
    },
    monthsContent: {
      gap: 12,
    },
    hoursRow: {
      gap: 6,
    },
    hoursDay: {
      color: colors.v2White,
      fontWeight: '600',
    },
    hint: {
      color: colors.v2GreyText,
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 8,
    },
    buttons: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      minHeight: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    discard: {
      borderWidth: 1,
      borderColor: colors.v2GreyOutline,
    },
    discardLabel: {
      color: colors.v2White,
      fontWeight: '700',
      fontSize: 16,
    },
    save: {
      backgroundColor: colors.v2Orange,
    },
    saving: {
      opacity: 0.6,
    },
    saveLabel: {
      color: colors.v2Background,
      fontWeight: '700',
      fontSize: 16,
    },
  });
