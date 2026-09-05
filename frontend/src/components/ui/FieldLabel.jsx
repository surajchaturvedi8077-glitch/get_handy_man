/**
 * FieldLabel.jsx
 * ------------------------------------------------------------------
 * A small uppercase section/field caption, e.g. "MATERIAL EXPENSES".
 * ------------------------------------------------------------------
 */
export default function FieldLabel({ children, style }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--gray)',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
