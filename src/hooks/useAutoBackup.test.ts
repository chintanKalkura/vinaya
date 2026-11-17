import { AppState } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAutoBackup } from './useAutoBackup';
import { autoBackup } from '../backup/account';

jest.mock('../backup/account', () => ({ autoBackup: jest.fn() }));

function changeAppState(state: string) {
  const changeCalls = (
    AppState.addEventListener as jest.Mock
  ).mock.calls.filter(([type]) => type === 'change');
  const [, handler] = changeCalls[changeCalls.length - 1];
  act(() => handler(state));
}

beforeEach(() => {
  jest.clearAllMocks();
  (autoBackup as jest.Mock).mockResolvedValue(false);
});

describe('useAutoBackup', () => {
  it('should check for a weekly backup when the app opens', () => {
    renderHook(() => useAutoBackup(() => {}));

    expect(autoBackup).toHaveBeenCalledTimes(1);
  });

  it('should check again when the app returns to the foreground', () => {
    renderHook(() => useAutoBackup(() => {}));

    changeAppState('active');

    expect(autoBackup).toHaveBeenCalledTimes(2);
  });

  it('should report a backup that ran', async () => {
    (autoBackup as jest.Mock).mockResolvedValueOnce(true);
    const onBackedUp = jest.fn();

    renderHook(() => useAutoBackup(onBackedUp));

    await waitFor(() => expect(onBackedUp).toHaveBeenCalled());
  });
});
