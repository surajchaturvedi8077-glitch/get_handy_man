const asyncHandler = require('../middleware/asyncHandler');
const Customer = require('../models/Customer');
const { ok, created } = require('../utils/apiResponse');

const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ name: 1 });
  ok(res, customers);
});

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);
  created(res, customer);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  ok(res, customer);
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  ok(res, { deleted: true });
});

module.exports = { listCustomers, createCustomer, updateCustomer, deleteCustomer };