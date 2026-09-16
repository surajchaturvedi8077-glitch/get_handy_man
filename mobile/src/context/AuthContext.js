/**
 * AuthContext.js
 * ------------------------------------------------------------------
 * Holds the logged-in user, persisted to AsyncStorage so the app
 * stays logged in between opens. All actual API calls go through
 * services/authService.js — this file only manages the resulting
 * state. Exposed via the useAuth() hook.
 * ------------------------------------------------------------------
 */
import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);
const USER_KEY = 'gh_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // On app start, restore whichever user was saved last session.
  useEffect(() => {
    AsyncStorage.getItem(USER_KEY)
      .then((raw) => raw && setUser(JSON.parse(raw)))
      .finally(() => setInitializing(false));
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const value = { user, isAuthenticated: !!user, initializing, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
