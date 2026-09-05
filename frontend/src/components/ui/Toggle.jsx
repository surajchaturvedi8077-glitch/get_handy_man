/**
 * Toggle.jsx
 * ------------------------------------------------------------------
 * An on/off switch (used for "Include GST" etc). Controlled: pass
 * `on` and `onToggle`, the component holds no state itself.
 * ------------------------------------------------------------------
 */
export default function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: on ? 'var(--green)' : 'var(--gray-light)',
        position: 'relative',
        flexShrink: 0,
        cursor: 'pointer',
        transition: '.15s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: '.15s',
        }}
      />
    </div>
  );
}
