/**
 * SettingsContext.js
 * ------------------------------------------------------------------
 * Loads business Settings (GST rate/toggle, branding) once via
 * services/settingsService.js and makes them available app-wide
 * through useSettings().
 * ------------------------------------------------------------------
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as settingsService from '../services/settingsService';
import { AuthContext } from './AuthContext';

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await settingsService.getSettings());
    } catch (error) {
      // Fixed: Catch block prevents unhandled promise rejection crashes
      console.log("Settings fetch failed gracefully:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  async function update(payload) {
    const data = await settingsService.updateSettings(payload);
    setSettings(data);
    return data;
  }

  const value = { settings, loading, refresh, update };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}