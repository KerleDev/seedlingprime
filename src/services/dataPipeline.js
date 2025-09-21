// Data pipeline wiring: normalization -> filtering -> prompt building
// Ensures downstream (screener, Gemini) consumes the canonical schema

const { normalizeSectorData } = require('../utils/normalizeSectorData');

/**
 * Prepare normalized, sector-filtered data for analysis
 * @param {object} sectorDataNew - The nested sectors dataset (snake_case)
 * @param {string} targetSector - Human-readable sector name (e.g., "Technology")
 * @returns {{ allStocks: any[]; sectorStocks: any[]; issues: Record<string,string[]> }}
 */
function prepareDataForAnalysis(sectorDataNew, targetSector) {
  const { stocks: allStocks, issues } = normalizeSectorData(sectorDataNew);
  const sectorStocks = allStocks.filter((s) => s.sector === targetSector);
  return { allStocks, sectorStocks, issues };
}

/**
 * Build a structured prompt for Gemini
 * @param {{
 *   stocks: Array<{
 *     symbol: string; sector: string; price: number; peRatio?: number; priceToBook?: number; priceToSales?: number;
 *     roe?: number; netIncome?: number; freeCashFlowMargin?: number; debtToEquity?: number; revenueGrowth?: number; netIncomeGrowth?: number;
 *     screeningScore?: number; scoringBreakdown?: any; validationIssues?: string[];
 *   }>;
 *   sectorMetrics?: any;
 *   marketTrends?: any;
 * }} data
 * @param {string} sector
 */
function buildPrompt(data, sector) {
  const payload = {
    sector,
    stocks: data.stocks.map((s) => ({
      symbol: s.symbol,
      price: s.price,
      peRatio: s.peRatio,
      priceToBook: s.priceToBook,
      priceToSales: s.priceToSales,
      roe: s.roe,
      netIncome: s.netIncome,
      freeCashFlowMargin: s.freeCashFlowMargin,
      debtToEquity: s.debtToEquity,
      revenueGrowth: s.revenueGrowth,
      netIncomeGrowth: s.netIncomeGrowth,
      screeningScore: s.screeningScore,
      // Keep validation issues for transparency, but model may ignore
      validationIssues: s.validationIssues && s.validationIssues.slice(0, 5),
    })),
    sectorMetrics: data.sectorMetrics || null,
    marketTrends: data.marketTrends || null,
  };

  return `You are an equity research analyst. Analyze ${sector} sector for mean reversion opportunities.

Data (JSON):\n${JSON.stringify(payload, null, 2)}\n\nInstructions:\n1) Identify undervalued stocks with potential for mean reversion.\n2) Provide risk assessment and rationale (valuation vs sector, ROE, FCF margin, leverage, growth).\n3) Give clear investment recommendations and caveats.\n4) Return sections: Executive Summary, Key Findings, Market Analysis, Risks, Recommendations, Conclusion.`;
}

module.exports = {
  prepareDataForAnalysis,
  buildPrompt,
};
