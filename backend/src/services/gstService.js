/**
 * gstService.js
 * ------------------------------------------------------------------
 * Pure calculation functions for a single invoice. No DB or HTTP code
 * here on purpose — this is the same maths the prototype UI used, now
 * centralised so the API and any future client compute totals
 * identically.
 *
 * calcInvoiceTotals - what the CUSTOMER owes (subtotal, discount, GST).
 * calcCostTotals    - what the WORKER spent (materials vs other), used
 *                      internally and never shown on the customer PDF.
 * ------------------------------------------------------------------
 */
const { round2 } = require('../utils/money');

/**
 * @param {Array<{qty:number, amt:number}>} items
 * @param {{type:'amount'|'percent', value:number}} discount
 * @param {boolean} gstIncluded - whether this invoice charges GST at all
 * @param {number} gstRate - percent, e.g. 10 for 10%
 */
function calcInvoiceTotals(items = [], discount = { type: 'percent', value: 0 }, gstIncluded = false, gstRate = 10) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.amt) || 0), 0);
  const discAmt = discount.type === 'percent'
    ? subtotal * ((Number(discount.value) || 0) / 100)
    : (Number(discount.value) || 0);
  const discSubtotal = Math.max(subtotal - discAmt, 0);

  const applyGst = !!gstIncluded;
  const gst = applyGst ? discSubtotal * (gstRate / 100) : 0;
  const total = discSubtotal + gst;

  return {
    subtotal: round2(subtotal),
    discAmt: round2(discAmt),
    discSubtotal: round2(discSubtotal),
    applyGst,
    gst: round2(gst),
    total: round2(total),
  };
}

/**
 * @param {{materials: Array<{cost:number}>, other: Array<{cost:number}>}} costs
 */
function calcCostTotals(costs = { materials: [], other: [] }) {
  const materials = (costs.materials || []).reduce((s, m) => s + (Number(m.cost) || 0), 0);
  const other = (costs.other || []).reduce((s, m) => s + (Number(m.cost) || 0), 0);
  return {
    materials: round2(materials),
    other: round2(other),
    total: round2(materials + other),
  };
}

module.exports = { calcInvoiceTotals, calcCostTotals };
