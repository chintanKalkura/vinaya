import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { colors } from '../../theme';
import { getAppVersionName } from '../../storage/appInfo';
import { ACCOUNT_DELETION_URL, PRIVACY_POLICY_URL } from '../../config/links';
import MenuRow from './MenuRow';
import ScreenHeader from './ScreenHeader';

// Profile → About: docs/style-choices/profile/profile-menu.md
interface AboutScreenProps {
  onBack: () => void;
  // Injected for tests; the real pages come from src/config/links.ts
  privacyPolicyUrl?: string | null;
  accountDeletionUrl?: string | null;
}

export default function AboutScreen({
  onBack,
  privacyPolicyUrl = PRIVACY_POLICY_URL,
  accountDeletionUrl = ACCOUNT_DELETION_URL,
}: AboutScreenProps): React.JSX.Element {
  const [version, setVersion] = useState('');

  useEffect(() => {
    getAppVersionName().then(name => setVersion(name ?? ''));
  }, []);

  // A link opens only once its page is set; until then it shows and does nothing
  const open = (url: string | null) =>
    url ? () => Linking.openURL(url) : undefined;
  const linkIcon = <ExternalLink color={colors.v2GreyText} size={16} />;

  return (
    <View testID="about-screen" style={styles.screen}>
      <ScreenHeader title="About" onBack={onBack} testID="about" />
      <ScrollView contentContainerStyle={styles.content}>
        <MenuRow
          testID="about-version"
          label="Version"
          value={version}
          accessibilityRole="text"
        />
        <MenuRow
          testID="about-privacy"
          label="Privacy policy"
          accessibilityRole="link"
          onPress={open(privacyPolicyUrl)}
          right={linkIcon}
        />
        <MenuRow
          testID="about-deletion"
          label="Delete account data"
          accessibilityRole="link"
          onPress={open(accountDeletionUrl)}
          right={linkIcon}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  content: {
    paddingHorizontal: 16,
  },
});
