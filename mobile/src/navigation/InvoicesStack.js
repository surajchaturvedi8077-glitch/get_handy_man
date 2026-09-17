import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvoicesScreen from '../screens/InvoicesScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import PdfPreviewScreen from '../screens/PdfPreviewScreen'; // <-- Added

const Stack = createNativeStackNavigator();

export default function InvoicesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoicesList" component={InvoicesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
    </Stack.Navigator>
  );
}