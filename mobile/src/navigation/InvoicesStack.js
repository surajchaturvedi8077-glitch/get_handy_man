/**
 * InvoicesStack.js
 * ------------------------------------------------------------------
 * Invoices tab: list/report screen (tabs between Unpaid/Paid/All/
 * Report internally, like the web app), then invoice detail pushed
 * on top.
 * ------------------------------------------------------------------
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoicesScreen from '../screens/InvoicesScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';

const Stack = createNativeStackNavigator();

export default function InvoicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoicesList" component={InvoicesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
}
