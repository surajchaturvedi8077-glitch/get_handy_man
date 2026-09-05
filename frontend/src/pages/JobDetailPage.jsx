/**
 * JobDetailPage.jsx
 * ------------------------------------------------------------------
 * Owns useJob() for one job. Shows JobDetailForm while details are
 * still needed; once filled in, shows the read-only JobSummaryCard
 * plus a live-editable materials section and the complete/delete
 * actions. Completing a job jumps straight to the generated invoice.
 * ------------------------------------------------------------------
 */
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import ScreenHeader from '../components/layout/ScreenHeader.jsx';
import JobDetailForm from '../components/jobs/JobDetailForm.jsx';
import JobSummaryCard from '../components/jobs/JobSummaryCard.jsx';
import JobMaterialsSection from '../components/jobs/JobMaterialsSection.jsx';
import JobActions from '../components/jobs/JobActions.jsx';
import JobStatusBadge from '../components/jobs/JobStatusBadge.jsx';
import useJob from '../hooks/useJob.js';
import useToast from '../hooks/useToast.js';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { job, loading, error, saveDetails, updateMaterials, complete, remove } = useJob(id);

  async function handleSaveDetails(payload) {
    await saveDetails(payload);
    showToast('Job details saved');
  }

  async function handleComplete() {
    const { invoice } = await complete();
    showToast('Job marked complete — invoice created');
    navigate(`/invoices/${invoice._id}`);
  }

  async function handleDelete() {
    await remove();
    showToast('Job deleted');
    navigate('/jobs');
  }

  return (
    <AppShell activeTab="jobs">
      <ScreenHeader
        title="JOB DETAILS"
        subtitle={job?.name}
        rightAction={job ? <JobStatusBadge job={job} /> : null}
      />
      <div style={{ padding: 16 }}>
        {loading && <div style={{ color: 'var(--gray)', fontSize: 12.5 }}>Loading…</div>}
        {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        {job && job.needsDetails && <JobDetailForm job={job} onSave={handleSaveDetails} />}
        {job && !job.needsDetails && (
          <>
            <JobSummaryCard job={job} />
            <JobMaterialsSection materials={job.materials} onSave={updateMaterials} />
            <JobActions job={job} onComplete={handleComplete} onDelete={handleDelete} />
          </>
        )}
      </div>
    </AppShell>
  );
}
