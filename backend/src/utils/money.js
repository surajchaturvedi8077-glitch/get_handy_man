/**
 * money.js
 * ------------------------------------------------------------------
 * Small helpers for working with currency values consistently.
 * round2: avoids floating point drift (e.g. 0.1 + 0.2) on money maths.
 * ------------------------------------------------------------------
 */
const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

module.exports = { round2 };
