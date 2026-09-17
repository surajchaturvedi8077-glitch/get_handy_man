import React from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function MaterialItemRow({ material, onChange, onRemove }) {
  return (
    <View style={styles.row}>
      <TextInput
        defaultValue={material.name}
        onEndEditing={(e) => onChange({ ...material, name: e.nativeEvent.text })}
        style={[styles.input, { flex: 1 }]}
        placeholder="Item name"
      />
      <TextInput
        defaultValue={material.cost?.toString()}
        onEndEditing={(e) => onChange({ ...material, cost: e.nativeEvent.text })}
        keyboardType="numeric"
        style={[styles.input, { width: 70 }]}
        placeholder="Cost"
      />
      <Pressable onPress={onRemove} hitSlop={8}><Text style={styles.remove}>×</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }, input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12.5 }, remove: { color: colors.red, fontWeight: '700', fontSize: 16 }});