import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HelpScreen from './HelpScreen';
import { HELP_TOPICS } from '../../content/howToUse';

function renderScreen(onShowWalkthrough = () => {}) {
  return render(
    <HelpScreen onBack={() => {}} onShowWalkthrough={onShowWalkthrough} />,
  );
}

describe('HelpScreen', () => {
  it('should list all eight topics collapsed', () => {
    const { getByText, queryByTestId } = renderScreen();

    expect([
      HELP_TOPICS.length,
      HELP_TOPICS.every(topic => !!getByText(topic.title)),
      queryByTestId('help-body-create'),
    ]).toEqual([8, true, null]);
  });

  it('should expand a topic when tapped and collapse it again', () => {
    const { getByTestId, queryByTestId } = renderScreen();

    fireEvent.press(getByTestId('help-topic-streaks'));
    const shown = queryByTestId('help-body-streaks')?.props.children;
    fireEvent.press(getByTestId('help-topic-streaks'));

    expect([shown, queryByTestId('help-body-streaks')]).toEqual([
      HELP_TOPICS[2].body,
      null,
    ]);
  });

  it('should show the walkthrough again', () => {
    const onShow = jest.fn();
    const { getByTestId } = renderScreen(onShow);

    fireEvent.press(getByTestId('help-show-walkthrough'));

    expect(onShow).toHaveBeenCalled();
  });
});
