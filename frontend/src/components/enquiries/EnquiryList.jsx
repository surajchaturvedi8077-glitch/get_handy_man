/**
 * EnquiryList.jsx
 * ------------------------------------------------------------------
 * Renders a list of EnquiryListItem rows, or an empty-state message.
 * Purely presentational — data comes from the useEnquiries() hook.
 * ------------------------------------------------------------------
 */
import EnquiryListItem from './EnquiryListItem.jsx';

export default function EnquiryList({ enquiries }) {
  if (!enquiries.length) {
    return (
      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, padding: '30px 0' }}>
        No enquiries here.
      </div>
    );
  }
  return enquiries.map((e) => <EnquiryListItem key={e._id} enquiry={e} />);
}
