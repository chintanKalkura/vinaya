import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { HabitCadence } from '../../types/habit';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { CompletionRate, TrendPoint } from '../../utils/history';
import Section, { NOT_ENOUGH_DAYS, makeNoteStyles } from './Section';
import { percentText } from './pageStats';

// Overall rate since creation, then the trend: one point per slice, most
// recent first (habit-group-detail-page.md, decisions 10–11)
const UNIT: Record<HabitCadence, string> = {
  Day: 'day',
  Week: 'week',
  Month: 'month',
  Year: 'year',
};

export function sliceText(step: number, cadence: HabitCadence): string {
  const unit = UNIT[cadence];
  return `Each point is ${step} ${unit}${
    step === 1 ? '' : 's'
  }, most recent first`;
}

interface CompletionRateSectionProps {
  rate: CompletionRate;
  trend: TrendPoint[];
  step: number;
  cadence: HabitCadence;
  color: string;
}

const HEIGHT = 130;
const LEFT = 34;
const RIGHT = 8;
const TOP = 8;
const BOTTOM = 22;

export default function CompletionRateSection({
  rate,
  trend,
  step,
  cadence,
  color,
}: CompletionRateSectionProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const notes = useThemedStyles(makeNoteStyles);
  const [width, setWidth] = useState(0);

  const last = Math.max(1, trend.length - 1);
  const x = (i: number) => LEFT + (i * (width - LEFT - RIGHT)) / last;
  const y = (r: number) => TOP + (1 - r) * (HEIGHT - TOP - BOTTOM);
  const line = trend
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.rate).toFixed(1)}`,
    )
    .join(' ');
  const summary = trend.map(p => `${Math.round(p.rate * 100)}%`).join(', ');

  return (
    <Section title="COMPLETION RATE" testID="detail-completion">
      <View style={styles.rateRow}>
        <Text testID="detail-rate" style={styles.rate}>
          {percentText(rate.rate)}
        </Text>
        <Text style={styles.rateNote}>overall, since creation</Text>
      </View>
      {trend.length === 0 ? (
        <Text testID="detail-trend-empty" style={notes.empty}>
          {NOT_ENOUGH_DAYS}
        </Text>
      ) : (
        <View
          testID="detail-trend"
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Completion by slice, most recent first: ${summary}`}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
          <Text style={notes.note}>{sliceText(step, cadence)}</Text>
          {width > 0 ? (
            <Svg width={width} height={HEIGHT}>
              {[0, 0.5, 1].map(r => (
                <React.Fragment key={r}>
                  <Line
                    x1={LEFT}
                    x2={width - RIGHT}
                    y1={y(r)}
                    y2={y(r)}
                    stroke={colors.v2Border}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={LEFT - 6}
                    y={y(r) + 4}
                    fontSize={10}
                    fill={colors.v2GreyText}
                    textAnchor="end"
                  >
                    {`${r * 100}%`}
                  </SvgText>
                </React.Fragment>
              ))}
              <Path d={line} stroke={color} strokeWidth={2} fill="none" />
              {trend.map((p, i) => (
                <Circle
                  key={p.x}
                  cx={x(i)}
                  cy={y(p.rate)}
                  r={i === 0 ? 4 : 2.5}
                  fill={color}
                />
              ))}
              {trend.map((p, i) =>
                i % 3 === 0 || i === trend.length - 1 ? (
                  <SvgText
                    key={`x${p.x}`}
                    x={x(i)}
                    y={HEIGHT - 6}
                    fontSize={10}
                    fill={colors.v2GreyText}
                    textAnchor="middle"
                  >
                    {String(p.x)}
                  </SvgText>
                ) : null,
              )}
            </Svg>
          ) : null}
        </View>
      )}
    </Section>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    rateRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    rate: {
      color: colors.v2White,
      fontSize: 34,
      fontWeight: '700',
    },
    rateNote: {
      color: colors.v2GreyText,
      fontSize: 13,
    },
  });
