import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { StreakSummary } from '../../utils/history';
import Section from './Section';

// Current (in the completion colour while alive), best and previous
interface StreakStatsProps {
  streaks: StreakSummary;
  color: string;
}

export default function StreakStats({
  streaks,
  color,
}: StreakStatsProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const tiles = [
    { key: 'current', label: 'Current', value: streaks.current },
    { key: 'best', label: 'Best', value: streaks.best },
    { key: 'previous', label: 'Previous', value: streaks.previous },
  ];
  return (
    <Section title="STREAKS" testID="detail-streaks">
      <View style={styles.row}>
        {tiles.map(tile => (
          <View
            key={tile.key}
            accessible
            accessibilityLabel={`${tile.label} streak ${tile.value}`}
            style={styles.tile}
          >
            <Text
              testID={`detail-streak-${tile.key}`}
              style={[
                styles.value,
                tile.key === 'current' && {
                  color: tile.value > 0 ? color : colors.v2GreyText,
                },
              ]}
            >
              {tile.value}
            </Text>
            <Text style={styles.label}>{tile.label}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    tile: {
      flex: 1,
      borderRadius: 12,
      backgroundColor: colors.v2CardBackgroundInset,
      padding: 10,
      gap: 2,
    },
    value: {
      color: colors.v2White,
      fontSize: 26,
      fontWeight: '700',
      fontStyle: 'italic',
    },
    label: {
      color: colors.v2GreyText,
      fontSize: 12,
    },
  });
