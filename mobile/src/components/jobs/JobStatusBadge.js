import React from 'react';
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  if (job.status === 'confirmed') return <Chip tone="blue">Confirmed</Chip>; // Fixed: changed 'yellow' to 'blue'
  return <Chip tone="red">Pending</Chip>;
}