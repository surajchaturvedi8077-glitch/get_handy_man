/**
 * QuoteItemRow.js
 * ------------------------------------------------------------------
 * One editable line item (name + amount) inside the quote composer.
 * Fully controlled: reports every change up via onChange/onRemove.
 * ------------------------------------------------------------------
 */
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function QuoteItemRow({ item, onChange, onRemove }) {
  return (
    <View style={styles.row}>
      <TextInput
        value={item.name}
        onChangeText={(v) => onChange({ ...item, name: v })}
        style={[styles.input, { flex: 1 }]}
      />
      <TextInput
        value={String(item.amt)}
        onChangeText={(v) => onChange({ ...item, amt: Number(v) || 0 })}
        keyboardType="numeric"
        style={[styles.input, { width: 70 }]}
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.remove}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12.5,
  },
  remove: { color: colors.red, fontWeight: '700', fontSize: 16 },
});
