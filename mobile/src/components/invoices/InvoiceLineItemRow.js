import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function InvoiceLineItemRow({ item, onChange, onRemove }) {
  return (
    <View style={styles.row}>
      <TextInput
        value={item.name}
        onChangeText={(v) => onChange({ ...item, name: v })}
        style={[styles.input, { flex: 1 }]}
      />
      <TextInput
        value={String(item.amt)}
        onChangeText={(v) => onChange({ ...item, amt: v })}
        keyboardType="numeric"
        style={[styles.input, { width: 60 }]}
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.remove}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: colors.grayLight,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 11.5,
  },
  remove: { color: colors.red, fontWeight: '700', fontSize: 16 },
});