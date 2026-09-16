/**
 * CostItemsEditor.js
 * ------------------------------------------------------------------
 * The editable list for one cost kind ("materials" or "other" —
 * "other" replaces the old "vehicle expenses" naming). Each item is
 * just a name, a cost, and a receipt photo. Every change saves
 * immediately via the callbacks from useInvoice(), which call
 * services/invoiceService.js — no separate "save" step here.
 * ------------------------------------------------------------------
 */
import { View } from 'react-native';
import CostItemRow from './CostItemRow';
import Button from '../ui/Button';

export default function CostItemsEditor({ items = [], kind, onSetItems, onUploadPhoto }) {
  const addLabel = kind === 'materials' ? '+ Add material expense' : '+ Add expense';

  function updateItem(idx, next) {
    onSetItems(items.map((it, i) => (i === idx ? next : it)));
  }
  function removeItem(idx) {
    onSetItems(items.filter((_, i) => i !== idx));
  }
  function addItem() {
    onSetItems([...items, { name: 'New item', cost: 0, photoUrl: null }]);
  }

  return (
    <View>
      {items.map((item, idx) => (
        <CostItemRow
          key={idx}
          item={item}
          onChange={(next) => updateItem(idx, next)}
          onRemove={() => removeItem(idx)}
          onUploadPhoto={(asset) => onUploadPhoto(idx, asset)}
        />
      ))}
      <Button variant="outline" onPress={addItem} style={{ paddingVertical: 8 }}>
        {addLabel}
      </Button>
    </View>
  );
}
