/**
 * InvoiceLineItemsEditor.jsx
 * ------------------------------------------------------------------
 * The editable list of customer-facing line items on an invoice.
 * Controlled (items + onChange) so InvoiceDetailPage decides when to
 * persist (e.g. debounce, or save on blur/button).
 * ------------------------------------------------------------------
 */
import InvoiceLineItemRow from './InvoiceLineItemRow.jsx';
import Button from '../ui/Button.jsx';

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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, fontWeight: 700, color: 'var(--gray)' }}>
        <span>DESCRIPTION</span>
        <span>AMOUNT</span>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--gray-light)', margin: '6px 0 8px' }} />
      {items.map((it, idx) => (
        <InvoiceLineItemRow
          key={idx}
          item={it}
          onChange={(next) => updateItem(idx, next)}
          onRemove={() => removeItem(idx)}
        />
      ))}
      <Button variant="outline" style={{ width: '100%', padding: 8, fontSize: 11.5, marginTop: 2 }} onClick={addItem}>
        + Add line item
      </Button>
    </div>
  );
}
