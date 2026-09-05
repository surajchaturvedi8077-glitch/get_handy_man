/**
 * jobRoutes.js — /api/jobs
 * ------------------------------------------------------------------
 */
const express = require('express');
const {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  saveJobDetails,
  updateMaterials,
  markComplete,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', listJobs);
router.get('/:id', getJob);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.put('/:id/details', saveJobDetails);
router.put('/:id/materials', updateMaterials);
router.post('/:id/complete', markComplete);

module.exports = router;
