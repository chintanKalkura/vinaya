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
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';

// Full-screen modal with a back arrow, used by the create forms
interface FormScreenProps {
  visible: boolean;
  title: string;
  testID: string;
  backTestID: string;
  onBack: () => void;
  children: React.ReactNode;
  saveError?: React.ReactNode; // the form covers the screen's save message
  menu?: React.ReactNode; // a ⋮ at the right of the title (edit forms)
}

export default function FormScreen({
  visible,
  title,
  testID,
  backTestID,
  onBack,
  children,
  saveError,
  menu,
}: FormScreenProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
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
          {menu ? <View style={styles.menu}>{menu}</View> : null}
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {saveError}
      </View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
      flex: 1,
      color: colors.v2White,
      fontWeight: '700',
      fontSize: 22,
    },
    // The ⋮'s 48dp target reaches into the padding, so the icon lines up
    // with the fields' right edge
    menu: {
      marginVertical: -12,
      marginRight: -14,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
  });
