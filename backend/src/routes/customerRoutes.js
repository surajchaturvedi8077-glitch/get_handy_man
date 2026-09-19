const express = require('express');
const { listCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;