/**
 * GstIncludeToggle.jsx
 * ------------------------------------------------------------------
 * The "Include GST" switch on an invoice. When on, this invoice's
 * income counts as Reported income; when off, it's a Cash Bonus
 * (no GST, not reported) — see reportService.js for how these two
 * feed the business Report.
 * ------------------------------------------------------------------
 */
import Toggle from '../ui/Toggle.jsx';

export default function GstIncludeToggle({ gstIncluded, onToggle }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderTop: '1px solid var(--gray-light)',
        borderBottom: '1px solid var(--gray-light)',
        marginBottom: 14,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 12.5 }}>Include GST</div>
        <div
          style={{
            fontSize: 10,
            color: gstIncluded ? 'var(--green)' : 'var(--red)',
            marginTop: 1,
            fontWeight: 700,
          }}
        >
          {gstIncluded ? 'Reported income' : 'Cash Bonus'}
        </div>
      </div>
      <Toggle on={gstIncluded} onToggle={onToggle} />
    </div>
  );
}
