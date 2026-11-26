import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import EditPastDaysSheet from './EditPastDaysSheet';
import { Habit } from '../../types/habit';

const TODAY = '2026-11-26';
const created = new Date(2026, 10, 1, 9).getTime();
const mark = (date: string) => ({ date, kind: 'marker' as const, value: 1 });

const habit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'run',
  name: 'Run',
  cadence: 'Day',
  type: 'Checkmark',
  streakFreezeInterval: 7,
  status: 'active',
  sortOrder: 0,
  createdAt: created,
  recentLog: [],
  history: [mark('2026-11-24')],
  ...overrides,
});

function renderSheet(item: Habit = habit(), saveResult = true) {
  const onSave = jest.fn().mockResolvedValue(saveResult);
  const onClose = jest.fn();
  const utils = render(
    <EditPastDaysSheet
      habit={item}
      todayKey={TODAY}
      weekStart="monday"
      onSave={onSave}
      onClose={onClose}
    />,
  );
  return { ...utils, onSave, onClose };
}

describe('EditPastDaysSheet', () => {
  it('should cover the last 7 days for a Day habit, not today', () => {
    const utils = renderSheet();
    const tappable = (key: string) =>
      utils.getByTestId(`day-${key}`).props.accessibilityRole === 'button';

    expect([
      !!utils.getByText(
        'Run · the last 7 days. Tap days to mark or unmark them.',
      ),
      tappable('2026-11-19'),
      tappable('2026-11-25'),
      tappable('2026-11-18'),
      tappable(TODAY),
    ]).toEqual([true, true, true, false, false]);
  });

  it('should save several marks and unmarks in one go', async () => {
    const utils = renderSheet();
    fireEvent.press(utils.getByTestId('day-2026-11-24'));
    fireEvent.press(utils.getByTestId('day-2026-11-22'));
    fireEvent.press(utils.getByTestId('day-2026-11-23'));
    fireEvent.press(utils.getByTestId('day-2026-11-23'));
    const label = utils.getByText(/^Save/).props.children;

    fireEvent.press(utils.getByTestId('past-days-save'));

    await waitFor(() => expect(utils.onClose).toHaveBeenCalled());
    expect([label, utils.onSave.mock.calls[0][0]]).toEqual([
      'Save 2 changes',
      [
        { date: '2026-11-24', value: 0 },
        { date: '2026-11-22', value: 1 },
      ],
    ]);
  });

  it('should drop changes on Discard and on a tap outside', () => {
    const utils = renderSheet();
    fireEvent.press(utils.getByTestId('day-2026-11-22'));
    fireEvent.press(utils.getByTestId('past-days-discard'));
    fireEvent.press(utils.getByTestId('past-days-backdrop'));

    expect([
      utils.onClose.mock.calls.length,
      utils.onSave.mock.calls.length,
    ]).toEqual([2, 0]);
  });

  it('should just close when nothing changed', async () => {
    const utils = renderSheet();
    fireEvent.press(utils.getByTestId('past-days-save'));

    await waitFor(() => expect(utils.onClose).toHaveBeenCalled());
    expect(utils.onSave).not.toHaveBeenCalled();
  });

  it('should stay open when the save fails', async () => {
    const utils = renderSheet(habit(), false);
    fireEvent.press(utils.getByTestId('day-2026-11-22'));
    fireEvent.press(utils.getByTestId('past-days-save'));

    await waitFor(() => expect(utils.onSave).toHaveBeenCalled());
    expect(utils.onClose).not.toHaveBeenCalled();
  });

  it('should set an Hours day with the stepper', async () => {
    const hours = { date: '2026-11-24', kind: 'hours' as const, value: 1 };
    const utils = renderSheet(
      habit({ type: 'Hours', targetHours: 2, history: [hours] }),
    );
    const hint = !!utils.getByText('Tap a day to set its hours');
    fireEvent.press(utils.getByTestId('day-2026-11-24'));
    fireEvent.press(utils.getByTestId('past-days-stepper-increment'));
    fireEvent.press(utils.getByTestId('past-days-save'));

    await waitFor(() => expect(utils.onSave).toHaveBeenCalled());
    expect([hint, utils.onSave.mock.calls[0][0]]).toEqual([
      true,
      [{ date: '2026-11-24', value: 2 }],
    ]);
  });

  it('should show a frozen day with its label', () => {
    const utils = renderSheet(
      habit({
        streakFreeze: {
          available: 0,
          earnedAtStreak: 0,
          frozenDates: ['2026-11-23'],
        },
      }),
    );

    expect(utils.getByTestId('day-2026-11-23').props.accessibilityLabel).toBe(
      'Mon 23 Nov, frozen',
    );
  });

  it('should show nothing on the creation day', () => {
    const utils = renderSheet(
      habit({ createdAt: new Date(2026, 10, 26, 9).getTime() }),
    );

    expect(utils.queryByTestId('past-days-sheet')).toBeNull();
  });
});
