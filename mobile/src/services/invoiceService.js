import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, unwrap, BASE_URL } from './apiClient';

export const listInvoices = (status) => unwrap(apiClient.get('/api/invoices', { params: { status } }));
export const getInvoice = (id) => unwrap(apiClient.get(`/api/invoices/${id}`));
export const updateInvoice = (id, payload) => unwrap(apiClient.put(`/api/invoices/${id}`, payload));
export const deleteInvoice = (id) => unwrap(apiClient.delete(`/api/invoices/${id}`));
export const setDiscount = (id, discount) => unwrap(apiClient.put(`/api/invoices/${id}/discount`, discount));
export const setGstIncluded = (id, gstIncluded) => unwrap(apiClient.put(`/api/invoices/${id}/gst`, { gstIncluded }));
export const setPaymentMode = (id, paymentMode) => unwrap(apiClient.put(`/api/invoices/${id}/payment-mode`, { paymentMode }));
export const setInvoiceStatus = (id, status) => unwrap(apiClient.put(`/api/invoices/${id}/status`, { status }));
export const setCostItems = (id, kind, items) => unwrap(apiClient.put(`/api/invoices/${id}/cost-items/${kind}`, { items }));

// FIXED: Uses native fetch to ensure Android/iOS multipart boundaries aren't stripped
export const uploadCostItemPhoto = async (id, kind, index, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
    name: asset.fileName || `receipt-${index}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  });
  
  const token = await AsyncStorage.getItem('gh_token');
  const res = await fetch(`${BASE_URL}/api/invoices/${id}/cost-items/${kind}/${index}/photo`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // Do NOT set Content-Type; fetch sets it automatically
    body: form
  });
  
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const uploadCompletionPhoto = async (id, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
    name: asset.fileName || `completion-${Date.now()}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  });
  return unwrap(
    apiClient.post(`/api/invoices/${id}/completion-photo`, form, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    })
  );
};