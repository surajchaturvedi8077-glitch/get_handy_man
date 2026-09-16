/**
 * services/index.js
 * ------------------------------------------------------------------
 * Barrel file: re-exports every service module as a namespace, so any
 * screen/hook can do either:
 *
 *   import { jobService } from '../services';
 *   jobService.getJob(id);
 *
 * or import a single function directly from its own file:
 *
 *   import { getJob } from '../services/jobService';
 *
 * Both work — use whichever reads better at the call site. This file
 * (plus apiClient.js) is the ONLY place that needs to change when you
 * point the app at your real backend or rename an endpoint.
 * ------------------------------------------------------------------
 */
export * as authService from './authService';
export * as settingsService from './settingsService';
export * as enquiryService from './enquiryService';
export * as jobService from './jobService';
export * as invoiceService from './invoiceService';
export * as reportService from './reportService';
export { apiClient, BASE_URL } from './apiClient';
