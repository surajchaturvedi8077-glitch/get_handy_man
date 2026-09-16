/**
 * enquiryService.js
 * ------------------------------------------------------------------
 * Every enquiry-related API call. Mirrors backend/src/routes/enquiryRoutes.js
 * one function per endpoint — matches the web app's api/enquiryApi.js
 * 1:1, so behaviour stays identical between the two frontends.
 * ------------------------------------------------------------------
 */
import { apiClient, unwrap } from './apiClient';

export const listEnquiries = (status) =>
  unwrap(apiClient.get('/api/enquiries', { params: { status } }));

export const getEnquiry = (id) => unwrap(apiClient.get(`/api/enquiries/${id}`));

export const updateEnquiry = (id, payload) => unwrap(apiClient.put(`/api/enquiries/${id}`, payload));

export const deleteEnquiry = (id) => unwrap(apiClient.delete(`/api/enquiries/${id}`));

export const rejectEnquiry = (id) => unwrap(apiClient.post(`/api/enquiries/${id}/reject`));

export const sendQuote = (id, items) => unwrap(apiClient.post(`/api/enquiries/${id}/send-quote`, { items }));

export const acceptEnquiry = (id) => unwrap(apiClient.post(`/api/enquiries/${id}/accept`));
