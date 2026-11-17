import { AppState } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useToday } from './useToday';

// Calls the newest AppState listener with a new state
function changeAppState(state: string) {
  const changeCalls = (
    AppState.addEventListener as jest.Mock
  ).mock.calls.filter(([type]) => type === 'change');
  const [, handler] = changeCalls[changeCalls.length - 1];
  act(() => handler(state));
}

describe('useToday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 5, 15, 10, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return today's date key", () => {
    const { result } = renderHook(() => useToday());

    expect(result.current).toBe('2024-06-15');
  });

  it('should update when the app becomes active on a new day', () => {
    const { result } = renderHook(() => useToday());

    jest.setSystemTime(new Date(2024, 5, 16, 8, 0));
    changeAppState('active');

    expect(result.current).toBe('2024-06-16');
  });

  it('should not update when the app goes to the background', () => {
    const { result } = renderHook(() => useToday());

    jest.setSystemTime(new Date(2024, 5, 16, 8, 0));
    changeAppState('background');

    expect(result.current).toBe('2024-06-15');
  });

  it('should update at midnight while the app is open', () => {
    jest.setSystemTime(new Date(2024, 5, 15, 23, 59));
    const { result } = renderHook(() => useToday());

    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(result.current).toBe('2024-06-16');
  });

  it('should update again at the following midnight', () => {
    jest.setSystemTime(new Date(2024, 5, 15, 23, 59));
    const { result } = renderHook(() => useToday());

    act(() => {
      jest.advanceTimersByTime(60 * 1000 + 24 * 60 * 60 * 1000);
    });

    expect(result.current).toBe('2024-06-17');
  });

  it('should remove its listener and timer on unmount', () => {
    const { unmount } = renderHook(() => useToday());
    const subscription = (AppState.addEventListener as jest.Mock).mock.results[
      (AppState.addEventListener as jest.Mock).mock.results.length - 1
    ].value;

    unmount();

    expect([
      subscription.remove.mock.calls.length,
      jest.getTimerCount(),
    ]).toEqual([1, 0]);
  });
});
