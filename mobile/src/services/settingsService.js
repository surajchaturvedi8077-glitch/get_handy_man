import { apiClient, unwrap, BASE_URL } from './apiClient';

export function getSettings() {
  return unwrap(apiClient.get('/api/settings'));
}

export function updateSettings(payload) {
  return unwrap(apiClient.put('/api/settings', payload));
}

// FIXED: Explicitly builds a clean object to stop the React Native FormData crash
export function uploadLogo(asset) {
  const form = new FormData();
  form.append('logo', { 
    uri: asset.uri, 
    name: asset.fileName || asset.name || `logo-${Date.now()}.jpg`, 
    type: asset.mimeType || asset.type || 'image/jpeg' 
  });
  
  return unwrap(
    apiClient.post('/api/settings/logo', form, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    })
  );
}

export function resolveMediaUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export function triggerMorningBriefing() {
  return unwrap(apiClient.post('/api/settings/test-briefing'));
}