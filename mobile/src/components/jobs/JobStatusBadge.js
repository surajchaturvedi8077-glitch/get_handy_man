import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  if (job.status === 'confirmed') return <Chip tone="yellow">Confirmed</Chip>; // CHANGED TO BLUE
  return <Chip tone="red">Pending</Chip>;
}