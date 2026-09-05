/**
 * GstSettingsToggle.jsx
 * ------------------------------------------------------------------
 * The business-wide default: whether new invoices charge GST, and at
 * what rate. Matches the prototype's Settings > GST section.
 * ------------------------------------------------------------------
 */
import Toggle from '../ui/Toggle.jsx';
import FieldLabel from '../ui/FieldLabel.jsx';

export default function GstSettingsToggle({ gstEnabled, gstRate, onToggle, onRateChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>GST on invoices</div>
          <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>
            Applied to online-payment invoices only
          </div>
        </div>
        <Toggle on={gstEnabled} onToggle={onToggle} />
      </div>
      {gstEnabled && (
        <div style={{ marginTop: 12 }}>
          <FieldLabel>GST rate (%)</FieldLabel>
          <input
            type="number"
            value={gstRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            style={{ width: '100%', border: '1px solid var(--gray-light)', borderRadius: 8, padding: '9px 10px', fontSize: 13, marginTop: 5 }}
          />
        </div>
      )}
      <div style={{ fontSize: 10.5, color: '#9CA3AF', marginTop: 10, fontStyle: 'italic' }}>
        Cash-paid invoices never include GST, regardless of this setting.
      </div>
    </div>
  );
}
