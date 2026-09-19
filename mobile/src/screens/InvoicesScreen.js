import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InvoiceTabs from '../components/invoices/InvoiceTabs';
import InvoiceList from '../components/invoices/InvoiceList';
import ReportScreen from '../components/report/ReportScreen';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useInvoices from '../hooks/useInvoices';
import { colors } from '../theme/colors';

function InvoiceListPane({ tab }) {
  const { invoices, loading, error } = useInvoices(tab);
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search state

  if (loading) return <LoadingState />;
  if (error) return <ErrorState>{error}</ErrorState>;

  // NEW: Filter logic for the search bar
  const filteredInvoices = invoices.filter(i => 
    searchQuery === '' ||
    i.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      {/* NEW: Global Search Bar */}
      <TextInput 
        style={styles.searchBar} 
        placeholder="Search by customer name or invoice #..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        placeholderTextColor={colors.gray}
      />
      <InvoiceList invoices={filteredInvoices} showUnpaidTotal={tab === 'unpaid'} />
    </View>
  );
}

function ReportPane() {
  const useReport = require('../hooks/useReport').default;
  const { report, loading, error } = useReport();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState>{error}</ErrorState>;
  return <ReportScreen report={report} />;
}

export default function InvoicesScreen() {
  const [tab, setTab] = useState('unpaid');

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.title}>INVOICES</Text>
        <InvoiceTabs value={tab} onChange={setTab} />
      </SafeAreaView>
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        {tab === 'report' ? <ReportPane /> : <InvoiceListPane tab={tab} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 14 },
  title: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 10 },
  body: { flex: 1 },
  bodyContent: { padding: 14 },
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal }
});