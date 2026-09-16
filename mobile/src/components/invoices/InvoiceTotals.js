/**
 * InvoiceTotals.js
 * ------------------------------------------------------------------
 * Read-only breakdown of subtotal -> discount -> GST -> total due,
 * using the `totals` object the API already computed for this
 * invoice (see backend gstService.calcInvoiceTotals) — no maths here.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function InvoiceTotals({ totals, discount, gstRate }) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Subtotal</Text>
        <Text style={styles.rowLabel}>{money(totals.subtotal)}</Text>
      </View>
      {totals.discAmt > 0 && (
        <View style={styles.row}>
          <Text style={styles.rowLabel}>
            Discount{discount.type === 'percent' ? ` (${discount.value}%)` : ''}
          </Text>
          <Text style={styles.rowLabel}>−{money(totals.discAmt)}</Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{totals.applyGst ? `GST (${gstRate}%)` : 'GST'}</Text>
        <Text style={styles.rowLabel}>
          {totals.applyGst ? money(totals.gst) : 'Not included · Cash Bonus'}
        </Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total due</Text>
        <Text style={styles.totalValue}>{money(totals.total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  rowLabel: { fontSize: 11.5, color: colors.gray },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.orangeTint,
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  totalLabel: { fontWeight: '800', fontSize: 13 },
  totalValue: { fontWeight: '800', fontSize: 16, color: colors.orangeDeep },
});
