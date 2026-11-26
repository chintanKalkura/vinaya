import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Eye, X } from 'lucide-react-native';
import { COMPLETION_COLOUR_IDS, CompletionColourId } from '../../types/habit';
import { Palette, completionColour } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import TouchTarget, { MIN_TOUCH_SIZE } from './TouchTarget';
import { getColorScheme } from './colorRules';
import { useFormStyles } from './formStyles';

// Completion colour picker, right after Name on the habit and group forms:
// docs/style-choices/theme/completion-colours.md. One row: the swatches, drawn
// as filled checks, then a Preview button that opens a row under them showing
// the item not done and done. Swatches stay tappable while it's open.
export const COMPLETION_COLOUR_NAMES: Record<CompletionColourId, string> = {
  orange: 'Orange',
  blue: 'Blue',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  purple: 'Purple',
};

interface CompletionColourFieldProps {
  value: CompletionColourId;
  onChange: (value: CompletionColourId) => void;
  name: string; // the draft's name, shown in the preview
  placeholder: string; // the preview's name while the draft has none
  testID: string;
}

export default function CompletionColourField({
  value,
  onChange,
  name,
  placeholder,
  testID,
}: CompletionColourFieldProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const formStyles = useFormStyles();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const [buttonWidth, setButtonWidth] = useState(0);
  const previewName = name.trim() || placeholder;

  // On narrow phones the 48dp swatch targets overlap a little (like the
  // header's view toggle) so the row and Preview fit on one line
  const room = (rowWidth - buttonWidth) / COMPLETION_COLOUR_IDS.length;
  const overlap =
    rowWidth > 0 && room < MIN_TOUCH_SIZE ? (MIN_TOUCH_SIZE - room) / 2 : 0;

  return (
    <View style={styles.field}>
      <View
        style={styles.row}
        onLayout={e => setRowWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.swatches} accessibilityRole="radiogroup">
          {COMPLETION_COLOUR_IDS.map(id => {
            const selected = value === id;
            return (
              <TouchTarget
                key={id}
                testID={`${testID}-${id}`}
                accessibilityRole="radio"
                accessibilityLabel={`${COMPLETION_COLOUR_NAMES[id]} when complete`}
                accessibilityState={{ selected }}
                onPress={() => onChange(id)}
                style={{ marginHorizontal: -overlap }}
              >
                <View style={[styles.ring, selected && styles.ringSelected]}>
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: completionColour(colors, id).accent },
                    ]}
                  >
                    <Check
                      color={colors.v2Background}
                      size={17}
                      strokeWidth={3.5}
                    />
                  </View>
                </View>
              </TouchTarget>
            );
          })}
        </View>
        <TouchTarget
          testID={`${testID}-preview-toggle`}
          accessibilityRole="button"
          accessibilityLabel="Preview completion colour"
          accessibilityState={{ expanded: previewOpen }}
          onPress={() => setPreviewOpen(open => !open)}
          onLayout={e => setButtonWidth(e.nativeEvent.layout.width)}
        >
          <View
            style={[
              formStyles.chip,
              styles.previewButton,
              previewOpen && styles.previewButtonOpen,
            ]}
          >
            <Eye color={colors.v2White} size={16} />
            <Text style={formStyles.chipLabel}>Preview</Text>
          </View>
        </TouchTarget>
      </View>

      {previewOpen ? (
        <View testID={`${testID}-preview-panel`} style={styles.panel}>
          <View style={styles.panelHead}>
            <Text style={styles.previewLabel}>How it looks</Text>
            <TouchTarget
              testID={`${testID}-preview-close`}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
              onPress={() => setPreviewOpen(false)}
              style={styles.close}
            >
              <X color={colors.v2GreyText} size={18} />
            </TouchTarget>
          </View>
          <View style={styles.previews}>
            <Preview label="Not done" name={previewName} complete={false} />
            <Preview
              label="Done"
              name={previewName}
              complete
              colour={value}
              testID={`${testID}-preview`}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Preview({
  label,
  name,
  complete,
  colour,
  testID,
}: {
  label: string;
  name: string;
  complete: boolean;
  colour?: CompletionColourId;
  testID?: string;
}): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const scheme = getColorScheme(
    'banner',
    complete,
    complete,
    false,
    colors,
    colour,
  );
  return (
    <View style={styles.preview}>
      <Text style={styles.previewLabel}>{label}</Text>
      <View testID={testID} style={[styles.banner, scheme.container]}>
        <View
          style={[
            styles.check,
            {
              borderColor: scheme.iconColor,
              backgroundColor: scheme.iconFilled ? scheme.iconColor : undefined,
            },
          ]}
        >
          {scheme.iconFilled ? (
            <Check color={colors.v2Background} size={13} strokeWidth={3.5} />
          ) : null}
        </View>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: scheme.titleColor }]}
        >
          {name}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    field: {
      gap: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginLeft: -8,
    },
    swatches: {
      flexDirection: 'row',
    },
    // The selected swatch gets a ring in the text colour, a gap away
    ring: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringSelected: {
      borderColor: colors.v2White,
    },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
    },
    previewButtonOpen: {
      borderColor: colors.v2White,
    },
    panel: {
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 14,
      backgroundColor: colors.v2CardBackground,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    panelHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    close: {
      marginRight: -12,
    },
    previews: {
      flexDirection: 'row',
      gap: 10,
    },
    preview: {
      flex: 1,
      gap: 4,
    },
    previewLabel: {
      color: colors.v2GreyText,
      fontSize: 12,
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 16,
      backgroundColor: colors.v2CardBackgroundInset,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    check: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      flexShrink: 1,
      fontWeight: '600',
    },
  });
