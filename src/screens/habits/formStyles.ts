import { StyleSheet } from 'react-native';
import { colors } from '../../theme';

// Shared by the New Habit and New Habit Group forms
export const formStyles = StyleSheet.create({
  label: {
    color: colors.v2GreyText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackground,
    color: colors.v2White,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 12,
    backgroundColor: colors.v2CardBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readOnly: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 18,
    backgroundColor: colors.v2CardBackground,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: {
    color: colors.v2White,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.v2Orange,
  },
  createButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.v2Orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  createDisabled: {
    opacity: 0.4,
  },
  createLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 17,
  },
});
