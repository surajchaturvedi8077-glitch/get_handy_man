import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import StatRow from '../components/ui/StatRow';
import * as invoiceService from '../services/invoiceService';
import { money } from '../utils/money';
import { colors } from '../theme/colors';

export default function ExpensesScreen() {
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all'); // 'all' | 'materials' | 'other'
  const [searchQuery, setSearchQuery] = useState('');

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.listInvoices('all');
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const allExpenses = useMemo(() => {
    const list = [];
    invoices.forEach((inv) => {
      const mats = inv.costs?.materials || [];
      const others = inv.costs?.other || [];
      mats.forEach((m, idx) => {
        list.push({
          id: `${inv._id}-mat-${idx}`,
          invoiceId: inv._id,
          invoiceNumber: inv.number,
          customer: inv.customer,
          date: inv.date,
          kind: 'materials',
          name: m.name || 'Material Expense',
          cost: Number(m.cost) || 0,
        });
      });
      others.forEach((o, idx) => {
        list.push({
          id: `${inv._id}-oth-${idx}`,
          invoiceId: inv._id,
          invoiceNumber: inv.number,
          customer: inv.customer,
          date: inv.date,
          kind: 'other',
          name: o.name || 'Other Expense',
          cost: Number(o.cost) || 0,
        });
      });
    });
    return list;
  }, [invoices]);

  const totals = useMemo(() => {
    const matTotal = allExpenses
      .filter((e) => e.kind === 'materials')
      .reduce((s, e) => s + e.cost, 0);
    const othTotal = allExpenses
      .filter((e) => e.kind === 'other')
      .reduce((s, e) => s + e.cost, 0);
    return {
      materials: matTotal,
      other: othTotal,
      total: matTotal + othTotal,
    };
  }, [allExpenses]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      const kindMatch = tab === 'all' ? true : e.kind === tab;
      const q = searchQuery.toLowerCase();
      const searchMatch =
        q === '' ||
        e.name.toLowerCase().includes(q) ||
        (e.customer && e.customer.toLowerCase().includes(q)) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(q));
      return kindMatch && searchMatch;
    });
  }, [allExpenses, tab, searchQuery]);

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>EXPENSES</Text>
        </View>
        <SegmentedControl
          options={[
            { value: 'all', label: 'All Expenses' },
            { value: 'materials', label: 'Materials' },
            { value: 'other', label: 'Other' },
          ]}
          value={tab}
          onChange={setTab}
          dark
        />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <StatRow
          label="Total Expenses"
          sub={`Materials: ${money(totals.materials)} · Other: ${money(totals.other)}`}
          value={money(totals.total)}
          bg={colors.orangeTint}
          fg={colors.orangeDeep}
        />

        <TextInput
          style={styles.searchBar}
          placeholder="Search expense item, customer or invoice #..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading && <LoadingState />}
        {error && <ErrorState>{error}</ErrorState>}
        {!loading && !error && filteredExpenses.length === 0 && (
          <EmptyState>No expenses recorded yet. Attach material or other costs inside any invoice.</EmptyState>
        )}

        {!loading &&
          !error &&
          filteredExpenses.map((exp) => (
            <TouchableOpacity
              key={exp.id}
              style={styles.card}
              onPress={() =>
                navigation.getParent()?.navigate('Invoices', {
                  screen: 'InvoiceDetail',
                  params: { id: exp.invoiceId },
                  initial: false,
                })
              }
            >
              <View style={styles.cardTop}>
                <Text style={styles.itemName}>{exp.name}</Text>
                <Text style={styles.costText}>{money(exp.cost)}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.metaText}>
                  #{exp.invoiceNumber} · {exp.customer}
                </Text>
                <Text style={styles.kindBadge}>
                  {exp.kind === 'materials' ? 'Material' : 'Other'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offwhite },
  header: { backgroundColor: colors.charcoal, paddingHorizontal: 16, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  title: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  content: { padding: 16, paddingBottom: 60 },
  searchBar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginVertical: 12,
    color: colors.charcoal,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName: { fontWeight: '800', fontSize: 14, color: colors.charcoal },
  costText: { fontWeight: '800', fontSize: 14, color: colors.orangeDeep },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { fontSize: 11.5, color: colors.gray },
  kindBadge: { fontSize: 10.5, fontWeight: '700', color: colors.blue },
});