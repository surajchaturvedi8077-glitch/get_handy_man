/**
 * settingsApi.js
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const getSettings = () =>
  axiosClient.get('/api/settings').then((r) => r.data.data);

export const updateSettings = (payload) =>
  axiosClient.put('/api/settings', payload).then((r) => r.data.data);

export const uploadLogo = (file) => {
  const form = new FormData();
  form.append('logo', file);
  return axiosClient
    .post('/api/settings/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.data);
};
