/**
 * useReport.js
 * ------------------------------------------------------------------
 * Loads the business Report (Reported income, Cash Bonus, GST on
 * material, Reportable GST, expenses, profit) shown on ReportPage.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as reportApi from '../api/reportApi';

export default function useReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getBusinessReport();
      setReport(data);
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
