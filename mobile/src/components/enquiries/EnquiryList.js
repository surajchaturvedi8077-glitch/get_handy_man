/**
 * EnquiryList.js
 * ------------------------------------------------------------------
 * Renders a list of EnquiryListItem rows, or an empty-state message.
 * ------------------------------------------------------------------
 */
import EnquiryListItem from './EnquiryListItem';
import EmptyState from '../ui/EmptyState';

export default function EnquiryList({ enquiries }) {
  if (!enquiries.length) return <EmptyState>No enquiries here.</EmptyState>;
  return enquiries.map((e) => <EnquiryListItem key={e._id} enquiry={e} />);
}
