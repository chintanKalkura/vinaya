import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { mixHex } from '../../utils/colorMix';
import { HeatSlot } from '../../utils/history';
import Section, { NOT_ENOUGH_DAYS, makeNoteStyles } from './Section';
import { percentText } from './pageStats';

// "When you do it": one cell per weekday, week of the month or month, in five
// shade steps from the empty-cell grey to the completion colour, with the
// share under each (habit-group-detail-page.md, decision 12)
interface HeatmapSectionProps {
  slots: HeatSlot[];
  steps: number[]; // 0–4, from heatSteps
  color: string;
}

export default function HeatmapSection({
  slots,
  steps,
  color,
}: HeatmapSectionProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const notes = useThemedStyles(makeNoteStyles);
  const empty = slots.every(slot => slot.share === null);

  return (
    <Section title="WHEN YOU DO IT" testID="detail-heatmap">
      {empty ? (
        <Text testID="detail-heatmap-empty" style={notes.empty}>
          {NOT_ENOUGH_DAYS}
        </Text>
      ) : (
        <View style={styles.row}>
          {slots.map((slot, i) => (
            <View
              key={slot.label}
              accessible
              accessibilityLabel={`${slot.label} ${percentText(slot.share)}`}
              style={styles.slot}
            >
              <Text style={styles.label}>{slot.label}</Text>
              <View
                testID={`detail-heat-${slot.label}`}
                style={[
                  styles.cell,
                  {
                    backgroundColor: mixHex(
                      colors.v2CardBackgroundInset,
                      color,
                      steps[i] / 4,
                    ),
                  },
                ]}
              />
              <Text style={styles.label}>{percentText(slot.share)}</Text>
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 4,
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    cell: {
      alignSelf: 'stretch',
      height: 30,
      borderRadius: 7,
    },
    label: {
      color: colors.v2GreyText,
      fontSize: 11,
      fontVariant: ['tabular-nums'],
    },
  });
