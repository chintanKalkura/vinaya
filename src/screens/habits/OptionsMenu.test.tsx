import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Calendar, Pencil, Trash2 } from 'lucide-react-native';
import OptionsMenu, { MenuItem } from './OptionsMenu';

function renderMenu(items: MenuItem[]) {
  const utils = render(
    <OptionsMenu kind="habit" testID="menu" items={items} />,
  );
  fireEvent.press(utils.getByTestId('menu'));
  return utils;
}

describe('OptionsMenu', () => {
  it('should list its items and run the one tapped', () => {
    const edit = jest.fn();
    const utils = renderMenu([
      { key: 'edit', label: 'Edit', Icon: Pencil, onPress: edit },
      {
        key: 'past',
        label: 'Edit past days',
        Icon: Calendar,
        onPress: jest.fn(),
      },
    ]);

    const labels = [utils.getByText('Edit'), utils.getByText('Edit past days')]
      .length;
    fireEvent.press(utils.getByTestId('menu-edit'));

    expect([labels, edit.mock.calls.length]).toEqual([2, 1]);
  });

  it('should ask before running a danger item', () => {
    const remove = jest.fn();
    const utils = renderMenu([
      {
        key: 'delete',
        label: 'Delete habit',
        Icon: Trash2,
        danger: true,
        onPress: remove,
      },
    ]);

    fireEvent.press(utils.getByTestId('menu-delete'));
    const before = remove.mock.calls.length;
    fireEvent.press(utils.getByTestId('menu-confirm-delete'));

    expect([before, remove.mock.calls.length]).toEqual([0, 1]);
  });

  it('should not run a disabled item', () => {
    const past = jest.fn();
    const utils = renderMenu([
      {
        key: 'past',
        label: 'Edit past days',
        Icon: Calendar,
        onPress: past,
        disabled: true,
      },
    ]);

    fireEvent.press(utils.getByTestId('menu-past'));

    expect([
      past.mock.calls.length,
      utils.getByTestId('menu-past').props.accessibilityState.disabled,
    ]).toEqual([0, true]);
  });
});
