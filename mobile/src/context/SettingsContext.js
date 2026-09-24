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
    } catch (err) {
      console.log("Settings fetch caught safely:", err);
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