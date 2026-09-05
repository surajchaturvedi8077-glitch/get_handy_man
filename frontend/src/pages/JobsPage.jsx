/**
 * JobsPage.jsx
 * ------------------------------------------------------------------
 * The jobs list screen: filter tabs + JobList.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import JobFilterTabs from '../components/jobs/JobFilterTabs.jsx';
import JobList from '../components/jobs/JobList.jsx';
import useJobs from '../hooks/useJobs.js';

export default function JobsPage() {
  const [filter, setFilter] = useState('all');
  const { jobs, loading, error } = useJobs(filter);

  return (
    <AppShell activeTab="jobs">
      <ScreenHeader title="JOBS" onBack={false} />
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <JobFilterTabs value={filter} onChange={setFilter} />
        </div>
        {loading && <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        {!loading && !error && <JobList jobs={jobs} />}
      </div>
    </AppShell>
  );
}
