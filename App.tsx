import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import JournalScreen from './src/screens/JournalScreen';
import {colors} from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
      <JournalScreen />
    </SafeAreaProvider>
  );
}
