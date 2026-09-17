import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import FieldLabel from '../ui/FieldLabel';
import { colors } from '../../theme/colors';

export default function DiscountEditor({ discount, onChange }) {
  const [val, setVal] = useState(discount.value?.toString() || '0');

  useEffect(() => {
    setVal(discount.value?.toString() || '0');
  }, [discount.value]);

  const commitChanges = () => {
    if (val !== discount.value?.toString()) {
      onChange({ ...discount, value: val });
    }
  };

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
          value={val}
          onChangeText={setVal}
          onBlur={commitChanges}
          keyboardType="numeric"
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
  input: { flex: 1, borderWidth: 1, borderColor: colors.grayLight, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12.5 },
});