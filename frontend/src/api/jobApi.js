/**
 * jobApi.js
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const listJobs = (status) =>
  axiosClient.get('/api/jobs', { params: { status } }).then((r) => r.data.data);

export const getJob = (id) =>
  axiosClient.get(`/api/jobs/${id}`).then((r) => r.data.data);

export const updateJob = (id, payload) =>
  axiosClient.put(`/api/jobs/${id}`, payload).then((r) => r.data.data);

export const deleteJob = (id) =>
  axiosClient.delete(`/api/jobs/${id}`).then((r) => r.data.data);

export const saveJobDetails = (id, payload) =>
  axiosClient.put(`/api/jobs/${id}/details`, payload).then((r) => r.data.data);

export const updateMaterials = (id, materials) =>
  axiosClient.put(`/api/jobs/${id}/materials`, { materials }).then((r) => r.data.data);

export const markJobComplete = (id) =>
  axiosClient.post(`/api/jobs/${id}/complete`).then((r) => r.data.data);
