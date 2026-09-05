/**
 * EnquiryDetail.jsx
 * ------------------------------------------------------------------
 * Composes the small enquiry-detail pieces (summary card, quote
 * composer, accept/reject actions) based on the enquiry's status.
 * Holds no logic of its own — every action is passed down from
 * EnquiryDetailPage, which owns the useEnquiry() hook.
 * ------------------------------------------------------------------
 */
import EnquirySummaryCard from './EnquirySummaryCard.jsx';
import QuoteComposer from './QuoteComposer.jsx';
import EnquiryActions from './EnquiryActions.jsx';
import Button from '../ui/Button.jsx';
import { money } from '../../utils/money.js';

export default function EnquiryDetail({ enquiry, onReject, onSendQuote, onAccept }) {
  return (
    <div>
      <EnquirySummaryCard enquiry={enquiry} />

      {enquiry.status === 'new' && (
        <>
          <QuoteComposer initialItems={enquiry.quoteItems} onSend={onSendQuote} />
          <Button variant="outline" style={{ width: '100%', marginTop: 10 }} onClick={onReject}>
            Reject enquiry
          </Button>
        </>
      )}

      {enquiry.status === 'quoted' && (
        <>
          <div style={{ fontWeight: 800, fontSize: 15, margin: '4px 0 14px' }}>
            Quoted: {money(enquiry.price)}
          </div>
          <EnquiryActions onReject={onReject} onAccept={onAccept} acceptLabel="Mark accepted & create job" />
        </>
      )}

      {(enquiry.status === 'accepted' || enquiry.status === 'rejected') && (
        <div style={{ fontSize: 12.5, color: 'var(--gray)' }}>
          This enquiry is {enquiry.status}. No further action needed here.
        </div>
      )}
    </div>
  );
}
