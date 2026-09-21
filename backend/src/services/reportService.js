const Invoice = require('../models/Invoice');
const { calcInvoiceTotals, calcCostTotals } = require('./gstService');
const { round2 } = require('../utils/money');

const MATERIAL_GST_RATE = 0.10; 

async function buildBusinessReport(gstRate, startDate, endDate) {
  // Apply Date Filter if requested
  const query = {};
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const invoices = await Invoice.find(query).lean();

  let reportedIncome = 0;
  let cashBonus = 0;
  let totalGstCollected = 0;
  let materialExpenses = 0;
  let otherExpenses = 0;

  invoices.forEach((inv) => {
    const totals = calcInvoiceTotals(inv.items, inv.discount, inv.gstIncluded, gstRate);
    if (inv.gstIncluded) {
      reportedIncome += totals.discSubtotal;
      totalGstCollected += totals.gst;
    } else {
      cashBonus += totals.discSubtotal;
    }
    const costs = calcCostTotals(inv.costs);
    materialExpenses += costs.materials;
    otherExpenses += costs.other;
  });

  const totalExpenses = materialExpenses + otherExpenses;
  const profit = reportedIncome + cashBonus - totalExpenses;
  const gstOnMaterial = materialExpenses * MATERIAL_GST_RATE;
  const reportableGst = totalGstCollected - gstOnMaterial;

  return {
    income: {
      reportedIncome: round2(reportedIncome),
      cashBonus: round2(cashBonus),
      gstOnMaterial: round2(gstOnMaterial),
      reportableGst: round2(reportableGst),
    },
    expenses: {
      materialExpenses: round2(materialExpenses),
      otherExpenses: round2(otherExpenses),
      totalExpenses: round2(totalExpenses),
    },
    profit: round2(profit),
    invoiceCount: invoices.length,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildBusinessReport, MATERIAL_GST_RATE };