/**
 * StatRow.js
 * ------------------------------------------------------------------
 * One row in the business Report: a label/value pair on a tinted
 * background, with a small sub-caption underneath. Used for Reported
 * income, Cash Bonus, GST on material, Reportable GST, expenses,
 * profit — every row on ReportScreen is one of these.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';

export default function StatRow({ label, sub, value, bg, fg }) {
  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={styles.top}>
        <Text style={[styles.label, { color: fg }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.value, { color: fg }]}>{value}</Text>
      </View>
      <Text style={[styles.sub, { color: fg }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 10, padding: 14, marginBottom: 10 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  value: { fontSize: 16, fontWeight: '800' },
  sub: { fontSize: 10, opacity: 0.85, marginTop: 2 },
});
