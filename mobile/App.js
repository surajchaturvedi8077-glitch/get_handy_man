/**
 * App.js
 * ------------------------------------------------------------------
 * Root component: wraps the whole app in the shared context providers
 * (auth, settings, toast) and the navigation container. Kept tiny —
 * the actual screens live in src/screens/, routing in src/navigation/.
 * ------------------------------------------------------------------
 */
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
