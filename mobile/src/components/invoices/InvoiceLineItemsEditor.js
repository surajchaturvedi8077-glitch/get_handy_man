/**
 * InvoiceLineItemsEditor.js
 * ------------------------------------------------------------------
 * The editable list of customer-facing line items on an invoice.
 * Controlled (items + onChange) so InvoiceDetailScreen decides when
 * to persist.
 * ------------------------------------------------------------------
 */
import { View, Text, StyleSheet } from 'react-native';
import InvoiceLineItemRow from './InvoiceLineItemRow';
import Button from '../ui/Button';
import { colors } from '../../theme/colors';

export default function InvoiceLineItemsEditor({ items = [], onChange }) {
  function updateItem(idx, next) {
    onChange(items.map((it, i) => (i === idx ? next : it)));
  }
  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function addItem() {
    onChange([...items, { name: 'New item', qty: 1, amt: 0 }]);
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>DESCRIPTION</Text>
        <Text style={styles.headerText}>AMOUNT</Text>
      </View>
      <View style={styles.divider} />
      {items.map((it, idx) => (
        <InvoiceLineItemRow key={idx} item={it} onChange={(next) => updateItem(idx, next)} onRemove={() => removeItem(idx)} />
      ))}
      <Button variant="outline" onPress={addItem} style={{ paddingVertical: 8 }}>
        + Add line item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { fontSize: 9.5, fontWeight: '700', color: colors.gray },
  divider: { borderTopWidth: 1, borderTopColor: colors.grayLight, marginVertical: 6 },
});
