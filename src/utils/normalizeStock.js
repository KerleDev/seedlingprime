// Normalizes a raw stock entry (snake_case) into the canonical camelCase schema
// Injects `symbol` and `sector` and passes through some optional fields (name, marketCap)

/**
 * @typedef {Object} RawStock
 * @property {number} price
 * @property {number} [pe_ratio]
 * @property {number} [pb_ratio]
 * @property {number} [ps_ratio]
 * @property {number} [roe]
 * @property {number} [net_income]
 * @property {number} [free_cash_flow_margin]
 * @property {number} [de_ratio]
 * @property {number} [rev_growth]
 * @property {number} [net_income_growth]
 * @property {string} [name]
 * @property {number} [market_cap]
 */

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
 * @property {string|undefined} name
 * @property {number|undefined} marketCap
 */

/**
 * Normalize one stock entry
 * @param {{ symbol: string; sector: string; raw: RawStock }} params
 * @returns {CanonicalStock}
 */
function normalizeStock({ symbol, sector, raw }) {
  return {
    symbol,
    sector,
    price: raw.price,
    peRatio: raw.pe_ratio,
    priceToBook: raw.pb_ratio,
    priceToSales: raw.ps_ratio,
    roe: raw.roe,
    netIncome: raw.net_income,
    freeCashFlowMargin: raw.free_cash_flow_margin,
    debtToEquity: raw.de_ratio,
    revenueGrowth: raw.rev_growth,
    netIncomeGrowth: raw.net_income_growth,
    // optional passthrough
    name: raw.name,
    marketCap: raw.market_cap,
  };
}

export { normalizeStock };
