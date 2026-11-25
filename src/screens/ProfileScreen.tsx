import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '../theme';
import { useThemedStyles } from '../theming';
import AccountSection from './profile/AccountSection';
import MenuRow from './profile/MenuRow';

// The account card, then the menu: docs/style-choices/profile/profile-menu.md
interface ProfileScreenProps {
  onDataChanged: () => void;
  onOpenAbout: () => void;
}

export default function ProfileScreen({
  onDataChanged,
  onOpenAbout,
}: ProfileScreenProps): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
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
        <View>
          {/* Display settings, Support the developer and How to use rows go
              in AccountSection's slot, above Sign out */}
          <AccountSection onDataChanged={onDataChanged} />
          <MenuRow
            testID="profile-about"
            label="About"
            chevron
            onPress={onOpenAbout}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
