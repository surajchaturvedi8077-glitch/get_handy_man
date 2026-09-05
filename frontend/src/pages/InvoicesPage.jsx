/**
 * InvoicesPage.jsx
 * ------------------------------------------------------------------
 * The invoices screen: Unpaid / Paid / All tabs show InvoiceList;
 * the Report tab (was "Summary") shows ReportScreen instead, backed
 * by its own useReport() hook so it only fetches when selected.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import InvoiceTabs from '../components/invoices/InvoiceTabs.jsx';
import InvoiceList from '../components/invoices/InvoiceList.jsx';
import ReportScreen from '../components/report/ReportScreen.jsx';
import useInvoices from '../hooks/useInvoices.js';
import useReport from '../hooks/useReport.js';

function InvoiceListPane({ tab }) {
  const { invoices, loading, error } = useInvoices(tab);
  if (loading) return <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>;
  if (error) return <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>;
  return <InvoiceList invoices={invoices} showUnpaidTotal={tab === 'unpaid'} />;
}

function ReportPane() {
  const { report, loading, error } = useReport();
  if (loading) return <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>;
  if (error) return <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>;
  return <ReportScreen report={report} />;
}

export default function InvoicesPage() {
  const [tab, setTab] = useState('unpaid');

  return (
    <AppShell activeTab="invoices">
      <div style={{ background: 'var(--charcoal)', padding: '10px 16px 14px' }}>
        <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>
          INVOICES
        </div>
        <InvoiceTabs value={tab} onChange={setTab} />
      </div>
      <div style={{ background: 'var(--offwhite)', padding: 14, minHeight: '60vh' }}>
        {tab === 'report' ? <ReportPane /> : <InvoiceListPane tab={tab} />}
      </div>
    </AppShell>
  );
}
