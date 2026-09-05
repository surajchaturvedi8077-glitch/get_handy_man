/**
 * Chip.jsx
 * ------------------------------------------------------------------
 * A small status pill, e.g. "New", "Confirmed", "Paid". `tone` picks
 * the color: 'green' | 'orange' | 'blue' | 'red'.
 * ------------------------------------------------------------------
 */
const TONES = {
  green: { background: 'var(--green-tint)', color: 'var(--green)' },
  orange: { background: 'var(--orange-tint)', color: 'var(--orange-deep)' },
  blue: { background: 'var(--blue-tint)', color: 'var(--blue)' },
  red: { background: 'var(--red-tint)', color: 'var(--red)' },
};

export default function Chip({ tone = 'orange', children }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 999,
        ...TONES[tone],
      }}
    >
      {children}
    </span>
  );
}
