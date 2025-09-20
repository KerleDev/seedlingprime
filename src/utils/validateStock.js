// Validates a canonical stock object and reports issues
// Designed to work after normalization (camelCase fields)

/**
 * @typedef {Object} CanonicalStock
 * @property {string} symbol
 * @property {string} sector
 * @property {number} price
 * @property {number|undefined} peRatio
 * @property {number|undefined} priceToBook
 * @property {number|undefined} priceToSales
 * @property {number|undefined} roe
 * @property {number|undefined} netIncome
 * @property {number|undefined} freeCashFlowMargin
 * @property {number|undefined} debtToEquity
 * @property {number|undefined} revenueGrowth
 * @property {number|undefined} netIncomeGrowth
 */

const RANGES = {
  peRatio: { min: 0.01, max: 500 },
  priceToBook: { min: 0.01, max: 200 },
  priceToSales: { min: 0.01, max: 200 },
  debtToEquity: { min: 0, max: 10 },
  roe: { min: -200, max: 500 }, // percent
  freeCashFlowMargin: { min: -100, max: 100 }, // percent
  revenueGrowth: { min: -100, max: 500 }, // percent
  netIncomeGrowth: { min: -100, max: 1000 }, // percent
  price: { min: 0.01, max: 100000 },
  netIncome: { min: -1e13, max: 1e14 },
};

/**
 * @param {CanonicalStock} s
 * @returns {{ valid: boolean; issues: string[] }}
 */
function validateStock(s) {
  const issues = [];

  // Required basic fields
  if (!s || typeof s !== 'object') issues.push('Invalid stock object');
  if (!s.symbol) issues.push('Missing symbol');
  if (!s.sector) issues.push('Missing sector');
  if (typeof s.price !== 'number') issues.push('Missing or invalid price');

  // Range checks
  for (const [key, range] of Object.entries(RANGES)) {
    const v = s[key];
    if (v == null) continue; // allow missing optional metrics
    if (typeof v !== 'number' || Number.isNaN(v)) {
      issues.push(`Invalid ${key}: not a number`);
      continue;
    }
    if (v < range.min || v > range.max) {
      issues.push(`Out of range ${key}: ${v} (expected ${range.min}..${range.max})`);
    }
  }

  return { valid: issues.length === 0, issues };
}

module.exports = {
  validateStock,
  RANGES,
};
