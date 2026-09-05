/**
 * ReportPage.jsx
 * ------------------------------------------------------------------
 * Standalone /report route (in addition to the Report tab inside
 * Invoices) so the business Report can be linked/bookmarked directly.
 * ------------------------------------------------------------------
 */
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import ReportScreen from '../components/report/ReportScreen.jsx';
import useReport from '../hooks/useReport.js';

export default function ReportPage() {
  const { report, loading, error } = useReport();

  return (
    <AppShell activeTab="invoices">
      <ScreenHeader title="REPORT" onBack={false} />
      <div style={{ padding: 16 }}>
        {loading && <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        {report && <ReportScreen report={report} />}
      </div>
    </AppShell>
  );
}
