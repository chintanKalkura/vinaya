import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {HabitDefinition, HabitState, CompositeRule} from '../types';
import {getEffectiveHabitState, getSubHabitHours, getHoursSum} from '../utils/habits';
import {colors, fonts} from '../theme';
import {sectionTitle} from '../styles/shared';

interface Props {
  habits: HabitDefinition[];
  habitStates: Record<string, HabitState>;
  allLogs: Record<string, Record<string, HabitState>>;
  onToggle: (habitId: string) => void;
  onLongPress?: (habitId: string) => void;
  readOnly?: boolean;
}

export type ParentIndicatorState = 'none' | 'partial' | 'done';

function getDoneCount(
  habit: HabitDefinition,
  allLogs: Record<string, Record<string, HabitState>>,
): number {
  return Object.values(allLogs).filter(
    dayStates => getEffectiveHabitState(habit, dayStates) === 'done',
  ).length;
}

function getSubHabitActiveDays(
  subHabitId: string,
  allLogs: Record<string, Record<string, HabitState>>,
  isHours: boolean,
): number {
  return Object.values(allLogs).filter(dayStates => {
    const state = dayStates[subHabitId];
    if (isHours) return typeof state === 'number' && state > 0;
    return state === 'done';
  }).length;
}

export function getParentIndicatorState(
  habit: HabitDefinition,
  habitStates: Record<string, HabitState>,
): ParentIndicatorState {
  if (getEffectiveHabitState(habit, habitStates) === 'done') return 'done';

  if (habit.compositeRule?.type === 'hours') {
    return getHoursSum(habit, habitStates) > 0 ? 'partial' : 'none';
  }

  const anySubDone = habit.subHabits!.some(sub => habitStates[sub.id] === 'done');
  return anySubDone ? 'partial' : 'none';
}

function ParentIndicator({state}: {state: ParentIndicatorState}) {
  if (state === 'done') {
    return (
      <View style={styles.parentDone}>
        <Text style={styles.parentDoneMark}>✓</Text>
      </View>
    );
  }
  if (state === 'partial') {
    return (
      <View style={styles.parentWrap}>
        <View style={styles.parentPartialClip}>
          <View style={styles.parentPartialFill} />
        </View>
        <View style={styles.parentRingAccent} />
      </View>
    );
  }
  return <View style={styles.parentRing} />;
}

function SubHabitIndicator({rule, done}: {rule: CompositeRule; done: boolean}) {
  if (rule.type === 'required') {
    return (
      <View style={[styles.subRadio, done && styles.subRadioDone]}>
        {done && <View style={styles.subRadioDot} />}
      </View>
    );
  }
  return (
    <View
      style={[
        styles.subCheck,
        rule.type === 'any' && styles.subCheckSquare,
        done && styles.subCheckDone,
      ]}>
      {done && <Text style={styles.subCheckMark}>✓</Text>}
    </View>
  );
}

function HoursIndicator({hours, active}: {hours: number; active: boolean}) {
  return (
    <View style={[styles.hoursBox, active && styles.hoursBoxActive]}>
      <Text style={[styles.hoursText, active && styles.hoursTextActive]}>
        {hours}
      </Text>
    </View>
  );
}

export default function HabitsSection({
  habits,
  habitStates,
  allLogs,
  onToggle,
  onLongPress,
  readOnly = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Habits</Text>
      {habits.map(habit => {
        const isComposite = !!(habit.subHabits && habit.compositeRule);
        const isHoursRule = habit.compositeRule?.type === 'hours';
        const state = getEffectiveHabitState(habit, habitStates);
        const done = getDoneCount(habit, allLogs);
        const rule = habit.compositeRule;

        return (
          <View key={habit.id}>
            {isComposite ? (
              <View style={[styles.row, habit.isKeystone && styles.keystoneRow]}>
                <ParentIndicator
                  state={getParentIndicatorState(habit, habitStates)}
                />
                <Text
                  style={[
                    styles.name,
                    habit.isKeystone && styles.keystoneName,
                    state === 'done' && styles.nameDone,
                  ]}>
                  {habit.isKeystone ? '★ ' : ''}
                  {habit.name}
                </Text>
                <Text style={styles.count}>
                  {done}/{habit.maxCount}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => !readOnly && onToggle(habit.id)}
                style={[styles.row, habit.isKeystone && styles.keystoneRow]}>
                <View style={[styles.check, state === 'done' && styles.checkDone]}>
                  {state === 'done' && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.name,
                    habit.isKeystone && styles.keystoneName,
                    state === 'done' && styles.nameDone,
                  ]}>
                  {habit.isKeystone ? '★ ' : ''}
                  {habit.name}
                </Text>
                <Text style={[styles.count, state === 'done' && styles.countDone]}>
                  {done}/{habit.maxCount}
                </Text>
              </Pressable>
            )}
            {isComposite && (
              <View style={styles.chipsRow}>
                {habit.subHabits!.map(sub => {
                  const subState = habitStates[sub.id] ?? 'none';
                  const subDone = getSubHabitActiveDays(sub.id, allLogs, isHoursRule);
                  const isRequired =
                    rule?.type === 'required' && rule.ids.includes(sub.id);

                  if (isHoursRule) {
                    const hours = getSubHabitHours(subState);
                    const active = hours > 0;
                    return (
                      <Pressable
                        key={sub.id}
                        onPress={() => !readOnly && onToggle(sub.id)}
                        onLongPress={() => !readOnly && onLongPress?.(sub.id)}
                        style={[styles.chip, active && styles.chipDone]}>
                        <HoursIndicator hours={hours} active={active} />
                        <Text style={[styles.chipName, active && styles.chipNameDone]}>
                          {sub.name}
                        </Text>
                        <Text style={[styles.chipCount, active && styles.chipCountDone]}>
                          {subDone}d
                        </Text>
                      </Pressable>
                    );
                  }

                  const isDone = subState === 'done';
                  return (
                    <Pressable
                      key={sub.id}
                      onPress={() => !readOnly && onToggle(sub.id)}
                      style={[styles.chip, isDone && styles.chipDone]}>
                      <SubHabitIndicator rule={rule!} done={isDone} />
                      <Text style={[styles.chipName, isDone && styles.chipNameDone]}>
                        {isRequired ? '★ ' : ''}
                        {sub.name}
                      </Text>
                      <Text
                        style={[styles.chipCount, isDone && styles.chipCountDone]}>
                        {subDone}d
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const INDICATOR_SIZE = 16;
const SUB_INDICATOR_SIZE = 12;
const CHIP_DONE_BG = 'rgba(74,124,89,0.08)';

const styles = StyleSheet.create({
  container: {marginBottom: 28},
  sectionTitle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  keystoneRow: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 10,
  },
  // Standalone habit checkbox
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkDone: {backgroundColor: colors.done, borderColor: colors.done},
  checkMark: {fontSize: 10, color: '#fff'},
  name: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  keystoneName: {fontFamily: fonts.bodyMedium},
  nameDone: {color: colors.done},
  count: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.muted,
    minWidth: 36,
    textAlign: 'right',
  },
  countDone: {color: colors.done},
  // Parent indicator — none state (empty ring)
  parentRing: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.muted,
    flexShrink: 0,
  },
  // Parent indicator — partial state (half-filled ring)
  parentWrap: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    flexShrink: 0,
  },
  parentPartialClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: INDICATOR_SIZE / 2,
    height: INDICATOR_SIZE,
    overflow: 'hidden',
  },
  parentPartialFill: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: colors.accent,
  },
  parentRingAccent: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  // Parent indicator — done state (filled green with ✓)
  parentDone: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: colors.done,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  parentDoneMark: {fontSize: 9, color: '#fff'},
  // Chips row
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
    paddingBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipDone: {
    borderColor: colors.done,
    backgroundColor: CHIP_DONE_BG,
  },
  chipName: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
  },
  chipNameDone: {color: colors.done},
  chipCount: {
    fontFamily: fonts.bodyItalic,
    fontSize: 11,
    color: colors.muted,
  },
  chipCountDone: {color: colors.done},
  // Sub-habit indicator — square (any rule)
  subCheck: {
    width: SUB_INDICATOR_SIZE,
    height: SUB_INDICATOR_SIZE,
    borderRadius: SUB_INDICATOR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subCheckSquare: {borderRadius: 2},
  subCheckDone: {backgroundColor: colors.done, borderColor: colors.done},
  subCheckMark: {fontSize: 7, color: '#fff'},
  // Sub-habit indicator — radio (required rule)
  subRadio: {
    width: SUB_INDICATOR_SIZE,
    height: SUB_INDICATOR_SIZE,
    borderRadius: SUB_INDICATOR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subRadioDone: {borderColor: colors.done},
  subRadioDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.done,
  },
  // Hours indicator badge
  hoursBox: {
    width: SUB_INDICATOR_SIZE,
    height: SUB_INDICATOR_SIZE,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hoursBoxActive: {borderColor: colors.done},
  hoursText: {
    fontSize: 7,
    fontFamily: fonts.bodyMedium,
    color: colors.muted,
    lineHeight: 10,
  },
  hoursTextActive: {color: colors.done},
});
