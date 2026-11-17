import { StyleSheet, ViewStyle } from 'react-native';
import { formStyles } from './formStyles';

describe('formStyles', () => {
  it('should let the create button grow with the text', () => {
    const style: ViewStyle = StyleSheet.flatten(formStyles.createButton);

    expect([style.height, style.minHeight]).toEqual([undefined, 52]);
  });
});
