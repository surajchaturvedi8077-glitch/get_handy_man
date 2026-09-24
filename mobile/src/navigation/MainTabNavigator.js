import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

import DashboardStack from './DashboardStack';
import EnquiriesStack from './EnquiriesStack';
import JobsStack from './JobsStack';
import InvoicesStack from './InvoicesStack';

const Tab = createBottomTabNavigator();

const ICONS = { Home: '🏠', Enquiries: '📩', Jobs: '📅', Invoices: '💰' };

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets(); // Grabs the exact height of the Android system bar

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', paddingBottom: 5 },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 24, color, marginBottom: -4 }}>{ICONS[route.name]}</Text>
        ),
        tabBarStyle: [
          styles.tabBar,
          {
            height: 64 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          }
        ],
      })}
    >
      <Tab.Screen name="Home" component={DashboardStack} />
      <Tab.Screen name="Enquiries" component={EnquiriesStack} />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="Invoices" component={InvoicesStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.grayLight, paddingTop: 8 }
});