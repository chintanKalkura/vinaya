import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleHelp, Lock, Star, X } from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { Rating } from '../../utils/rating';
import TouchTarget from '../habits/TouchTarget';

// The five goal-based stars, with a How to earn button that opens the goals
// and where this item stands: habit-group-detail-page.md, decision 8
interface StarRowProps {
  stars: number; // 0–5
  color: string; // filled stars
  size: number;
  testID: string;
}

// Earned stars filled in `color`, the rest grey outlines. Used on the page
// and, small, on banners and group cards.
export function StarRow({
  stars,
  color,
  size,
  testID,
}: StarRowProps): React.JSX.Element {
  const colors = usePalette();
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${stars} of 5 stars`}
      style={[styles.row, size > 14 ? styles.wide : styles.tight]}
    >
      {[0, 1, 2, 3, 4].map(i => {
        const filled = i < stars;
        return (
          <Star
            key={i}
            testID={filled ? `${testID}-filled` : `${testID}-empty`}
            color={filled ? color : colors.v2GreyOutline}
            fill={filled ? color : 'transparent'}
            size={size}
            strokeWidth={1.5}
          />
        );
      })}
    </View>
  );
}

interface RatingStarsProps {
  rating: Rating;
  color: string;
}

export default function RatingStars({
  rating,
  color,
}: RatingStarsProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <StarRow
          stars={rating.stars}
          color={color}
          size={22}
          testID="detail-rating"
        />
        <TouchTarget
          testID="rating-help"
          accessibilityRole="button"
          accessibilityLabel="How to earn stars"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(o => !o)}
          style={styles.helpTarget}
        >
          <View style={[styles.helpButton, open && styles.helpButtonOpen]}>
            <CircleHelp color={colors.v2White} size={15} />
            <Text style={styles.helpLabel}>How to earn</Text>
          </View>
        </TouchTarget>
      </View>
      {open ? (
        <View testID="rating-rules" style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              HOW TO EARN STARS
            </Text>
            <TouchTarget
              testID="rating-rules-close"
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => setOpen(false)}
              style={styles.close}
            >
              <X color={colors.v2GreyText} size={18} />
            </TouchTarget>
          </View>
          {rating.items.map((item, i) => (
            <View
              key={item.goal}
              testID={`rating-goal-${i + 1}`}
              accessible
              accessibilityLabel={`${item.goal}, ${item.status}`}
              style={styles.goal}
            >
              <View style={styles.goalIcon}>
                {item.state === 'locked' ? (
                  <Lock color={colors.v2GreyText} size={15} />
                ) : (
                  <Star
                    color={
                      item.state === 'earned' ? color : colors.v2GreyOutline
                    }
                    fill={item.state === 'earned' ? color : 'transparent'}
                    size={17}
                    strokeWidth={1.5}
                  />
                )}
              </View>
              <View style={styles.goalText}>
                <Text
                  style={[
                    styles.goalLabel,
                    item.state === 'locked' && { color: colors.v2GreyText },
                  ]}
                >
                  {item.goal}
                </Text>
                <Text
                  style={[styles.status, item.state === 'earned' && { color }]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  wide: {
    gap: 4,
  },
  tight: {
    gap: 2,
  },
});

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    section: {
      gap: 10,
    },
    head: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 4,
    },
    helpTarget: {
      marginVertical: -6,
    },
    helpButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 18,
      backgroundColor: colors.v2CardBackground,
      paddingVertical: 6,
      paddingHorizontal: 11,
    },
    helpButtonOpen: {
      borderColor: colors.v2White,
    },
    helpLabel: {
      color: colors.v2White,
      fontSize: 13,
      fontWeight: '600',
    },
    card: {
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 16,
      backgroundColor: colors.v2CardBackground,
      paddingHorizontal: 14,
      paddingBottom: 14,
      gap: 10,
    },
    cardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      color: colors.v2GreyText,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    close: {
      marginRight: -14,
    },
    goal: {
      flexDirection: 'row',
      gap: 10,
    },
    goalIcon: {
      width: 20,
      alignItems: 'center',
      paddingTop: 1,
    },
    goalText: {
      flex: 1,
      gap: 1,
    },
    goalLabel: {
      color: colors.v2White,
      fontSize: 14,
      fontWeight: '700',
    },
    status: {
      color: colors.v2GreyText,
      fontSize: 13,
    },
  });
