/**
 * reportService.js
 * ------------------------------------------------------------------
 * Builds the business Report across ALL invoices, and includes a 
 * separate earnings timeline grouping (Today, Weekly, Monthly, Yearly).
 * ------------------------------------------------------------------
 */
const Invoice = require('../models/Invoice');
const { calcInvoiceTotals, calcCostTotals } = require('./gstService');
const { round2 } = require('../utils/money');

const MATERIAL_GST_RATE = 0.10; 

async function buildBusinessReport(gstRate) {
  const invoices = await Invoice.find().lean();

  let reportedIncome = 0;
  let cashBonus = 0;
  let totalGstCollected = 0;
  let materialExpenses = 0;
  let otherExpenses = 0;

  // Setup Date thresholds for Timeline
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday start
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let earnings = { today: 0, week: 0, month: 0, year: 0 };

  invoices.forEach((inv) => {
    const totals = calcInvoiceTotals(inv.items, inv.discount, inv.gstIncluded, gstRate);
    
    // Core Report Calculation
    if (inv.gstIncluded) {
      reportedIncome += totals.discSubtotal;
      totalGstCollected += totals.gst;
    } else {
      cashBonus += totals.discSubtotal;
    }
    const costs = calcCostTotals(inv.costs);
    materialExpenses += costs.materials;
    otherExpenses += costs.other;

    // Timeline Earnings Calculation (Only counts Paid invoices)
    if (inv.status === 'paid') {
      const invDate = new Date(inv.date);
      const income = totals.discSubtotal;
      if (invDate >= startOfDay) earnings.today += income;
      if (invDate >= startOfWeek) earnings.week += income;
      if (invDate >= startOfMonth) earnings.month += income;
      if (invDate >= startOfYear) earnings.year += income;
    }
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
    earnings: {
      today: round2(earnings.today),
      week: round2(earnings.week),
      month: round2(earnings.month),
      year: round2(earnings.year),
    },
    profit: round2(profit),
    invoiceCount: invoices.length,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildBusinessReport, MATERIAL_GST_RATE };