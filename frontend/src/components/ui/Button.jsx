/**
 * Button.jsx
 * ------------------------------------------------------------------
 * The one button component every screen uses. `variant` picks the
 * color treatment: 'primary' (orange), 'dark', 'green', 'outline'.
 * ------------------------------------------------------------------
 */
export default function Button({ variant = 'primary', children, style, ...rest }) {
  const variants = {
    primary: { background: 'var(--orange)', color: '#fff', border: 'none' },
    dark: { background: 'var(--charcoal)', color: '#fff', border: 'none' },
    green: { background: 'var(--green)', color: '#fff', border: 'none' },
    outline: { background: '#fff', color: 'var(--charcoal)', border: '1.5px solid var(--charcoal)' },
  };
  return (
    <button
      {...rest}
      style={{
        borderRadius: 8,
        fontWeight: 700,
        cursor: 'pointer',
        fontSize: 13,
        padding: 12,
        textAlign: 'center',
        fontFamily: 'inherit',
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
