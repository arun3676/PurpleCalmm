import React from 'react';
import { NavigationContainer, DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { ThemeProvider, useAppTheme } from './theme/ThemeProvider';
import HomeScreen from './screens/HomeScreen';
import CalmScreen from './screens/CalmScreen';
import SleepScreen from './screens/SleepScreen';
import MigraineScreen from './screens/MigraineScreen';
import JournalScreen from './screens/JournalScreen';
import JournalTrendsScreen from './screens/JournalTrendsScreen';
import SettingsScreen from './screens/SettingsScreen';
import CatChatScreen from './screens/CatChatScreen';
import { SettingsProvider } from './providers/SettingsProvider';

export type RootStackParamList = {
  Home: undefined;
  Calm: undefined;
  Sleep: undefined;
  Migraine: undefined;
  Journal: undefined;
  JournalTrends: undefined;
  Settings: undefined;
  CatChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function ThemedNavContainer({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useAppTheme();
  const navTheme: NavTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: colors.primary
    }
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {children}
    </NavigationContainer>
  );
}

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Calm" component={CalmScreen} />
      <Stack.Screen name="Sleep" component={SleepScreen} />
      <Stack.Screen name="Migraine" component={MigraineScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="JournalTrends" component={JournalTrendsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="CatChat" component={CatChatScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider onApplyTheme={(t) => { try { if (typeof document !== 'undefined') { document.documentElement.setAttribute('data-theme', t); } } catch {} }}>
          <ThemeProvider>
            <ThemedNavContainer>
              {/* Gate wraps the app and shows a small splash while hydrating */}
              {/** BEGIN gate **/}
              {React.createElement(require('./components/AppGate').default, { splashSrc: '/assets/loading_cat.png' },
                React.createElement(RootNavigator, null)
              )}
              {/** END gate **/}
            </ThemedNavContainer>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
