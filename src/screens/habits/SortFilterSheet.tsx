import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { SORT_KEYS, SortFilterState, SortKey } from '../../utils/sortFilter';

// Screen 03: docs/feature-development/sort-filter-delete-habit.md.
// Choices apply on Apply; the backdrop or back discards them.
interface SortFilterSheetProps {
  visible: boolean;
  value: SortFilterState;
  onApply: (value: SortFilterState) => void;
  onClose: () => void;
}

interface ShowOption {
  key: 'Completed' | 'Active' | 'Paused' | 'Archived';
  selected: boolean;
  disabled: boolean; // Active is locked on; Paused and Archived aren't built yet
  onPress?: () => void;
}

export default function SortFilterSheet({
  visible,
  value,
  onApply,
  onClose,
}: SortFilterSheetProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<SortFilterState>(value);

  useEffect(() => {
    if (visible) setDraft(value);
    // Only reset when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Tapping the selected chip again returns to the default, oldest first
  const toggleSort = (sort: SortKey) =>
    setDraft(prev => ({
      ...prev,
      sort: prev.sort === sort ? undefined : sort,
    }));

  const showOptions: ShowOption[] = [
    {
      key: 'Completed',
      selected: draft.completedOnly,
      disabled: false,
      onPress: () =>
        setDraft(prev => ({ ...prev, completedOnly: !prev.completedOnly })),
    },
    { key: 'Active', selected: true, disabled: true },
    { key: 'Paused', selected: false, disabled: true },
    { key: 'Archived', selected: false, disabled: true },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        testID="sort-sheet-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        testID="sort-sheet"
        style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Sort & Filter</Text>

        <Text style={styles.label}>SORT BY</Text>
        <View style={styles.chips}>
          {SORT_KEYS.map(sort => {
            const selected = draft.sort === sort;
            return (
              <Pressable
                key={sort}
                testID={`sort-option-${sort}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => toggleSort(sort)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    selected && styles.chipLabelSelected,
                  ]}
                >
                  {sort}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>SHOW</Text>
        <View style={styles.grid}>
          {showOptions.map(option => (
            <Pressable
              key={option.key}
              testID={`show-option-${option.key}`}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: option.selected,
                disabled: option.disabled,
              }}
              disabled={option.disabled}
              onPress={option.onPress}
              style={[
                styles.show,
                option.selected && styles.showSelected,
                option.disabled && !option.selected && styles.showDisabled,
              ]}
            >
              <View
                style={[styles.dot, option.selected && styles.dotSelected]}
              />
              <Text style={styles.showLabel}>{option.key}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="sort-sheet-apply"
          accessibilityRole="button"
          onPress={() => onApply(draft)}
          style={styles.apply}
        >
          <Text style={styles.applyLabel}>Apply</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 12, 0.85)',
  },
  sheet: {
    backgroundColor: colors.v2CardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.v2GreyOutline,
    marginBottom: 12,
  },
  title: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 18,
  },
  label: {
    color: colors.v2GreyText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
    borderRadius: 18,
    backgroundColor: colors.v2Border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipSelected: {
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Orange,
  },
  chipLabel: {
    color: colors.v2White,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.v2Background,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  show: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 10,
    backgroundColor: colors.v2CardBackgroundInset,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  showSelected: {
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  showDisabled: {
    opacity: 0.35,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.v2GreyText,
  },
  dotSelected: {
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Orange,
  },
  showLabel: {
    color: colors.v2White,
    fontWeight: '600',
  },
  apply: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  applyLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 17,
  },
});
