/**
 * BusinessDetailsForm.jsx
 * ------------------------------------------------------------------
 * Business name / ABN / contact email shown on invoice & quote PDFs.
 * Controlled: {settings, onChange} where onChange(patch) merges into
 * the parent's draft state (SettingsPage decides when to save).
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';

const inputStyle = {
  width: '100%',
  border: '1px solid var(--gray-light)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  marginBottom: 12,
};

export default function BusinessDetailsForm({ settings, onChange }) {
  return (
    <div>
      <FieldLabel>Business name</FieldLabel>
      <input
        value={settings.businessName}
        onChange={(e) => onChange({ businessName: e.target.value })}
        style={inputStyle}
      />
      <FieldLabel>ABN</FieldLabel>
      <input value={settings.abn} onChange={(e) => onChange({ abn: e.target.value })} style={inputStyle} />
      <FieldLabel>Business email</FieldLabel>
      <input
        type="email"
        value={settings.bizEmail}
        onChange={(e) => onChange({ bizEmail: e.target.value })}
        style={inputStyle}
      />
    </div>
  );
}
