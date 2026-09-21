import { Platform } from 'react-native';
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

export const uploadCostItemPhoto = async (id, kind, index, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
    name: asset.fileName || `receipt-${index}.jpg`,
    type: asset.mimeType || 'image/jpeg',
  });
  
  return unwrap(
    apiClient.post(`/api/invoices/${id}/cost-items/${kind}/${index}/photo`, form, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    })
  );
};