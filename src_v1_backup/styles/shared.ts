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
 * Shared reminders row styles (Logged + Mindfulness Bell buttons).
 */
export const remindersStyles = {
  remindersRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 24,
    paddingTop: 16,
  },
  remindersBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  remindersBtnText: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.paper,
    letterSpacing: 0.5,
  },
  remindersBtnLogged: {
    backgroundColor: colors.done,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
};
