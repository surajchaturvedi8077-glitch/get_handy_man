/**
 * invoiceApi.js
 * ------------------------------------------------------------------
 * Each function maps 1:1 to one small backend route, matching how
 * the UI edits an invoice one field/action at a time (discount, GST
 * toggle, payment mode, cost items, receipt photo...).
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const listInvoices = (status) =>
  axiosClient.get('/api/invoices', { params: { status } }).then((r) => r.data.data);

export const getInvoice = (id) =>
  axiosClient.get(`/api/invoices/${id}`).then((r) => r.data.data);

export const updateInvoice = (id, payload) =>
  axiosClient.put(`/api/invoices/${id}`, payload).then((r) => r.data.data);

export const deleteInvoice = (id) =>
  axiosClient.delete(`/api/invoices/${id}`).then((r) => r.data.data);

export const setDiscount = (id, discount) =>
  axiosClient.put(`/api/invoices/${id}/discount`, discount).then((r) => r.data.data);

export const setGstIncluded = (id, gstIncluded) =>
  axiosClient.put(`/api/invoices/${id}/gst`, { gstIncluded }).then((r) => r.data.data);

export const setPaymentMode = (id, paymentMode) =>
  axiosClient.put(`/api/invoices/${id}/payment-mode`, { paymentMode }).then((r) => r.data.data);

export const setInvoiceStatus = (id, status) =>
  axiosClient.put(`/api/invoices/${id}/status`, { status }).then((r) => r.data.data);

export const setCostItems = (id, kind, items) =>
  axiosClient.put(`/api/invoices/${id}/cost-items/${kind}`, { items }).then((r) => r.data.data);

export const uploadCostItemPhoto = (id, kind, index, file) => {
  const form = new FormData();
  form.append('photo', file);
  return axiosClient
    .post(`/api/invoices/${id}/cost-items/${kind}/${index}/photo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data.data);
};
