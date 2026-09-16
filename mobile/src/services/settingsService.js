/**
 * settingsService.js
 * ------------------------------------------------------------------
 */
import { apiClient, unwrap, BASE_URL } from './apiClient';

export function getSettings() {
  return unwrap(apiClient.get('/api/settings'));
}

export function updateSettings(payload) {
  return unwrap(apiClient.put('/api/settings', payload));
}

// React Native uploads use { uri, name, type } objects (from the image
// picker), not browser File objects — see components/settings/LogoUploader.js.
export function uploadLogo(asset) {
  const form = new FormData();
  form.append('logo', { uri: asset.uri, name: asset.fileName || 'logo.jpg', type: asset.mimeType || 'image/jpeg' });
  return unwrap(
    apiClient.post('/api/settings/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  );
}

// Receipt/logo photo URLs come back from the API as relative paths
// (e.g. "/uploads/xyz.jpg"). Screens use this to build a full <Image
// source={{ uri: resolveMediaUrl(item.photoUrl) }} /> URL.
export function resolveMediaUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}
