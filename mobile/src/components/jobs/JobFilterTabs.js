import React from 'react';
import SegmentedControl from '../ui/SegmentedControl';

// FIXED: Removed 'Confirmed' and renamed 'Accepted' to 'Assigned'
const OPTIONS = [
  { value: 'accepted', label: 'Assigned' }, 
  { value: 'complete', label: 'Complete' },
  { value: 'all', label: 'All' },
];

export default function JobFilterTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}