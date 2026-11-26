import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { useIsDark, usePalette } from './src/theming';
import { SettingsProvider } from './src/settings/SettingsProvider';
import { setLightNavigationBar } from './src/systemBars';
import { HabitsList } from './src/screens/HabitsScreen';
import { HabitsDataProvider } from './src/screens/habits/HabitsData';
import HabitDetailScreen, {
  DetailKind,
} from './src/screens/detail/HabitDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ComingSoonScreen from './src/screens/ComingSoonScreen';
import AboutScreen from './src/screens/profile/AboutScreen';
import DisplaySettingsScreen from './src/screens/profile/DisplaySettingsScreen';
import HelpScreen from './src/screens/howToUse/HelpScreen';
import SupportScreen from './src/screens/profile/SupportScreen';
import { consumeLeftoverPurchases } from './src/support/support';
import { playBillingClient } from './src/support/playBillingClient';
import WalkthroughScreen from './src/screens/howToUse/WalkthroughScreen';
import {
  hasSeenOnboarding,
  markOnboardingSeen,
} from './src/storage/onboardingStorage';
import BottomMenu, { Tab } from './src/screens/habits/BottomMenu';
import { useAutoBackup } from './src/hooks/useAutoBackup';

const Tabs = createBottomTabNavigator();

// The Habits list and the habit and group pages, which stack on each other:
// docs/feature-development/release-1-readiness/habit-group-detail-page.md
type HabitsStackParams = {
  HabitsList: undefined;
  Detail: { kind: DetailKind; id: string };
};
const HabitsStack = createNativeStackNavigator<HabitsStackParams>();

function HabitsListRoute({
  navigation,
}: NativeStackScreenProps<HabitsStackParams, 'HabitsList'>) {
  return (
    <HabitsList
      onOpenHabit={id => navigation.push('Detail', { kind: 'habit', id })}
      onOpenGroup={id => navigation.push('Detail', { kind: 'group', id })}
    />
  );
}

function DetailRoute({
  navigation,
  route,
}: NativeStackScreenProps<HabitsStackParams, 'Detail'>) {
  return (
    <HabitDetailScreen
      kind={route.params.kind}
      id={route.params.id}
      onBack={navigation.goBack}
      onOpenGroup={id => navigation.push('Detail', { kind: 'group', id })}
      onOpenHabit={id => navigation.push('Detail', { kind: 'habit', id })}
      onGone={navigation.popToTop}
    />
  );
}

// Data, saves and forms are shared by the list and the pages, and the forms
// open over whichever is showing
function HabitsTab({ dataVersion }: { dataVersion: number }) {
  return (
    <HabitsDataProvider dataVersion={dataVersion}>
      <HabitsStack.Navigator screenOptions={{ headerShown: false }}>
        <HabitsStack.Screen name="HabitsList" component={HabitsListRoute} />
        <HabitsStack.Screen name="Detail" component={DetailRoute} />
      </HabitsStack.Navigator>
    </HabitsDataProvider>
  );
}
// Profile and the screens its menu opens; back returns to the menu
const ProfileStack = createNativeStackNavigator();

interface ProfileTabProps {
  onDataChanged: () => void;
  onShowWalkthrough: () => void;
}

function ProfileTab({ onDataChanged, onShowWalkthrough }: ProfileTabProps) {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMenu">
        {({ navigation }) => (
          <ProfileScreen
            onDataChanged={onDataChanged}
            onOpenAbout={() => navigation.navigate('About')}
            onOpenDisplaySettings={() => navigation.navigate('DisplaySettings')}
            onOpenHowToUse={() => navigation.navigate('HowToUse')}
            onOpenSupport={() => navigation.navigate('Support')}
          />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="DisplaySettings">
        {({ navigation }) => (
          <DisplaySettingsScreen onBack={navigation.goBack} />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="Support">
        {({ navigation }) => <SupportScreen onBack={navigation.goBack} />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="HowToUse">
        {({ navigation }) => (
          <HelpScreen
            onBack={navigation.goBack}
            onShowWalkthrough={onShowWalkthrough}
          />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="About">
        {({ navigation }) => <AboutScreen onBack={navigation.goBack} />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
}

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
  // Bumped when a backup or restore changed the stored habits or settings
  const [dataVersion, setDataVersion] = useState(0);
  const dataChanged = useCallback(() => setDataVersion(v => v + 1), []);

  useAutoBackup(dataChanged);

  // Support purchases left unconsumed last time: support-the-developer.md
  useEffect(() => {
    consumeLeftoverPurchases(playBillingClient);
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider reloadKey={dataVersion}>
        <ThemedApp dataVersion={dataVersion} onDataChanged={dataChanged} />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

interface ThemedAppProps {
  dataVersion: number;
  onDataChanged: () => void;
}

function ThemedApp({
  dataVersion,
  onDataChanged,
}: ThemedAppProps): React.JSX.Element {
  const colors = usePalette();
  const isDark = useIsDark();

  // The app's own colours, so screens don't flash between tabs
  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.v2Background,
        card: colors.v2Background,
      },
    };
  }, [colors, isDark]);

  useEffect(() => {
    setLightNavigationBar(!isDark);
  }, [isDark]);

  // Shown over Habits on first launch, and again from Profile → How to use
  const [walkthrough, setWalkthrough] = useState<'hidden' | 'first' | 'replay'>(
    'hidden',
  );
  useEffect(() => {
    hasSeenOnboarding().then(seen => {
      if (!seen) setWalkthrough('first');
    });
  }, []);
  const closeWalkthrough = useCallback(() => {
    if (walkthrough === 'first') markOnboardingSeen();
    setWalkthrough('hidden');
  }, [walkthrough]);
  const showWalkthrough = useCallback(() => setWalkthrough('replay'), []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
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
            {() => <HabitsTab dataVersion={dataVersion} />}
          </Tabs.Screen>
          <Tabs.Screen name="Journal">
            {() => <ComingSoonScreen section="Journal" />}
          </Tabs.Screen>
          <Tabs.Screen name="Level-Up">
            {() => <ComingSoonScreen section="Level-Up" />}
          </Tabs.Screen>
          <Tabs.Screen name="Profile">
            {() => (
              <ProfileTab
                onDataChanged={onDataChanged}
                onShowWalkthrough={showWalkthrough}
              />
            )}
          </Tabs.Screen>
        </Tabs.Navigator>
      </NavigationContainer>
      <WalkthroughScreen
        visible={walkthrough !== 'hidden'}
        onDone={closeWalkthrough}
      />
    </>
  );
}
