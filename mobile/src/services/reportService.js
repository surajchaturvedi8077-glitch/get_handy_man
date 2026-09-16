/**
 * reportService.js
 * ------------------------------------------------------------------
 * Fetches the business Report (Reported income, Cash Bonus, GST on
 * material, Reportable GST, expenses, profit) from the backend.
 * ------------------------------------------------------------------
 */
import { apiClient, unwrap } from './apiClient';

export const getBusinessReport = () => unwrap(apiClient.get('/api/report'));
