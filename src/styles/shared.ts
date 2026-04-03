import {colors, fonts} from '../theme';

/**
 * Shared save-row styles. Use directly or spread into a local StyleSheet
 * to add overrides (e.g. borderTop in JournalScreen).
 */
export const saveStyles = {
  saveRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 24,
    paddingTop: 16,
  },
  savedMsg: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.done,
  },
  saveBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  saveBtnText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.paper,
    letterSpacing: 0.5,
  },
};
