import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import HabitsScreen from './src/screens/HabitsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { Tab } from './src/screens/habits/BottomMenu';
import { useAutoBackup } from './src/hooks/useAutoBackup';

export default function App() {
  const [tab, setTab] = useState<Tab>('Habits');
  // Bumped when a backup or restore changed the stored habits
  const [dataVersion, setDataVersion] = useState(0);
  const dataChanged = useCallback(() => setDataVersion(v => v + 1), []);

  useAutoBackup(dataChanged);

  // Back on Profile returns to Habits; on Habits it leaves the app
  useEffect(() => {
    if (tab === 'Habits') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setTab('Habits');
        return true;
      },
    );
    return () => subscription.remove();
  }, [tab]);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.v2Background}
      />
      {/* Habits stays mounted so its view and filters survive a visit to Profile */}
      <View style={[styles.fill, tab !== 'Habits' && styles.hidden]}>
        <HabitsScreen
          onOpenProfile={() => setTab('Profile')}
          dataVersion={dataVersion}
        />
      </View>
      {tab === 'Profile' && (
        <ProfileScreen
          onOpenHabits={() => setTab('Habits')}
          onDataChanged={dataChanged}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
