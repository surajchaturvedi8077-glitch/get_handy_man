import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  
  // Replaced "Pending" and "Confirmed" with a unified "Assigned" status
  return <Chip tone="blue">Assigned</Chip>;
}