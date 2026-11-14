import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import BannerMenu from './BannerMenu';

function renderMenu(kind: 'habit' | 'group' = 'habit') {
  const onDelete = jest.fn();
  const utils = render(
    <BannerMenu kind={kind} onDelete={onDelete} testID="m" />,
  );
  return { ...utils, onDelete };
}

describe('BannerMenu', () => {
  it('should open a menu with Delete habit and Cancel', () => {
    const { getByTestId, getByText } = renderMenu();

    fireEvent.press(getByTestId('m'));

    expect([!!getByText('Delete habit'), !!getByText('Cancel')]).toEqual([
      true,
      true,
    ]);
  });

  it('should say Delete group for a group', () => {
    const { getByTestId, getByText } = renderMenu('group');

    fireEvent.press(getByTestId('m'));

    expect(!!getByText('Delete group')).toBe(true);
  });

  it('should ask for confirmation, then delete', () => {
    const { getByTestId, getByText, onDelete } = renderMenu();
    fireEvent.press(getByTestId('m'));
    fireEvent.press(getByTestId('m-delete'));
    const asked = !!getByText('Are you sure?');

    fireEvent.press(getByTestId('m-confirm-delete'));

    expect([asked, onDelete.mock.calls.length]).toEqual([true, 1]);
  });

  it('should not delete when cancelled from the menu', () => {
    const { getByTestId, queryByTestId, onDelete } = renderMenu();
    fireEvent.press(getByTestId('m'));

    fireEvent.press(getByTestId('m-cancel'));

    expect([queryByTestId('m-delete'), onDelete.mock.calls.length]).toEqual([
      null,
      0,
    ]);
  });

  it('should not delete when cancelled from the confirm step', () => {
    const { getByTestId, queryByText, onDelete } = renderMenu();
    fireEvent.press(getByTestId('m'));
    fireEvent.press(getByTestId('m-delete'));

    fireEvent.press(getByTestId('m-confirm-cancel'));

    expect([queryByText('Are you sure?'), onDelete.mock.calls.length]).toEqual([
      null,
      0,
    ]);
  });
});
