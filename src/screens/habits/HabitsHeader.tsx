import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HabitCadence } from '../../types/habit';
import { LayoutGrid, List, ListFilter } from 'lucide-react-native';
import { colors } from '../../theme';

const CADENCES: HabitCadence[] = ['Day', 'Week', 'Month', 'Year'];
const SELECTED_CADENCE: HabitCadence = 'Day';

export type HabitsViewMode = 'group' | 'list';

interface HabitsHeaderProps {
  viewMode: HabitsViewMode;
  onChangeViewMode: (mode: HabitsViewMode) => void;
}

export default function HabitsHeader({
  viewMode,
  onChangeViewMode,
}: HabitsHeaderProps): React.JSX.Element {
  const isGroup = viewMode === 'group';

  return (
    <View style={styles.row}>
      <View style={styles.cadenceGroup}>
        {CADENCES.map(cadence => (
          <Pressable
            key={cadence}
            testID={`cadence-pill-${cadence}`}
            onPress={() => {}}
            style={[
              styles.cadencePill,
              cadence === SELECTED_CADENCE && styles.cadencePillActive,
            ]}
          >
            <Text
              style={[
                styles.cadenceLabel,
                cadence === SELECTED_CADENCE && styles.cadenceLabelActive,
              ]}
            >
              {cadence}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.toggleGroup}>
        <Pressable
          testID="view-mode-toggle-group"
          accessibilityRole="button"
          accessibilityState={{ selected: isGroup }}
          onPress={() => onChangeViewMode('group')}
          style={[styles.toggleButton, isGroup && styles.toggleButtonActive]}
        >
          <LayoutGrid
            color={isGroup ? colors.v2Background : colors.v2GreyText}
            size={18}
          />
        </Pressable>
        <Pressable
          testID="view-mode-toggle-list"
          accessibilityRole="button"
          accessibilityState={{ selected: !isGroup }}
          onPress={() => onChangeViewMode('list')}
          style={[styles.toggleButton, !isGroup && styles.toggleButtonActive]}
        >
          <List
            color={isGroup ? colors.v2GreyText : colors.v2Background}
            size={18}
          />
        </Pressable>
      </View>
      <Pressable
        testID="sort-button"
        onPress={() => {}}
        style={styles.sortButton}
      >
        <ListFilter color={colors.v2White} size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  cadenceGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.v2CardBackground,
    borderRadius: 18,
    padding: 3,
  },
  cadencePill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 16,
  },
  cadencePillActive: {
    backgroundColor: colors.v2Orange,
  },
  cadenceLabel: {
    color: colors.v2GreyText,
    fontWeight: '600',
  },
  cadenceLabelActive: {
    color: colors.v2Background,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.v2CardBackground,
    borderRadius: 10,
    padding: 3,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.v2Orange,
  },
  sortButton: {
    backgroundColor: colors.v2CardBackground,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
});
