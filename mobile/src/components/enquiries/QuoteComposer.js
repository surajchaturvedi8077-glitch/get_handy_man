/**
 * QuoteComposer.js
 * ------------------------------------------------------------------
 * Builds the list of quote line items for an enquiry, then sends the
 * quote (via useEnquiry().sendQuote -> services/enquiryService.js).
 * Holds the draft items locally until "Send quote" is pressed.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuoteItemRow from './QuoteItemRow';
import Button from '../ui/Button';
import FieldLabel from '../ui/FieldLabel';
import { money } from '../../utils/money';

export default function QuoteComposer({ initialItems = [], onSend }) {
  const [items, setItems] = useState(
    initialItems.length ? initialItems : [{ name: 'New item', qty: 1, amt: 0 }]
  );

  const total = items.reduce((s, it) => s + (Number(it.qty) || 1) * (Number(it.amt) || 0), 0);

  function updateItem(idx, next) {
    setItems((prev) => prev.map((it, i) => (i === idx ? next : it)));
  }
  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function addItem() {
    setItems((prev) => [...prev, { name: 'New item', qty: 1, amt: 0 }]);
  }

  return (
    <View>
      <FieldLabel>Quote line items</FieldLabel>
      {items.map((it, idx) => (
        <QuoteItemRow key={idx} item={it} onChange={(next) => updateItem(idx, next)} onRemove={() => removeItem(idx)} />
      ))}
      <Button variant="outline" onPress={addItem} style={styles.addBtn}>
        + Add item
      </Button>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{money(total)}</Text>
      </View>
      <Button variant="primary" onPress={() => onSend(items)}>
        Send quote
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { paddingVertical: 9 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  totalLabel: { fontWeight: '800' },
  totalValue: { fontWeight: '800' },
});
