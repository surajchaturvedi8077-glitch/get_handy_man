/**
 * useJobs.js
 * ------------------------------------------------------------------
 * Loads the jobs list for a status filter ('accepted', 'confirmed',
 * 'complete', or undefined/'all'). Mirrors useEnquiries.js.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as jobApi from '../api/jobApi';

export default function useJobs(status) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobApi.listJobs(status);
      setJobs(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { jobs, loading, error, refresh };
}
