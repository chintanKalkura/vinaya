import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme';

// ⋮ right of a banner's streak number: docs/style-choices/banner-menu.md.
// Opens a dropdown (Edit, Delete), then a confirm step before deleting.
interface BannerMenuProps {
  kind: 'habit' | 'group';
  onDelete: () => void;
  testID: string;
}

type Step = 'closed' | 'dropdown' | 'confirm';

interface MenuPosition {
  top: number;
  right: number;
}

// Used until the button has been measured
const DEFAULT_POSITION: MenuPosition = { top: 120, right: 16 };

export default function BannerMenu({
  kind,
  onDelete,
  testID,
}: BannerMenuProps): React.JSX.Element {
  const buttonRef = useRef<View>(null);
  const [step, setStep] = useState<Step>('closed');
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const close = () => setStep('closed');

  // The dropdown hangs below the ⋮, right-aligned with it
  const open = () => {
    setStep('dropdown');
    buttonRef.current?.measureInWindow((x, y, width, height) =>
      setPosition({
        top: y + height + 4,
        right: Dimensions.get('window').width - (x + width),
      }),
    );
  };

  return (
    <>
      <Pressable
        ref={buttonRef}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={
          kind === 'habit' ? 'Habit options' : 'Group options'
        }
        accessibilityState={{ expanded: step === 'dropdown' }}
        hitSlop={10}
        onPress={open}
        style={styles.button}
      >
        <EllipsisVertical color={colors.v2GreyText} size={18} />
      </Pressable>

      {/* Not drawn under the status bar, so window coordinates line up */}
      <Modal
        visible={step === 'dropdown'}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          testID={`${testID}-backdrop`}
          style={StyleSheet.absoluteFill}
          onPress={close}
        />
        <View
          testID={`${testID}-dropdown`}
          style={[
            styles.dropdown,
            { top: position.top, right: position.right },
          ]}
        >
          {/* Editing is not built yet */}
          <Pressable
            testID={`${testID}-edit`}
            accessibilityRole="menuitem"
            accessibilityState={{ disabled: true }}
            disabled
            style={[styles.option, styles.optionDisabled]}
          >
            <Pencil color={colors.v2GreyText} size={16} />
            <Text style={[styles.optionLabel, styles.editLabel]}>Edit</Text>
          </Pressable>
          <Pressable
            testID={`${testID}-delete`}
            accessibilityRole="menuitem"
            onPress={() => setStep('confirm')}
            style={styles.option}
          >
            <Trash2 color={colors.v2Red} size={16} />
            <Text style={[styles.optionLabel, styles.deleteLabel]}>Delete</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={step === 'confirm'}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Pressable
          testID={`${testID}-confirm-backdrop`}
          style={styles.backdrop}
          onPress={close}
        >
          <Pressable style={styles.dialog} onPress={() => {}}>
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
  dropdown: {
    position: 'absolute',
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.v2Border,
    backgroundColor: colors.v2CardBackground,
    paddingVertical: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  editLabel: {
    color: colors.v2GreyText,
  },
  deleteLabel: {
    color: colors.v2Red,
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
