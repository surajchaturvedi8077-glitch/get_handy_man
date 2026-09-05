/**
 * CostItemRow.jsx
 * ------------------------------------------------------------------
 * One expense line: name, cost (money), and a receipt photo — the
 * only three fields an expense has, per the "just name, money, and a
 * photo" requirement. Used for both material and other expenses.
 * ------------------------------------------------------------------
 */
import PhotoUploadButton from './PhotoUploadButton.jsx';

export default function CostItemRow({ item, onChange, onRemove, onUploadPhoto }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        style={{ flex: 1, minWidth: 0, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 9px', fontSize: 12 }}
      />
      <input
        type="number"
        value={item.cost}
        onChange={(e) => onChange({ ...item, cost: Number(e.target.value) })}
        style={{ width: 56, border: '1px solid var(--gray-light)', borderRadius: 8, padding: '8px 6px', fontSize: 12 }}
      />
      <PhotoUploadButton photoUrl={item.photoUrl} onUpload={onUploadPhoto} />
      <span onClick={onRemove} style={{ cursor: 'pointer', color: 'var(--red)', fontWeight: 700 }}>
        ×
      </span>
    </div>
  );
}
