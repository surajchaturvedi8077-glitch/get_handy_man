/**
 * InvoiceLineItemRow.jsx
 * ------------------------------------------------------------------
 * One editable customer-facing line item (name + amount) on the
 * invoice. Controlled: reports changes via onChange/onRemove.
 * ------------------------------------------------------------------
 */
export default function InvoiceLineItemRow({ item, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 7 }}>
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        style={{ flex: 1, border: '1px solid var(--gray-light)', borderRadius: 6, padding: '6px 8px', fontSize: 11.5 }}
      />
      <input
        type="number"
        value={item.amt}
        onChange={(e) => onChange({ ...item, amt: Number(e.target.value) })}
        style={{ width: 58, border: '1px solid var(--gray-light)', borderRadius: 6, padding: '6px 6px', fontSize: 11.5 }}
      />
      <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 700 }}>
        ×
      </span>
    </div>
  );
}
