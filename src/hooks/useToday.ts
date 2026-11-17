import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { msUntilNextMidnight, toDateKey } from '../utils/dates';

// Today's date key, kept current when the app stays open or in the background
// across midnight: docs/feature-development/release-1-readiness/date-rollover.md
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey(new Date()));

  // Resuming also picks up time zone and clock changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setToday(toDateKey(new Date()));
    });
    return () => subscription.remove();
  }, []);

  // Re-arms after every firing, so a timer that fires early still reaches
  // midnight
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      timer = setTimeout(() => {
        setToday(toDateKey(new Date()));
        arm();
      }, msUntilNextMidnight(new Date()));
    };
    arm();
    return () => clearTimeout(timer);
  }, []);

  return today;
}
