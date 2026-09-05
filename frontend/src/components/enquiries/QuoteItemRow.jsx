/**
 * QuoteItemRow.jsx
 * ------------------------------------------------------------------
 * One editable line item (name + amount) inside the quote composer.
 * Fully controlled: reports every change up via onChange/onRemove.
 * ------------------------------------------------------------------
 */
export default function QuoteItemRow({ item, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        style={{ flex: 1, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5 }}
      />
      <input
        type="number"
        value={item.amt}
        onChange={(e) => onChange({ ...item, amt: Number(e.target.value) })}
        style={{ width: 70, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 8px', fontSize: 12.5 }}
      />
      <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 700 }}>
        ×
      </span>
    </div>
  );
}
