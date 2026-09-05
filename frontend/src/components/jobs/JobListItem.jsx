/**
 * JobListItem.jsx
 * ------------------------------------------------------------------
 * One row in the jobs list: scheduled time, status badge, customer +
 * service, and address. Clicking navigates to the job detail page.
 * ------------------------------------------------------------------
 */
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import JobStatusBadge from './JobStatusBadge.jsx';

export default function JobListItem({ job }) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(`/jobs/${job._id}`)}
      style={job.needsDetails ? { borderColor: 'var(--orange)' } : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 13.5 }}>{job.when}</span>
        <JobStatusBadge job={job} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--charcoal2)', marginTop: 4 }}>
        {job.name} — {job.service}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--gray)', marginTop: 4 }}>{job.address}</div>
    </Card>
  );
}
