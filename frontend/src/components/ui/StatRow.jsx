/**
 * StatRow.jsx
 * ------------------------------------------------------------------
 * One row in the business Report: a label/value pair on a tinted
 * background, with a small sub-caption underneath. Used for Reported
 * income, Cash Bonus, GST on material, Reportable GST, expenses,
 * profit — every row on ReportScreen is one of these.
 * ------------------------------------------------------------------
 */
export default function StatRow({ label, sub, value, bg, fg }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: fg, letterSpacing: 0.4 }}>
          {label.toUpperCase()}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color: fg }}>{value}</span>
      </div>
      <div style={{ fontSize: 10, color: fg, opacity: 0.85, marginTop: 2 }}>{sub}</div>
    </div>
  );
}
