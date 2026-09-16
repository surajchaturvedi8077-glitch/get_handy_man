/**
 * useInvoice.js
 * ------------------------------------------------------------------
 * Loads a single invoice and exposes every action the invoice detail
 * screen needs. Each action calls its own service function and
 * updates local state from the response.
 * ------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from 'react';
import * as invoiceService from '../services/invoiceService';

export default function useInvoice(id) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setInvoice(await invoiceService.getInvoice(id));
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
    (items) => invoiceService.updateInvoice(id, { items }).then(setInvoice),
    [id]
  );
  const setDiscount = useCallback(
    (discount) => invoiceService.setDiscount(id, discount).then(setInvoice),
    [id]
  );
  const toggleGstIncluded = useCallback(
    () => invoiceService.setGstIncluded(id, !invoice?.gstIncluded).then(setInvoice),
    [id, invoice?.gstIncluded]
  );
  const setPaymentMode = useCallback(
    (mode) => invoiceService.setPaymentMode(id, mode).then(setInvoice),
    [id]
  );
  const togglePaidStatus = useCallback(() => {
    const next = invoice?.status === 'paid' ? 'unpaid' : 'paid';
    return invoiceService.setInvoiceStatus(id, next).then(setInvoice);
  }, [id, invoice?.status]);
  const setCostItems = useCallback(
    (kind, items) => invoiceService.setCostItems(id, kind, items).then(setInvoice),
    [id]
  );
  const uploadCostItemPhoto = useCallback(
    (kind, index, asset) => invoiceService.uploadCostItemPhoto(id, kind, index, asset).then(setInvoice),
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
