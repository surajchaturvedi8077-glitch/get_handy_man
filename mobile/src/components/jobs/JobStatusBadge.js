import React from 'react';
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  
  if (job.needsDetails) {
    return <Chip tone="orange">Needs details</Chip>;
  }

  // FIXED: Replaced Confirmed with Accepted and mapped to Red
  if (job.status === 'accepted' || job.status === 'confirmed') {
    return <Chip tone="red">Accepted</Chip>;
  }

  return <Chip tone="red">Pending</Chip>;
}