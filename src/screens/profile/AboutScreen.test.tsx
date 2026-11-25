import React from 'react';
import { Linking, NativeModules } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import AboutScreen from './AboutScreen';

afterEach(() => {
  delete NativeModules.AppInfo;
  jest.restoreAllMocks();
});

describe('AboutScreen', () => {
  it('should show the app version', async () => {
    NativeModules.AppInfo = {
      getVersionName: jest.fn().mockResolvedValue('1.0.0'),
    };
    const { findByText } = render(<AboutScreen onBack={() => {}} />);

    expect(await findByText('1.0.0')).toBeTruthy();
  });

  it('should show both links but open nothing until they are wired', () => {
    const openURL = jest.spyOn(Linking, 'openURL');
    const { getByText } = render(
      <AboutScreen
        onBack={() => {}}
        privacyPolicyUrl={null}
        accountDeletionUrl={null}
      />,
    );

    fireEvent.press(getByText('Privacy policy'));
    fireEvent.press(getByText('Delete account data'));

    expect(openURL).not.toHaveBeenCalled();
  });

  it('should open a link once its page is set', () => {
    const openURL = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    const { getByTestId } = render(
      <AboutScreen
        onBack={() => {}}
        privacyPolicyUrl="https://example.com/privacy"
        accountDeletionUrl={null}
      />,
    );

    fireEvent.press(getByTestId('about-privacy'));

    expect(openURL).toHaveBeenCalledWith('https://example.com/privacy');
  });

  it('should go back from the header arrow', () => {
    const onBack = jest.fn();
    const { getByTestId } = render(<AboutScreen onBack={onBack} />);

    fireEvent.press(getByTestId('about-back'));

    expect(onBack).toHaveBeenCalled();
  });
});
