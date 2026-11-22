import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LayoutGrid, List, ListFilter } from 'lucide-react-native';
import { colors } from '../../theme';
import CadenceFilter, { CadenceFilterValue } from './CadenceFilter';
import TouchTarget from './TouchTarget';

export type HabitsViewMode = 'group' | 'list';

interface HabitsHeaderProps {
  cadenceFilter: CadenceFilterValue;
  onChangeCadenceFilter: (value: CadenceFilterValue) => void;
  viewMode: HabitsViewMode;
  onChangeViewMode: (mode: HabitsViewMode) => void;
  onOpenSort: () => void;
}

export default function HabitsHeader({
  cadenceFilter,
  onChangeCadenceFilter,
  viewMode,
  onChangeViewMode,
  onOpenSort,
}: HabitsHeaderProps): React.JSX.Element {
  const isGroup = viewMode === 'group';

  return (
    <View style={styles.row}>
      {/* Title left, controls right on one line: docs/style-choices/habits-section/header-and-bottom-menu.md */}
      <Text
        testID="habits-title"
        style={styles.title}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        Vinaya - Habits
      </Text>
      <CadenceFilter value={cadenceFilter} onChange={onChangeCadenceFilter} />
      {/* The group's background is drawn behind 48dp targets, so it keeps its size */}
      <View style={styles.toggleGroup}>
        <View style={styles.toggleBackground} />
        <TouchTarget
          testID="view-mode-toggle-group"
          accessibilityRole="button"
          accessibilityLabel="Group view"
          accessibilityState={{ selected: isGroup }}
          onPress={() => onChangeViewMode('group')}
          style={styles.toggleTarget}
        >
          <View
            style={[styles.toggleButton, isGroup && styles.toggleButtonActive]}
          >
            <LayoutGrid
              color={isGroup ? colors.v2Background : colors.v2GreyText}
              size={18}
            />
          </View>
        </TouchTarget>
        <TouchTarget
          testID="view-mode-toggle-list"
          accessibilityRole="button"
          accessibilityLabel="List view"
          accessibilityState={{ selected: !isGroup }}
          onPress={() => onChangeViewMode('list')}
          style={styles.toggleTarget}
        >
          <View
            style={[styles.toggleButton, !isGroup && styles.toggleButtonActive]}
          >
            <List
              color={isGroup ? colors.v2GreyText : colors.v2Background}
              size={18}
            />
          </View>
        </TouchTarget>
      </View>
      <TouchTarget
        testID="sort-button"
        accessibilityRole="button"
        accessibilityLabel="Sort and filter"
        onPress={onOpenSort}
        style={styles.sortTarget}
      >
        <View style={styles.sortButton}>
          <ListFilter color={colors.v2White} size={18} />
        </View>
      </TouchTarget>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    // 48dp targets fill the vertical padding, so the header keeps its height
    paddingTop: 8,
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.v2White,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 20,
  },
  toggleGroup: {
    flexDirection: 'row',
    paddingHorizontal: 3,
  },
  toggleBackground: {
    ...StyleSheet.absoluteFillObject,
    top: 8,
    bottom: 8,
    backgroundColor: colors.v2CardBackground,
    borderRadius: 10,
  },
  // Each target overlaps its neighbour so the pair stays as wide as before
  toggleTarget: {
    marginHorizontal: -7,
  },
  sortTarget: {
    marginHorizontal: -5,
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
