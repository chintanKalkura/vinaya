import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';
import { colors } from '../../theme';
import { clampHours } from '../../utils/hours';

interface HoursEntryModalProps {
  visible: boolean;
  habitName: string;
  initialHours: number;
  onDone: (hours: number) => void;
  onClose: () => void;
}

export default function HoursEntryModal({
  visible,
  habitName,
  initialHours,
  onDone,
  onClose,
}: HoursEntryModalProps): React.JSX.Element {
  const [hours, setHours] = useState(clampHours(initialHours));
  const [text, setText] = useState(String(clampHours(initialHours)));

  useEffect(() => {
    if (!visible) return;
    const value = clampHours(initialHours);
    setHours(value);
    setText(String(value));
  }, [visible, initialHours]);

  const update = (next: number) => {
    const value = clampHours(next);
    setHours(value);
    setText(String(value));
  };

  const handleChangeText = (input: string) => {
    const digits = input.replace(/[^0-9]/g, '');
    if (digits === '') {
      setHours(0);
      setText('');
      return;
    }
    update(Number(digits));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View testID="hours-modal" style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{habitName}</Text>
            <Pressable
              testID="hours-modal-close"
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              onPress={onClose}
            >
              <X color={colors.v2GreyText} size={20} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Hours logged today</Text>

          <View style={styles.stepperRow}>
            <Pressable
              testID="hours-modal-decrement"
              accessibilityRole="button"
              accessibilityLabel="Decrease hours"
              onPress={() => update(hours - 1)}
              style={styles.stepButton}
            >
              <Minus color={colors.v2White} size={22} strokeWidth={2.5} />
            </Pressable>
            <TextInput
              testID="hours-modal-input"
              value={text}
              onChangeText={handleChangeText}
              onBlur={() => setText(String(hours))}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={2}
              style={styles.input}
            />
            <Pressable
              testID="hours-modal-increment"
              accessibilityRole="button"
              accessibilityLabel="Increase hours"
              onPress={() => update(hours + 1)}
              style={styles.stepButton}
            >
              <Plus color={colors.v2White} size={22} strokeWidth={2.5} />
            </Pressable>
          </View>

          <Text style={styles.helper}>
            Default 0 · tap field to type a value
          </Text>

          <Pressable
            testID="hours-modal-done"
            accessibilityRole="button"
            onPress={() => onDone(hours)}
            style={styles.doneButton}
          >
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'rgba(10, 10, 25, 0.7)',
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.v2CardBackground,
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 18,
  },
  subtitle: {
    color: colors.v2GreyText,
    fontSize: 14,
    marginTop: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  stepButton: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
    backgroundColor: colors.v2Border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2Background,
    color: colors.v2Orange,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  helper: {
    color: colors.v2GreyText,
    fontSize: 12,
    marginTop: 12,
  },
  doneButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  doneLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 16,
  },
});
