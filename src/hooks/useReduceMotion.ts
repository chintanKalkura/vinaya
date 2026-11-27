import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// The phone's Remove animations setting, followed live
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then(value => {
        if (active) setReduce(value === true);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      value => setReduce(value === true),
    );
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);
  return reduce;
}
