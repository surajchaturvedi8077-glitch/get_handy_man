/**
 * EnquiryListItem.jsx
 * ------------------------------------------------------------------
 * One row in the enquiries list: name, status chip, service, and
 * when it was received. Clicking navigates to the detail page.
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import Chip from '../ui/Chip.jsx';

const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquiryListItem({ enquiry }) {
  const navigate = useNavigate();
  return (
    <Card onClick={() => navigate(`/enquiries/${enquiry._id}`)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 13.5 }}>{enquiry.name}</span>
        <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
          {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
        </Chip>
      </div>
      <div style={{ fontSize: 12, color: 'var(--charcoal2)', marginTop: 4 }}>{enquiry.service}</div>
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--gray)',
          marginTop: 5,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{enquiry.when}</span>
        <span>{new Date(enquiry.received).toLocaleDateString()}</span>
      </div>
    </Card>
  );
}
