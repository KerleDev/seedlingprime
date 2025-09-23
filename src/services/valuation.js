// Valuation service: estimates fair value using sector-average multiples
// Works with normalized stock objects produced by normalizeSectorData()
// Fields consumed per stock: price, peRatio, priceToBook, priceToSales
// Optional: screeningScore (for selection), roe, revenueGrowth, etc. for notes

/**
 * Compute sector statistics if not supplied.
 * Mirrors what screening.calculateSectorStatistics does for the fields we need.
 * @param {Array} stockData
 * @param {string} targetSector
 */
export function computeSectorStats(stockData, targetSector) {
  const sectorStocks = stockData.filter(
    (s) => s && s.sector === targetSector && typeof s.price === 'number' && s.price > 0
  );
  const mean = (arr) => {
    const vals = arr.filter((v) => Number.isFinite(v) && v > 0);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  return {
    sector: targetSector,
    meanPE: mean(sectorStocks.map((s) => s.peRatio)),
    meanPriceToBook: mean(sectorStocks.map((s) => s.priceToBook)),
    meanPriceToSales: mean(sectorStocks.map((s) => s.priceToSales)),
  };
}

/**
 * Estimate fair price using sector-average multiples.
 * Uses earnings, book value, and sales per share derived from current price and ratios.
 * @param {object} stock
 * @param {object} sectorStats - { meanPE, meanPriceToBook, meanPriceToSales }
 * @param {{weights?: {pe?: number, pb?: number, ps?: number}}} [options]
 */
export function estimateFairPrice(stock, sectorStats, options = {}) {
  const w = {
    pe: 0.5,
    pb: 0.3,
    ps: 0.2,
    ...(options.weights || {}),
  };
  const sumW = w.pe + w.pb + w.ps || 1;

  const price = Number(stock.price) || 0;
  const pe = Number(stock.peRatio) || 0;
  const pb = Number(stock.priceToBook) || 0;
  const ps = Number(stock.priceToSales) || 0;

  const meanPE = Number(sectorStats?.meanPE) || 0;
  const meanPB = Number(sectorStats?.meanPriceToBook) || 0;
  const meanPS = Number(sectorStats?.meanPriceToSales) || 0;

  // Derive per-share fundamentals from current price and ratios (approximation)
  const earningsPerShare = pe > 0 ? price / pe : null;
  const bookPerShare = pb > 0 ? price / pb : null;
  const salesPerShare = ps > 0 ? price / ps : null;

  const fairByPE = earningsPerShare && meanPE > 0 ? earningsPerShare * meanPE : null;
  const fairByPB = bookPerShare && meanPB > 0 ? bookPerShare * meanPB : null;
  const fairByPS = salesPerShare && meanPS > 0 ? salesPerShare * meanPS : null;

  // Blend available fair values by weights, ignoring missing signals
  const parts = [];
  if (Number.isFinite(fairByPE)) parts.push({ v: fairByPE, w: w.pe });
  if (Number.isFinite(fairByPB)) parts.push({ v: fairByPB, w: w.pb });
  if (Number.isFinite(fairByPS)) parts.push({ v: fairByPS, w: w.ps });

  const blendedFairPrice = parts.length
    ? parts.reduce((acc, p) => acc + p.v * p.w, 0) / parts.reduce((acc, p) => acc + p.w, 0)
    : null;

  const upsidePct = blendedFairPrice && price > 0 ? ((blendedFairPrice - price) / price) * 100 : null;
  const marginOfSafety = blendedFairPrice && price > 0 ? ((blendedFairPrice - price) / blendedFairPrice) * 100 : null;

  return {
    inputs: {
      price,
      pe,
      pb,
      ps,
      meanPE,
      meanPB,
      meanPS,
    },
    components: {
      earningsPerShare,
      bookPerShare,
      salesPerShare,
      fairByPE,
      fairByPB,
      fairByPS,
    },
    blendedFairPrice: Number.isFinite(blendedFairPrice) ? round2(blendedFairPrice) : null,
    upsidePct: Number.isFinite(upsidePct) ? round2(upsidePct) : null,
    marginOfSafety: Number.isFinite(marginOfSafety) ? round2(marginOfSafety) : null,
  };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

/**
 * Value a list of stocks given sector stats.
 * @param {Array} stocks
 * @param {object} sectorStats
 * @param {{weights?: {pe?: number, pb?: number, ps?: number}}} [options]
 */
export function valueStocks(stocks, sectorStats, options) {
  return stocks.map((s) => {
    const valuation = estimateFairPrice(s, sectorStats, options);
    return {
      ...s,
      valuation,
    };
  });
}

/**
 * Select top two undervalued stocks and return detailed valuation results.
 * Selection policy:
 * 1) Prefer by highest upside percentage (based on blended fair value)
 * 2) If upside unavailable, fallback to existing screeningScore (desc)
 * 3) If still tied, fallback to price discount vs sector fair PE-only estimate
 *
 * @param {Array} stocks - normalized and preferably pre-screened for undervaluation
 * @param {string} sector
 * @param {{
 *   sectorStats?: { meanPE: number, meanPriceToBook: number, meanPriceToSales: number },
 *   weights?: { pe?: number, pb?: number, ps?: number }
 * }} [options]
 */
export function valueTopUndervalued(stocks, sector, options = {}) {
  if (!Array.isArray(stocks) || stocks.length === 0) return { sector, sectorStats: null, results: [] };

  const stats = options.sectorStats || computeSectorStats(stocks, sector);
  const valued = valueStocks(stocks, stats, { weights: options.weights });

  // Rank by upsidePct desc, then screeningScore desc
  valued.sort((a, b) => {
    const ua = a.valuation?.upsidePct ?? -Infinity;
    const ub = b.valuation?.upsidePct ?? -Infinity;
    if (ub !== ua) return ub - ua;
    const sa = Number.isFinite(a.screeningScore) ? a.screeningScore : -Infinity;
    const sb = Number.isFinite(b.screeningScore) ? b.screeningScore : -Infinity;
    return sb - sa;
  });

  const topTwo = valued.slice(0, 2).map((s) => ({
    symbol: s.symbol,
    sector: s.sector,
    price: s.price,
    screeningScore: s.screeningScore ?? null,
    scoringBreakdown: s.scoringBreakdown ?? null,
    valuation: s.valuation,
    notes: buildNotes(s, stats),
  }));

  return {
    sector,
    sectorStats: stats,
    results: topTwo,
  };
}

function buildNotes(stock, stats) {
  const notes = [];
  if (Number.isFinite(stock.peRatio) && stats.meanPE > 0) {
    const rel = round2((stock.peRatio / stats.meanPE) * 100);
    notes.push(`P/E at ${rel}% of sector avg`);
  }
  if (Number.isFinite(stock.priceToBook) && stats.meanPriceToBook > 0) {
    const rel = round2((stock.priceToBook / stats.meanPriceToBook) * 100);
    notes.push(`P/B at ${rel}% of sector avg`);
  }
  if (Number.isFinite(stock.priceToSales) && stats.meanPriceToSales > 0) {
    const rel = round2((stock.priceToSales / stats.meanPriceToSales) * 100);
    notes.push(`P/S at ${rel}% of sector avg`);
  }
  if (Number.isFinite(stock.roe)) {
    notes.push(`ROE ${stock.roe}%`);
  }
  if (Number.isFinite(stock.freeCashFlowMargin)) {
    notes.push(`FCF margin ${stock.freeCashFlowMargin}%`);
  }
  if (Number.isFinite(stock.debtToEquity)) {
    notes.push(`Debt/Equity ${stock.debtToEquity}`);
  }
  return notes;
}

// ES module named exports above
