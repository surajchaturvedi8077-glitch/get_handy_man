/**
 * Card.jsx
 * ------------------------------------------------------------------
 * A bordered, rounded container. `onClick` makes it act like a
 * clickable list row (used for enquiry/job/invoice rows).
 * ------------------------------------------------------------------
 */
export default function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid var(--gray-light)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 10,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
