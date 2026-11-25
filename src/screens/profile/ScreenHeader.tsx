import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import TouchTarget from '../habits/TouchTarget';

// Back arrow and title for screens opened from Profile, in the form screens' style
interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  testID: string;
}

export default function ScreenHeader({
  title,
  onBack,
  testID,
}: ScreenHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <TouchTarget
        testID={`${testID}-back`}
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={styles.back}
      >
        <ChevronLeft color={colors.v2White} size={26} />
      </TouchTarget>
      <Text style={styles.heading}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  back: {
    marginRight: 0,
  },
  heading: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 22,
  },
});
