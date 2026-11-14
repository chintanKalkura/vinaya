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

const ITEMS = [
  { label: 'Habits', Icon: ListChecks },
  { label: 'Journal', Icon: FilePen },
  { label: 'Level-Up', Icon: TrendingUp },
  { label: 'Profile', Icon: CircleUser },
];
const SELECTED = 'Habits';

// Flush with the screen's bottom edge, padded by the bottom inset so it clears
// the gesture or 3-button bar: docs/style-choices/habits-section/header-and-bottom-menu.md
export const BOTTOM_MENU_HEIGHT = 60;

export default function BottomMenu(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="bottom-menu"
      style={[styles.bar, { paddingBottom: 10 + insets.bottom }]}
    >
      {ITEMS.map(item => {
        const color =
          item.label === SELECTED ? colors.v2Orange : colors.v2White;
        return (
          <Pressable
            key={item.label}
            testID={`bottom-menu-${item.label}`}
            onPress={() => {}}
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
