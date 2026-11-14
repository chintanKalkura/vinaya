import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import NewHabitGroupForm, { PendingHabit } from './NewHabitGroupForm';
import { Habit, HabitType } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { colors } from '../../theme';

function habit(id: string, type: HabitType = 'Checkmark'): Habit {
  return {
    id,
    name: id,
    cadence: 'Day',
    type,
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };
}

const HABITS = [habit('run'), habit('read'), habit('study', 'Hours')];

function renderForm(
  props: Partial<React.ComponentProps<typeof NewHabitGroupForm>> = {},
) {
  const onBack = jest.fn();
  const onCreate = jest.fn();
  const onCreateHabit = jest.fn();
  const utils = render(
    <NewHabitGroupForm
      visible
      habits={HABITS}
      onBack={onBack}
      onCreate={onCreate}
      onCreateHabit={onCreateHabit}
      {...props}
    />,
  );
  return { ...utils, onBack, onCreate, onCreateHabit };
}

function assign(utils: ReturnType<typeof renderForm>, ids: string[]) {
  fireEvent.press(utils.getByTestId('new-group-assign'));
  ids.forEach(id =>
    fireEvent.press(utils.getByTestId(`assign-sheet-item-${id}`)),
  );
  fireEvent.press(utils.getByTestId('assign-sheet-done'));
}

describe('NewHabitGroupForm', () => {
  it('should start as an Any group with its description', () => {
    const { getByTestId } = renderForm();

    expect([
      getByTestId('new-group-type-Any').props.accessibilityState.selected,
      getByTestId('new-group-description').props.children,
    ]).toEqual([true, 'Any one habit marks the group complete']);
  });

  it.each([
    ['Required', 'Some habits must be done to complete the group'],
    ['All', 'Every habit must be done to complete the group'],
    ['Hours', 'Total hours across habits must meet target'],
  ])('should describe %s', (type, text) => {
    const { getByTestId } = renderForm();

    fireEvent.press(getByTestId(`new-group-type-${type}`));

    expect(getByTestId('new-group-description').props.children).toBe(text);
  });

  it('should show the target stepper for Week and the read-only block for Day', () => {
    const { getByTestId, queryByTestId } = renderForm();
    const day = !!queryByTestId('new-group-target-day');

    fireEvent.press(getByTestId('new-group-cadence-Week'));

    expect([day, !!getByTestId('new-group-target-input')]).toEqual([
      true,
      true,
    ]);
  });

  it('should show the streak freeze field defaulting to 7', () => {
    expect(renderForm().getByTestId('new-group-freeze').props.value).toBe('7');
  });

  it('should show assigned habits after Done, with none to start', () => {
    const utils = renderForm();
    const empty = !!utils.queryByText('No habits assigned yet');

    assign(utils, ['run', 'read']);

    expect([
      empty,
      !!utils.getByTestId('new-group-assigned-run'),
      !!utils.getByTestId('new-group-assigned-read'),
    ]).toEqual([true, true, true]);
  });

  it('should grey out habits the group type cannot take', () => {
    const utils = renderForm();
    fireEvent.press(utils.getByTestId('new-group-assign'));

    expect([
      utils.getByTestId('assign-sheet-item-run').props.accessibilityState
        .disabled,
      utils.getByTestId('assign-sheet-item-study').props.accessibilityState
        .disabled,
    ]).toEqual([false, true]);
  });

  it('should drop incompatible habits when the type switches to Hours', () => {
    const utils = renderForm();
    assign(utils, ['run']);

    fireEvent.press(utils.getByTestId('new-group-type-Hours'));

    expect(utils.queryByTestId('new-group-assigned-run')).toBeNull();
  });

  it('should show Required Habits only for Required, and Hours Target only for Hours', () => {
    const utils = renderForm();
    const anyView = [
      utils.queryByText('REQUIRED HABITS'),
      utils.queryByText('HOURS TARGET'),
    ];
    fireEvent.press(utils.getByTestId('new-group-type-Required'));
    const requiredView = !!utils.queryByText('REQUIRED HABITS');
    fireEvent.press(utils.getByTestId('new-group-type-Hours'));

    expect([
      anyView,
      requiredView,
      !!utils.queryByText('HOURS TARGET'),
    ]).toEqual([[null, null], true, true]);
  });

  it('should mark required habits with a blue border', () => {
    const utils = renderForm();
    fireEvent.press(utils.getByTestId('new-group-type-Required'));
    assign(utils, ['run', 'read']);

    fireEvent.press(utils.getByTestId('new-group-edit-required'));
    fireEvent.press(utils.getByTestId('required-sheet-item-run'));
    fireEvent.press(utils.getByTestId('required-sheet-done'));

    const border = (id: string) =>
      StyleSheet.flatten(
        utils.getByTestId(`new-group-assigned-${id}`).props.style,
      ).borderColor;
    expect([border('run'), border('read')]).toEqual([
      colors.v2Blue,
      colors.v2GreyOutline,
    ]);
  });

  it('should disable Create with no habits, and for Required with none required', () => {
    const utils = renderForm();
    fireEvent.changeText(utils.getByTestId('new-group-name'), 'Routine');
    const disabled = () =>
      utils.getByTestId('new-group-create').props.accessibilityState.disabled;
    const noHabits = disabled();
    fireEvent.press(utils.getByTestId('new-group-type-Required'));
    assign(utils, ['run']);

    expect([noHabits, disabled()]).toEqual([true, true]);
  });

  it('should show the helper line while no habit is assigned', () => {
    expect(
      !!renderForm().getByText('Add at least 1 habit to create a group'),
    ).toBe(true);
  });

  it('should submit every field', () => {
    const utils = renderForm();
    fireEvent.changeText(utils.getByTestId('new-group-name'), 'Deep Work');
    fireEvent.press(utils.getByTestId('new-group-cadence-Month'));
    fireEvent.press(utils.getByTestId('new-group-target-increment'));
    fireEvent.changeText(utils.getByTestId('new-group-freeze'), '10');
    fireEvent.press(utils.getByTestId('new-group-type-Hours'));
    assign(utils, ['study']);
    fireEvent.changeText(utils.getByTestId('new-group-hours-input'), '3');

    fireEvent.press(utils.getByTestId('new-group-create'));

    expect(utils.onCreate).toHaveBeenCalledWith({
      name: 'Deep Work',
      cadence: 'Month',
      target: 2,
      streakFreezeInterval: 10,
      groupType: 'Hours',
      habitIds: ['study'],
      requiredHabitIds: [],
      targetHours: 3,
    });
  });

  it('should open Create Habit, and hide it when not allowed', () => {
    const allowed = renderForm();
    fireEvent.press(allowed.getByTestId('new-group-create-habit'));
    const hidden = renderForm({ allowCreateHabit: false });

    expect([
      allowed.onCreateHabit.mock.calls.length,
      hidden.queryByTestId('new-group-create-habit'),
    ]).toEqual([1, null]);
  });

  it('should assign a habit made with Create Habit when it returns', () => {
    const utils = renderForm();

    utils.rerender(
      <NewHabitGroupForm
        visible
        habits={[...HABITS, habit('swim')]}
        newHabitId="swim"
        onBack={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(!!utils.getByTestId('new-group-assigned-swim')).toBe(true);
  });

  describe('opened from the New Habit form', () => {
    const pending: PendingHabit = { name: 'Morning run', type: 'Checkmark' };

    it('should assign the habit being created, locked', () => {
      const utils = renderForm({ pendingHabit: pending });
      fireEvent.press(utils.getByTestId('new-group-assign'));

      expect([
        !!utils.getByTestId('new-group-assigned-pending-habit'),
        utils.getByTestId('assign-sheet-item-pending-habit').props
          .accessibilityState,
      ]).toEqual([true, { checked: true, disabled: true }]);
    });

    it('should disable group types the habit cannot join', () => {
      const utils = renderForm({ pendingHabit: pending });

      expect(
        utils.getByTestId('new-group-type-Hours').props.accessibilityState
          .disabled,
      ).toBe(true);
    });

    it('should start as an Hours group for an Hours habit', () => {
      const utils = renderForm({
        pendingHabit: { name: '', type: 'Hours' },
      });

      expect([
        utils.getByTestId('new-group-type-Hours').props.accessibilityState
          .selected,
        !!utils.getByText('This habit'),
      ]).toEqual([true, true]);
    });
  });
});

describe('NewHabitGroupForm editing', () => {
  const group: HabitGroup = {
    id: 'g',
    name: 'Mornings',
    cadence: 'Day',
    groupType: 'Required',
    habitIds: ['run', 'read'],
    requiredHabitIds: ['run'],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };

  const renderEdit = () => renderForm({ editing: group });
  const saveDisabled = (utils: ReturnType<typeof renderForm>) =>
    utils.getByTestId('new-group-create').props.accessibilityState.disabled;

  it('should show Edit Habit Group with the saved values and a Save button', () => {
    const utils = renderEdit();

    expect([
      !!utils.getByText('Edit Habit Group'),
      !!utils.getByText('Save'),
      utils.getByTestId('new-group-name').props.value,
      !!utils.getByTestId('new-group-assigned-run'),
      utils.getByTestId('new-group-assigned-run').props.accessibilityState
        .selected,
      utils.getByTestId('new-group-assigned-read').props.accessibilityState
        .selected,
    ]).toEqual([true, true, 'Mornings', true, true, false]);
  });

  it('should lock the group type', () => {
    const utils = renderEdit();

    expect(
      ['Any', 'All', 'Hours'].map(
        t =>
          utils.getByTestId(`new-group-type-${t}`).props.accessibilityState
            .disabled,
      ),
    ).toEqual([true, true, true]);
  });

  it('should enable Save once a habit is removed, and save the edit', () => {
    const utils = renderEdit();
    const before = saveDisabled(utils);
    fireEvent.press(utils.getByTestId('new-group-assign'));
    fireEvent.press(utils.getByTestId('assign-sheet-item-read'));
    fireEvent.press(utils.getByTestId('assign-sheet-done'));
    const after = saveDisabled(utils);

    fireEvent.press(utils.getByTestId('new-group-create'));

    expect([before, after, utils.onCreate.mock.calls[0][0].habitIds]).toEqual([
      true,
      false,
      ['run'],
    ]);
  });
});
