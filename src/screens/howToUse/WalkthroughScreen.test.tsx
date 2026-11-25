import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WalkthroughScreen from './WalkthroughScreen';
import { WALKTHROUGH_CARDS } from '../../content/howToUse';

describe('WalkthroughScreen', () => {
  it('should show all five cards', () => {
    const { getByText } = render(
      <WalkthroughScreen visible onDone={() => {}} />,
    );

    expect(WALKTHROUGH_CARDS.map(card => !!getByText(card.title))).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
  });

  it('should finish from Skip', () => {
    const onDone = jest.fn();
    const { getByTestId } = render(
      <WalkthroughScreen visible onDone={onDone} />,
    );

    fireEvent.press(getByTestId('walkthrough-skip'));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('should step through with Next and finish with Get started', () => {
    const onDone = jest.fn();
    const { getByTestId, getByText } = render(
      <WalkthroughScreen visible onDone={onDone} />,
    );

    for (let i = 0; i < WALKTHROUGH_CARDS.length - 1; i++) {
      fireEvent.press(getByTestId('walkthrough-next'));
    }
    const label = !!getByText('Get started');
    fireEvent.press(getByTestId('walkthrough-next'));

    expect([label, onDone.mock.calls.length]).toEqual([true, 1]);
  });

  it('should mention both habit types, configurable freezes and the cloud', () => {
    const text = WALKTHROUGH_CARDS.map(card => card.body).join(' ');

    expect([
      text.includes('Checkmark') && text.includes('Hours'),
      text.includes('you choose how many streak days earn one'),
      text.includes('to the cloud'),
      text.includes('Google Drive'),
    ]).toEqual([true, true, true, false]);
  });
});
