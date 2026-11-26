import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import NewHabitForm from './NewHabitForm';
import { Habit } from '../../types/habit';
import { HabitGroup, HabitGroupType } from '../../types/habitGroup';
import { colors } from '../../theme';

function group(id: string, groupType: HabitGroupType): HabitGroup {
  return {
    id,
    name: id,
    cadence: 'Day',
    groupType,
    habitIds: [],
    streakFreezeInterval: 7,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };
}

const GROUPS = [group('fitness', 'Any'), group('productive', 'Hours')];

function renderForm() {
  const onBack = jest.fn();
  const onCreate = jest.fn();
  const utils = render(
    <NewHabitForm
      visible
      groups={GROUPS}
      onBack={onBack}
      onCreate={onCreate}
    />,
  );
  return { ...utils, onBack, onCreate };
}

describe('NewHabitForm', () => {
  it('should show the read-only target block for Day', () => {
    const { getByText, queryByTestId } = renderForm();

    expect([
      !!getByText('Repeats every day, no target needed'),
      queryByTestId('new-habit-target-input'),
    ]).toEqual([true, null]);
  });

  it.each([
    ['Week', 'of 6 max'],
    ['Month', 'of 20 max'],
    ['Year', 'of 100 max'],
  ])('should show the target stepper for %s with "%s"', (cadence, suffix) => {
    const { getByTestId, getByText } = renderForm();

    fireEvent.press(getByTestId(`new-habit-cadence-${cadence}`));

    expect([
      !!getByTestId('new-habit-target-input'),
      !!getByText(suffix),
    ]).toEqual([true, true]);
  });

  it('should clamp the target when switching from Year to Week', () => {
    const { getByTestId } = renderForm();
    fireEvent.press(getByTestId('new-habit-cadence-Year'));
    fireEvent.changeText(getByTestId('new-habit-target-input'), '50');

    fireEvent.press(getByTestId('new-habit-cadence-Week'));

    expect(getByTestId('new-habit-target-input').props.value).toBe('6');
  });

  it('should show Daily Target Hours only for Hours', () => {
    const { getByTestId, queryByText } = renderForm();
    const before = queryByText('DAILY TARGET HOURS');

    fireEvent.press(getByTestId('new-habit-type-Hours'));

    expect([before, !!queryByText('DAILY TARGET HOURS')]).toEqual([null, true]);
  });

  it('should disable groups the habit type cannot join', () => {
    const { getByTestId } = renderForm();
    const disabled = (id: string) =>
      getByTestId(`new-habit-group-${id}`).props.accessibilityState.disabled;

    const checkmark = [disabled('fitness'), disabled('productive')];
    fireEvent.press(getByTestId('new-habit-type-Hours'));

    // Hours habits can join any group: hours-habits-in-any-group.md
    expect([checkmark, [disabled('fitness'), disabled('productive')]]).toEqual([
      [false, true],
      [false, false],
    ]);
  });

  it('should clear the group when the type switch makes it incompatible', () => {
    const { getByTestId, onCreate } = renderForm();
    fireEvent.changeText(getByTestId('new-habit-name'), 'Run');
    fireEvent.press(getByTestId('new-habit-type-Hours'));
    fireEvent.press(getByTestId('new-habit-group-productive'));

    fireEvent.press(getByTestId('new-habit-type-Checkmark'));
    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate.mock.calls[0][0].groupId).toBeUndefined();
  });

  it('should keep a Checkmark-style group when switching to Hours', () => {
    const { getByTestId, onCreate } = renderForm();
    fireEvent.changeText(getByTestId('new-habit-name'), 'Read');
    fireEvent.press(getByTestId('new-habit-group-fitness'));

    fireEvent.press(getByTestId('new-habit-type-Hours'));
    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate.mock.calls[0][0].groupId).toBe('fitness');
  });

  it('should clear the group when the selected chip is tapped again', () => {
    const { getByTestId } = renderForm();
    const chip = () => getByTestId('new-habit-group-fitness');

    fireEvent.press(chip());
    const selected = chip().props.accessibilityState.selected;
    fireEvent.press(chip());

    expect([selected, chip().props.accessibilityState.selected]).toEqual([
      true,
      false,
    ]);
  });

  it('should open + Create Group with the draft', () => {
    const onCreateGroup = jest.fn();
    const { getByTestId } = render(
      <NewHabitForm
        visible
        groups={GROUPS}
        onBack={jest.fn()}
        onCreate={jest.fn()}
        onCreateGroup={onCreateGroup}
      />,
    );
    fireEvent.changeText(getByTestId('new-habit-name'), 'Run');

    fireEvent.press(getByTestId('new-habit-create-group'));

    expect(onCreateGroup.mock.calls[0][0]).toMatchObject({
      name: 'Run',
      type: 'Checkmark',
    });
  });

  it('should select a group made with + Create Group when it returns', () => {
    const props = {
      visible: true,
      groups: GROUPS,
      onBack: jest.fn(),
      onCreate: jest.fn(),
    };
    const { getByTestId, rerender } = render(<NewHabitForm {...props} />);

    rerender(
      <NewHabitForm
        {...props}
        pendingGroup={{ name: 'Mornings', groupType: 'Any' }}
      />,
    );

    expect(
      getByTestId('new-habit-group-pending-group').props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('should hide the group row when opened from the group form', () => {
    const { queryByText } = render(
      <NewHabitForm
        visible
        groups={GROUPS}
        hideGroupRow
        onBack={jest.fn()}
        onCreate={jest.fn()}
      />,
    );

    expect(queryByText('HABIT GROUP')).toBeNull();
  });

  it('should disable Create Habit while the name is empty', () => {
    const { getByTestId, onCreate } = renderForm();

    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should submit every field', () => {
    const { getByTestId, onCreate } = renderForm();
    fireEvent.changeText(getByTestId('new-habit-name'), 'Study');
    fireEvent.press(getByTestId('new-habit-cadence-Week'));
    fireEvent.press(getByTestId('new-habit-target-increment'));
    fireEvent.changeText(getByTestId('new-habit-freeze'), '10');
    fireEvent.press(getByTestId('new-habit-type-Hours'));
    fireEvent.changeText(getByTestId('new-habit-hours-input'), '8');
    fireEvent.press(getByTestId('new-habit-group-productive'));
    fireEvent.press(getByTestId('new-habit-colour-green'));

    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate).toHaveBeenCalledWith({
      name: 'Study',
      cadence: 'Week',
      target: 2,
      streakFreezeInterval: 10,
      type: 'Hours',
      targetHours: 8,
      colour: 'green',
      groupId: 'productive',
    });
  });

  it('should clamp the streak freeze to 100', () => {
    const { getByTestId, onCreate } = renderForm();
    fireEvent.changeText(getByTestId('new-habit-name'), 'Run');
    fireEvent.changeText(getByTestId('new-habit-freeze'), '500');

    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate.mock.calls[0][0].streakFreezeInterval).toBe(100);
  });

  it('should start on orange with the preview closed', () => {
    const { getByTestId, queryByTestId } = renderForm();

    expect([
      getByTestId('new-habit-colour-orange').props.accessibilityState.selected,
      queryByTestId('new-habit-colour-preview-panel'),
    ]).toEqual([true, null]);
  });

  it('should open the preview and follow the chosen colour while open', () => {
    const { getByTestId } = renderForm();
    fireEvent.press(getByTestId('new-habit-colour-preview-toggle'));
    fireEvent.press(getByTestId('new-habit-colour-blue'));
    const preview = StyleSheet.flatten(
      getByTestId('new-habit-colour-preview').props.style,
    );

    expect([
      getByTestId('new-habit-colour-preview-toggle').props.accessibilityState
        .expanded,
      preview.borderColor,
      preview.backgroundColor,
    ]).toEqual([
      true,
      colors.completion.blue.accent,
      colors.completion.blue.tint,
    ]);
  });

  it('should close the preview with the close button or Preview again', () => {
    const { getByTestId, queryByTestId } = renderForm();
    const toggle = () =>
      fireEvent.press(getByTestId('new-habit-colour-preview-toggle'));
    const isOpen = () => !!queryByTestId('new-habit-colour-preview-panel');

    toggle();
    fireEvent.press(getByTestId('new-habit-colour-preview-close'));
    const afterClose = isOpen();
    toggle();
    toggle();

    expect([afterClose, isOpen()]).toEqual([false, false]);
  });

  it('should go back', () => {
    const { getByTestId, onBack } = renderForm();

    fireEvent.press(getByTestId('new-habit-back'));

    expect(onBack).toHaveBeenCalled();
  });
});

describe('NewHabitForm editing', () => {
  const habit: Habit = {
    id: 'run',
    name: 'Run',
    cadence: 'Week',
    type: 'Checkmark',
    target: 3,
    streakFreezeInterval: 5,
    status: 'active',
    sortOrder: 0,
    createdAt: 0,
    recentLog: [],
    history: [],
  };

  const renderEdit = () => {
    const onCreate = jest.fn();
    const utils = render(
      <NewHabitForm
        visible
        groups={GROUPS}
        editing={habit}
        onBack={jest.fn()}
        onCreate={onCreate}
      />,
    );
    return { ...utils, onCreate };
  };
  const saveDisabled = (utils: ReturnType<typeof renderEdit>) =>
    utils.getByTestId('new-habit-create').props.accessibilityState.disabled;

  it('should show Edit Habit with the saved values and a Save button', () => {
    const utils = renderEdit();

    expect([
      !!utils.getByText('Edit Habit'),
      !!utils.getByText('Save'),
      utils.getByTestId('new-habit-name').props.value,
      utils.getByTestId('new-habit-cadence-Week').props.accessibilityState
        .selected,
      utils.getByTestId('new-habit-target-input').props.value,
      utils.getByTestId('new-habit-freeze').props.value,
    ]).toEqual([true, true, 'Run', true, '3', '5']);
  });

  it('should lock the type and hide the group row', () => {
    const utils = renderEdit();

    expect([
      utils.getByTestId('new-habit-type-Hours').props.accessibilityState
        .disabled,
      utils.queryByText('HABIT GROUP'),
    ]).toEqual([true, null]);
  });

  it('should enable Save only while something has changed', () => {
    const utils = renderEdit();
    const before = saveDisabled(utils);
    fireEvent.press(utils.getByTestId('new-habit-target-increment'));
    const changed = saveDisabled(utils);
    fireEvent.press(utils.getByTestId('new-habit-target-decrement'));

    expect([before, changed, saveDisabled(utils)]).toEqual([true, false, true]);
  });

  it('should load the saved colour, and enable Save when it changes', () => {
    const utils = renderEdit();
    const selected = (id: string) =>
      utils.getByTestId(`new-habit-colour-${id}`).props.accessibilityState
        .selected;
    const before = [selected('orange'), saveDisabled(utils)];
    fireEvent.press(utils.getByTestId('new-habit-colour-purple'));

    expect([before, [selected('purple'), saveDisabled(utils)]]).toEqual([
      [true, true],
      [true, false],
    ]);
  });

  it('should save the edited draft', () => {
    const utils = renderEdit();
    fireEvent.changeText(utils.getByTestId('new-habit-name'), 'Morning run');

    fireEvent.press(utils.getByTestId('new-habit-create'));

    expect(utils.onCreate.mock.calls[0][0]).toMatchObject({
      name: 'Morning run',
      cadence: 'Week',
      target: 3,
      streakFreezeInterval: 5,
    });
  });
});
