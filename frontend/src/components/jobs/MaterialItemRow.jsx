/**
 * MaterialItemRow.jsx
 * ------------------------------------------------------------------
 * One editable material line (name + cost) inside MaterialsEditor.
 * These are the on-site materials a worker logs, which later seed
 * the invoice's material cost items when the job is completed.
 * ------------------------------------------------------------------
 */
export default function MaterialItemRow({ material, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <input
        value={material.name}
        onChange={(e) => onChange({ ...material, name: e.target.value })}
        style={{ flex: 1, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5 }}
      />
      <input
        type="number"
        value={material.cost}
        onChange={(e) => onChange({ ...material, cost: Number(e.target.value) })}
        style={{ width: 70, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 8px', fontSize: 12.5 }}
      />
      <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 700 }}>
        ×
      </span>
    </div>
  );
}
