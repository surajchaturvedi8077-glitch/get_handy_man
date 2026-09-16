/**
 * RootNavigator.js
 * ------------------------------------------------------------------
 * Top-level switch: shows LoginScreen while unauthenticated, or the
 * MainTabNavigator (Dashboard/Enquiries/Jobs/Invoices) once logged in.
 * Mirrors ProtectedRoute.jsx from the web app, but as a navigator
 * instead of a route wrapper.
 * ------------------------------------------------------------------
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import useAuth from '../hooks/useAuth';
import LoadingState from '../components/ui/LoadingState';
import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <LoadingState label="Starting up…" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
