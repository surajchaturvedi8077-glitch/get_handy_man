/**
 * useInvoices.js
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as invoiceService from '../services/invoiceService';

export default function useInvoices(status) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvoices(await invoiceService.listInvoices(status));
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
