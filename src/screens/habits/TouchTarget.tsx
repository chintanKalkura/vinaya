import React from 'react';
import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

// At least 48×48dp to tap without changing what is drawn: the visible control
// is the child, centred in a transparent target. hitSlop can't do this on
// Android when the parent is smaller than 48dp:
// docs/style-choices/habits-section/tap-targets.md
export const MIN_TOUCH_SIZE = 48;

type TouchTargetProps = PressableProps & {
  children: React.ReactNode;
};

const TouchTarget = React.forwardRef<View, TouchTargetProps>(
  ({ style, children, ...props }, ref) => (
    <Pressable
      ref={ref}
      {...props}
      style={state => [
        styles.target,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {children}
    </Pressable>
  ),
);

export default TouchTarget;

const styles = StyleSheet.create({
  target: {
    minWidth: MIN_TOUCH_SIZE,
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
