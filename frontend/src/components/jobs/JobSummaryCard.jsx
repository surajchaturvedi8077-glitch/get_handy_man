/**
 * JobSummaryCard.jsx
 * ------------------------------------------------------------------
 * Read-only summary shown once a job's details are filled in:
 * customer, service, schedule, address, materials list, labour.
 * (While needsDetails is true, JobDetailForm is shown instead.)
 * ------------------------------------------------------------------
 */
import FieldLabel from '../ui/FieldLabel.jsx';
import { money } from '../../utils/money.js';

export default function JobSummaryCard({ job }) {
  const materialsTotal = (job.materials || []).reduce((s, m) => s + (m.cost || 0), 0);
  return (
    <div>
      <FieldLabel>Customer</FieldLabel>
      <div style={{ fontSize: 13, marginBottom: 10 }}>
        {job.name} {job.phone ? `· ${job.phone}` : ''}
      </div>

      <FieldLabel>Service & schedule</FieldLabel>
      <div style={{ fontSize: 13, marginBottom: 10 }}>
        {job.service} — {job.when}
      </div>

      <FieldLabel>Address</FieldLabel>
      <div style={{ fontSize: 13, marginBottom: 10 }}>{job.address}</div>

      <FieldLabel>Materials</FieldLabel>
      {(job.materials || []).length ? (
        <ul style={{ margin: '4px 0 10px', paddingLeft: 18, fontSize: 12.5 }}>
          {job.materials.map((m, idx) => (
            <li key={idx}>
              {m.name} — {money(m.cost)}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ fontSize: 12.5, color: 'var(--gray)', marginBottom: 10 }}>None added</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
        <span>Materials total</span>
        <span>{money(materialsTotal)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700 }}>
        <span>Labour</span>
        <span>{money(job.labour)}</span>
      </div>
    </div>
  );
}
