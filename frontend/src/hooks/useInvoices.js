/**
 * useInvoices.js
 * ------------------------------------------------------------------
 * Loads the invoices list for a tab filter ('unpaid', 'paid', or
 * undefined/'all'). Each invoice in the list already includes a
 * computed `totals` object from the API — no client-side GST maths.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as invoiceApi from '../api/invoiceApi';

export default function useInvoices(status) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.listInvoices(status);
      setInvoices(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { invoices, loading, error, refresh };
}
