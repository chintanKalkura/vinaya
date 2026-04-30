import {NativeModules} from 'react-native';
import {
  getBellState,
  getNextAlarmMs,
  initMindfulnessBell,
  setBellState,
  BELL_STATE_LABELS,
} from './mindfulnessBell';

const mockScheduler = {
  init: jest.fn(),
  setBellState: jest.fn(),
  getBellState: jest.fn(),
  getNextAlarmMs: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  NativeModules.MindfulnessScheduler = mockScheduler;
});

// ── initMindfulnessBell ────────────────────────────────────────────────────

describe('initMindfulnessBell', () => {
  it('should call native init with start date, end date, and MINDFULNESS_TEST_MODE', () => {
    initMindfulnessBell('2025-12-01', '2025-12-31');
    expect(mockScheduler.init).toHaveBeenCalledWith('2025-12-01', '2025-12-31', true);
  });

  it('should not throw when native module is unavailable', () => {
    NativeModules.MindfulnessScheduler = undefined;
    expect(() => initMindfulnessBell('2025-12-01', '2025-12-31')).not.toThrow();
  });
});

// ── setBellState ───────────────────────────────────────────────────────────

describe('setBellState', () => {
  it('should call native setBellState with active', () => {
    setBellState('active');
    expect(mockScheduler.setBellState).toHaveBeenCalledWith('active');
  });

  it('should call native setBellState with snoozed_next', () => {
    setBellState('snoozed_next');
    expect(mockScheduler.setBellState).toHaveBeenCalledWith('snoozed_next');
  });

  it('should call native setBellState with snoozed_day', () => {
    setBellState('snoozed_day');
    expect(mockScheduler.setBellState).toHaveBeenCalledWith('snoozed_day');
  });

  it('should not throw when native module is unavailable', () => {
    NativeModules.MindfulnessScheduler = undefined;
    expect(() => setBellState('snoozed_next')).not.toThrow();
  });
});

// ── getBellState ───────────────────────────────────────────────────────────

describe('getBellState', () => {
  it('should resolve with the state returned by the native callback', async () => {
    mockScheduler.getBellState.mockImplementation((cb: Function) => cb('snoozed_next'));
    const state = await getBellState();
    expect(state).toBe('snoozed_next');
  });

  it('should resolve with active when native module is unavailable', async () => {
    NativeModules.MindfulnessScheduler = undefined;
    const state = await getBellState();
    expect(state).toBe('active');
  });
});

// ── getNextAlarmMs ─────────────────────────────────────────────────────────

describe('getNextAlarmMs', () => {
  it('should resolve with the timestamp from the native callback', async () => {
    mockScheduler.getNextAlarmMs.mockImplementation((cb: Function) => cb(1700000000000));
    const ms = await getNextAlarmMs();
    expect(ms).toBe(1700000000000);
  });

  it('should resolve with 0 when native module is unavailable', async () => {
    NativeModules.MindfulnessScheduler = undefined;
    const ms = await getNextAlarmMs();
    expect(ms).toBe(0);
  });
});

// ── BELL_STATE_LABELS ──────────────────────────────────────────────────────

describe('BELL_STATE_LABELS', () => {
  it('should have the correct label for active', () => {
    expect(BELL_STATE_LABELS.active).toBe('Active');
  });

  it('should have the correct label for snoozed_next', () => {
    expect(BELL_STATE_LABELS.snoozed_next).toBe('Snoozed — Next Bell');
  });

  it('should have the correct label for snoozed_day', () => {
    expect(BELL_STATE_LABELS.snoozed_day).toBe('Snoozed — Today');
  });
});
