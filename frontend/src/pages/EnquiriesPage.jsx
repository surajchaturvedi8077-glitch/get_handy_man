/**
 * EnquiriesPage.jsx
 * ------------------------------------------------------------------
 * The enquiries list screen: filter tabs + EnquiryList. Owns the
 * status filter's local state and the useEnquiries() data hook.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import EnquiryFilterTabs from '../components/enquiries/EnquiryFilterTabs.jsx';
import EnquiryList from '../components/enquiries/EnquiryList.jsx';
import useEnquiries from '../hooks/useEnquiries.js';

export default function EnquiriesPage() {
  const [filter, setFilter] = useState('new');
  const { enquiries, loading, error } = useEnquiries(filter);

  return (
    <AppShell activeTab="enquiries">
      <ScreenHeader title="ENQUIRIES" onBack={false} />
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 14 }}>
          <EnquiryFilterTabs value={filter} onChange={setFilter} />
        </div>
        {loading && <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        {!loading && !error && <EnquiryList enquiries={enquiries} />}
      </div>
    </AppShell>
  );
}
