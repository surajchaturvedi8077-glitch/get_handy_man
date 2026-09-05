/**
 * useEnquiry.js
 * ------------------------------------------------------------------
 * Loads a single enquiry by id and exposes the actions available on
 * the enquiry detail screen: reject, send-quote, accept (creates a
 * job). Each action re-fetches the enquiry so the UI reflects the
 * new status immediately.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as enquiryApi from '../api/enquiryApi';

export default function useEnquiry(id) {
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await enquiryApi.getEnquiry(id);
      setEnquiry(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const reject = useCallback(async () => {
    const data = await enquiryApi.rejectEnquiry(id);
    setEnquiry(data);
    return data;
  }, [id]);

  const sendQuote = useCallback(async (items) => {
    const data = await enquiryApi.sendQuote(id, items);
    setEnquiry(data);
    return data;
  }, [id]);

  const accept = useCallback(async () => {
    const data = await enquiryApi.acceptEnquiry(id);
    setEnquiry(data.enquiry);
    return data; // { enquiry, job } — caller can navigate to the new job
  }, [id]);

  return { enquiry, loading, error, refresh, reject, sendQuote, accept };
}
