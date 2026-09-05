/**
 * JobActions.jsx
 * ------------------------------------------------------------------
 * Bottom actions on a confirmed/complete job: "Mark complete"
 * (generates the invoice) once, and a "Delete job" flow gated behind
 * a confirmation step so a stray tap can't remove a job.
 * ------------------------------------------------------------------
 */
import { useState } from 'react';
import Button from '../ui/Button.jsx';

export default function JobActions({ job, onComplete, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (confirmingDelete) {
    return (
      <div style={{ background: 'var(--red-tint)', borderRadius: 10, padding: 14, marginTop: 16 }}>
        <div style={{ fontSize: 12.5, color: 'var(--red)', fontWeight: 700, marginBottom: 10 }}>
          Delete this job? This can't be undone.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" style={{ flex: 1 }} onClick={() => setConfirmingDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="dark"
            style={{ flex: 1, background: 'var(--red)' }}
            onClick={() => onDelete()}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      {job.status !== 'complete' && (
        <Button variant="green" style={{ flex: 1 }} onClick={onComplete}>
          Mark complete
        </Button>
      )}
      <Button variant="outline" style={{ flex: 1 }} onClick={() => setConfirmingDelete(true)}>
        Delete job
      </Button>
    </div>
  );
}
