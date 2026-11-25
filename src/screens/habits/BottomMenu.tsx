import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FilePen,
  ListChecks,
  TrendingUp,
  CircleUser,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

// Route names in App.tsx's tab navigator
export type Tab = 'Habits' | 'Journal' | 'Level-Up' | 'Profile';

const ITEMS: { label: Tab; Icon: typeof ListChecks }[] = [
  { label: 'Habits', Icon: ListChecks },
  { label: 'Journal', Icon: FilePen },
  { label: 'Level-Up', Icon: TrendingUp },
  { label: 'Profile', Icon: CircleUser },
];

// The tab bar: flush with the screen's bottom edge, padded by the bottom inset
// so it clears the gesture or 3-button bar. Screens sit above it, so it grows
// with the font size without covering anything:
// docs/style-choices/habits-section/header-and-bottom-menu.md

interface BottomMenuProps {
  selected?: Tab;
  onSelect?: (tab: Tab) => void;
}

export default function BottomMenu({
  selected = 'Habits',
  onSelect,
}: BottomMenuProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="bottom-menu"
      style={[styles.bar, { paddingBottom: 10 + insets.bottom }]}
    >
      {ITEMS.map(item => {
        const isSelected = item.label === selected;
        const color = isSelected ? colors.v2Orange : colors.v2White;
        return (
          <Pressable
            key={item.label}
            testID={`bottom-menu-${item.label}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect?.(item.label)}
            style={styles.item}
          >
            <item.Icon color={color} size={22} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    backgroundColor: colors.v2MenuBackground,
    borderTopWidth: 1,
    borderTopColor: colors.v2MenuBorder,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
