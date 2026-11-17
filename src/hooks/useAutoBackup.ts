import { useEffect } from 'react';
import { AppState } from 'react-native';
import { autoBackup } from '../backup/account';

// Weekly backup when the app opens or returns to the foreground, in the
// background without blocking the screen: google-drive-backup.md (decision 6)
export function useAutoBackup(onBackedUp: () => void): void {
  useEffect(() => {
    const run = () => {
      autoBackup()
        .then(backedUp => {
          if (backedUp) onBackedUp();
        })
        .catch(() => {});
    };
    run();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') run();
    });
    return () => subscription.remove();
  }, [onBackedUp]);
}
