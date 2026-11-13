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
  const { interactive, visual } = useHabitVisual(habit, todayKey);
  const isMarked = visual?.habitColorState === 'marked';
  const scheme = getColorScheme('pill', isMarked);

  return (
    <Pressable
      testID={`habit-pill-${habit.id}`}
      disabled={!interactive}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isMarked, disabled: !interactive }}
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
      {visual ? (
        <Text style={[styles.streak, { color: scheme.numberColor }]}>
          {visual.streakValue}
        </Text>
      ) : (
        <Text style={[styles.streak, { color: colors.v2GreyText }]}>–</Text>
      )}
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
