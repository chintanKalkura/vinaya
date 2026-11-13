import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { Check } from 'lucide-react-native';
import { colors } from '../../theme';
import { useHabitVisual } from './useHabitVisual';
import { getColorScheme } from './colorRules';

interface HabitPillProps {
  habit: Habit;
  todayKey: string;
  onPress: (habitId: string) => void;
  required?: boolean;
  shape?: 'round' | 'square';
}

export default function HabitPill({
  habit,
  todayKey,
  onPress,
  required = false,
  shape = 'round',
}: HabitPillProps): React.JSX.Element {
  const { status } = useHabitVisual(habit, todayKey);
  const scheme = getColorScheme('pill', status.complete, status.markedToday);

  return (
    <Pressable
      testID={`habit-pill-${habit.id}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: status.markedToday }}
      onPress={() => onPress(habit.id)}
      style={[
        styles.pill,
        { borderColor: required ? colors.v2Blue : colors.v2Border },
      ]}
    >
      <View
        style={[
          styles.icon,
          shape === 'square' && styles.iconSquare,
          {
            borderColor: scheme.iconColor,
            backgroundColor: scheme.iconFilled ? scheme.iconColor : undefined,
          },
        ]}
      >
        {scheme.iconFilled ? (
          <Check color={colors.v2Background} size={12} strokeWidth={3.5} />
        ) : null}
      </View>
      <Text style={[styles.name, { color: scheme.titleColor }]}>
        {habit.name}
      </Text>
      <Text style={[styles.streak, { color: scheme.numberColor }]}>
        {status.streak}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.v2CardBackgroundInset,
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconSquare: {
    borderRadius: 3,
  },
  name: {
    fontWeight: '600',
    marginRight: 8,
  },
  streak: {
    fontStyle: 'italic',
  },
});
