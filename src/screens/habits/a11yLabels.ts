import { HabitGroupType } from '../../types/habitGroup';
import { freezesLeftText } from './FreezeLabel';

// TalkBack labels for the Habits screen: docs/style-choices/habits-section/tap-targets.md

interface FreezeState {
  frozen: boolean;
  freezesLeft: number;
}

function streakText(streak: number): string {
  return `${streak} day streak`;
}

function frozenText({ frozen, freezesLeft }: FreezeState): string {
  return frozen
    ? `, streak freeze used today, ${freezesLeftText(freezesLeft)}`
    : '';
}

export function checkmarkLabel(
  name: string,
  streak: number,
  freeze: FreezeState,
): string {
  return `${name}, ${streakText(streak)}${frozenText(freeze)}`;
}

export function hoursLabel(
  name: string,
  hours: number,
  target: number,
  streak: number,
  freeze: FreezeState,
): string {
  return `${name}, ${hours} of ${target} hours today, ${streakText(
    streak,
  )}${frozenText(freeze)}`;
}

export function groupLabel(
  name: string,
  groupType: HabitGroupType,
  complete: boolean,
  streak: number,
  freeze: FreezeState,
): string {
  return `${name}, ${groupType} group, ${
    complete ? 'complete' : 'not complete'
  }, ${streakText(streak)}${frozenText(freeze)}`;
}
