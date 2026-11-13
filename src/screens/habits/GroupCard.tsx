import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { ChartNoAxesColumnIncreasing } from 'lucide-react-native';
import { colors } from '../../theme';
import { getGroupStreak } from '../../services/habitGroupService';
import { getHoursToday } from '../../utils/hours';
import HabitPill from './HabitPill';

interface GroupCardProps {
  group: HabitGroup;
  habits: Habit[];
  todayKey: string;
  complete: boolean;
  onToggle: (habitId: string) => void;
}

export default function GroupCard({
  group,
  habits,
  todayKey,
  complete,
  onToggle,
}: GroupCardProps): React.JSX.Element {
  const isRequiredGroup = group.groupType === 'Required';
  const isHoursGroup = group.groupType === 'Hours';
  const accent = complete ? colors.v2Orange : colors.v2GreyText;
  const hoursTotal = habits.reduce(
    (sum, habit) => sum + getHoursToday(habit, todayKey),
    0,
  );
  const hoursTarget = group.targetHours ?? 0;
  const progress = hoursTarget > 0 ? Math.min(hoursTotal / hoursTarget, 1) : 0;

  return (
    <View
      testID={`group-card-${group.id}`}
      style={[styles.card, complete && styles.cardComplete]}
    >
      <View style={styles.header}>
        {isHoursGroup ? (
          <View
            testID={`group-hours-icon-${group.id}`}
            style={styles.hoursIcon}
          >
            <ChartNoAxesColumnIncreasing
              color={complete ? colors.v2Orange : colors.v2White}
              size={26}
              strokeWidth={3}
            />
          </View>
        ) : (
          <View
            testID={`group-selector-${group.id}`}
            style={[
              styles.selector,
              isRequiredGroup ? styles.selectorRound : styles.selectorSquare,
              { borderColor: complete ? colors.v2Orange : colors.v2White },
            ]}
          >
            {complete ? (
              <View
                style={[
                  styles.selectorFill,
                  isRequiredGroup
                    ? styles.selectorFillRound
                    : styles.selectorFillSquare,
                ]}
              />
            ) : null}
          </View>
        )}
        <Text style={styles.title}>{group.name}</Text>
        <Text
          testID={`group-number-${group.id}`}
          style={[styles.number, { color: accent }]}
        >
          {getGroupStreak(group, todayKey)}
        </Text>
      </View>
      {isHoursGroup ? (
        <View style={styles.hoursProgress}>
          <View style={styles.progressTrack}>
            <View
              testID={`group-progress-${group.id}`}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressCaption}>
            {`${hoursTotal} / ${hoursTarget} hrs today`}
          </Text>
        </View>
      ) : null}
      <View style={styles.pillRow}>
        {habits.map(habit => (
          <HabitPill
            key={habit.id}
            habit={habit}
            todayKey={todayKey}
            onPress={onToggle}
            required={group.requiredHabitIds?.includes(habit.id) ?? false}
            shape={isRequiredGroup ? 'round' : 'square'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 16,
    backgroundColor: colors.v2CardBackground,
    padding: 14,
  },
  cardComplete: {
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selector: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectorRound: {
    borderRadius: 11,
  },
  selectorSquare: {
    borderRadius: 3,
  },
  selectorFill: {
    backgroundColor: colors.v2Orange,
  },
  selectorFillRound: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  selectorFillSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  title: {
    flex: 1,
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 24,
  },
  number: {
    fontWeight: '700',
    fontSize: 32,
  },
  hoursIcon: {
    marginRight: 10,
  },
  hoursProgress: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.v2Border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.v2Orange,
  },
  progressCaption: {
    color: colors.v2GreyText,
    fontSize: 13,
    marginTop: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
