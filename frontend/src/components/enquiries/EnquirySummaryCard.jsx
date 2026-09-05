/**
 * EnquirySummaryCard.jsx
 * ------------------------------------------------------------------
 * Read-only summary of an enquiry's contact + job details, shown at
 * the top of the enquiry detail screen.
 * ------------------------------------------------------------------
 */
import Chip from '../ui/Chip.jsx';

const CHIP_TONE = { new: 'orange', quoted: 'blue', accepted: 'green', rejected: 'red' };

export default function EnquirySummaryCard({ enquiry }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>{enquiry.name}</span>
        <Chip tone={CHIP_TONE[enquiry.status] || 'orange'}>
          {enquiry.status[0].toUpperCase() + enquiry.status.slice(1)}
        </Chip>
      </div>
      <div style={{ fontSize: 13, color: 'var(--charcoal2)', marginTop: 4 }}>{enquiry.service}</div>
      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 8, lineHeight: 1.6 }}>
        {enquiry.phone && <div>{enquiry.phone}</div>}
        {enquiry.email && <div>{enquiry.email}</div>}
        {(enquiry.address || enquiry.suburb) && (
          <div>{[enquiry.address, enquiry.suburb].filter(Boolean).join(', ')}</div>
        )}
        {enquiry.when && <div>Preferred: {enquiry.when}</div>}
      </div>
      {enquiry.message && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: 'var(--offwhite)',
            borderRadius: 8,
            fontSize: 12.5,
            color: 'var(--charcoal2)',
          }}
        >
          {enquiry.message}
        </div>
      )}
    </div>
  );
}
