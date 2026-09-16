/**
 * apiClient.js
 * ------------------------------------------------------------------
 * THE single HTTP client for the whole app. Every other service file
 * in this folder (authService, jobService, invoiceService, etc.)
 * imports and uses ONLY this — no screen or component ever imports
 * axios directly. That means:
 *
 *   - The backend base URL lives in exactly one place (EXPO_PUBLIC_API_URL,
 *     see .env.example) — point it at your real backend once it's ready
 *     and the whole app follows.
 *   - Auth headers, error handling, and logging are wired up once here.
 *   - If you ever swap HTTP libraries or add request signing/retries,
 *     you change this one file.
 *
 * Token storage uses AsyncStorage (React Native's equivalent of
 * localStorage — there's no browser storage on a phone).
 * ------------------------------------------------------------------
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';
const TOKEN_KEY = 'gh_token';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the saved JWT (if any) to every outgoing request.
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired/invalid token), clear local auth state so the app
// can fall back to the login screen. Individual screens don't need
// to handle this themselves.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([TOKEN_KEY, 'gh_user']);
    }
    return Promise.reject(error);
  }
);

// Small helpers so every service function can write one line instead
// of unwrapping response.data.data everywhere.
export const unwrap = (promise) => promise.then((r) => r.data.data);

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.multiRemove([TOKEN_KEY, 'gh_user']);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export { BASE_URL };
