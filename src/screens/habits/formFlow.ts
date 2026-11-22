import { NewHabitGroupDraft } from '../../utils/newHabitGroup';
import { PendingHabit } from './NewHabitGroupForm';

// The + and edit flows on the Habits screen: one base form, plus the form
// stacked on top of it ("+ Create Group" over New Habit, "Create Habit" over a
// group form). Only these are mounted, so the form underneath keeps what was
// typed: docs/feature-development/release-1-readiness/tech-debt-cleanup.md
export type BaseForm =
  | { kind: 'none' }
  | { kind: 'choice' }
  | { kind: 'newHabit' }
  | { kind: 'newGroup' }
  | { kind: 'editHabit'; habitId: string }
  | { kind: 'editGroup'; groupId: string };

export interface FormFlowState {
  base: BaseForm;
  groupForHabit: PendingHabit | null; // stacked on New Habit
  pendingGroupDraft: NewHabitGroupDraft | null; // saved with the new habit
  habitForGroup: boolean; // stacked on New or Edit Habit Group
  groupNewHabitId?: string; // made there, assigned when the group form returns
}

export const INITIAL_FORM_FLOW: FormFlowState = {
  base: { kind: 'none' },
  groupForHabit: null,
  pendingGroupDraft: null,
  habitForGroup: false,
};

export type FormFlowAction =
  | { type: 'openChoice' }
  | { type: 'chooseHabit' }
  | { type: 'chooseGroup' }
  | { type: 'backToChoice' }
  | { type: 'editHabit'; habitId: string }
  | { type: 'editGroup'; groupId: string }
  | { type: 'close' }
  | { type: 'openGroupForHabit'; habit: PendingHabit }
  | { type: 'closeGroupForHabit' }
  | { type: 'saveGroupForHabit'; draft: NewHabitGroupDraft }
  | { type: 'openHabitForGroup' }
  | { type: 'closeHabitForGroup' }
  | { type: 'habitCreatedForGroup'; habitId: string };

export function formFlowReducer(
  state: FormFlowState,
  action: FormFlowAction,
): FormFlowState {
  switch (action.type) {
    case 'openChoice':
      return { ...INITIAL_FORM_FLOW, base: { kind: 'choice' } };
    case 'chooseHabit':
      return { ...state, base: { kind: 'newHabit' } };
    case 'chooseGroup':
      return { ...state, base: { kind: 'newGroup' } };
    // Back from New Habit or New Group drops what was pending for it
    case 'backToChoice':
      return { ...INITIAL_FORM_FLOW, base: { kind: 'choice' } };
    case 'editHabit':
      return {
        ...INITIAL_FORM_FLOW,
        base: { kind: 'editHabit', habitId: action.habitId },
      };
    case 'editGroup':
      return {
        ...INITIAL_FORM_FLOW,
        base: { kind: 'editGroup', groupId: action.groupId },
      };
    // Saved, cancelled or closed: back to the list
    case 'close':
      return INITIAL_FORM_FLOW;
    case 'openGroupForHabit':
      return { ...state, groupForHabit: action.habit };
    case 'closeGroupForHabit':
      return { ...state, groupForHabit: null };
    case 'saveGroupForHabit':
      return { ...state, groupForHabit: null, pendingGroupDraft: action.draft };
    case 'openHabitForGroup':
      return { ...state, habitForGroup: true };
    case 'closeHabitForGroup':
      return { ...state, habitForGroup: false };
    case 'habitCreatedForGroup':
      return {
        ...state,
        habitForGroup: false,
        groupNewHabitId: action.habitId,
      };
  }
}
