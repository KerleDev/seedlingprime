import sectorDataNew from '../constants/sectorDataNew';

const byTicker = new Map();
const bySector = new Map();

for (const [sectorKey, sectorNode] of Object.entries(
  sectorDataNew.sectors || {}
)) {
  const stocks = sectorNode?.stocks || {};
  const tickers = Object.keys(stocks);
  bySector.set(sectorKey, tickers);
  for (const t of tickers) {
    byTicker.set(t, { sectorKey, raw: stocks[t] });
  }
}

const asNumber = (v) => (Number.isFinite(v) ? v : null);
const asFraction = (v) =>
  Number.isFinite(v) ? (v > 1 ? v / 100 : v) : null;

export function getStocksBySector(sectorKey) {
  return bySector.get(sectorKey) || [];
}

export function getStockName(ticker) {
  const rec = byTicker.get(ticker);
  return rec?.raw?.name || ticker;
}

export function getStockMetrics(ticker) {
  const rec = byTicker.get(ticker);
  const s = rec?.raw || {};
  return {
    price: asNumber(s.price ?? null),
    peRatio: asNumber(s.pe_ratio ?? null),
    pbRatio: asNumber(s.pb_ratio ?? null),
    psRatio: asNumber(s.ps_ratio ?? null),
    deRatio: asNumber(s.de_ratio ?? null),
    roe: asFraction(s.roe ?? null), // normalize to fraction
    cashFlowMargin: asFraction(s.free_cash_flow_margin), // fraction already
    revenueGrowth: asFraction(s.rev_growth), // fraction
    netIncomeGrowth: asFraction(s.net_income_growth), // fraction
    change: null, // not provided in dataset
  };
}

export const uoUtils = {
  getStocksBySector,
  getStockMetrics,
  getStockName,
};
