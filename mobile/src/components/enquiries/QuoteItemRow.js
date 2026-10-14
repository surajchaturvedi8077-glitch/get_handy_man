import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function QuoteItemRow({ item, onChange, onRemove }) {
  return (
    <View style={styles.row}>
      <TextInput
        value={item.name || ''}
        onChangeText={(text) => onChange({ ...item, name: text })}
        style={[styles.input, { flex: 1 }]}
        placeholder="Item Name"
      />
      <TextInput
        value={item.amt?.toString() || ''}
        onChangeText={(text) => onChange({ ...item, amt: text })}
        keyboardType="numeric"
        style={[styles.input, { width: 70 }]}
        placeholder="Price"
      />
      <Pressable onPress={onRemove} hitSlop={8}>
        <Text style={styles.remove}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ 
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }, 
  input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12.5 }, 
  remove: { color: colors.red, fontWeight: '700', fontSize: 16 }
});