/**
 * useJobs.js
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as jobService from '../services/jobService';

export default function useJobs(status) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await jobService.listJobs(status));
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
