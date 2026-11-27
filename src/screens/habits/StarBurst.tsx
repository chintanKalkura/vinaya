import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useReduceMotion } from '../../hooks/useReduceMotion';

// Five small stars flying out of a check and fading, when a habit is marked
// done (habit-group-detail-page.md, decision 8, option A). Never blocks a tap;
// skipped when the phone's Remove animations setting is on.
const STARS = [
  { angle: -150, distance: 46, spin: -80 },
  { angle: -110, distance: 56, spin: -40 },
  { angle: -70, distance: 50, spin: 0 },
  { angle: -30, distance: 56, spin: 40 },
  { angle: 10, distance: 46, spin: 80 },
];
const SIZE = 14;
const DURATION = 900;
const STAGGER = 40;

interface StarBurstProps {
  color: string;
  playKey: number; // a new value plays it once; 0 never plays
  testID: string;
}

export default function StarBurst({
  color,
  playKey,
  testID,
}: StarBurstProps): React.JSX.Element | null {
  const reduce = useReduceMotion();
  const progress = useRef(STARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (playKey === 0 || reduce) return;
    progress.forEach(value => value.setValue(0));
    const animation = Animated.stagger(
      STAGGER,
      progress.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [playKey, reduce, progress]);

  if (playKey === 0 || reduce) return null;
  return (
    <View testID={testID} pointerEvents="none" style={styles.origin}>
      {STARS.map((star, i) => {
        const radians = (star.angle * Math.PI) / 180;
        const p = progress[i];
        return (
          <Animated.View
            key={star.angle}
            style={[
              styles.star,
              {
                opacity: p.interpolate({
                  inputRange: [0, 0.15, 1],
                  outputRange: [0, 1, 0],
                }),
                transform: [
                  {
                    translateX: p.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(radians) * star.distance],
                    }),
                  },
                  {
                    translateY: p.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(radians) * star.distance],
                    }),
                  },
                  {
                    scale: p.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    rotate: p.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${star.spin}deg`],
                    }),
                  },
                ],
              },
            ]}
          >
            <Star color={color} fill={color} size={SIZE} strokeWidth={1.5} />
          </Animated.View>
        );
      })}
    </View>
  );
}

// A zero-size point at the parent's centre that the stars fly out from
const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    overflow: 'visible',
  },
  star: {
    position: 'absolute',
    left: -SIZE / 2,
    top: -SIZE / 2,
  },
});

// A new play key each time `done` turns true while shown (not when first
// drawn already done), so marking plays the burst and unmarking doesn't
export function useBurstOnDone(done: boolean): number {
  const [key, setKey] = useState(0);
  const was = useRef(done);
  useEffect(() => {
    if (done && !was.current) setKey(k => k + 1);
    was.current = done;
  }, [done]);
  return key;
}
