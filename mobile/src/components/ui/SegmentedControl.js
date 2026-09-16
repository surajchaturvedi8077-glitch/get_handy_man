/**
 * SegmentedControl.js
 * ------------------------------------------------------------------
 * A row of pill buttons where exactly one is active — used for
 * status filter tabs and the invoice tabs (Unpaid / Paid / All / Report).
 * `options`: [{ value, label }]. Controlled via `value`/`onChange`.
 * ------------------------------------------------------------------
 */
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function SegmentedControl({ options, value, onChange, dark = false }) {
  return (
    <View style={[styles.wrap, { backgroundColor: dark ? colors.charcoal2 : '#F1F0ED' }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              active && { backgroundColor: dark ? colors.orange : '#fff' },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? (dark ? '#fff' : colors.charcoal) : dark ? '#C7CCD4' : colors.gray },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 8, padding: 3 },
  segment: { flex: 1, paddingVertical: 7, borderRadius: 6, alignItems: 'center' },
  label: { fontSize: 11, fontWeight: '700' },
});
