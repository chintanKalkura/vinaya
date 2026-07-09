import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import EvePage from './EvePage';

const baseProps = {
  intentions: ['', '', ''] as [string, string, string],
  onIntentionChange: jest.fn(),
  onLogged: jest.fn(),
  isLogged: false,
  totalDays: 21,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EvePage', () => {
  it('should render the intro text with totalDays', () => {
    const {getByText} = render(<EvePage {...baseProps} />);
    expect(getByText(/21 days/)).toBeTruthy();
  });

  it('should render the Logged button', () => {
    const {getByText} = render(<EvePage {...baseProps} />);
    expect(getByText('Logged')).toBeTruthy();
  });

  it('should call onLogged when Logged button is pressed', () => {
    const {getByText} = render(<EvePage {...baseProps} />);
    fireEvent.press(getByText('Logged'));
    expect(baseProps.onLogged).toHaveBeenCalledTimes(1);
  });

  it('should show intentions section with correct title', () => {
    const {getByText} = render(<EvePage {...baseProps} />);
    expect(getByText('Three intentions for Day 1')).toBeTruthy();
  });

  it('should render pre-filled intentions when provided', () => {
    const props = {
      ...baseProps,
      intentions: ['First', 'Second', 'Third'] as [string, string, string],
    };
    const {getByDisplayValue} = render(<EvePage {...props} />);
    expect(getByDisplayValue('First')).toBeTruthy();
    expect(getByDisplayValue('Second')).toBeTruthy();
    expect(getByDisplayValue('Third')).toBeTruthy();
  });
});
