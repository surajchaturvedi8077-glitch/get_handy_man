import React from 'react';
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  
  // FIXED: Intercepts the backend status and forces it to display as Accepted in Red
  if (job.status === 'confirmed' || job.status === 'accepted') {
    return <Chip tone="red">Accepted</Chip>;
  }

  return <Chip tone="red">Pending</Chip>;
}