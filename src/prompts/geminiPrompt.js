export default function buildGeminiPrompt({
  stockSymbol,
  stockData,
  sectorJson,
  ppxlText,
}) {
  return `You are a senior financial analyst. Using ONLY the structured JSON data below, generate a comprehensive investment analysis for ${stockSymbol}. Do not invent metrics that are not present in the data.

STOCK DATA:
${JSON.stringify(stockData || {}, null, 2)}

SECTOR DATA:
${JSON.stringify(sectorJson ?? { raw: ppxlText }, null, 2)}

You must provide your analysis in this EXACT JSON format (no markdown, no additional text):

{
  "introduction": "A 2-3 sentence company overview describing what the company does and its business model",
  "recommendation": "LONG or SHORT",
  "confidence": "HIGH or MEDIUM or LOW",
  "strengths": [
    "First key strength based on the data",
    "Second key strength based on the data",
    "Third key strength based on the data"
  ],
  "weaknesses": [
    "First key weakness or risk based on the data",
    "Second key weakness or risk based on the data",
    "Third key weakness or risk based on the data"
  ],
  "marketPosition": "A single paragraph describing the company's competitive position and market dynamics"
}

Analysis guidelines:
- Base your recommendation on actual financial metrics provided (P/E, P/B, ROE, growth rates, etc.)
- Strengths should highlight positive financial metrics, competitive advantages, or growth prospects
- Weaknesses should identify risks, poor metrics, or concerning trends
- Market position should consider sector context and competitive landscape
- If data is missing, mention it as a limitation but still provide analysis based on available information
- Keep each array item to 1-2 sentences maximum
- Ensure recommendation aligns with your analysis

Return ONLY the JSON object, no other text.`;
}
