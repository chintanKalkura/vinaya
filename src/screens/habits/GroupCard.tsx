import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { ChartNoAxesColumnIncreasing, Snowflake } from 'lucide-react-native';
import { colors } from '../../theme';
import { getGroupStatus } from '../../services/habitGroupService';
import { getHoursToday } from '../../utils/hours';
import { getColorScheme } from './colorRules';
import HabitListRow from './HabitListRow';
import HabitPill from './HabitPill';
import HoursProgress from './HoursProgress';
import CadenceLabel, { CADENCE_LABEL_SPACE } from './CadenceLabel';
import FreezeLabel from './FreezeLabel';
import BannerMenu from './BannerMenu';

interface GroupCardProps {
  group: HabitGroup;
  habits: Habit[];
  todayKey: string;
  onToggle: (habitId: string) => void;
  onDelete?: (groupId: string) => void;
}

export default function GroupCard({
  group,
  habits,
  todayKey,
  onToggle,
  onDelete,
}: GroupCardProps): React.JSX.Element {
  const isRequiredGroup = group.groupType === 'Required';
  const isHoursGroup = group.groupType === 'Hours';
  const status = getGroupStatus(group, todayKey);
  const scheme = getColorScheme(
    'banner',
    status.complete,
    status.markedToday,
    status.frozenToday,
  );
  const hoursTotal = habits.reduce(
    (sum, habit) => sum + getHoursToday(habit, todayKey),
    0,
  );
  const hoursTarget = group.targetHours ?? 0;

  return (
    <View
      testID={`group-card-${group.id}`}
      style={[styles.card, scheme.container]}
    >
      <View style={styles.header}>
        {scheme.iconFrozen ? (
          <Snowflake
            testID={`group-frozen-${group.id}`}
            style={styles.frozenIcon}
            color={scheme.iconColor}
            size={isHoursGroup ? 26 : 22}
            strokeWidth={2.5}
          />
        ) : isHoursGroup ? (
          <View
            testID={`group-hours-icon-${group.id}`}
            style={styles.hoursIcon}
          >
            <ChartNoAxesColumnIncreasing
              color={scheme.iconColor}
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
              { borderColor: scheme.iconColor },
            ]}
          >
            {scheme.iconFilled ? (
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
        <Text style={[styles.title, { color: scheme.titleColor }]}>
          {group.name}
        </Text>
        <Text
          testID={`group-number-${group.id}`}
          style={[styles.number, { color: scheme.numberColor }]}
        >
          {status.streak}
        </Text>
        {onDelete ? (
          <BannerMenu
            kind="group"
            onDelete={() => onDelete(group.id)}
            testID={`group-menu-${group.id}`}
          />
        ) : null}
      </View>
      {isHoursGroup ? (
        <View style={styles.hoursProgress}>
          <HoursProgress
            total={hoursTotal}
            target={hoursTarget}
            testID={`group-progress-${group.id}`}
            color={scheme.barColor}
          />
        </View>
      ) : null}
      {isHoursGroup ? (
        <View style={styles.hoursGrid}>
          {habits.map(habit => (
            <View
              key={habit.id}
              testID={`group-hours-cell-${habit.id}`}
              style={styles.hoursCell}
            >
              <HabitListRow
                habit={habit}
                todayKey={todayKey}
                onPress={onToggle}
                colorKind="pill"
              />
            </View>
          ))}
        </View>
      ) : (
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
      )}
      {scheme.frozen ? (
        <FreezeLabel
          freezesLeft={status.freezesLeft}
          testID={`group-freeze-${group.id}`}
        />
      ) : null}
      <CadenceLabel
        cadence={group.cadence}
        testID={`group-cadence-${group.id}`}
      />
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
    paddingBottom: 14 + CADENCE_LABEL_SPACE,
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
  frozenIcon: {
    marginRight: 10,
  },
  hoursIcon: {
    marginRight: 10,
  },
  hoursProgress: {
    marginBottom: 12,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  hoursCell: {
    width: '48.5%',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
