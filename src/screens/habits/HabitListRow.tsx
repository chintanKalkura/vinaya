import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { colors } from '../../theme';
import { useHabitVisual } from './useHabitVisual';

interface HabitListRowProps {
  habit: Habit;
  groupName?: string;
  todayKey: string;
  onPress: (habitId: string) => void;
}

export default function HabitListRow({
  habit,
  groupName,
  todayKey,
  onPress,
}: HabitListRowProps): React.JSX.Element {
  const { interactive, visual } = useHabitVisual(habit, todayKey);
  const isMarked = visual?.habitColorState === 'marked';
  const nameColor = isMarked ? colors.v2Orange : colors.v2GreyText;
  const streakColor =
    visual?.streakNumberColorState === 'marked'
      ? colors.v2Orange
      : colors.v2GreyText;

  return (
    <Pressable
      testID={`habit-row-${habit.id}`}
      disabled={!interactive}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isMarked, disabled: !interactive }}
      onPress={() => onPress(habit.id)}
      style={styles.row}
    >
      <View
        style={[
          styles.icon,
          { borderColor: isMarked ? colors.v2Orange : colors.v2GreyOutline },
        ]}
      >
        {isMarked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <View style={styles.textColumn}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: nameColor }]}>{habit.name}</Text>
          {visual ? (
            <Text style={[styles.streak, { color: streakColor }]}>
              {visual.streakValue}
            </Text>
          ) : (
            <Text style={[styles.streak, { color: colors.v2GreyText }]}>–</Text>
          )}
        </View>
        {groupName ? <Text style={styles.groupName}>{groupName}</Text> : null}
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
  checkmark: {
    color: colors.v2Orange,
    fontSize: 13,
  },
  textColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontWeight: '600',
  },
  streak: {
    fontStyle: 'italic',
  },
  groupName: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
});
