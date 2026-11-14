import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

// Full-screen modal with a back arrow, used by the create forms
interface FormScreenProps {
  visible: boolean;
  title: string;
  testID: string;
  backTestID: string;
  onBack: () => void;
  children: React.ReactNode;
}

export default function FormScreen({
  visible,
  title,
  testID,
  backTestID,
  onBack,
  children,
}: FormScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onBack}
    >
      <View
        testID={testID}
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            testID={backTestID}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            onPress={onBack}
          >
            <ChevronLeft color={colors.v2White} size={26} />
          </Pressable>
          <Text style={styles.heading}>{title}</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.v2Background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  heading: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
