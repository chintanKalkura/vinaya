import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LayoutGrid, List, ListFilter } from 'lucide-react-native';
import { colors } from '../../theme';
import CadenceFilter, { CadenceFilterValue } from './CadenceFilter';

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
      {/* Title left, controls right on one line: docs/style-choices/header-and-bottom-menu.md */}
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
        accessibilityRole="button"
        accessibilityLabel="Sort and filter"
        onPress={onOpenSort}
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
