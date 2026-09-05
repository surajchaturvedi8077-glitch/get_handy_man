/**
 * BottomTabBar.jsx
 * ------------------------------------------------------------------
 * The app's primary navigation: Dashboard / Enquiries / Jobs /
 * Invoices, fixed to the bottom of the screen like the prototype's
 * phone tab bar. `active` is the current route key.
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';

const TABS = [
  { key: 'dashboard', label: 'Home', path: '/' },
  { key: 'enquiries', label: 'Enquiries', path: '/enquiries' },
  { key: 'jobs', label: 'Jobs', path: '/jobs' },
  { key: 'invoices', label: 'Invoices', path: '/invoices' },
];

export default function BottomTabBar({ active }) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        display: 'flex',
        borderTop: '1px solid var(--gray-light)',
        background: '#fff',
        position: 'sticky',
        bottom: 0,
      }}
    >
      {TABS.map((tab) => (
        <div
          key={tab.key}
          onClick={() => navigate(tab.path)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '9px 0 11px',
            cursor: 'pointer',
            color: active === tab.key ? 'var(--orange)' : 'var(--gray)',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
