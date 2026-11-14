import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, CircleDot, LayoutGrid } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

// Screen 05: what to add from the + button
interface CreateChoiceSheetProps {
  visible: boolean;
  onNewHabit: () => void;
  onClose: () => void;
}

export default function CreateChoiceSheet({
  visible,
  onNewHabit,
  onClose,
}: CreateChoiceSheetProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const options = [
    {
      key: 'habit',
      title: 'New Habit',
      subtitle: 'Track a single behaviour',
      Icon: CircleDot,
      onPress: onNewHabit,
    },
    {
      // Group creation is not built yet; tapping does nothing
      key: 'group',
      title: 'New Habit Group',
      subtitle: 'Combine habits under one goal',
      Icon: LayoutGrid,
      onPress: () => {},
    },
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
        testID="choice-sheet-backdrop"
        style={styles.backdrop}
        onPress={onClose}
      />
      <View
        testID="choice-sheet"
        style={[styles.sheet, { paddingBottom: 28 + insets.bottom }]}
      >
        <Text style={styles.title}>What would you like to add?</Text>
        {options.map(option => (
          <Pressable
            key={option.key}
            testID={`choice-sheet-${option.key}`}
            accessibilityRole="button"
            onPress={option.onPress}
            style={styles.option}
          >
            <option.Icon color={colors.v2Orange} size={22} strokeWidth={2} />
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <ChevronRight color={colors.v2GreyText} size={18} />
          </Pressable>
        ))}
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
    padding: 18,
    gap: 12,
  },
  title: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 14,
    backgroundColor: colors.v2CardBackgroundInset,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 16,
  },
  optionSubtitle: {
    color: colors.v2GreyText,
    fontSize: 13,
    marginTop: 2,
  },
});
