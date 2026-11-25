import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

// Non-blocking "Couldn't save" above the FAB, or at the bottom of an open
// form: docs/style-choices/habits-section/storage-error-messages.md
export const SAVE_ERROR_HIDE_MS = 4000;
// FAB: 16 above the bottom menu, 56 tall; the snackbar sits 12 above it
const FAB_TOP = 16 + 56 + 12;

interface SaveErrorSnackbarProps {
  visible: boolean;
  onDismiss: () => void;
  inForm?: boolean; // a form covers the FAB and bottom menu
}

// A new failure remounts it (keyed by the screen), restarting the timer
export default function SaveErrorSnackbar({
  visible,
  onDismiss,
  inForm = false,
}: SaveErrorSnackbarProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, SAVE_ERROR_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;
  return (
    <Pressable
      testID="save-error"
      accessibilityRole="alert"
      onPress={onDismiss}
      style={[
        styles.snackbar,
        {
          // The tab bar is below the screen, so the screen's bottom is its top
          bottom: inForm ? 16 + insets.bottom : FAB_TOP,
        },
      ]}
    >
      <Text style={styles.text}>Couldn't save. Try again.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.v2Red,
    backgroundColor: colors.v2CardBackground,
  },
  text: {
    color: colors.v2White,
    fontSize: 14,
  },
});
