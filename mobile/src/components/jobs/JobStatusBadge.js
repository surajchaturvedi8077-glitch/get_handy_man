import React from 'react';
import Chip from '../ui/Chip';

export default function JobStatusBadge({ job }) {
  if (job.needsDetails) return <Chip tone="orange">Needs details</Chip>;
  if (job.status === 'complete') return <Chip tone="green">Complete</Chip>;
  
  // FIXED: Maps the backend 'accepted' status to visually display 'Assigned Job'
  if (job.status === 'accepted') return <Chip tone="blue">Assigned Job</Chip>;
  
  return <Chip tone="red">Pending</Chip>;
}