/**
 * useJob.js
 * ------------------------------------------------------------------
 * Loads a single job and exposes its detail-screen actions: save
 * details, update materials, mark complete, delete.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as jobService from '../services/jobService';

export default function useJob(id) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setJob(await jobService.getJob(id));
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
    const data = await jobService.saveJobDetails(id, payload);
    setJob(data);
    return data;
  }, [id]);

  const updateMaterials = useCallback(async (materials) => {
    const data = await jobService.updateMaterials(id, materials);
    setJob(data);
    return data;
  }, [id]);

  const complete = useCallback(async () => {
    const data = await jobService.markJobComplete(id);
    setJob(data.job);
    return data; // { job, invoice }
  }, [id]);

  const remove = useCallback(() => jobService.deleteJob(id), [id]);

  return { job, loading, error, refresh, saveDetails, updateMaterials, complete, remove };
}
