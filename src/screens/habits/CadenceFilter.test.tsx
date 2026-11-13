import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, within } from '@testing-library/react-native';
import CadenceFilter, { CadenceFilterValue } from './CadenceFilter';
import { colors } from '../../theme';

function renderFilter(value: CadenceFilterValue = 'All', onChange = jest.fn()) {
  const utils = render(<CadenceFilter value={value} onChange={onChange} />);
  return { ...utils, onChange };
}

function openMenu(utils: ReturnType<typeof renderFilter>) {
  fireEvent.press(utils.getByTestId('cadence-filter'));
}

describe('CadenceFilter', () => {
  it('should show the selected value', () => {
    expect(
      renderFilter('Week').getByTestId('cadence-filter'),
    ).toHaveTextContent('Week');
  });

  it('should show a down chevron when closed', () => {
    expect(
      renderFilter().getByTestId('cadence-filter-chevron-down', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
  });

  it('should keep the menu hidden until pressed', () => {
    expect(renderFilter().queryByTestId('cadence-filter-menu')).toBeNull();
  });

  it('should list All, Day, Week, Month and Year when opened', () => {
    const utils = renderFilter();
    openMenu(utils);

    expect(
      ['All', 'Day', 'Week', 'Month', 'Year'].every(
        option => !!utils.getByTestId(`cadence-option-${option}`),
      ),
    ).toBe(true);
  });

  it('should flip the chevron up when opened', () => {
    const utils = renderFilter();
    openMenu(utils);

    expect(
      utils.getByTestId('cadence-filter-chevron-up', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
  });

  it('should show the selected option orange and checked', () => {
    const utils = renderFilter('Month');
    openMenu(utils);
    const option = utils.getByTestId('cadence-option-Month');

    expect([
      option.props.accessibilityState.selected,
      StyleSheet.flatten(within(option).getByText('Month').props.style).color,
    ]).toEqual([true, colors.v2Orange]);
  });

  it('should show the other options grey', () => {
    const utils = renderFilter('Month');
    openMenu(utils);

    expect(StyleSheet.flatten(utils.getByText('Week').props.style).color).toBe(
      colors.v2GreyText,
    );
  });

  it('should call onChange with the chosen option', () => {
    const utils = renderFilter();
    openMenu(utils);

    fireEvent.press(utils.getByTestId('cadence-option-Year'));

    expect(utils.onChange).toHaveBeenCalledWith('Year');
  });

  it('should close after an option is chosen', () => {
    const utils = renderFilter();
    openMenu(utils);

    fireEvent.press(utils.getByTestId('cadence-option-Year'));

    expect(utils.queryByTestId('cadence-filter-menu')).toBeNull();
  });

  it('should close without a change when the backdrop is tapped', () => {
    const utils = renderFilter();
    openMenu(utils);

    fireEvent.press(utils.getByTestId('cadence-filter-backdrop'));

    expect([
      utils.queryByTestId('cadence-filter-menu'),
      utils.onChange.mock.calls.length,
    ]).toEqual([null, 0]);
  });
});
