/**
 * InvoicesScreen.js
 * ------------------------------------------------------------------
 * The invoices screen: Unpaid / Paid / All tabs show InvoiceList;
 * the Report tab (was "Summary") shows ReportScreen instead, backed
 * by its own useReport() hook so it only fetches when selected.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InvoiceTabs from '../components/invoices/InvoiceTabs';
import InvoiceList from '../components/invoices/InvoiceList';
import ReportScreen from '../components/report/ReportScreen';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import useInvoices from '../hooks/useInvoices';
import useReport from '../hooks/useReport';
import { colors } from '../theme/colors';

function InvoiceListPane({ tab }) {
  const { invoices, loading, error } = useInvoices(tab);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState>{error}</ErrorState>;
  return <InvoiceList invoices={invoices} showUnpaidTotal={tab === 'unpaid'} />;
}

function ReportPane() {
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
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
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
});
