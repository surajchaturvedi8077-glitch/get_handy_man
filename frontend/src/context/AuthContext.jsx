/**
 * AuthContext.jsx
 * ------------------------------------------------------------------
 * Holds the logged-in user + JWT, persisted to localStorage so a
 * page refresh doesn't log the worker out. Exposes login/logout and
 * the current user via the useAuth() hook (see hooks/useAuth.js).
 * ------------------------------------------------------------------
 */
import { createContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('gh_user', JSON.stringify(user));
    else localStorage.removeItem('gh_user');
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('gh_token', data.token);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('gh_token');
    setUser(null);
  }

  const value = { user, isAuthenticated: !!user, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
