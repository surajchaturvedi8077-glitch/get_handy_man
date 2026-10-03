import { apiClient, unwrap } from './apiClient';
import { Platform } from 'react-native';

export const listInvoices = (status) => unwrap(apiClient.get('/api/invoices', { params: { status } }));
export const getInvoice = (id) => unwrap(apiClient.get(`/api/invoices/${id}`));
export const updateInvoice = (id, payload) => unwrap(apiClient.put(`/api/invoices/${id}`, payload));
export const deleteInvoice = (id) => unwrap(apiClient.delete(`/api/invoices/${id}`));
export const setDiscount = (id, discount) => unwrap(apiClient.put(`/api/invoices/${id}/discount`, discount));
export const setGstIncluded = (id, gstIncluded) => unwrap(apiClient.put(`/api/invoices/${id}/gst`, { gstIncluded }));
export const setPaymentMode = (id, paymentMode) => unwrap(apiClient.put(`/api/invoices/${id}/payment-mode`, { paymentMode }));
export const setInvoiceStatus = (id, status) => unwrap(apiClient.put(`/api/invoices/${id}/status`, { status }));
export const setCostItems = (id, kind, items) => unwrap(apiClient.put(`/api/invoices/${id}/cost-items/${kind}`, { items }));

// FIXED: Mirrors the exact logic of the working LogoUploader
export const uploadCostItemPhoto = (id, kind, index, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
    name: asset.fileName || asset.name || `receipt-${index}.jpg`,
    type: asset.mimeType || asset.type || 'image/jpeg',
  });
  
  return unwrap(apiClient.post(`/api/invoices/${id}/cost-items/${kind}/${index}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

// FIXED: Mirrors the exact logic of the working LogoUploader
export const uploadCompletionPhoto = (id, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
    name: asset.fileName || asset.name || `completion-${Date.now()}.jpg`,
    type: asset.mimeType || asset.type || 'image/jpeg',
  });

  return unwrap(apiClient.post(`/api/invoices/${id}/completion-photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};