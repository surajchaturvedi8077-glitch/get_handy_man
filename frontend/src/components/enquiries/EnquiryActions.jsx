/**
 * EnquiryActions.jsx
 * ------------------------------------------------------------------
 * A generic Reject / Accept button pair. Used on a "quoted" enquiry
 * (reject vs. accept-and-create-job). Deliberately dumb — no status
 * branching here, the caller decides when to render it.
 * ------------------------------------------------------------------
 */
import Button from '../ui/Button.jsx';

export default function EnquiryActions({ onReject, onAccept, acceptLabel = 'Accept' }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="outline" style={{ flex: 1 }} onClick={onReject}>
        Reject
      </Button>
      <Button variant="green" style={{ flex: 1 }} onClick={onAccept}>
        {acceptLabel}
      </Button>
    </div>
  );
}
