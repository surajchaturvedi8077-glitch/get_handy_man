/**
 * AppRoutes.jsx
 * ------------------------------------------------------------------
 * The full route table. /login is public; everything else is wrapped
 * in ProtectedRoute so an unauthenticated visitor is bounced to login.
 * ------------------------------------------------------------------
 */
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import EnquiriesPage from '../pages/EnquiriesPage.jsx';
import EnquiryDetailPage from '../pages/EnquiryDetailPage.jsx';
import JobsPage from '../pages/JobsPage.jsx';
import JobDetailPage from '../pages/JobDetailPage.jsx';
import InvoicesPage from '../pages/InvoicesPage.jsx';
import InvoiceDetailPage from '../pages/InvoiceDetailPage.jsx';
import ReportPage from '../pages/ReportPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/enquiries" element={<ProtectedRoute><EnquiriesPage /></ProtectedRoute>} />
      <Route path="/enquiries/:id" element={<ProtectedRoute><EnquiryDetailPage /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}
