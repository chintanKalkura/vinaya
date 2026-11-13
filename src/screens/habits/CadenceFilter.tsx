import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { HabitCadence } from '../../types/habit';
import { colors } from '../../theme';

// Design: docs/style-choices/cadence-filter.md
export type CadenceFilterValue = 'All' | HabitCadence;

const OPTIONS: CadenceFilterValue[] = ['All', 'Day', 'Week', 'Month', 'Year'];

interface CadenceFilterProps {
  value: CadenceFilterValue;
  onChange: (value: CadenceFilterValue) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

// Used until the trigger has been measured
const DEFAULT_POSITION: MenuPosition = { top: 64, left: 16 };

export default function CadenceFilter({
  value,
  onChange,
}: CadenceFilterProps): React.JSX.Element {
  const triggerRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const Chevron = isOpen ? ChevronUp : ChevronDown;

  const open = () => {
    setIsOpen(true);
    triggerRef.current?.measureInWindow((x, y, _width, height) =>
      setPosition({ top: y + height + 6, left: x }),
    );
  };

  const close = () => setIsOpen(false);

  const select = (option: CadenceFilterValue) => {
    close();
    onChange(option);
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        testID="cadence-filter"
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={open}
        style={styles.trigger}
      >
        <Text style={styles.triggerLabel}>{value}</Text>
        <Chevron
          testID={
            isOpen ? 'cadence-filter-chevron-up' : 'cadence-filter-chevron-down'
          }
          color={colors.v2Background}
          size={16}
          strokeWidth={2.5}
        />
      </Pressable>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          testID="cadence-filter-backdrop"
          style={StyleSheet.absoluteFill}
          onPress={close}
        />
        <View
          testID="cadence-filter-menu"
          style={[styles.menu, { top: position.top, left: position.left }]}
        >
          {OPTIONS.map(option => {
            const selected = option === value;
            const color = selected ? colors.v2Orange : colors.v2GreyText;
            return (
              <Pressable
                key={option}
                testID={`cadence-option-${option}`}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                onPress={() => select(option)}
                style={styles.option}
              >
                <View style={styles.checkSlot}>
                  {selected ? (
                    <Check color={color} size={16} strokeWidth={3} />
                  ) : null}
                </View>
                <Text style={[styles.optionLabel, { color }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.v2Orange,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  triggerLabel: {
    color: colors.v2Background,
    fontWeight: '700',
  },
  menu: {
    position: 'absolute',
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.v2Border,
    backgroundColor: colors.v2CardBackground,
    paddingVertical: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checkSlot: {
    width: 22,
  },
  optionLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
});
