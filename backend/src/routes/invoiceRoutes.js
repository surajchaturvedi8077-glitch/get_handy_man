/**
 * invoiceRoutes.js — /api/invoices
 * ------------------------------------------------------------------
 * Small, single-purpose routes for each invoice action (discount,
 * GST toggle, payment mode/status, cost items, cost item photos) so
 * the frontend can update one thing at a time without resending the
 * whole invoice document.
 * ------------------------------------------------------------------
 */
const express = require('express');
const {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  setDiscount,
  setGstIncluded,
  setPaymentMode,
  setStatus,
  setCostItems,
  uploadCostItemPhoto,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(protect);

router.get('/', listInvoices);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

router.put('/:id/discount', setDiscount);
router.put('/:id/gst', setGstIncluded);
router.put('/:id/payment-mode', setPaymentMode);
router.put('/:id/status', setStatus);

router.put('/:id/cost-items/:kind', setCostItems);
router.post('/:id/cost-items/:kind/:index/photo', upload.single('photo'), uploadCostItemPhoto);

module.exports = router;
