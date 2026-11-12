import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import HabitsScreen from './src/screens/HabitsScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.v2Background}
      />
      <HabitsScreen />
    </SafeAreaProvider>
  );
}
