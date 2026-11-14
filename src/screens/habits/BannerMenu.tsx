import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { EllipsisVertical } from 'lucide-react-native';
import { colors } from '../../theme';

// ⋮ right of a banner's streak number: docs/style-choices/banner-menu.md.
// Opens a small menu, then a confirm step, before deleting.
interface BannerMenuProps {
  kind: 'habit' | 'group';
  onDelete: () => void;
  testID: string;
}

type Step = 'closed' | 'menu' | 'confirm';

export default function BannerMenu({
  kind,
  onDelete,
  testID,
}: BannerMenuProps): React.JSX.Element {
  const [step, setStep] = useState<Step>('closed');
  const close = () => setStep('closed');

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={
          kind === 'habit' ? 'Habit options' : 'Group options'
        }
        hitSlop={10}
        onPress={() => setStep('menu')}
        style={styles.button}
      >
        <EllipsisVertical color={colors.v2GreyText} size={18} />
      </Pressable>
      <Modal
        visible={step !== 'closed'}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable
          testID={`${testID}-backdrop`}
          style={styles.backdrop}
          onPress={close}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
            {step === 'menu' ? (
              <>
                <Pressable
                  testID={`${testID}-delete`}
                  accessibilityRole="button"
                  onPress={() => setStep('confirm')}
                  style={[styles.button48, styles.deleteOption]}
                >
                  <Text style={styles.deleteOptionLabel}>
                    {kind === 'habit' ? 'Delete habit' : 'Delete group'}
                  </Text>
                </Pressable>
                <Pressable
                  testID={`${testID}-cancel`}
                  accessibilityRole="button"
                  onPress={close}
                  style={[styles.button48, styles.cancel]}
                >
                  <Text style={styles.cancelLabel}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.title}>Are you sure?</Text>
                <Text style={styles.body}>This can't be undone.</Text>
                <View style={styles.row}>
                  <Pressable
                    testID={`${testID}-confirm-cancel`}
                    accessibilityRole="button"
                    onPress={close}
                    style={[styles.button48, styles.cancel, styles.half]}
                  >
                    <Text style={styles.cancelLabel}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    testID={`${testID}-confirm-delete`}
                    accessibilityRole="button"
                    onPress={() => {
                      close();
                      onDelete();
                    }}
                    style={[styles.button48, styles.confirm, styles.half]}
                  >
                    <Text style={styles.confirmLabel}>Delete</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 6,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 12, 0.85)',
  },
  dialog: {
    width: '78%',
    borderRadius: 18,
    backgroundColor: colors.v2CardBackground,
    padding: 18,
    gap: 12,
  },
  button48: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteOption: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    backgroundColor: colors.v2CardBackgroundInset,
  },
  deleteOptionLabel: {
    color: colors.v2Red,
    fontWeight: '700',
    fontSize: 16,
  },
  cancel: {
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
  },
  cancelLabel: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 17,
  },
  body: {
    color: colors.v2GreyText,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  confirm: {
    backgroundColor: colors.v2Red,
  },
  confirmLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 16,
  },
});
