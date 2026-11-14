import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

// Bar with a short "4/8h" label at its right end: docs/style-choices/habits-section/hours-progress.md
interface HoursProgressProps {
  total: number;
  target: number;
  testID: string;
  color?: string; // fill colour; icy blue on the day a freeze is used
}

export default function HoursProgress({
  total,
  target,
  testID,
  color = colors.v2Orange,
}: HoursProgressProps): React.JSX.Element {
  const progress = target > 0 ? Math.min(total / target, 1) : 0;

  return (
    <View style={styles.row}>
      <View style={styles.track}>
        <View
          testID={testID}
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.label}>{`${total}/${target}h`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.v2Border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  label: {
    color: colors.v2GreyText,
    fontSize: 12,
    marginLeft: 8,
  },
});
