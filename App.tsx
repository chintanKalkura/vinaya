import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/theme';
import HabitsScreen from './src/screens/HabitsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ComingSoonScreen from './src/screens/ComingSoonScreen';
import AboutScreen from './src/screens/profile/AboutScreen';
import BottomMenu, { Tab } from './src/screens/habits/BottomMenu';
import { useAutoBackup } from './src/hooks/useAutoBackup';

const Tabs = createBottomTabNavigator();
// Profile and the screens its menu opens; back returns to the menu
const ProfileStack = createNativeStackNavigator();

function ProfileTab({ onDataChanged }: { onDataChanged: () => void }) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMenu">
        {({ navigation }) => (
          <ProfileScreen
            onDataChanged={onDataChanged}
            onOpenAbout={() => navigation.navigate('About')}
          />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="About">
        {({ navigation }) => <AboutScreen onBack={navigation.goBack} />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
}

// The app's own colours, so screens don't flash white between tabs
const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.v2Background,
    card: colors.v2Background,
  },
};

// Our bottom menu as the tab bar: docs/style-choices/habits-section/header-and-bottom-menu.md
function TabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <BottomMenu
      selected={state.routes[state.index].name as Tab}
      onSelect={tab => navigation.navigate(tab)}
    />
  );
}

export default function App() {
  // Bumped when a backup or restore changed the stored habits
  const [dataVersion, setDataVersion] = useState(0);
  const dataChanged = useCallback(() => setDataVersion(v => v + 1), []);

  useAutoBackup(dataChanged);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.v2Background}
      />
      <NavigationContainer theme={navigationTheme}>
        {/* Back on another tab returns to Habits; on Habits it leaves the app.
            Visited tabs stay mounted, so Habits keeps its view and filters. */}
        <Tabs.Navigator
          tabBar={TabBar}
          backBehavior="firstRoute"
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="Habits">
            {() => <HabitsScreen dataVersion={dataVersion} />}
          </Tabs.Screen>
          <Tabs.Screen name="Journal">
            {() => <ComingSoonScreen section="Journal" />}
          </Tabs.Screen>
          <Tabs.Screen name="Level-Up">
            {() => <ComingSoonScreen section="Level-Up" />}
          </Tabs.Screen>
          <Tabs.Screen name="Profile">
            {() => <ProfileTab onDataChanged={dataChanged} />}
          </Tabs.Screen>
        </Tabs.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
