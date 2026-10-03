import { apiClient, unwrap } from './apiClient';

export const listInvoices = (status) => unwrap(apiClient.get('/api/invoices', { params: { status } }));
export const getInvoice = (id) => unwrap(apiClient.get(`/api/invoices/${id}`));
export const updateInvoice = (id, payload) => unwrap(apiClient.put(`/api/invoices/${id}`, payload));
export const deleteInvoice = (id) => unwrap(apiClient.delete(`/api/invoices/${id}`));
export const setDiscount = (id, discount) => unwrap(apiClient.put(`/api/invoices/${id}/discount`, discount));
export const setGstIncluded = (id, gstIncluded) => unwrap(apiClient.put(`/api/invoices/${id}/gst`, { gstIncluded }));
export const setPaymentMode = (id, paymentMode) => unwrap(apiClient.put(`/api/invoices/${id}/payment-mode`, { paymentMode }));
export const setInvoiceStatus = (id, status) => unwrap(apiClient.put(`/api/invoices/${id}/status`, { status }));
export const setCostItems = (id, kind, items) => unwrap(apiClient.put(`/api/invoices/${id}/cost-items/${kind}`, { items }));

// FIXED: Explicitly builds a clean object to stop the React Native FormData crash
export const uploadCostItemPhoto = (id, kind, index, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: asset.uri,
    name: asset.name || asset.fileName || `receipt-${index}.jpg`,
    type: asset.type || asset.mimeType || 'image/jpeg',
  });
  
  return unwrap(apiClient.post(`/api/invoices/${id}/cost-items/${kind}/${index}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};

// FIXED: Explicitly builds a clean object for completion photos
export const uploadCompletionPhoto = (id, asset) => {
  const form = new FormData();
  form.append('photo', {
    uri: asset.uri,
    name: asset.name || asset.fileName || `completion-${Date.now()}.jpg`,
    type: asset.type || asset.mimeType || 'image/jpeg',
  });

  return unwrap(apiClient.post(`/api/invoices/${id}/completion-photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }));
};