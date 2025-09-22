// ESM helper to run analysis using data stored in localStorage via perplexityCache
// Loads cached Perplexity payload, adapts it to the sectorDataNew-like schema,
// then reuses the existing analysisRunner pipeline (normalize -> screen -> value).

import { loadSectorData } from './perplexityCache';
import { runAnalysis, runValuation } from './analysisRunner';

/**
 * Convert snake_case sector key to human-readable (Information Technology)
 */
function humanizeSector(sectorKey) {
  return (sectorKey || '')
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Adapt Perplexity JSON payload into a sectorDataNew-like dataset
 * Expected input shape from Perplexity:
 * {
 *   sector: 'Technology',
 *   sector_key: 'information_technology',
 *   sector_etf: { ticker, name, price, pe_ratio },
 *   stocks: [ { symbol, name, market_cap, price, pe_ratio, pb_ratio, ps_ratio, roe, net_income, free_cash_flow_margin, de_ratio, rev_growth, net_income_growth } ]
 * }
 */
function adaptPerplexityToDataset(ppxl) {
  if (!ppxl || typeof ppxl !== 'object') throw new Error('Invalid cached payload');
  const sectorKey = ppxl.sector_key || '';
  const sectorName = ppxl.sector || humanizeSector(sectorKey);

  const stocksObj = {};
  for (const s of Array.isArray(ppxl.stocks) ? ppxl.stocks : []) {
    if (!s || !s.symbol) continue;
    // Pass through in snake_case as expected by normalizeStock
    stocksObj[s.symbol] = {
      name: s.name,
      market_cap: s.market_cap,
      price: s.price,
      pe_ratio: s.pe_ratio,
      pb_ratio: s.pb_ratio,
      ps_ratio: s.ps_ratio,
      roe: s.roe,
      net_income: s.net_income,
      free_cash_flow_margin: s.free_cash_flow_margin,
      de_ratio: s.de_ratio,
      rev_growth: s.rev_growth,
      net_income_growth: s.net_income_growth,
    };
  }

  return {
    sectors: {
      [sectorKey]: {
        sector_name: sectorName,
        sector_etf: ppxl.sector_etf || null,
        stocks: stocksObj,
      },
    },
  };
}

/**
 * Run full analysis using cached Perplexity sector payload from localStorage.
 * @param {string} sectorKey snake_case key used for caching (e.g., 'information_technology')
 * @param {{ criteria?: any, generateReport?: (prompt: string) => Promise<string> }} [options]
 */
export async function runSectorAnalysisFromCache(sectorKey, options = {}) {
  const cached = loadSectorData(sectorKey);
  if (!cached) throw new Error('No cached sector payload found or it expired');

  // If the cached data had a JSON envelope, unwrap if necessary
  const ppxl = cached?.sector ? cached : cached?.data ? cached.data : cached;
  const dataset = adaptPerplexityToDataset(ppxl);
  const sector = ppxl.sector || humanizeSector(sectorKey);

  return runAnalysis({
    sector,
    criteria: options.criteria || {},
    dataset,
    generateReport: options.generateReport,
  });
}

/**
 * Run valuation-only pipeline using cached payload.
 * @param {string} sectorKey
 * @param {{ criteria?: any }} [options]
 */
export async function runSectorValuationFromCache(sectorKey, options = {}) {
  const cached = loadSectorData(sectorKey);
  if (!cached) throw new Error('No cached sector payload found or it expired');

  const ppxl = cached?.sector ? cached : cached?.data ? cached.data : cached;
  const dataset = adaptPerplexityToDataset(ppxl);
  const sector = ppxl.sector || humanizeSector(sectorKey);

  return runValuation({
    sector,
    criteria: options.criteria || {},
    dataset,
  });
}
