import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { HELP_TOPICS, SHOW_WALKTHROUGH_AGAIN } from '../../content/howToUse';
import ScreenHeader from '../profile/ScreenHeader';

// Profile → How to use: docs/style-choices/how-to-use/walkthrough-and-help.md
interface HelpScreenProps {
  onBack: () => void;
  onShowWalkthrough: () => void;
}

export default function HelpScreen({
  onBack,
  onShowWalkthrough,
}: HelpScreenProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View testID="help-screen" style={styles.screen}>
      <ScreenHeader title="How to use" onBack={onBack} testID="help" />
      <ScrollView contentContainerStyle={styles.content}>
        {HELP_TOPICS.map(topic => {
          const expanded = open === topic.key;
          const Chevron = expanded ? ChevronUp : ChevronDown;
          return (
            <View key={topic.key} style={styles.topic}>
              <Pressable
                testID={`help-topic-${topic.key}`}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpen(expanded ? null : topic.key)}
                style={styles.topicRow}
              >
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Chevron color={colors.v2GreyText} size={18} />
              </Pressable>
              {expanded ? (
                <Text
                  testID={`help-body-${topic.key}`}
                  style={styles.topicBody}
                >
                  {topic.body}
                </Text>
              ) : null}
            </View>
          );
        })}
        <Pressable
          testID="help-show-walkthrough"
          accessibilityRole="button"
          onPress={onShowWalkthrough}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>{SHOW_WALKTHROUGH_AGAIN}</Text>
        </Pressable>
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
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    topic: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.v2Border,
    },
    topicRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 4,
    },
    topicTitle: {
      flexShrink: 1,
      color: colors.v2White,
      fontSize: 16,
      fontWeight: '600',
    },
    topicBody: {
      color: colors.v2GreyText,
      fontSize: 15,
      lineHeight: 22,
      paddingHorizontal: 4,
      paddingBottom: 16,
    },
    primary: {
      minHeight: 48,
      marginTop: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.v2Orange,
    },
    primaryLabel: {
      color: colors.v2Background,
      fontSize: 16,
      fontWeight: '700',
    },
  });
