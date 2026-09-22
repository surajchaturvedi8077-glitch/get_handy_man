import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import InvoiceTabs from '../components/invoices/InvoiceTabs';
import InvoiceList from '../components/invoices/InvoiceList';
import ReportScreen from '../components/report/ReportScreen';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import useInvoices from '../hooks/useInvoices';
import useReport from '../hooks/useReport';
import { colors } from '../theme/colors';

function InvoiceListPane({ tab }) {
  const { invoices, loading, error } = useInvoices(tab);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState>{error}</ErrorState>;

  const filteredInvoices = invoices.filter(i => 
    searchQuery === '' ||
    i.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
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
  const [period, setPeriod] = useState('month'); 
  const [refDate, setRefDate] = useState(new Date());
  
  const [customStart, setCustomStart] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [customEnd, setCustomEnd] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('start');

  const shiftDate = (dir) => {
    const next = new Date(refDate);
    if (period === 'day') next.setDate(next.getDate() + dir);
    if (period === 'month') next.setMonth(next.getMonth() + dir);
    if (period === 'year') next.setFullYear(next.getFullYear() + dir);
    setRefDate(next);
  };

  let start = null, end = null, label = "All Time";
  const d = new Date(refDate);

  if (period === 'day') {
    start = new Date(d.setHours(0,0,0,0));
    end = new Date(d.setHours(23,59,59,999));
    label = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } else if (period === 'month') {
    start = new Date(d.getFullYear(), d.getMonth(), 1);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23,59,59,999);
    label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (period === 'year') {
    start = new Date(d.getFullYear(), 0, 1);
    end = new Date(d.getFullYear(), 11, 31, 23,59,59,999);
    label = start.getFullYear().toString();
  } else if (period === 'custom') {
    start = new Date(customStart);
    start.setHours(0,0,0,0);
    end = new Date(customEnd);
    end.setHours(23,59,59,999);
  }

  const { report, loading, error } = useReport(start?.toISOString(), end?.toISOString());

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterControlRow}>
        <SegmentedControl
          options={[
            {label: 'Day', value: 'day'}, 
            {label: 'Month', value: 'month'}, 
            {label: 'Year', value: 'year'},
            {label: 'Custom', value: 'custom'}
          ]}
          value={period}
          onChange={setPeriod}
        />
      </View>

      {period === 'custom' && (
        <View style={styles.customDateRow}>
          <Button variant="outline" style={{flex: 1, paddingVertical: 8}} onPress={() => { setPickerTarget('start'); setShowPicker(true); }}>
            Start: {customStart.toLocaleDateString('en-GB')}
          </Button>
          <Button variant="outline" style={{flex: 1, paddingVertical: 8}} onPress={() => { setPickerTarget('end'); setShowPicker(true); }}>
            End: {customEnd.toLocaleDateString('en-GB')}
          </Button>
        </View>
      )}

      {(period !== 'all' && period !== 'custom') && (
        <View style={styles.dateNavRow}>
          <TouchableOpacity onPress={() => shiftDate(-1)} style={styles.arrowBtn}><Text style={styles.arrowText}>◀</Text></TouchableOpacity>
          <Text style={styles.dateLabel}>{label}</Text>
          <TouchableOpacity onPress={() => shiftDate(1)} style={styles.arrowBtn}><Text style={styles.arrowText}>▶</Text></TouchableOpacity>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={pickerTarget === 'start' ? customStart : customEnd}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) {
              if (pickerTarget === 'start') setCustomStart(date);
              else setCustomEnd(date);
            }
          }}
        />
      )}

      {loading ? <LoadingState /> : error ? <ErrorState>{error}</ErrorState> : <ReportScreen report={report} />}
    </View>
  );
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
  searchBar: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, marginBottom: 16, color: colors.charcoal },
  filterControlRow: { marginBottom: 16 },
  customDateRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dateNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: colors.grayLight },
  arrowBtn: { padding: 8 },
  arrowText: { fontSize: 16, color: colors.charcoal },
  dateLabel: { fontWeight: '800', fontSize: 14, color: colors.charcoal }
});