/**
 * GstSettingsToggle.js
 * ------------------------------------------------------------------
 * The business-wide default: whether new invoices charge GST, and at
 * what rate.
 * ------------------------------------------------------------------
 */
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Toggle from '../ui/Toggle';
import FieldLabel from '../ui/FieldLabel';
import { colors } from '../../theme/colors';

export default function GstSettingsToggle({ gstEnabled, gstRate, onToggle, onRateChange }) {
  return (
    <View>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>GST on invoices</Text>
          <Text style={styles.hint}>Applied to online-payment invoices only</Text>
        </View>
        <Toggle on={gstEnabled} onToggle={onToggle} />
      </View>
      {gstEnabled && (
        <View style={{ marginTop: 12 }}>
          <FieldLabel>GST rate (%)</FieldLabel>
          <TextInput
            value={String(gstRate)}
            onChangeText={(v) => onRateChange(Number(v) || 0)}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>
      )}
      <Text style={styles.note}>Cash-paid invoices never include GST, regardless of this setting.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '800', fontSize: 13.5 },
  hint: { fontSize: 11, color: colors.gray, marginTop: 2, maxWidth: 220 },
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 13,
    marginTop: 5,
  },
  note: { fontSize: 10.5, color: '#9CA3AF', marginTop: 10, fontStyle: 'italic' },
});
