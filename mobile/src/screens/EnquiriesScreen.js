/**
 * EnquiriesScreen.js
 * ------------------------------------------------------------------
 * The enquiries list screen: filter tabs + EnquiryList. Owns the
 * status filter's local state and the useEnquiries() data hook.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../components/layout/ScreenHeader';
import EnquiryFilterTabs from '../components/enquiries/EnquiryFilterTabs';
import EnquiryList from '../components/enquiries/EnquiryList';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useEnquiries from '../hooks/useEnquiries';

export default function EnquiriesScreen() {
  const [filter, setFilter] = useState('new');
  const { enquiries, loading, error } = useEnquiries(filter);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="ENQUIRIES" showBack={false} />
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
});
