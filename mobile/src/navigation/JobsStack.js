/**
 * JobsStack.js
 * ------------------------------------------------------------------
 * Jobs tab: list screen, then the detail screen pushed on top.
 * ------------------------------------------------------------------
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';

const Stack = createNativeStackNavigator();

export default function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobsList" component={JobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
  );
}
