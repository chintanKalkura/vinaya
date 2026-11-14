import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import NewHabitForm from './NewHabitForm';
import { HabitGroup, HabitGroupType } from '../../types/habitGroup';

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

    expect([checkmark, [disabled('fitness'), disabled('productive')]]).toEqual([
      [false, true],
      [true, false],
    ]);
  });

  it('should clear the group when the type switch makes it incompatible', () => {
    const { getByTestId, onCreate } = renderForm();
    fireEvent.changeText(getByTestId('new-habit-name'), 'Run');
    fireEvent.press(getByTestId('new-habit-group-fitness'));

    fireEvent.press(getByTestId('new-habit-type-Hours'));
    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate.mock.calls[0][0].groupId).toBeUndefined();
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

  it('should do nothing for + Create Group', () => {
    const { getByTestId, onBack, onCreate } = renderForm();

    fireEvent.press(getByTestId('new-habit-create-group'));

    expect([onBack, onCreate].map(f => f.mock.calls.length)).toEqual([0, 0]);
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

    fireEvent.press(getByTestId('new-habit-create'));

    expect(onCreate).toHaveBeenCalledWith({
      name: 'Study',
      cadence: 'Week',
      target: 2,
      streakFreezeInterval: 10,
      type: 'Hours',
      targetHours: 8,
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

  it('should go back', () => {
    const { getByTestId, onBack } = renderForm();

    fireEvent.press(getByTestId('new-habit-back'));

    expect(onBack).toHaveBeenCalled();
  });
});
