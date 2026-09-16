/**
 * JobList.js
 * ------------------------------------------------------------------
 * Renders a list of JobListItem rows, or an empty-state message.
 * ------------------------------------------------------------------
 */
import JobListItem from './JobListItem';
import EmptyState from '../ui/EmptyState';

export default function JobList({ jobs }) {
  if (!jobs.length) return <EmptyState>No jobs here.</EmptyState>;
  return jobs.map((j) => <JobListItem key={j._id} job={j} />);
}
