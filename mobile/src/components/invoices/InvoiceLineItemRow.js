import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function InvoiceLineItemRow({ item, onChange, onRemove }) {
  return (
    <View style={styles.row}>
      <TextInput
        defaultValue={item.name}
        onEndEditing={(e) => onChange({ ...item, name: e.nativeEvent.text })}
        style={[styles.input, { flex: 1 }]}
        placeholder="Description"
      />
      <TextInput
        defaultValue={item.amt?.toString()}
        onEndEditing={(e) => onChange({ ...item, amt: e.nativeEvent.text })}
        keyboardType="numeric"
        style={[styles.input, { width: 60 }]}
        placeholder="Amt"
      />
      <Pressable onPress={onRemove} hitSlop={8}><Text style={styles.remove}>×</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 7 }, input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, fontSize: 11.5 }, remove: { color: colors.red, fontWeight: '700', fontSize: 16 }});