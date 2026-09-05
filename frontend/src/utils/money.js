/**
 * money.js
 * ------------------------------------------------------------------
 * Formats a number as AUD currency, e.g. money(130) -> "$130.00".
 * Mirrors the prototype's money() helper.
 * ------------------------------------------------------------------
 */
export function money(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
}
