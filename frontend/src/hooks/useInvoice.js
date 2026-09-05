/**
 * useInvoice.js
 * ------------------------------------------------------------------
 * Loads a single invoice (with server-computed `totals`/`costTotals`)
 * and exposes every action the invoice detail screen needs. Each
 * action calls its own small backend route and updates local state
 * from the response, so the UI always reflects the server's totals.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as invoiceApi from '../api/invoiceApi';

export default function useInvoice(id) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceApi.getInvoice(id);
      setInvoice(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateItems = useCallback(
    (items) => invoiceApi.updateInvoice(id, { items }).then(setInvoice),
    [id]
  );

  const setDiscount = useCallback(
    (discount) => invoiceApi.setDiscount(id, discount).then(setInvoice),
    [id]
  );

  const toggleGstIncluded = useCallback(() => {
    return invoiceApi.setGstIncluded(id, !invoice?.gstIncluded).then(setInvoice);
  }, [id, invoice?.gstIncluded]);

  const setPaymentMode = useCallback(
    (mode) => invoiceApi.setPaymentMode(id, mode).then(setInvoice),
    [id]
  );

  const togglePaidStatus = useCallback(() => {
    const next = invoice?.status === 'paid' ? 'unpaid' : 'paid';
    return invoiceApi.setInvoiceStatus(id, next).then(setInvoice);
  }, [id, invoice?.status]);

  const setCostItems = useCallback(
    (kind, items) => invoiceApi.setCostItems(id, kind, items).then(setInvoice),
    [id]
  );

  const uploadCostItemPhoto = useCallback(
    (kind, index, file) => invoiceApi.uploadCostItemPhoto(id, kind, index, file).then(setInvoice),
    [id]
  );

  return {
    invoice,
    loading,
    error,
    refresh,
    updateItems,
    setDiscount,
    toggleGstIncluded,
    setPaymentMode,
    togglePaidStatus,
    setCostItems,
    uploadCostItemPhoto,
  };
}
