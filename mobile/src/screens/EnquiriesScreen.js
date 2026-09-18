import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../components/layout/ScreenHeader';
import EnquiryFilterTabs from '../components/enquiries/EnquiryFilterTabs';
import EnquiryList from '../components/enquiries/EnquiryList';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useEnquiries from '../hooks/useEnquiries';
import { colors } from '../theme/colors';

export default function EnquiriesScreen() {
  const [filter, setFilter] = useState('new');
  const { enquiries, loading, error } = useEnquiries(filter);
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      {/* ADDED: "Create Quote" button for direct callers */}
      <ScreenHeader 
        title="ENQUIRIES" 
        showBack={false} 
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('NewQuote')} style={styles.quoteBtn}>
            <Text style={styles.quoteText}>+ New Quote</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          <EnquiryFilterTabs value={filter} onChange={setFilter} />
        </View>
        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        {!loading && !error && <EnquiryList enquiries={enquiries} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  tabs: { marginBottom: 14 },
  quoteBtn: { backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  quoteText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});