/**
 * JobStatusBadge.js
 * ------------------------------------------------------------------
 * Status chip for a job: "Needs details" (overrides status),
 * "Complete"/"Confirmed" (green), or "Pending" (orange).
 * ------------------------------------------------------------------
 */
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  if (job.status === 'confirmed') return <Chip tone="green">Confirmed</Chip>;
  return <Chip tone="orange">Pending</Chip>;
}
