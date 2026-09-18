import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnquiriesScreen from '../screens/EnquiriesScreen';
import EnquiryDetailScreen from '../screens/EnquiryDetailScreen';
import NewQuoteScreen from '../screens/NewQuoteScreen'; // NEW

const Stack = createNativeStackNavigator();

export default function EnquiriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EnquiriesList" component={EnquiriesScreen} />
      <Stack.Screen name="EnquiryDetail" component={EnquiryDetailScreen} />
      <Stack.Screen name="NewQuote" component={NewQuoteScreen} />
    </Stack.Navigator>
  );
}