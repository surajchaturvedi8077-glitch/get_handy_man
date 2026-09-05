/**
 * Toast.jsx
 * ------------------------------------------------------------------
 * The floating confirmation banner ("Job deleted", "Quote sent via
 * email"...). Rendered once by ToastContext; shows/hides based on
 * whether `message` is set.
 * ------------------------------------------------------------------
 */
export default function Toast({ message }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 18,
        maxWidth: 420,
        margin: '0 auto',
        background: 'var(--charcoal-deep)',
        color: '#fff',
        padding: '12px 14px',
        borderRadius: 10,
        fontSize: 12.5,
        fontWeight: 600,
        opacity: message ? 1 : 0,
        transform: message ? 'translateY(0)' : 'translateY(8px)',
        transition: '.25s',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {message}
    </div>
  );
}
