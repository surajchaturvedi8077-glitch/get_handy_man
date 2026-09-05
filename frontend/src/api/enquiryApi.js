/**
 * enquiryApi.js
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const listEnquiries = (status) =>
  axiosClient.get('/api/enquiries', { params: { status } }).then((r) => r.data.data);

export const getEnquiry = (id) =>
  axiosClient.get(`/api/enquiries/${id}`).then((r) => r.data.data);

export const updateEnquiry = (id, payload) =>
  axiosClient.put(`/api/enquiries/${id}`, payload).then((r) => r.data.data);

export const deleteEnquiry = (id) =>
  axiosClient.delete(`/api/enquiries/${id}`).then((r) => r.data.data);

export const rejectEnquiry = (id) =>
  axiosClient.post(`/api/enquiries/${id}/reject`).then((r) => r.data.data);

export const sendQuote = (id, items) =>
  axiosClient.post(`/api/enquiries/${id}/send-quote`, { items }).then((r) => r.data.data);

export const acceptEnquiry = (id) =>
  axiosClient.post(`/api/enquiries/${id}/accept`).then((r) => r.data.data);
