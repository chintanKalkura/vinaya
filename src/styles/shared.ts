import {colors, fonts} from '../theme';

/**
 * Shared section title style. Spread into a local StyleSheet and override
 * marginBottom if a component needs a different spacing.
 */
export const sectionTitle = {
  fontFamily: fonts.serif,
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
  color: colors.muted,
  marginBottom: 12,
};

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
  saveBtnLogged: {
    backgroundColor: colors.done,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
};
