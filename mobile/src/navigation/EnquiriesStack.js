/**
 * EnquiriesStack.js
 * ------------------------------------------------------------------
 * Enquiries tab: list screen, then the detail screen pushed on top.
 * ------------------------------------------------------------------
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnquiriesScreen from '../screens/EnquiriesScreen';
import EnquiryDetailScreen from '../screens/EnquiryDetailScreen';

const Stack = createNativeStackNavigator();

export default function EnquiriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EnquiriesList" component={EnquiriesScreen} />
      <Stack.Screen name="EnquiryDetail" component={EnquiryDetailScreen} />
    </Stack.Navigator>
  );
}
