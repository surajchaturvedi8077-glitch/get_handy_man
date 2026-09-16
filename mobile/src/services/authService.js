/**
 * authService.js
 * ------------------------------------------------------------------
 * Every auth-related API call the app makes, in one place. Screens
 * and hooks call these functions — never apiClient directly.
 * ------------------------------------------------------------------
 */
import { apiClient, unwrap, saveToken, clearToken } from './apiClient';

export async function login(email, password) {
  const data = await unwrap(apiClient.post('/api/auth/login', { email, password }));
  await saveToken(data.token);
  return data;
}

export function register(payload) {
  return unwrap(apiClient.post('/api/auth/register', payload));
}

export function getMe() {
  return unwrap(apiClient.get('/api/auth/me'));
}

export async function logout() {
  await clearToken();
}
