/**
 * useReport.js
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as reportService from '../services/reportService';

export default function useReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await reportService.getBusinessReport());
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { report, loading, error, refresh };
}
