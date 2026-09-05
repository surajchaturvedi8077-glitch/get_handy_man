/**
 * enquiryRoutes.js — /api/enquiries
 * ------------------------------------------------------------------
 * POST / is public (the marketing website submits enquiries here).
 * Everything else requires a logged-in worker.
 * ------------------------------------------------------------------
 */
const express = require('express');
const {
  listEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  rejectEnquiry,
  sendQuote,
  acceptEnquiry,
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', createEnquiry); // public — website contact form

router.use(protect);
router.get('/', listEnquiries);
router.get('/:id', getEnquiry);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);
router.post('/:id/reject', rejectEnquiry);
router.post('/:id/send-quote', sendQuote);
router.post('/:id/accept', acceptEnquiry);

module.exports = router;
