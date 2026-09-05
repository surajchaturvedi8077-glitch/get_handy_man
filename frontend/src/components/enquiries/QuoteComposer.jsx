/**
 * QuoteComposer.jsx
 * ------------------------------------------------------------------
 * Builds the list of quote line items for an enquiry, then sends the
 * quote (via useEnquiry().sendQuote). Holds the draft items locally
 * until "Send quote" is pressed, so partial edits aren't saved early.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import QuoteItemRow from './QuoteItemRow.jsx';
import Button from '../ui/Button.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';
import { money } from '../../utils/money.js';

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
    <div>
      <FieldLabel>Quote line items</FieldLabel>
      {items.map((it, idx) => (
        <QuoteItemRow
          key={idx}
          item={it}
          onChange={(next) => updateItem(idx, next)}
          onRemove={() => removeItem(idx)}
        />
      ))}
      <Button variant="outline" style={{ width: '100%', padding: 9, fontSize: 12 }} onClick={addItem}>
        + Add item
      </Button>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0', fontWeight: 800 }}>
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
      <Button variant="primary" style={{ width: '100%' }} onClick={() => onSend(items)}>
        Send quote
      </Button>
    </div>
  );
}
