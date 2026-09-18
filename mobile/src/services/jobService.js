/**
 * jobService.js
 * ------------------------------------------------------------------
 * Every job-related API call. Mirrors backend/src/routes/jobRoutes.js.
 * ------------------------------------------------------------------
 */
import { apiClient, unwrap } from './apiClient';

export const listJobs = (status) => unwrap(apiClient.get('/api/jobs', { params: { status } }));

export const getJob = (id) => unwrap(apiClient.get(`/api/jobs/${id}`));

export const updateJob = (id, payload) => unwrap(apiClient.put(`/api/jobs/${id}`, payload));
export const createJob = (payload) => unwrap(apiClient.post('/api/jobs', payload));
export const deleteJob = (id) => unwrap(apiClient.delete(`/api/jobs/${id}`));

export const saveJobDetails = (id, payload) => unwrap(apiClient.put(`/api/jobs/${id}/details`, payload));

export const updateMaterials = (id, materials) =>
  unwrap(apiClient.put(`/api/jobs/${id}/materials`, { materials }));

export const markJobComplete = (id) => unwrap(apiClient.post(`/api/jobs/${id}/complete`));
