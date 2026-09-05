/**
 * SettingsContext.jsx
 * ------------------------------------------------------------------
 * Loads the business Settings (GST rate/toggle, branding) once and
 * makes them available app-wide via useSettings(), so components
 * like the invoice GST line don't each fetch settings themselves.
 * ------------------------------------------------------------------
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as settingsApi from '../api/settingsApi';
import { AuthContext } from './AuthContext.jsx';

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  async function update(payload) {
    const data = await settingsApi.updateSettings(payload);
    setSettings(data);
    return data;
  }

  const value = { settings, loading, refresh, update };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
