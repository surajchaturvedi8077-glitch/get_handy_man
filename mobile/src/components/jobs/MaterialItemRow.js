import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function MaterialItemRow({ material, onChange, onRemove }) {
  const [name, setName] = useState(material.name || '');
  const [cost, setCost] = useState(material.cost?.toString() || '');

  useEffect(() => {
    setName(material.name || '');
    setCost(material.cost?.toString() || '');
  }, [material.name, material.cost]);

  const commitChanges = () => {
    if (name !== material.name || cost !== material.cost?.toString()) {
      onChange({ ...material, name, cost });
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={name}
        onChangeText={setName}
        onBlur={commitChanges}
        style={[styles.input, { flex: 1 }]}
        placeholder="Item name"
      />
      <TextInput
        value={cost}
        onChangeText={setCost}
        onBlur={commitChanges}
        keyboardType="numeric"
        style={[styles.input, { width: 70 }]}
        placeholder="Cost"
      />
      <Pressable onPress={onRemove} hitSlop={8}><Text style={styles.remove}>×</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }, input: { borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12.5 }, remove: { color: colors.red, fontWeight: '700', fontSize: 16 }});