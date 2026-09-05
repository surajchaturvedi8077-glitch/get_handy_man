/**
 * DashboardPage.jsx
 * ------------------------------------------------------------------
 * Home screen: quick counts for new enquiries, today's jobs, and
 * unpaid invoices, each linking into the relevant list.
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import useEnquiries from '../hooks/useEnquiries.js';
import useJobs from '../hooks/useJobs.js';
import useInvoices from '../hooks/useInvoices.js';

function SummaryCard({ big, label, sub, bg, fg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: bg, borderRadius: 10, padding: '12px 14px', marginBottom: 12, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: fg }}>{big}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: fg, letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ fontSize: 10.5, color: fg, marginTop: 2, opacity: 0.85 }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { enquiries: newEnquiries } = useEnquiries('new');
  const { jobs: todayJobs } = useJobs('all');
  const { invoices: unpaidInvoices } = useInvoices('unpaid');

  return (
    <AppShell activeTab="dashboard">
      <ScreenHeader title="GET HANDYMAN" subtitle="Worker dashboard" onBack={false} />
      <div style={{ padding: 16 }}>
        <SummaryCard
          big={newEnquiries.length}
          label={newEnquiries.length === 1 ? 'NEW ENQUIRY' : 'NEW ENQUIRIES'}
          sub="From gethandyman.com.au"
          bg="var(--orange-tint)"
          fg="var(--orange-deep)"
          onClick={() => navigate('/enquiries')}
        />
        <SummaryCard
          big={todayJobs.length}
          label="JOBS"
          sub="Tap to view all jobs"
          bg="var(--blue-tint)"
          fg="var(--blue)"
          onClick={() => navigate('/jobs')}
        />
        {unpaidInvoices.length > 0 && (
          <SummaryCard
            big={unpaidInvoices.length}
            label={unpaidInvoices.length === 1 ? 'UNPAID INVOICE' : 'UNPAID INVOICES'}
            sub="Tap to review & follow up"
            bg="var(--red-tint)"
            fg="var(--red)"
            onClick={() => navigate('/invoices')}
          />
        )}
      </div>
    </AppShell>
  );
}
