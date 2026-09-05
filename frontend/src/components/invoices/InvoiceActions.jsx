/**
 * InvoiceActions.jsx
 * ------------------------------------------------------------------
 * The three primary buttons on an invoice: toggle paid/unpaid, and
 * placeholders for PDF preview / share (wire these to your PDF/share
 * integration of choice — kept as callbacks so this component stays
 * decoupled from that implementation).
 * ------------------------------------------------------------------
 */
import Button from '../ui/Button.jsx';

export default function InvoiceActions({ isPaid, onTogglePaid, onPreviewPdf, onShare }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <Button variant={isPaid ? 'outline' : 'green'} style={{ flex: 1, fontSize: 11.5 }} onClick={onTogglePaid}>
        {isPaid ? 'Mark unpaid' : 'Mark as paid'}
      </Button>
      <Button variant="dark" style={{ flex: 1, fontSize: 11.5 }} onClick={onPreviewPdf}>
        Preview PDF
      </Button>
      <Button variant="primary" style={{ flex: 1, fontSize: 11.5 }} onClick={onShare}>
        Share
      </Button>
    </div>
  );
}
