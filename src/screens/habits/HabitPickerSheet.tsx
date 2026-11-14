import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

// Screens 12 (Assign Habits) and 14 (Select Required Habits).
// The selection is applied on Done; the backdrop or back discards it.
export interface PickerItem {
  id: string;
  name: string;
  disabled?: boolean; // greyed out, can't be picked
  locked?: boolean; // always selected, can't be removed
}

interface HabitPickerSheetProps {
  visible: boolean;
  title: string;
  subtitle: string;
  items: PickerItem[];
  selectedIds: string[];
  doneLabel: (count: number) => string;
  onDone: (selectedIds: string[]) => void;
  onClose: () => void;
  testID: string;
}

export default function HabitPickerSheet({
  visible,
  title,
  subtitle,
  items,
  selectedIds,
  doneLabel,
  onDone,
  onClose,
  testID,
}: HabitPickerSheetProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (visible) setSelection(selectedIds);
    // Only reset when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const toggle = (id: string) =>
    setSelection(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  // Keep the order of the list
  const ordered = items.map(i => i.id).filter(id => selection.includes(id));

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
        testID={`${testID}-backdrop`}
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        testID={testID}
        style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
          {items.map(item => {
            const selected = selection.includes(item.id);
            const disabled = Boolean(item.disabled || item.locked);
            return (
              <Pressable
                key={item.id}
                testID={`${testID}-item-${item.id}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                onPress={() => toggle(item.id)}
                style={[
                  styles.row,
                  selected && styles.rowSelected,
                  item.disabled && styles.rowDisabled,
                ]}
              >
                <View style={[styles.check, selected && styles.checkSelected]}>
                  {selected ? (
                    <Check
                      color={colors.v2Background}
                      size={13}
                      strokeWidth={3.5}
                    />
                  ) : null}
                </View>
                <Text
                  style={[styles.name, selected && styles.nameSelected]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          testID={`${testID}-done`}
          accessibilityRole="button"
          onPress={() => onDone(ordered)}
          style={styles.done}
        >
          <Text style={styles.doneLabel}>{doneLabel(ordered.length)}</Text>
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
    maxHeight: '75%',
    backgroundColor: colors.v2CardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
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
  subtitle: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  // Shrinks inside the sheet's max height so long lists scroll above Done
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  list: {
    gap: 8,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackgroundInset,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowSelected: {
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  rowDisabled: {
    opacity: 0.35,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.v2GreyText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Orange,
  },
  name: {
    flex: 1,
    color: colors.v2White,
    fontWeight: '600',
    fontSize: 15,
  },
  nameSelected: {
    color: colors.v2Orange,
  },
  done: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 17,
  },
});
