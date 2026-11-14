import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme';

// Bottom-centre "n freezes left" on frozen banners: docs/style-choices/habits-section/streak-freeze.md
interface FreezeLabelProps {
  freezesLeft: number;
  testID: string;
}

export function freezesLeftText(freezesLeft: number): string {
  return `${freezesLeft} ${freezesLeft === 1 ? 'freeze' : 'freezes'} left`;
}

export default function FreezeLabel({
  freezesLeft,
  testID,
}: FreezeLabelProps): React.JSX.Element {
  return (
    <Text testID={testID} pointerEvents="none" style={styles.label}>
      {freezesLeftText(freezesLeft)}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 7,
    textAlign: 'center',
    color: colors.v2Ice,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
