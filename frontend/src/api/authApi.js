/**
 * authApi.js
 * ------------------------------------------------------------------
 * Thin wrappers around the /api/auth endpoints. Each function returns
 * response.data.data directly so callers never touch axios shapes.
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const login = (email, password) =>
  axiosClient.post('/api/auth/login', { email, password }).then((r) => r.data.data);

export const register = (payload) =>
  axiosClient.post('/api/auth/register', payload).then((r) => r.data.data);

export const getMe = () =>
  axiosClient.get('/api/auth/me').then((r) => r.data.data);
