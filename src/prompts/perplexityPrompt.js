import simplifiedSectorData from '../constants/simplifiedSectorData.js';

function humanizeSector(sectorKey) {
  return sectorKey
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// Expects the exact sector key from the dropdown, e.g. "information_technology"
const perplexityPrompt = (sectorKey) => {
  const symbols =
    simplifiedSectorData.sectors[sectorKey]?.stocks || [];
  const sector = humanizeSector(sectorKey);
  const symbolList = symbols.join(', ');

  return `Collect essential financial data for the ${sector} sector and restrict the universe strictly to these tickers: [${symbolList}]. If a symbol is missing or unavailable, include it with null fields.

Only provide the following minimal fields (numbers, not strings):
- name
- market_cap
- price
- change_percent_1d   // 1-day percent price change
- pe_ratio
- pb_ratio
- ps_ratio
- roe                // percent
- net_income         // absolute value
- free_cash_flow_margin // percent
- de_ratio
- rev_growth         // percent
- net_income_growth  // percent

Also include a minimal sector ETF object with: ticker, name, price, pe_ratio.

Output JSON exactly in this shape:
{
  "sector": "${sector}",
  "sector_key": "${sectorKey}",
  "sector_etf": { "ticker": "", "name": "", "price": 0, "pe_ratio": 0 },
  "stocks": [
    { "symbol": "TICKER", "name": "", "market_cap": 0, "price": 0, "change_percent_1d": 0, "pe_ratio": 0, "pb_ratio": 0, "ps_ratio": 0, "roe": 0, "net_income": 0, "free_cash_flow_margin": 0, "de_ratio": 0, "rev_growth": 0, "net_income_growth": 0 }
    // one object per ticker in [${symbolList}]
  ],
  "trends": { }
}

Rules:
- Only include the requested tickers and fields above (no extra fields).
 - Use web search to retrieve up-to-date numeric values for each field from reputable sources (e.g., company filings, SEC, major financial data providers). Provide numbers, not strings.
 - Avoid nulls. If a specific metric is unavailable after searching, set it to 0 and add a brief explanation and citations under "trends".
 - Include an array "citations" in "trends" with source URLs used for the data.
 - Use units consistently (e.g., percents as numbers like 12.3, not "12.3%"), and round reasonably.

`;
};

export default perplexityPrompt;
