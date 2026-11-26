import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { COMPLETION_COLOUR_IDS, CompletionColourId } from '../../types/habit';
import { Palette, completionColour } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import TouchTarget from './TouchTarget';
import { getColorScheme } from './colorRules';

// Completion colour picker, right after Name on the habit and group forms:
// docs/style-choices/theme/completion-colours.md. Swatches are drawn as filled
// checks, and the preview shows the item not done and done, so the colour
// reads as what done looks like.
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
  const previewName = name.trim() || placeholder;

  return (
    <View style={styles.field}>
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
      <View
        style={styles.previews}
        importantForAccessibility="no-hide-descendants"
      >
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
    swatches: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -8,
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
      backgroundColor: colors.v2CardBackground,
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
