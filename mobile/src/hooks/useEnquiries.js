/**
 * useEnquiries.js
 * ------------------------------------------------------------------
 * Loads the enquiries list for a status filter. All data access goes
 * through services/enquiryService.js — this hook just adds
 * loading/error state and re-fetches when the filter changes.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as enquiryService from '../services/enquiryService';

export default function useEnquiries(status) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEnquiries(await enquiryService.listEnquiries(status));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { enquiries, loading, error, refresh };
}
