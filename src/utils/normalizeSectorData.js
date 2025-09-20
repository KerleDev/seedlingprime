// Flattens sectorDataNew structure into an array of canonical stock objects
// Applies field normalization and validation

const { normalizeStock } = require('./normalizeStock');
const { validateStock } = require('./validateStock');

/**
 * Convert sector label: uses sector_name if present, strips trailing ' Sector'
 * Fallback: title-case of key replacing underscores with spaces
 */
function formatSectorName(sectorKey, sectorObj) {
  if (sectorObj && typeof sectorObj.sector_name === 'string') {
    const s = sectorObj.sector_name.trim();
    return s.endsWith(' Sector') ? s.replace(/ Sector$/, '') : s;
  }
  return sectorKey
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Scale a decimal ratio to percentage if it's in (-1, 1)
 * Keeps null/undefined as-is
 */
function toPercentIfDecimal(v) {
  if (v == null) return v;
  if (typeof v !== 'number' || Number.isNaN(v)) return v;
  if (v > -1 && v < 1) return v * 100;
  return v; // already in percent units
}

/**
 * Normalize entire dataset
 * @param {object} sectorDataNew
 * @returns {{ stocks: any[]; issues: Record<string, string[]> }}
 */
function normalizeSectorData(sectorDataNew) {
  const out = [];
  const issuesMap = {};

  if (!sectorDataNew || typeof sectorDataNew !== 'object' || !sectorDataNew.sectors) {
    return { stocks: out, issues: issuesMap };
  }

  const sectors = sectorDataNew.sectors;
  for (const [sectorKey, sectorObj] of Object.entries(sectors)) {
    if (!sectorObj || !sectorObj.stocks) continue;
    const sectorName = formatSectorName(sectorKey, sectorObj);

    for (const [symbol, raw] of Object.entries(sectorObj.stocks)) {
      if (!raw) continue;

      // Pre-adjust fields that are typically stored as decimals in the dataset
      const adjusted = {
        ...raw,
        free_cash_flow_margin: toPercentIfDecimal(raw.free_cash_flow_margin),
        rev_growth: toPercentIfDecimal(raw.rev_growth),
        net_income_growth: toPercentIfDecimal(raw.net_income_growth),
        // Keep roe as-is (dataset appears already in percent units)
      };

      const canonical = normalizeStock({ symbol, sector: sectorName, raw: adjusted });
      const { valid, issues } = validateStock(canonical);
      if (!valid) {
        issuesMap[symbol] = issues;
      }
      // Always push; the screener's own isValidStock will filter at runtime
      out.push({ ...canonical, validationIssues: issuesMap[symbol] || [] });
    }
  }

  return { stocks: out, issues: issuesMap };
}

module.exports = {
  normalizeSectorData,
};
