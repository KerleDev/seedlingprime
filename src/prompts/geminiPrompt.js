export default function buildGeminiPrompt({ sectorJson, ppxlText }) {
  return `You are a senior financial analyst. Using ONLY the structured JSON data below (and your reasoning), write a clear, concise markdown report identifying the most undervalued stocks in the specified sector. Do not invent tickers or metrics that are not present in the JSON; if a metric is missing or zero, acknowledge it as a limitation.

JSON DATA START\n${JSON.stringify(sectorJson ?? { raw: ppxlText }, null, 2)}\nJSON DATA END

Report requirements:
- Start with a short sector overview including the sector ETF (if available).
- Provide a ranked list of the top 2-3 candidates that appear undervalued based on available metrics (P/E, P/B, P/S, ROE, net income, FCF margin, D/E, revenue growth, net income growth).
- For each pick, include a brief rationale referencing the actual metrics from the JSON.
- Note any data gaps where values are missing or zero.
- End with a brief risk section and a one-paragraph conclusion.

Format the output in markdown with headings, bullet points, and short paragraphs.`;
}
