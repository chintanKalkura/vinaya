import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

// Shown in place of the list when habits can't be read, so nothing is saved
// over unread data: docs/style-choices/habits-section/storage-error-messages.md
interface LoadErrorMessageProps {
  onRetry: () => void;
}

export default function LoadErrorMessage({
  onRetry,
}: LoadErrorMessageProps): React.JSX.Element {
  return (
    <View testID="load-error" style={styles.container}>
      <Text style={styles.title}>Couldn't load your habits</Text>
      <Text style={styles.subtext}>
        Your data is safe. Click Retry to try again.
      </Text>
      <Pressable
        testID="load-error-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.retry}
      >
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: colors.v2White,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    color: colors.v2GreyText,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retry: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.v2Red,
    backgroundColor: 'transparent',
  },
  retryText: {
    color: colors.v2White,
    fontSize: 15,
    fontWeight: '600',
  },
});
