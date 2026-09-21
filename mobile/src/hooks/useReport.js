import { useCallback, useEffect, useState } from 'react';
import * as reportService from '../services/reportService';

export default function useReport(start, end) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await reportService.getBusinessReport(start, end));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { report, loading, error, refresh };
}