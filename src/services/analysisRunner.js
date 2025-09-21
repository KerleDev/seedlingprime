// Orchestrates: normalization -> screening -> prompt building -> (Gemini)

const StockScreener = require('./screening');
const { prepareDataForAnalysis, buildPrompt } = require('./dataPipeline');

/**
 * Runs the full analysis for a sector and returns results and (optionally) a Gemini report.
 * @param {{
 *   sector: string;
 *   criteria?: any;
 *   dataset: object; // sectorDataNew structure
 *   generateReport?: (prompt: string) => Promise<string>; // optional Gemini adapter
 * }} params
 */
async function runAnalysis({ sector, criteria = {}, dataset, generateReport }) {
  if (!sector) throw new Error('sector is required');
  if (!dataset) throw new Error('dataset is required');

  // Step 1: Normalize & filter
  const { sectorStocks, allStocks, issues } = prepareDataForAnalysis(dataset, sector);

  // Step 2: Screen
  const screener = new StockScreener();
  const screeningResults = await screener.screenStocks(
    { sector, ...criteria },
    allStocks // pass all so sector statistics are correct
  );

  // Step 3: Build prompt from top N results in sector
  const topInSector = screeningResults.filter((s) => s.sector === sector).slice(0, 25);
  const prompt = buildPrompt({ stocks: topInSector }, sector);

  // Step 4: Optional Gemini report
  let report = null;
  if (typeof generateReport === 'function') {
    report = await generateReport(prompt);
  }

  return {
    sector,
    issues, // validation issues by symbol
    topResults: topInSector,
    prompt,
    report,
  };
}

module.exports = {
  runAnalysis,
};
