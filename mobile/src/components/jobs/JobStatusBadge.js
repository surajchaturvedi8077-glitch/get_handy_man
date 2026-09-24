import React from 'react';
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  // FIXED: Explicitly marks newly accepted jobs as requiring a scheduled time
  if (job.needsDetails || job.status === 'accepted') return <Chip tone="orange">Accepted (Needs Time)</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  if (job.status === 'confirmed') return <Chip tone="blue">Confirmed</Chip>;
  return <Chip tone="red">Pending</Chip>;
}