/**
 * DiscountEditor.js
 * ------------------------------------------------------------------
 * Lets the worker set a discount as either a flat amount ($) or a
 * percentage, and the discount value. Controlled: {discount, onChange}.
 * ------------------------------------------------------------------
 */
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import { colors } from '../../theme/colors';

export default function DiscountEditor({ discount, onChange }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <FieldLabel style={{ marginBottom: 6 }}>Discount</FieldLabel>
      <View style={styles.row}>
        <View style={styles.typeSwitch}>
          {['amount', 'percent'].map((type) => (
            <Pressable
              key={type}
              onPress={() => onChange({ ...discount, type })}
              style={[styles.typeBtn, discount.type === type && styles.typeBtnActive]}
            >
              <Text style={styles.typeLabel}>{type === 'amount' ? 'A$' : '%'}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={String(discount.value)}
            onChangeText={(v) => onChange({ ...item, cost: v })} // or amt: v          keyboardType="numeric"
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  typeSwitch: { flexDirection: 'row', backgroundColor: '#F1F0ED', borderRadius: 8, padding: 3, width: 96 },
  typeBtn: { flex: 1, paddingVertical: 7, borderRadius: 6, alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#fff' },
  typeLabel: { fontSize: 11, fontWeight: '700', color: colors.charcoal },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12.5,
  },
});
