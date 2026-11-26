import { StyleSheet, ViewStyle } from 'react-native';
import { darkColors } from '../../theme';
import { makeFormStyles } from './formStyles';

describe('formStyles', () => {
  it('should let the create button grow with the text', () => {
    const style: ViewStyle = StyleSheet.flatten(
      makeFormStyles(darkColors).createButton,
    );

    expect([style.height, style.minHeight]).toEqual([undefined, 52]);
  });
});
