/**
 * App.jsx
 * ------------------------------------------------------------------
 * Top-level component: wraps the whole app in the shared context
 * providers (auth, settings, toast) and renders the route tree.
 * Keeps App.jsx itself tiny — the actual screens live in pages/.
 * ------------------------------------------------------------------
 */
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
