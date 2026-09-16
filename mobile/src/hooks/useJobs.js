import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as jobApi from '../services/jobService';

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

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  return { jobs, loading, error, refresh };
}