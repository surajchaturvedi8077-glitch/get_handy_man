import { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search state
  const { enquiries, loading, error } = useEnquiries(filter);
  const navigation = useNavigation();

  // NEW: Filter logic for the search bar
  const filteredEnquiries = enquiries.filter(e => 
    searchQuery === '' ||
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phone?.includes(searchQuery) ||
    e.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.services && e.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader 
        title="ENQUIRIES" 
        showBack={false} 
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('NewQuote')} style={styles.quoteBtn}>
            <Text style={styles.quoteText}>+ New Quote</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.tabs}>
          <EnquiryFilterTabs value={filter} onChange={setFilter} />
        </View>

        {/* NEW: Global Search Bar */}
        <TextInput 
          style={styles.searchBar} 
          placeholder="Search by name, phone, email, address..." 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholderTextColor={colors.gray}
        />

        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        {!loading && !error && <EnquiryList enquiries={filteredEnquiries} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  tabs: { marginBottom: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
  quoteBtn: { backgroundColor: colors.orange, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  quoteText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});