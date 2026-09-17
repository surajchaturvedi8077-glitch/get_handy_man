import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function InvoiceLineItemRow({ item, onChange, onRemove }) {
  const [name, setName] = useState(item.name || '');
  const [amt, setAmt] = useState(item.amt?.toString() || '');

  useEffect(() => {
    setName(item.name || '');
    setAmt(item.amt?.toString() || '');
  }, [item.name, item.amt]);

  const commitChanges = () => {
    if (name !== item.name || amt !== item.amt?.toString()) {
      onChange({ ...item, name, amt });
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={name}
        onChangeText={setName}
        onBlur={commitChanges}
        style={[styles.input, { flex: 1 }]}
        placeholder="Description"
      />
      <TextInput
        value={amt}
        onChangeText={setAmt}
        onBlur={commitChanges}
        keyboardType="numeric"
        style={[styles.input, { width: 60 }]}
        placeholder="Amt"
      />
      <Pressable onPress={onRemove} hitSlop={8}><Text style={styles.remove}>×</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 7 }, input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, fontSize: 11.5 }, remove: { color: colors.red, fontWeight: '700', fontSize: 16 }});