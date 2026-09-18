import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

import DashboardStack from './DashboardStack';
import EnquiriesStack from './EnquiriesStack';
import JobsStack from './JobsStack';
import InvoicesStack from './InvoicesStack';

const Tab = createBottomTabNavigator();

const ICONS = { Home: '🏠', Enquiries: '📩', Jobs: '📅', Invoices: '💰' };

// This helper intercepts the tab click and forcefully resets the screen back to the list
const resetTab = (navigation, tabName, rootScreen) => ({
  tabPress: (e) => {
    e.preventDefault();
    navigation.navigate(tabName, { screen: rootScreen });
  },
});

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', paddingBottom: 5 },
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 18, color }}>{ICONS[route.name]}</Text>
        ),
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardStack} 
        listeners={({navigation}) => resetTab(navigation, 'Home', 'Dashboard')} 
      />
      <Tab.Screen 
        name="Enquiries" 
        component={EnquiriesStack} 
        listeners={({navigation}) => resetTab(navigation, 'Enquiries', 'EnquiriesList')} 
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobsStack} 
        listeners={({navigation}) => resetTab(navigation, 'Jobs', 'JobsList')} 
      />
      <Tab.Screen 
        name="Invoices" 
        component={InvoicesStack} 
        listeners={({navigation}) => resetTab(navigation, 'Invoices', 'InvoicesList')} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.grayLight, height: 60, paddingTop: 8 }
});