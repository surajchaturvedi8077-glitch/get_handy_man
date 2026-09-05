/**
 * axiosClient.js
 * ------------------------------------------------------------------
 * The single configured axios instance every api/*.js file imports.
 * - Base URL comes from VITE_API_URL (empty in dev = same-origin,
 *   handled by the Vite proxy in vite.config.js).
 * - Attaches the saved JWT to every request.
 * - On 401, clears the token so the app can redirect to /login.
 * ------------------------------------------------------------------
 */
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_user');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
