/**
 * reportApi.js
 * ------------------------------------------------------------------
 */
import axiosClient from './axiosClient';

export const getBusinessReport = () =>
  axiosClient.get('/api/report').then((r) => r.data.data);
