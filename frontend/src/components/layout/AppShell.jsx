/**
 * AppShell.jsx
 * ------------------------------------------------------------------
 * Wraps a page's content with the bottom tab bar and the app's max
 * width/centering, so each page only needs to render its own content.
 * `activeTab` picks which BottomTabBar entry is highlighted.
 * ------------------------------------------------------------------
 */
import BottomTabBar from '../ui/BottomTabBar.jsx';

export default function AppShell({ activeTab, children }) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      <BottomTabBar active={activeTab} />
    </div>
  );
}
