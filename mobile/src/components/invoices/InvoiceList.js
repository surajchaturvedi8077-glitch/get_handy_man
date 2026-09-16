/**
 * InvoiceList.js
 * ------------------------------------------------------------------
 * Renders a list of InvoiceListItem rows, plus a "Total unpaid" strip
 * when viewing the Unpaid tab. Empty-state message otherwise.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import InvoiceListItem from './InvoiceListItem';
import EmptyState from '../ui/EmptyState';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function InvoiceList({ invoices, showUnpaidTotal }) {
  const unpaidTotal = invoices
    .filter((i) => i.status === 'unpaid')
    .reduce((s, i) => s + (i.totals?.total || 0), 0);

  return (
    <View>
      {showUnpaidTotal && unpaidTotal > 0 && (
        <View style={styles.totalStrip}>
          <Text style={styles.totalLabel}>TOTAL UNPAID</Text>
          <Text style={styles.totalValue}>{money(unpaidTotal)}</Text>
        </View>
      )}
      {invoices.length ? (
        invoices.map((inv) => <InvoiceListItem key={inv._id} invoice={inv} />)
      ) : (
        <EmptyState>No invoices here.</EmptyState>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  totalStrip: { backgroundColor: colors.orangeTint, borderRadius: 10, padding: 14, marginBottom: 14 },
  totalLabel: { fontSize: 10, fontWeight: '700', color: colors.orangeDeep, letterSpacing: 0.5 },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.orangeDeep, marginTop: 2 },
});
