import {
  FormFlowAction,
  FormFlowState,
  INITIAL_FORM_FLOW,
  formFlowReducer,
} from './formFlow';
import { DEFAULT_GROUP_DRAFT } from '../../utils/newHabitGroup';

const run = (...actions: FormFlowAction[]): FormFlowState =>
  actions.reduce(formFlowReducer, INITIAL_FORM_FLOW);

describe('formFlowReducer', () => {
  it('should open the choice sheet from +', () => {
    expect(run({ type: 'openChoice' }).base).toEqual({ kind: 'choice' });
  });

  it('should open New Habit or New Group from the choice sheet', () => {
    expect([
      run({ type: 'openChoice' }, { type: 'chooseHabit' }).base.kind,
      run({ type: 'openChoice' }, { type: 'chooseGroup' }).base.kind,
    ]).toEqual(['newHabit', 'newGroup']);
  });

  it('should stack the group form on New Habit and keep its draft as pending', () => {
    const state = run(
      { type: 'chooseHabit' },
      { type: 'openGroupForHabit', habit: { name: 'Run', type: 'Checkmark' } },
      { type: 'saveGroupForHabit', draft: DEFAULT_GROUP_DRAFT },
    );

    expect([
      state.base.kind,
      state.groupForHabit,
      state.pendingGroupDraft,
    ]).toEqual(['newHabit', null, DEFAULT_GROUP_DRAFT]);
  });

  it('should drop a pending group on Back to the choice sheet', () => {
    const state = run(
      { type: 'chooseHabit' },
      { type: 'saveGroupForHabit', draft: DEFAULT_GROUP_DRAFT },
      { type: 'backToChoice' },
    );

    expect([state.base.kind, state.pendingGroupDraft]).toEqual([
      'choice',
      null,
    ]);
  });

  it('should stack New Habit on a group form and pass back the new habit', () => {
    const state = run(
      { type: 'editGroup', groupId: 'g' },
      { type: 'openHabitForGroup' },
      { type: 'habitCreatedForGroup', habitId: 'h1' },
    );

    expect([state.base, state.habitForGroup, state.groupNewHabitId]).toEqual([
      { kind: 'editGroup', groupId: 'g' },
      false,
      'h1',
    ]);
  });

  // Back from a stacked form returns to the form under it, unchanged
  it('should close a stacked form and keep the form under it', () => {
    const groupOverHabit = run(
      { type: 'openChoice' },
      { type: 'chooseHabit' },
      { type: 'openGroupForHabit', habit: { name: 'Run', type: 'Checkmark' } },
      { type: 'closeGroupForHabit' },
    );
    const habitOverGroup = run(
      { type: 'editGroup', groupId: 'g' },
      { type: 'openHabitForGroup' },
      { type: 'closeHabitForGroup' },
    );

    expect([
      groupOverHabit.base,
      groupOverHabit.groupForHabit,
      groupOverHabit.pendingGroupDraft,
      habitOverGroup.base,
      habitOverGroup.habitForGroup,
      habitOverGroup.groupNewHabitId,
    ]).toEqual([
      { kind: 'newHabit' },
      null,
      null,
      { kind: 'editGroup', groupId: 'g' },
      false,
      undefined,
    ]);
  });

  it('should close everything when the flow finishes', () => {
    expect(
      run(
        { type: 'chooseGroup' },
        { type: 'openHabitForGroup' },
        { type: 'habitCreatedForGroup', habitId: 'h1' },
        { type: 'close' },
      ),
    ).toEqual(INITIAL_FORM_FLOW);
  });

  it('should open Edit Habit with its habit', () => {
    expect(run({ type: 'editHabit', habitId: 'h1' }).base).toEqual({
      kind: 'editHabit',
      habitId: 'h1',
    });
  });
});
