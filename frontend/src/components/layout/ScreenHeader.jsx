/**
 * ScreenHeader.jsx
 * ------------------------------------------------------------------
 * The dark header bar used at the top of most screens: an optional
 * back button, a title, and an optional right-side action (e.g. a
 * 3-dot menu trigger).
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';

export default function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--charcoal)', padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBack !== false && (
            <span
              onClick={() => (onBack ? onBack() : navigate(-1))}
              style={{ color: '#fff', cursor: 'pointer', fontSize: 16 }}
            >
              ←
            </span>
          )}
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 12.5, letterSpacing: 0.5 }}>
              {title}
            </div>
            {subtitle && <div style={{ color: '#C7CCD4', fontSize: 9.5 }}>{subtitle}</div>}
          </div>
        </div>
        {rightAction}
      </div>
    </div>
  );
}
