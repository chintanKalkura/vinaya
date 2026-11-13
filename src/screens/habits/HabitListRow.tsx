import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Habit } from '../../types/habit';
import { colors } from '../../theme';
import { useHabitVisual } from './useHabitVisual';
import HoursProgress from './HoursProgress';
import { ColorKind, getColorScheme } from './colorRules';

interface HabitListRowProps {
  habit: Habit;
  groupName?: string;
  todayKey: string;
  onPress: (habitId: string) => void;
  colorKind: ColorKind;
}

export default function HabitListRow({
  habit,
  groupName,
  todayKey,
  onPress,
  colorKind,
}: HabitListRowProps): React.JSX.Element {
  const { interactive, visual, hours } = useHabitVisual(habit, todayKey);
  const isMarked = visual?.habitColorState === 'marked';
  const scheme = getColorScheme(colorKind, isMarked);
  const rowStyle = [styles.row, scheme.container];
  const groupLabel = groupName ? (
    <Text style={styles.groupName}>{groupName}</Text>
  ) : null;

  if (hours) {
    return (
      <Pressable
        testID={`habit-row-${habit.id}`}
        accessibilityRole="button"
        accessibilityState={{ checked: isMarked, disabled: false }}
        onPress={() => onPress(habit.id)}
        style={rowStyle}
      >
        <View style={styles.textColumn}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: scheme.titleColor }]}>
              {habit.name}
            </Text>
            <Text
              testID={`habit-row-streak-${habit.id}`}
              style={[styles.streak, { color: scheme.numberColor }]}
            >
              {visual?.streakValue ?? 0}
            </Text>
          </View>
          {groupLabel}
          <View style={styles.hoursProgress}>
            <HoursProgress
              total={hours.hoursToday}
              target={habit.targetHours ?? 0}
              testID={`habit-row-progress-${habit.id}`}
            />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={`habit-row-${habit.id}`}
      disabled={!interactive}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isMarked, disabled: !interactive }}
      onPress={() => onPress(habit.id)}
      style={rowStyle}
    >
      <View
        testID={`habit-row-icon-${habit.id}`}
        style={[
          styles.icon,
          {
            borderColor: scheme.iconColor,
            backgroundColor: scheme.iconFilled ? scheme.iconColor : undefined,
          },
        ]}
      >
        {scheme.iconFilled ? (
          <Check color={colors.v2Background} size={13} strokeWidth={3.5} />
        ) : null}
      </View>
      <View style={styles.textColumn}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: scheme.titleColor }]}>
            {habit.name}
          </Text>
          {visual ? (
            <Text style={[styles.streak, { color: scheme.numberColor }]}>
              {visual.streakValue}
            </Text>
          ) : (
            <Text style={[styles.streak, { color: colors.v2GreyText }]}>–</Text>
          )}
        </View>
        {groupLabel}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.v2CardBackground,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  streak: {
    fontStyle: 'italic',
    fontWeight: '600',
  },
  groupName: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
  hoursProgress: {
    marginTop: 10,
  },
});
