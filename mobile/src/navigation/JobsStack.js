import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import DayDetailScreen from '../screens/DayDetailScreen';

const Stack = createNativeStackNavigator();

export default function JobsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JobsList" component={JobsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
    </Stack.Navigator>
  );
}