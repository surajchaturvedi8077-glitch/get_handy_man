/**
 * JobList.jsx
 * ------------------------------------------------------------------
 * Renders a list of JobListItem rows, or an empty-state message.
 * ------------------------------------------------------------------
 */
import JobListItem from './JobListItem.jsx';

export default function JobList({ jobs }) {
  if (!jobs.length) {
    return (
      <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 12.5, padding: '30px 0' }}>
        No jobs here.
      </div>
    );
  }
  return jobs.map((j) => <JobListItem key={j._id} job={j} />);
}
