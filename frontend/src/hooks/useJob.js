/**
 * useJob.js
 * ------------------------------------------------------------------
 * Loads a single job and exposes its detail-screen actions: save job
 * details, update the materials list, mark complete (which generates
 * the invoice server-side), and delete.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as jobApi from '../api/jobApi';

export default function useJob(id) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await jobApi.getJob(id);
      setJob(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDetails = useCallback(async (payload) => {
    const data = await jobApi.saveJobDetails(id, payload);
    setJob(data);
    return data;
  }, [id]);

  const updateMaterials = useCallback(async (materials) => {
    const data = await jobApi.updateMaterials(id, materials);
    setJob(data);
    return data;
  }, [id]);

  const complete = useCallback(async () => {
    const data = await jobApi.markJobComplete(id);
    setJob(data.job);
    return data; // { job, invoice } — caller can navigate to the new invoice
  }, [id]);

  const remove = useCallback(() => jobApi.deleteJob(id), [id]);

  return { job, loading, error, refresh, saveDetails, updateMaterials, complete, remove };
}
