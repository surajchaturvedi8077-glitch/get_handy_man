/**
 * EnquiryDetailPage.jsx
 * ------------------------------------------------------------------
 * Owns the useEnquiry() hook for one enquiry and wires its actions
 * (reject, send quote, accept) into EnquiryDetail. On accept, jumps
 * straight to the new job's detail page.
 * ------------------------------------------------------------------
 */
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import EnquiryDetail from '../components/enquiries/EnquiryDetail.jsx';
import useEnquiry from '../hooks/useEnquiry.js';
import useToast from '../hooks/useToast.js';

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { enquiry, loading, error, reject, sendQuote, accept } = useEnquiry(id);

  async function handleReject() {
    await reject();
    showToast('Enquiry rejected');
    navigate('/enquiries');
  }

  async function handleSendQuote(items) {
    await sendQuote(items);
    showToast('Quote sent');
  }

  async function handleAccept() {
    const { job } = await accept();
    showToast('Job created from enquiry');
    navigate(`/jobs/${job._id}`);
  }

  return (
    <AppShell activeTab="enquiries">
      <ScreenHeader title="ENQUIRY" subtitle={enquiry?.name} />
      <div style={{ padding: 16 }}>
        {loading && <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        {enquiry && (
          <EnquiryDetail
            enquiry={enquiry}
            onReject={handleReject}
            onSendQuote={handleSendQuote}
            onAccept={handleAccept}
          />
        )}
      </div>
    </AppShell>
  );
}
