import React from 'react';
import {render} from '@testing-library/react-native';
import IntentionsSection from './IntentionsSection';

const defaultProps = {
  intentions: ['a', 'b', 'c'] as [string, string, string],
  onChange: jest.fn(),
};

describe('IntentionsSection', () => {
  it('should wire onFocus onto the first intention TextInput', () => {
    const onFocus = jest.fn();
    const {getByPlaceholderText} = render(
      <IntentionsSection {...defaultProps} onFocus={onFocus} />,
    );
    expect(getByPlaceholderText('First intention for tomorrow...').props.onFocus).toBe(onFocus);
  });

  it('should wire onFocus onto the second intention TextInput', () => {
    const onFocus = jest.fn();
    const {getByPlaceholderText} = render(
      <IntentionsSection {...defaultProps} onFocus={onFocus} />,
    );
    expect(getByPlaceholderText('Second intention for tomorrow...').props.onFocus).toBe(onFocus);
  });

  it('should wire onFocus onto the third intention TextInput', () => {
    const onFocus = jest.fn();
    const {getByPlaceholderText} = render(
      <IntentionsSection {...defaultProps} onFocus={onFocus} />,
    );
    expect(getByPlaceholderText('Third intention for tomorrow...').props.onFocus).toBe(onFocus);
  });

  it('should not set onFocus on TextInputs when prop is not provided', () => {
    const {getByPlaceholderText} = render(<IntentionsSection {...defaultProps} />);
    expect(getByPlaceholderText('First intention for tomorrow...').props.onFocus).toBeUndefined();
  });
});
