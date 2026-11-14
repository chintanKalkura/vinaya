import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import BannerMenu from './BannerMenu';

function renderMenu(kind: 'habit' | 'group' = 'habit') {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  const utils = render(
    <BannerMenu kind={kind} onEdit={onEdit} onDelete={onDelete} testID="m" />,
  );
  return { ...utils, onEdit, onDelete };
}

describe('BannerMenu', () => {
  it('should open a dropdown with Edit and Delete', () => {
    const { getByTestId, getByText } = renderMenu();

    fireEvent.press(getByTestId('m'));

    expect([
      !!getByTestId('m-dropdown'),
      !!getByText('Edit'),
      !!getByText('Delete'),
    ]).toEqual([true, true, true]);
  });

  it('should open the edit form from Edit and close the dropdown', () => {
    const { getByTestId, queryByTestId, onEdit } = renderMenu();
    fireEvent.press(getByTestId('m'));

    fireEvent.press(getByTestId('m-edit'));

    expect([onEdit.mock.calls.length, queryByTestId('m-dropdown')]).toEqual([
      1,
      null,
    ]);
  });

  it('should offer the same options on a group', () => {
    const { getByTestId } = renderMenu('group');

    fireEvent.press(getByTestId('m'));

    expect([!!getByTestId('m-edit'), !!getByTestId('m-delete')]).toEqual([
      true,
      true,
    ]);
  });

  it('should ask for confirmation, then delete', () => {
    const { getByTestId, getByText, queryByTestId, onDelete } = renderMenu();
    fireEvent.press(getByTestId('m'));
    fireEvent.press(getByTestId('m-delete'));
    const asked = [!!getByText('Are you sure?'), queryByTestId('m-dropdown')];

    fireEvent.press(getByTestId('m-confirm-delete'));

    expect([asked, onDelete.mock.calls.length]).toEqual([[true, null], 1]);
  });

  it('should close the dropdown without deleting when tapped outside', () => {
    const { getByTestId, queryByTestId, onDelete } = renderMenu();
    fireEvent.press(getByTestId('m'));

    fireEvent.press(getByTestId('m-backdrop'));

    expect([queryByTestId('m-dropdown'), onDelete.mock.calls.length]).toEqual([
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
