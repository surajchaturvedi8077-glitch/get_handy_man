import { apiClient, unwrap } from './apiClient';

export const getBusinessReport = (start, end) => {
  let url = '/api/report';
  if (start && end) url += `?start=${start}&end=${end}`;
  return unwrap(apiClient.get(url));
};