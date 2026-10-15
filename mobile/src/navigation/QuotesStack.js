import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuotesScreen from '../screens/QuotesScreen';
import QuoteDetailScreen from '../screens/QuoteDetailScreen';
import NewQuoteScreen from '../screens/NewQuoteScreen';
import PdfPreviewScreen from '../screens/PdfPreviewScreen';

const Stack = createNativeStackNavigator();

export default function QuotesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuotesList" component={QuotesScreen} />
      <Stack.Screen name="QuoteDetail" component={QuoteDetailScreen} />
      <Stack.Screen name="NewQuote" component={NewQuoteScreen} />
      <Stack.Screen name="PdfPreview" component={PdfPreviewScreen} />
    </Stack.Navigator>
  );
}