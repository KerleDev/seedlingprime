// Abstraction to persist and retrieve Perplexity sector data
// and convert it into the shape expected by StockScreener (src/services/screening.js)

import { loadSectorData, saveSectorData } from './perplexityCache';

// Map a single Perplexity stock object -> Screener stock shape
function mapToScreenerStock(sectorKey, symbol, s) {
  if (!s || typeof s !== 'object') return null;
  const coerce = (v) => (v === null || v === undefined ? null : Number(v));

  return {
    symbol,
    sector: sectorKey, // keep raw sector key
    price: coerce(s.price),
    peRatio: coerce(s.pe_ratio),
    priceToBook: coerce(s.pb_ratio),
    priceToSales: coerce(s.ps_ratio),
    roe: coerce(s.roe),
    netIncome: coerce(s.net_income),
    freeCashFlowMargin: coerce(s.free_cash_flow_margin),
    debtToEquity: coerce(s.de_ratio),
    revenueGrowth: coerce(s.rev_growth),
    netIncomeGrowth: coerce(s.net_income_growth),
  };
}

// Convert cached Perplexity sector payload -> array of Screener stocks
export function getSectorDataForScreening(sectorKey) {
  const payload = loadSectorData(sectorKey);
  if (!payload) return [];

  // payload may be JSON object with shape { sector, sector_etf, stocks: {SYMBOL: {...}}, ... }
  // or a raw text fallback. Only handle JSON object case here.
  if (typeof payload !== 'object' || !payload.stocks) return [];

  const out = [];
  for (const [symbol, s] of Object.entries(payload.stocks)) {
    const mapped = mapToScreenerStock(sectorKey, symbol, s);
    if (mapped && typeof mapped.price === 'number' && mapped.price > 0) {
      out.push(mapped);
    }
  }
  return out;
}

// Optional helper to refresh cache for a sector (called after new fetch)
export function setSectorDataFromPerplexity(sectorKey, jsonPayload) {
  if (!sectorKey) return;
  saveSectorData(sectorKey, jsonPayload);
}
