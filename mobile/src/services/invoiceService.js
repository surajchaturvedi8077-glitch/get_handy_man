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

// FIXED: Bypasses the FormData crash by passing the exact raw object
export const uploadCostItemPhoto = async (id, kind, index, asset) => {
  const form = new FormData();
  form.append('photo', asset); 
  
  const token = await AsyncStorage.getItem('gh_token');
  
  const response = await fetch(`${BASE_URL}/api/invoices/${id}/cost-items/${kind}/${index}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: form
  });
  
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Upload failed');
  return data.data;
};

// FIXED: Native fetch implementation for completion photos
export const uploadCompletionPhoto = async (id, asset) => {
  const form = new FormData();
  form.append('photo', asset);

  const token = await AsyncStorage.getItem('gh_token');
  
  const response = await fetch(`${BASE_URL}/api/invoices/${id}/completion-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: form
  });

  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message || 'Upload failed');
  return data.data;
};