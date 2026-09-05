/**
 * useEnquiries.js
 * ------------------------------------------------------------------
 * Loads the enquiries list for a given status filter ('new', 'quoted',
 * 'accepted', 'rejected', or undefined/'all'). Re-fetches whenever
 * the filter changes. Used by EnquiriesPage + EnquiryFilterTabs.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as enquiryApi from '../api/enquiryApi';

export default function useEnquiries(status) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryApi.listEnquiries(status);
      setEnquiries(data);
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
