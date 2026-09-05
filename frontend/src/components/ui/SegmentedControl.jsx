/**
 * SegmentedControl.jsx
 * ------------------------------------------------------------------
 * A row of pill buttons where exactly one is active — used for
 * status filter tabs (enquiries/jobs) and the invoice tabs
 * (Unpaid / Paid / All / Report).
 * `options`: [{ value, label }]. Controlled via `value`/`onChange`.
 * ------------------------------------------------------------------
 */
export default function SegmentedControl({ options, value, onChange, dark = false }) {
  return (
    <div
      style={{
        display: 'flex',
        background: dark ? '#2B3648' : '#F1F0ED',
        borderRadius: 8,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              border: 'none',
              background: active ? (dark ? 'var(--orange)' : '#fff') : 'transparent',
              color: active ? (dark ? '#fff' : 'var(--charcoal)') : dark ? '#C7CCD4' : 'var(--gray)',
              boxShadow: active && !dark ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
              fontSize: dark ? 10.5 : 11,
              fontWeight: 700,
              padding: '7px 0',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
