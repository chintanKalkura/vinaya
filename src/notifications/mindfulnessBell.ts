import {NativeModules} from 'react-native';

// Accessed at call time (not destructured at import) so tests can override
// NativeModules.MindfulnessScheduler without stale reference issues.
function scheduler() {
  return NativeModules.MindfulnessScheduler as
    | {
        init: (endDate: string, testMode: boolean) => void;
        setBellState: (state: string) => void;
        getBellState: (cb: (s: string) => void) => void;
        getNextAlarmMs: (cb: (ms: number) => void) => void;
      }
    | undefined;
}

export type BellState = 'active' | 'snoozed_next' | 'snoozed_day';

// Flip to true for 2-minute intervals and 4-minute snooze during emulator testing.
// The native layer reads this from SharedPrefs after init() is called.
export const MINDFULNESS_TEST_MODE = false;

/**
 * Call once when the active challenge is determined. Stores the end date,
 * arms the first alarm (if none is already scheduled), and propagates
 * TEST_MODE to the native scheduler.
 */
export function initMindfulnessBell(challengeEndDate: string): void {
  scheduler()?.init(challengeEndDate, MINDFULNESS_TEST_MODE);
}

/**
 * Transition the bell to a new state. The native module applies the
 * corresponding scheduling effect (reschedule / cancel) immediately.
 *
 * Active      → no alarm change (reset state; happens automatically at midnight)
 * SnoozedNext → next alarm pushed 2h later than originally set
 * SnoozedDay  → next alarm cancelled; chain resumes at midnight
 */
export function setBellState(state: BellState): void {
  scheduler()?.setBellState(state);
}

/**
 * Reads the current bell state from SharedPrefs via native callback.
 * Resolves to 'active' if the native module is unavailable (e.g. in tests).
 */
export function getBellState(): Promise<BellState> {
  return new Promise(resolve => {
    const s = scheduler();
    if (!s) {resolve('active'); return;}
    s.getBellState(state => resolve(state as BellState));
  });
}

/**
 * Returns the timestamp (ms) of the next scheduled alarm, or 0 if none.
 */
export function getNextAlarmMs(): Promise<number> {
  return new Promise(resolve => {
    const s = scheduler();
    if (!s) {resolve(0); return;}
    s.getNextAlarmMs(ms => resolve(ms));
  });
}

/**
 * Next state in the in-app press cycle:
 *   active → snoozed_next → snoozed_day → snoozed_day (terminal)
 */
export function nextBellState(current: BellState): BellState {
  if (current === 'active') return 'snoozed_next';
  if (current === 'snoozed_next') return 'snoozed_day';
  return 'snoozed_day';
}

export const BELL_STATE_LABELS: Record<BellState, string> = {
  active: 'Mindfulness (Active)',
  snoozed_next: 'Mindfulness (Snoozed Next)',
  snoozed_day: 'Mindfulness (Snoozed Day)',
};
