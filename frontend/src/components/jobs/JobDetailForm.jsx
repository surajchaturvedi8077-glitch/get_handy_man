/**
 * JobDetailForm.jsx
 * ------------------------------------------------------------------
 * The "needs details" form: service, scheduled time, address, labour
 * cost, notes, and the materials editor. Saving calls saveDetails()
 * from useJob(), which flips needsDetails off and accepted->confirmed.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import FieldLabel from '../ui/FieldLabel.jsx';
import Button from '../ui/Button.jsx';
import MaterialsEditor from './MaterialsEditor.jsx';

const inputStyle = {
  width: '100%',
  border: '1px solid var(--gray-light)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  fontFamily: 'inherit',
  marginBottom: 12,
};

export default function JobDetailForm({ job, onSave }) {
  const [form, setForm] = useState({
    service: job.service || '',
    when: job.when || '',
    address: job.address || '',
    labour: job.labour || 0,
    notes: job.notes || '',
  });
  const [materials, setMaterials] = useState(job.materials || []);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({ ...form, materials });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <FieldLabel>Service</FieldLabel>
      <input
        value={form.service}
        onChange={(e) => setForm({ ...form, service: e.target.value })}
        style={inputStyle}
      />

      <FieldLabel>Scheduled time</FieldLabel>
      <input
        value={form.when}
        onChange={(e) => setForm({ ...form, when: e.target.value })}
        style={inputStyle}
        placeholder="e.g. Fri 4 Sep · 9:00 AM"
      />

      <FieldLabel>Address</FieldLabel>
      <input
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={inputStyle}
      />

      <FieldLabel>Labour ($)</FieldLabel>
      <input
        type="number"
        value={form.labour}
        onChange={(e) => setForm({ ...form, labour: Number(e.target.value) || 0 })}
        style={inputStyle}
      />

      <FieldLabel style={{ marginBottom: 6 }}>Materials</FieldLabel>
      <MaterialsEditor materials={materials} onChange={setMaterials} />

      <FieldLabel style={{ marginTop: 12 }}>Notes</FieldLabel>
      <textarea
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      <Button variant="primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save job details'}
      </Button>
    </div>
  );
}
