/**
 * CostItemsEditor.jsx
 * ------------------------------------------------------------------
 * The editable list for one cost kind ("materials" or "other" —
 * "other" replaces the old "vehicle expenses" naming). Each item is
 * just a name, a cost, and a receipt photo. Every change (edit,
 * remove, add, photo upload) saves immediately via the callbacks
 * from useInvoice(), so there's no separate "save" step here.
 * ------------------------------------------------------------------
 */
import CostItemRow from './CostItemRow.jsx';
import Button from '../ui/Button.jsx';

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
    <div>
      {items.map((item, idx) => (
        <CostItemRow
          key={idx}
          item={item}
          onChange={(next) => updateItem(idx, next)}
          onRemove={() => removeItem(idx)}
          onUploadPhoto={(file) => onUploadPhoto(idx, file)}
        />
      ))}
      <Button variant="outline" style={{ width: '100%', padding: 8, fontSize: 11.5 }} onClick={addItem}>
        {addLabel}
      </Button>
    </div>
  );
}
