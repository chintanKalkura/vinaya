import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { EllipsisVertical, LucideIcon } from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import TouchTarget from './TouchTarget';

// A ⋮ that opens a dropdown of items; a danger item (Delete) asks first.
// Used by banners and cards (BannerMenu), the habit and group page, and the
// edit forms: docs/style-choices/habits-section/banner-menu.md
export interface MenuItem {
  key: string; // testID suffix
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  danger?: boolean; // red, and confirmed before onPress
  disabled?: boolean;
}

interface OptionsMenuProps {
  kind: 'habit' | 'group';
  items: MenuItem[];
  testID: string;
  // Where the 48dp target sits: the parent places it over its name row, since
  // the row itself is too short to hold it (tap-targets.md)
  targetStyle?: StyleProp<ViewStyle>;
  iconColor?: string; // grey on banners, the text colour in headers
  iconSize?: number;
}

type Step = 'closed' | 'dropdown' | 'confirm';

interface MenuPosition {
  top: number;
  right: number;
}

// Used until the button has been measured
const DEFAULT_POSITION: MenuPosition = { top: 120, right: 16 };

export default function OptionsMenu({
  kind,
  items,
  testID,
  targetStyle,
  iconColor,
  iconSize = 18,
}: OptionsMenuProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const buttonRef = useRef<View>(null);
  const [step, setStep] = useState<Step>('closed');
  const [confirming, setConfirming] = useState<MenuItem | null>(null);
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
      <TouchTarget
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={
          kind === 'habit' ? 'Habit options' : 'Group options'
        }
        accessibilityState={{ expanded: step === 'dropdown' }}
        onPress={open}
        style={targetStyle}
      >
        {/* Measured for the dropdown: the icon, not the 48dp target */}
        <View ref={buttonRef}>
          <EllipsisVertical
            color={iconColor ?? colors.v2GreyText}
            size={iconSize}
          />
        </View>
      </TouchTarget>

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
          {items.map(item => (
            <Pressable
              key={item.key}
              testID={`${testID}-${item.key}`}
              accessibilityRole="menuitem"
              accessibilityState={{ disabled: !!item.disabled }}
              disabled={item.disabled}
              onPress={() => {
                if (item.danger) {
                  setConfirming(item);
                  setStep('confirm');
                  return;
                }
                close();
                item.onPress();
              }}
              style={[styles.option, item.disabled && styles.disabled]}
            >
              <item.Icon
                color={item.danger ? colors.v2Red : colors.v2White}
                size={16}
              />
              <Text
                style={[
                  styles.optionLabel,
                  item.danger ? styles.deleteLabel : styles.editLabel,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
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
                  confirming?.onPress();
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

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
    optionLabel: {
      fontWeight: '600',
      fontSize: 15,
    },
    editLabel: {
      color: colors.v2White,
    },
    deleteLabel: {
      color: colors.v2Red,
    },
    disabled: {
      opacity: 0.4,
    },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.v2Scrim,
    },
    dialog: {
      width: '78%',
      borderRadius: 18,
      backgroundColor: colors.v2CardBackground,
      padding: 18,
      gap: 12,
    },
    button48: {
      minHeight: 46,
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
