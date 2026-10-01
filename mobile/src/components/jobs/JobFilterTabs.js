import React from 'react';
import SegmentedControl from '../ui/SegmentedControl';

const OPTIONS = [
  { value: 'accepted', label: 'Accepted' },
  { value: 'complete', label: 'Complete' },
  { value: 'all', label: 'All' },
];

export default function JobFilterTabs({ value, onChange }) {
  return <SegmentedControl options={OPTIONS} value={value} onChange={onChange} />;
}