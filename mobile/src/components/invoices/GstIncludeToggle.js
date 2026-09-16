/**
 * GstIncludeToggle.js
 * ------------------------------------------------------------------
 * The "Include GST" switch on an invoice. When on, this invoice's
 * income counts as Reported income; when off, it's a Cash Bonus
 * (no GST, not reported) — see backend reportService.js for how these
 * two feed the business Report.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import Toggle from '../ui/Toggle';
import { colors } from '../../theme/colors';

export default function GstIncludeToggle({ gstIncluded, onToggle }) {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.title}>Include GST</Text>
        <Text style={[styles.status, { color: gstIncluded ? colors.green : colors.red }]}>
          {gstIncluded ? 'Reported income' : 'Cash Bonus'}
        </Text>
      </View>
      <Toggle on={gstIncluded} onToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.grayLight,
    marginBottom: 14,
  },
  title: { fontWeight: '700', fontSize: 12.5 },
  status: { fontSize: 10, marginTop: 1, fontWeight: '700' },
});
