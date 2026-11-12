import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FilePen,
  ListChecks,
  TrendingUp,
  CircleUser,
} from 'lucide-react-native';
import { colors } from '../../theme';

const ITEMS = [
  { label: 'Habits', Icon: ListChecks },
  { label: 'Journal', Icon: FilePen },
  { label: 'Level-Up', Icon: TrendingUp },
  { label: 'Profile', Icon: CircleUser },
];
const SELECTED = 'Habits';

export default function BottomMenu(): React.JSX.Element {
  return (
    <View style={styles.bar}>
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
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: colors.v2CardBackground,
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 16,
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
