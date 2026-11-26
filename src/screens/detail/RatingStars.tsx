import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { usePalette } from '../../theming';

// Stars from the overall completion rate, nearest fifth (starRating), filled
// in the item's completion colour; no text: habit-group-detail-page.md
interface RatingStarsProps {
  stars: number; // 0–5
  color: string;
}

export default function RatingStars({
  stars,
  color,
}: RatingStarsProps): React.JSX.Element {
  const colors = usePalette();
  return (
    <View
      testID="detail-rating"
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${stars} of 5 stars`}
      style={styles.row}
    >
      {[0, 1, 2, 3, 4].map(i => {
        const filled = i < stars;
        return (
          <Star
            key={i}
            testID={filled ? 'detail-star-filled' : 'detail-star-empty'}
            color={filled ? color : colors.v2GreyOutline}
            fill={filled ? color : 'transparent'}
            size={22}
            strokeWidth={1.5}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
});
