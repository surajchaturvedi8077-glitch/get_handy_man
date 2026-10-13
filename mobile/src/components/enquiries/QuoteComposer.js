import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QuoteItemRow from './QuoteItemRow';
import Button from '../ui/Button';
import FieldLabel from '../ui/FieldLabel';
import { money } from '../../utils/money';
import { colors } from '../../theme/colors';

export default function QuoteComposer({ initialItems = [], onSave, onPreview, onSend, savingQuote, generating }) {
  const [items, setItems] = useState(
    initialItems.length ? initialItems : [{ name: 'New item', qty: 1, amt: 0 }]
  );

  useEffect(() => {
    if (initialItems && initialItems.length > 0) setItems(initialItems);
  }, [initialItems]);

  const total = items.reduce((s, it) => s + (Number(it.qty) || 1) * (Number(it.amt) || 0), 0);

  function updateItem(idx, next) { setItems((prev) => prev.map((it, i) => (i === idx ? next : it))); }
  function removeItem(idx) { setItems((prev) => prev.filter((_, i) => i !== idx)); }
  function addItem() { setItems((prev) => [...prev, { name: 'New item', qty: 1, amt: 0 }]); }

  return (
    <View style={{ marginTop: 10 }}>
      <FieldLabel>Description (Services)</FieldLabel>
      {items.map((it, idx) => (
        <QuoteItemRow key={idx} item={it} onChange={(next) => updateItem(idx, next)} onRemove={() => removeItem(idx)} />
      ))}
      <Button variant="outline" onPress={addItem} style={styles.addBtn}>+ Add description line</Button>
      
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>{money(total)}</Text>
      </View>

      {/* Instant visual feedback when clicked */}
      <Button variant="outline" style={{ marginBottom: 10 }} onPress={() => onSave(items)} disabled={savingQuote}>
        {savingQuote ? "Saving..." : "💾 Save Quote Data"}
      </Button>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button variant="dark" style={{ flex: 1 }} onPress={() => onPreview(items)}>📄 Preview PDF</Button>
        <Button variant="primary" style={{ flex: 1, backgroundColor: colors.orange }} onPress={() => onSend(items)} disabled={generating}>
          {generating ? <ActivityIndicator color="#fff" /> : '📤 Send quote'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { paddingVertical: 9 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  totalLabel: { fontWeight: '800' },
  totalValue: { fontWeight: '800', color: colors.charcoal },
});