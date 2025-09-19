const perplexityPrompt = (sector) => `
Collect comprehensive financial data for the ${sector} sector. I need the following information for each relevant company in this sector:

- Stock prices and historical performance (current price, 52-week high/low)
- Financial statements and key ratios:
  - Price-to-Earnings (P/E) Ratio
  - Price-to-Book (P/B) Ratio
  - Price-to-Sales (P/S) Ratio
  - Earnings Per Share (EPS)
  - Return on Equity (ROE)
  - Return on Assets (ROA)
  - Debt-to-Equity Ratio
  - Current Ratio
  - PEG (Price/Earnings to Growth) Ratio
  - Dividend Yield
- Technical indicators:
  - 50-day Moving Average (MA50)
  - 200-day Moving Average (MA200)
  - Relative Strength Index (RSI)
  - MACD (Moving Average Convergence Divergence)

Also, provide overall market metrics and sector comparisons, including:
- The sector's ETF ticker, name, current price, and P/E ratio.
- Any notable market trends or insights for the ${sector} sector.

Structure the output as a JSON object with a 'sector_etf', 'stocks' (an array of stock objects, each containing its symbol and the requested metrics), and 'trends' key. Ensure all numerical data is provided as actual numbers, not strings.
`;

export default perplexityPrompt;
