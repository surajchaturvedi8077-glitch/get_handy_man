import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

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