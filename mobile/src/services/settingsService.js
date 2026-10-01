import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, unwrap, BASE_URL } from './apiClient';

export function getSettings() {
  return unwrap(apiClient.get('/api/settings'));
}

export function updateSettings(payload) {
  return unwrap(apiClient.put('/api/settings', payload));
}

// FIXED: Bypasses the Axios FormData bug using native fetch
export async function uploadLogo(asset) {
  const form = new FormData();
  form.append('logo', { 
    uri: asset.uri, 
    name: asset.fileName || asset.name || `logo-${Date.now()}.jpg`, 
    type: asset.mimeType || asset.type || 'image/jpeg' 
  });
  
  const token = await AsyncStorage.getItem('gh_token');
  
  const response = await fetch(`${BASE_URL}/api/settings/logo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: form
  });
  
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Logo upload failed');
  return data.data;
}

export function resolveMediaUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

export function triggerMorningBriefing() {
  return unwrap(apiClient.post('/api/settings/test-briefing'));
}