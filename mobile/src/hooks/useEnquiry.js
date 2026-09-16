/**
 * useEnquiry.js
 * ------------------------------------------------------------------
 * Loads a single enquiry and exposes its detail-screen actions.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as enquiryService from '../services/enquiryService';

export default function useEnquiry(id) {
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setEnquiry(await enquiryService.getEnquiry(id));
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
    const data = await enquiryService.rejectEnquiry(id);
    setEnquiry(data);
    return data;
  }, [id]);

  const sendQuote = useCallback(async (items) => {
    const data = await enquiryService.sendQuote(id, items);
    setEnquiry(data);
    return data;
  }, [id]);

  const accept = useCallback(async () => {
    const data = await enquiryService.acceptEnquiry(id);
    setEnquiry(data.enquiry);
    return data; // { enquiry, job }
  }, [id]);

  return { enquiry, loading, error, refresh, reject, sendQuote, accept };
}
