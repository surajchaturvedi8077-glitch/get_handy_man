/**
 * DashboardStack.js
 * ------------------------------------------------------------------
 * Dashboard tab: the home screen, plus Settings pushed on top (there's
 * no separate Settings tab — it's reached via a button on Dashboard).
 * ------------------------------------------------------------------
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
