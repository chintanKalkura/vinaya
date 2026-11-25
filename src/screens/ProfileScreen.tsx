import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import AccountSection from './profile/AccountSection';

// Only Account & backup for now; the other sections come with profile-tab.md
interface ProfileScreenProps {
  onDataChanged: () => void;
}

export default function ProfileScreen({
  onDataChanged,
}: ProfileScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="profile-screen"
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <Text testID="profile-title" style={styles.title}>
        Vinaya - Profile
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        <AccountSection onDataChanged={onDataChanged} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  // Same title look as the Habits header
  title: {
    color: colors.v2White,
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 16,
    gap: 12,
  },
});
